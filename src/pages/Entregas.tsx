import { useEffect, useRef, useState, useLayoutEffect } from "react";
import axios from "axios";
import SignaturePad from "react-signature-canvas";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface IEntrega {
   _id: string;

  colaboradorId: {
    _id: string;
    nome: string;
    matricula?: string;
  };

  epiId: {
    _id: string;
    nome: string;
  };

  epiSnapshot?: {
    nome: string;
    ca?: number;
    validade_ca?: string;
    nivel_protecao?: string;
    fotoUrl?: string;
  };

  quantidade: number;
  dataEntrega: string;

  entreguePor?: {
    _id: string;
    nome: string;
    email?: string;
  };

  observacao?: string;
  assinaturaBase64?: string;

  validadeStatus?: "valido" | "vencido";

  // 🔁 DEVOLUÇÃO
  devolvida?: boolean;
  dataDevolucao?: string;

  devolvidoPor?: {
    _id: string;
    nome: string;
    email?: string;
  };

  observacaoDevolucao?: string;

  assinaturaDevolucaoBase64?: string;
}


export default function Entregas() {
  const [entregas, setEntregas] = useState<IEntrega[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // form
  const [colaboradorId, setColaboradorId] = useState("");
  const [epiId, setEpiId] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [observacao, setObservacao] = useState("");
  const [assinaturaBase64, setAssinaturaBase64] = useState("");
  const sigPadRef = useRef<any>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  const [epis, setEpis] = useState<any[]>([]);
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertLowStock, setAlertLowStock] = useState<string | null>(null);

  // UI feedback states para salvar assinatura
  const [savingSignature, setSavingSignature] = useState(false);
  const [signatureSavedModalOpen, setSignatureSavedModalOpen] = useState(false);
  const [signatureErrorModalOpen, setSignatureErrorModalOpen] = useState(false);
  const [signatureErrorMessage, setSignatureErrorMessage] = useState("");

  // DEVOLUÇÃO
  const [openDevolucao, setOpenDevolucao] = useState(false);
  const [devolucaoEntrega, setDevolucaoEntrega] = useState<IEntrega | null>(null);
  const [devolucaoObs, setDevolucaoObs] = useState("");
  const [devolucaoLoading, setDevolucaoLoading] = useState(false);
  const sigPadDevolucaoRef = useRef<any>(null);
  const canvasDevolucaoRef = useRef<HTMLDivElement | null>(null);
  const [assinaturaDevolucaoBase64, setAssinaturaDevolucaoBase64] = useState("");
  const [signatureDevolucaoSaved, setSignatureDevolucaoSaved] = useState(false);
  const [signatureDevolucaoError, setSignatureDevolucaoError] = useState<string | null>(null);




  const token = localStorage.getItem("token");

  async function load() {
    setLoading(true);
    try {
      const [resEnt, resEpis, resCols] = await Promise.all([
        axios.get("http://localhost:4000/entregas", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:4000/epis", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:4000/colaboradores", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setEntregas(resEnt.data.data || resEnt.data);
      setEpis(resEpis.data);
      setColaboradores(resCols.data);

      // quick check low stock (threshold 5)
      const low = resEpis.data.find((e: any) => e.estoque <= 5);
      setAlertLowStock(low ? `Estoque baixo: ${low.nome} (${low.estoque})` : null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const selectedEpi = epis.find(x => x._id === epiId);

  // ------------- CANVAS / SIGNATURE PAD RESIZE FIX -------------
  // reason: offset / wrong cursor occurs when canvas is styled with CSS but internal buffer size doesn't match
  function resizeSignatureCanvas() {
    const pad = sigPadRef.current;
    const container = canvasContainerRef.current;
    if (!pad || !container) return;

    const desiredHeight = 200; // px
    const width = container.clientWidth;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);

    const canvas = pad.getCanvas();
    // set internal buffer size according to devicePixelRatio to avoid coordinate mismatch
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(desiredHeight * ratio);

    // set CSS size (what user sees)
    canvas.style.width = `${width}px`;
    canvas.style.height = `${desiredHeight}px`;

    // reset the signature pad (we only do this when modal opens/resizes to ensure correct scale)
    pad.clear();
  }

  // when modal opens, set canvas size; also on window resize
  useLayoutEffect(() => {
    if (!openModal) return;
    // small timeout to ensure modal DOM is mounted and has width
    const t = setTimeout(() => resizeSignatureCanvas(), 80);
    const onResize = () => resizeSignatureCanvas();
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, [openModal, canvasContainerRef.current]);

  function clearSignature() {
    sigPadRef.current?.clear();
    setAssinaturaBase64("");
  }

function saveSignature() {
  try {
    const pad = sigPadRef.current;
    if (!pad) {
      setSignatureErrorMessage("Erro interno: referência do canvas não encontrada.");
      setSignatureErrorModalOpen(true);
      return;
    }

    if (pad.isEmpty()) {
      setSignatureErrorMessage("Assinatura vazia. Desenhe algo antes de salvar.");
      setSignatureErrorModalOpen(true);
      return;
    }

    setSavingSignature(true);

    let dataURL: string | null = null;

    try {
      // tenta usar o trimmed (se funcionar)
      const trimmed = (pad as any).getTrimmedCanvas?.();
      if (trimmed && typeof trimmed.toDataURL === "function") {
        dataURL = trimmed.toDataURL("image/png");
      } else {
        // se getTrimmedCanvas não existir ou não for função, cai no fallback
        throw new Error("getTrimmedCanvas não disponível");
      }
    } catch (err) {
      // fallback seguro: pega o canvas "cru" e gera dataURL
      const canvas = pad.getCanvas();
      dataURL = canvas.toDataURL("image/png");
    }

    if (!dataURL) {
      throw new Error("Não foi possível gerar a imagem da assinatura.");
    }

    setAssinaturaBase64(dataURL);
    setSignatureSavedModalOpen(true);

    // fecha o modal de sucesso automaticamente depois de um tempo
    setTimeout(() => setSignatureSavedModalOpen(false), 1200);
  } catch (err) {
    console.error("Erro ao salvar assinatura", err);
    setSignatureErrorMessage("Erro ao salvar assinatura. Tente novamente.");
    setSignatureErrorModalOpen(true);
  } finally {
    setSavingSignature(false);
  }
}

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!colaboradorId || !epiId) return alert("Colaborador e EPI obrigatórios");
    if (selectedEpi && selectedEpi.estoque < quantidade) return alert("Estoque insuficiente");

    try {
      setLoading(true);
      const payload = { colaboradorId, epiId, quantidade, observacao, assinaturaBase64 };
      await axios.post("http://localhost:4000/entregas", payload, { headers: { Authorization: `Bearer ${token}` } });
      setOpenModal(false);
      clearSignature();
      load();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.error || "Erro ao registrar entrega");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      setLoading(true);
      await axios.delete(`http://localhost:4000/entregas/${deleteId}`, { headers: { Authorization: `Bearer ${token}` } });
      setOpenDelete(false);
      setDeleteId(null);
      load();
    } catch (err) {
      console.error(err);
      alert("Erro ao deletar entrega");
    } finally {
      setLoading(false);
    }
  }

  async function handleDevolucao() {
  if (!devolucaoEntrega) return;

  try {
    setDevolucaoLoading(true);

    await axios.post(
      `http://localhost:4000/entregas/${devolucaoEntrega._id}/devolucao`,
      { observacao: devolucaoObs, assinaturaBase64: assinaturaDevolucaoBase64 },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setOpenDevolucao(false);
    setDevolucaoEntrega(null);
    setDevolucaoObs("");
    load();
  } catch (err) {
    console.error(err);
    alert("Erro ao registrar devolução");
  } finally {
    setDevolucaoLoading(false);
  }
}

  // Função limpar assinatura devolução
  function clearSignatureDevolucao() {
  sigPadDevolucaoRef.current?.clear();
  setAssinaturaDevolucaoBase64("");
}
  
  // Função salvar assinatura devolução
  function saveSignatureDevolucao() {
  const pad = sigPadDevolucaoRef.current;
  if (!pad || pad.isEmpty()) {
    setSignatureDevolucaoError("Assinatura da devolução vazia.");
    return;
  }

  const dataURL = pad.getCanvas().toDataURL("image/png");
  setAssinaturaDevolucaoBase64(dataURL);
  setSignatureDevolucaoSaved(true);

  setTimeout(() => setSignatureDevolucaoSaved(false), 1200);
}



  async function generatePdfReceipt(entrega: IEntrega) {
    const ele = document.createElement("div");
    ele.style.padding = "16px";
    ele.style.fontFamily = "Arial, sans-serif";
    ele.innerHTML = `
      <div style="text-align:center;">
        <h2>Recibo de Entrega de EPI</h2>
        <p><strong>Colaborador:</strong> ${entrega.colaboradorId?.nome || "-"}</p>
        <p><strong>EPI:</strong> ${entrega.epiSnapshot?.nome || entrega.epiId?.nome || "-"}</p>
        <p><strong>Quantidade:</strong> ${entrega.quantidade}</p>
        <p><strong>Data:</strong> ${new Date(entrega.dataEntrega).toLocaleString()}</p>
        <p><strong>Entregue por:</strong> ${entrega.entreguePor?.nome || "-"}</p>
        <p><strong>Validade do EPI:</strong> ${entrega.epiSnapshot?.validade_ca ? new Date(entrega.epiSnapshot.validade_ca).toLocaleDateString() : "-"}</p>
      </div>
      ${entrega.assinaturaBase64 ? `<div style="margin-top:20px"><img src="${entrega.assinaturaBase64}" style="display:block;margin:20px auto;width:240px;border:1px solid #ccc;"/></div>` : ""}
    `;
    document.body.appendChild(ele);
    const canvas = await html2canvas(ele);
    const imgData = canvas.toDataURL("image/png");
    const doc = new jsPDF("p", "mm", "a4");
    const imgProps = doc.getImageProperties(imgData);
    const pdfWidth = 190;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    doc.addImage(imgData, "PNG", 10, 10, pdfWidth, pdfHeight);
    doc.save(`recibo_entrega_${entrega._id}.pdf`);
    document.body.removeChild(ele);
  }

  async function generatePdfDevolucao(entrega: IEntrega) {
  const ele = document.createElement("div");
  ele.style.padding = "16px";
  ele.style.fontFamily = "Arial";

  ele.innerHTML = `
    <h2 style="text-align:center;">Recibo de Devolução de EPI</h2>
    <div style="text-align:center;">
    <p><strong>Colaborador:</strong> ${entrega.colaboradorId?.nome}</p>
    <p><strong>EPI:</strong> ${entrega.epiSnapshot?.nome}</p>
    <p><strong>Quantidade:</strong> ${entrega.quantidade}</p>
    <p><strong>Data da devolução:</strong> ${new Date(entrega.dataDevolucao!).toLocaleString()}</p>
    <p><strong>Devolvido por:</strong> ${entrega.devolvidoPor?.nome}</p>

    ${
      entrega.assinaturaDevolucaoBase64
        ? `<img src="${entrega.assinaturaDevolucaoBase64}" style="display:block;margin:20px auto;width:240px;border:1px solid #ccc;" />`
        : ""
    }
  `;

  document.body.appendChild(ele);

  const canvas = await html2canvas(ele);
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
  pdf.save(`recibo_devolucao_${entrega._id}.pdf`);

  document.body.removeChild(ele);
}

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Entregas de EPI</h1>

        <div className="flex items-center gap-3">
          {alertLowStock && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-2 rounded">
              <strong>Atenção:</strong> {alertLowStock}
            </div>
          )}

          <button onClick={() => setOpenModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Nova Entrega
          </button>
        </div>
      </div>

      {loading ? <div>Carregando...</div> : (
        <table className="w-full bg-white shadow rounded overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Colaborador</th>
              <th className="p-2 text-left">EPI</th>
              <th className="p-2">Qtde</th>
              <th className="p-2">Data</th>
              <th className="p-2">Entregue por</th>
              <th className="p-2">Validade</th>
              <th className="p-2">Status</th>
              <th className="p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {entregas.map(en => (
              <tr key={en._id} className="border-t">
                <td className="p-2">{en.colaboradorId?.nome}</td>
                <td className="p-2">{en.epiSnapshot?.nome || en.epiId?.nome}</td>
                <td className="p-2 text-center">{en.quantidade}</td>
                <td className="p-2">{new Date(en.dataEntrega).toLocaleString()}</td>
                <td className="p-2">{en.entreguePor?.nome}</td>
                <td className="p-2">{en.epiSnapshot?.validade_ca ? new Date(en.epiSnapshot.validade_ca).toLocaleDateString() : "-"}</td>
                <td className="p-2">{en.devolvida ? ( <span className="text-blue-600 font-semibold">Devolvido</span>
                    ) : (
                      <span className="text-green-600 font-semibold">Ativo</span>
                    )}
                  </td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => generatePdfReceipt(en)} className="text-blue-600">Recibo</button>
                  {en.devolvida && ( <button onClick={() => generatePdfDevolucao(en)} className="text-purple-600">Recibo Devolução</button> )}
                  {!en.devolvida && (
                  <button onClick={() => { setDevolucaoEntrega(en); setOpenDevolucao(true);}} className="text-orange-600"> Devolver</button> )}
                  <button onClick={() => { setDeleteId(en._id); setOpenDelete(true); }} className="text-red-600">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal Nova Entrega - aqui aumentei a área interna pra modal ficar maior e responsiva */}
      <Modal open={openModal} onClose={() => { setOpenModal(false); clearSignature(); }} title="Nova Entrega">
        <div className="max-w-3xl w-full max-h-[80vh] overflow-auto p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <select value={colaboradorId} onChange={e => setColaboradorId(e.target.value)} required className="border p-2 w-full">
              <option value="">Selecione colaborador</option>
              {colaboradores.map(c => <option key={c._id} value={c._id}>{c.nome}</option>)}
            </select>

            <select value={epiId} onChange={e => setEpiId(e.target.value)} required className="border p-2 w-full">
              <option value="">Selecione EPI</option>
              {epis.map(ep => <option key={ep._id} value={ep._id}>{ep.nome} (estoque: {ep.estoque})</option>)}
            </select>

            {selectedEpi && (
              <div className="p-2 bg-gray-50 border rounded">
                <div>Estoque atual: {selectedEpi.estoque}</div>
                <div>Validade CA: {selectedEpi.validade_ca ? new Date(selectedEpi.validade_ca).toLocaleDateString() : "-"}</div>
              </div>
            )}

            <input type="number" min={1} value={quantidade} onChange={e => setQuantidade(Number(e.target.value))} className="border p-2 w-full" required />

            <textarea value={observacao} onChange={e => setObservacao(e.target.value)} className="border p-2 w-full" placeholder="Observação (opcional)" />

            <div>
              <div className="mb-2 font-medium">Assinatura</div>

              {/* container responsivo do canvas */}
              <div ref={canvasContainerRef} className="border rounded p-2">
                <SignaturePad
                  ref={sigPadRef}
                  // important: we do not set width/height css here; we resize on mount with JS for correct ratio
                  canvasProps={{ className: "signature-canvas", style: { width: "100%", height: "200px" } }}
                />
              </div>

              <div className="flex gap-2 mt-2">
                <button type="button" onClick={clearSignature} className="px-3 py-1 border rounded">Limpar</button>

                <button
                  type="button"
                  onClick={saveSignature}
                  className={`px-3 py-1 border rounded ${savingSignature ? "opacity-60" : ""}`}
                  disabled={savingSignature}
                >
                  {savingSignature ? "Salvando..." : "Salvar assinatura"}
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Confirmar Entrega</button>
              <button type="button" onClick={() => { setOpenModal(false); clearSignature(); }} className="px-4 py-2 border rounded">Cancelar</button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Confirm delete */}
      <ConfirmModal
        open={openDelete}
        title="Excluir entrega"
        message="Excluir entrega restaurará o estoque. Tem certeza?"
        onClose={() => setOpenDelete(false)}
        onConfirm={handleDelete}
      />

      {/* Modal de confirmação padrão quando assinatura salva */}
      {signatureSavedModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
            <h3 className="font-semibold mb-2">Assinatura salva</h3>
            <p className="text-sm text-gray-600 mb-4">A assinatura foi salva com sucesso ✅</p>
            <div className="flex justify-center">
              <button onClick={() => setSignatureSavedModalOpen(false)} className="px-4 py-2 bg-blue-600 text-white rounded">OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de erro padrão para assinatura */}
      {signatureErrorModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="font-semibold mb-2 text-red-600">Erro</h3>
            <p className="text-sm text-gray-700 mb-4">{signatureErrorMessage}</p>
            <div className="flex justify-end">
              <button onClick={() => setSignatureErrorModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded">Fechar</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Devolução */}
      <Modal
          open={openDevolucao}
          onClose={() => {
            setOpenDevolucao(false);
            setDevolucaoEntrega(null);
            setDevolucaoObs("");
          }}
          title="Registrar Devolução"
        >
          <div className="space-y-4">
            <p>
              <strong>Colaborador:</strong> {devolucaoEntrega?.colaboradorId?.nome}
            </p>
            <p>
              <strong>EPI:</strong>{" "}
              {devolucaoEntrega?.epiSnapshot?.nome || devolucaoEntrega?.epiId?.nome}
            </p>
            <p>
              <strong>Quantidade:</strong> {devolucaoEntrega?.quantidade}
            </p>

            <textarea
              value={devolucaoObs}
              onChange={(e) => setDevolucaoObs(e.target.value)}
              className="border p-2 w-full"
              placeholder="Observação da devolução (opcional)"
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setOpenDevolucao(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancelar
              </button>

              <div>

            <div className="font-medium mb-2">Assinatura da devolução</div>

              <div ref={canvasDevolucaoRef} className="border rounded p-2">
                <SignaturePad
                  ref={sigPadDevolucaoRef}
                  canvasProps={{ style: { width: "100%", height: "200px" } }}
                />
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={clearSignatureDevolucao}
                  className="px-3 py-1 border rounded"
                >
                  Limpar
                </button>

                <button
                  type="button"
                  onClick={saveSignatureDevolucao}
                  className="px-3 py-1 border rounded"
                >
                  Salvar assinatura
                </button>

              <button
                onClick={handleDevolucao}
                disabled={devolucaoLoading}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
              >
                {devolucaoLoading ? "Registrando..." : "Confirmar Devolução"}
              </button>

                 {/* Modal de Sucesso para devolução */}
              {signatureDevolucaoSaved && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
                    <h3 className="font-semibold mb-2">Assinatura salva</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Assinatura da devolução salva com sucesso ✅
                    </p>
                    <button
                      onClick={() => setSignatureDevolucaoSaved(false)}
                      className="px-4 py-2 bg-orange-600 text-white rounded"
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}
              {/* Modal de erro para devolução */}
              {signatureDevolucaoError && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                    <h3 className="font-semibold text-red-600 mb-2">Erro</h3>
                    <p className="text-sm mb-4">{signatureDevolucaoError}</p>
                    <button
                      onClick={() => setSignatureDevolucaoError(null)}
                      className="px-4 py-2 bg-gray-300 rounded"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}
                </div>
              </div>
            </div>
          </div>
        </Modal>
    </div>
  );
}
