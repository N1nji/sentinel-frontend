import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { api } from "../services/api";
import SignaturePad from "react-signature-canvas";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import jsPDF from "jspdf";

import {
  TrashIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  ArrowPathRoundedSquareIcon,
  CheckBadgeIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon
} from "@heroicons/react/24/outline";

interface IEntrega {
  _id: string;
  colaboradorId: { _id: string; nome: string; matricula?: string; };
  epiId: { _id: string; nome: string; };
  epiSnapshot?: {
    nome: string;
    ca?: number;
    validade_ca?: string; 
    nivel_protecao?: string;
    fotoUrl?: string;
  };
  quantidade: number;
  dataEntrega: string;
  entreguePor?: { _id: string; nome: string; email?: string; };
  observacao?: string;
  assinaturaBase64?: string;
  validadeStatus?: "valido" | "vencido";
  devolvida?: boolean;
  dataDevolucao?: string;
  devolvidoPor?: { _id: string; nome: string; email?: string; };
  observacaoDevolucao?: string;
  assinaturaDevolucaoBase64?: string;
}

export default function Entregas() {
  const [entregas, setEntregas] = useState<IEntrega[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [colaboradorId, setColaboradorId] = useState("");
  const [epiId, setEpiId] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [observacao, setObservacao] = useState("");
  
  const sigPadRef = useRef<any>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  const [epis, setEpis] = useState<any[]>([]);
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertLowStock, setAlertLowStock] = useState<string | null>(null);

  const [openDevolucao, setOpenDevolucao] = useState(false);
  const [devolucaoEntrega, setDevolucaoEntrega] = useState<IEntrega | null>(null);
  const [devolucaoObs, setDevolucaoObs] = useState("");
  const [devolucaoLoading, setDevolucaoLoading] = useState(false);
  const sigPadDevolucaoRef = useRef<any>(null);

  const token = localStorage.getItem("token");

  async function load() {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [resEnt, resEpis, resCols] = await Promise.all([
        api.get("/entregas", { headers }),
        api.get("/epis", { headers }),
        api.get("/colaboradores", { headers }),
      ]);
      setEntregas(resEnt.data);
      setEpis(resEpis.data);
      setColaboradores(resCols.data);

      const low = resEpis.data.find((e: any) => e.estoque <= 5);
      setAlertLowStock(low ? `${low.nome} (${low.estoque} un)` : null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function generatePdfReceipt(en: IEntrega) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("FICHA DE CONTROLE DE EPI", pageWidth / 2, 20, { align: "center" });

    doc.setLineWidth(0.5);
    doc.line(10, 25, pageWidth - 10, 25);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const termo = `Declaramos para os devidos fins que recebi da empresa os Equipamentos de Proteção Individual (EPIs) abaixo listados, novos e em perfeitas condições de uso, em conformidade com a NR-6 da Portaria 3.214/78. Comprometo-me a utilizá-los apenas para a finalidade a que se destinam e a zelar pela sua guarda e conservação.`;
    const splitTermo = doc.splitTextToSize(termo, pageWidth - 20);
    doc.text(splitTermo, 10, 35);

    doc.setFont("helvetica", "bold");
    doc.text(`Colaborador: ${en.colaboradorId?.nome || "---"}`, 10, 55);
    doc.text(`Data: ${new Date(en.dataEntrega).toLocaleDateString()}`, pageWidth - 50, 55);

    doc.setFillColor(245, 245, 245);
    doc.rect(10, 65, pageWidth - 20, 10, "F");
    doc.text("Item", 12, 72);
    doc.text("CA", 120, 72);
    doc.text("Qtd", 150, 72);

    doc.setFont("helvetica", "normal");
    doc.text(en.epiSnapshot?.nome || en.epiId?.nome || "---", 12, 82);
    doc.text(String(en.epiSnapshot?.ca || "---"), 120, 82);
    doc.text(String(en.quantidade), 150, 82);

    if (en.assinaturaBase64) {
      doc.setFont("helvetica", "bold");
      doc.text("Assinatura do Recebedor:", 10, 110);
      doc.addImage(en.assinaturaBase64, "PNG", 10, 115, 50, 20);
      doc.line(10, 136, 70, 136);
    }

    doc.save(`Recibo_EPI_${en.colaboradorId?.nome}.pdf`);
  }

  const resizeCanvas = (pad: any, container: HTMLDivElement | null) => {
    if (!pad || !container) return;
    const canvas = pad.getCanvas();
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = container.offsetWidth * ratio;
    canvas.height = 200 * ratio;
    canvas.getContext("2d")?.scale(ratio, ratio);
    pad.clear();
  };

  useLayoutEffect(() => {
    if (openModal) setTimeout(() => resizeCanvas(sigPadRef.current, canvasContainerRef.current), 200);
  }, [openModal]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sigPadRef.current || sigPadRef.current.isEmpty()) return alert("Assinatura obrigatória");
    const signature = sigPadRef.current.getTrimmedCanvas().toDataURL("image/png");

    try {
      setLoading(true);
      await api.post("/entregas", {
        colaboradorId, epiId, quantidade, observacao, assinaturaBase64: signature
      }, { headers: { Authorization: `Bearer ${token}` } });
      setOpenModal(false);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Erro");
    } finally {
      setLoading(false);
    }
  }

  async function handleDevolucao() {
    if (!sigPadDevolucaoRef.current || sigPadDevolucaoRef.current.isEmpty()) return alert("Assinatura obrigatória");
    const signature = sigPadDevolucaoRef.current.getTrimmedCanvas().toDataURL("image/png");
    try {
      setDevolucaoLoading(true);
      await api.post(`/entregas/${devolucaoEntrega?._id}/devolucao`, {
        observacao: devolucaoObs, assinaturaBase64: signature
      }, { headers: { Authorization: `Bearer ${token}` } });
      setOpenDevolucao(false);
      load();
    } finally { setDevolucaoLoading(false); }
  }

  async function handleDelete() {
    await api.delete(`/entregas/${deleteId}`, { headers: { Authorization: `Bearer ${token}` } });
    setOpenDelete(false);
    load();
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* HEADER DASHBOARD */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Entregas de EPI</h1>
          <div className="flex items-center gap-2 mt-1">
            <CheckBadgeIcon className="h-5 w-5 text-emerald-500" />
            <p className="text-gray-500 text-sm font-medium">Controle jurídico e operacional de equipamentos.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {alertLowStock && (
            <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl border border-amber-200 text-xs font-bold flex items-center gap-2">
              <ExclamationTriangleIcon className="h-4 w-4" /> Estoque Baixo: {alertLowStock}
            </div>
          )}
          <button onClick={() => setOpenModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl shadow-lg transition-all font-bold flex items-center gap-2">
            <PlusIcon className="h-5 w-5" /> Nova Entrega
          </button>
        </div>
      </div>

      {/* LISTAGEM */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                <th className="p-4">Colaborador / Equipamento</th>
                <th className="p-4 text-center">Qtd</th>
                <th className="p-4">Data / CA</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entregas.map(en => {
                const validadeCaStr = en.epiSnapshot?.validade_ca;
                const isCAVencido = validadeCaStr ? new Date(validadeCaStr) < new Date() : false;

                return (
                  <tr key={en._id} className="hover:bg-blue-50/20 transition-all group">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800">{en.colaboradorId?.nome}</span>
                        <span className="text-xs text-blue-600 flex items-center gap-1 font-medium">
                          <InformationCircleIcon className="h-3.5 w-3.5" /> {en.epiSnapshot?.nome || en.epiId?.nome}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-gray-100 px-2 py-1 rounded-md text-xs font-bold text-gray-600">{en.quantidade}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col text-[11px]">
                        <span className="text-gray-600 font-bold tracking-tight flex items-center gap-1">
                          <CalendarDaysIcon className="h-3.5 w-3.5 text-gray-400" />
                          {new Date(en.dataEntrega).toLocaleDateString()}
                        </span>
                        <span className={`${isCAVencido ? 'text-red-500 font-black' : 'text-gray-400 font-medium'}`}>
                          CA: {en.epiSnapshot?.ca || '---'} {isCAVencido && ' (VENCIDO)'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {en.devolvida ? (
                        <span className="px-2 py-1 rounded-full text-[9px] font-black bg-blue-100 text-blue-700 uppercase">Devolvido</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-700 uppercase">Ativo</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => generatePdfReceipt(en)} className="p-2 text-gray-400 hover:text-blue-600 transition-all"><ArrowDownTrayIcon className="h-5 w-5"/></button>
                        {!en.devolvida && (
                          <button onClick={() => { setDevolucaoEntrega(en); setOpenDevolucao(true);}} className="p-2 text-gray-400 hover:text-orange-600 transition-all"><ArrowPathRoundedSquareIcon className="h-5 w-5"/></button>
                        )}
                        <button onClick={() => { setDeleteId(en._id); setOpenDelete(true); }} className="p-2 text-gray-400 hover:text-red-600 transition-all"><TrashIcon className="h-5 w-5"/></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL NOVA ENTREGA */}
      <Modal open={openModal} onClose={() => setOpenModal(false)} title="Nova Entrega de EPI">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select value={colaboradorId} onChange={e => setColaboradorId(e.target.value)} required className="w-full border-gray-300 rounded-xl focus:ring-blue-500">
              <option value="">Selecione Colaborador</option>
              {colaboradores.map(c => <option key={c._id} value={c._id}>{c.nome}</option>)}
            </select>
            <select value={epiId} onChange={e => setEpiId(e.target.value)} required className="w-full border-gray-300 rounded-xl focus:ring-blue-500">
              <option value="">Selecione EPI</option>
              {epis.map(ep => <option key={ep._id} value={ep._id}>{ep.nome} (Estoque: {ep.estoque})</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <input type="number" min={1} value={quantidade} onChange={e => setQuantidade(Number(e.target.value))} className="w-24 border-gray-300 rounded-xl" required />
            <input type="text" value={observacao} onChange={e => setObservacao(e.target.value)} placeholder="Observação opcional..." className="flex-1 border-gray-300 rounded-xl" />
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Assinatura Digital</label>
            <div ref={canvasContainerRef} className="border-2 border-dashed border-gray-200 rounded-2xl mt-1 bg-gray-50 overflow-hidden relative">
              <SignaturePad ref={sigPadRef} canvasProps={{ className: "w-full h-[200px]" }} />
              <button type="button" onClick={() => sigPadRef.current.clear()} className="absolute top-2 right-2 bg-white px-2 py-1 text-[9px] font-black rounded border">Limpar</button>
            </div>
          </div>
          <button disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all uppercase tracking-widest text-xs">
            {loading ? "Registrando..." : "Confirmar Entrega"}
          </button>
        </form>
      </Modal>

      {/* MODAL DEVOLUÇÃO */}
      <Modal open={openDevolucao} onClose={() => setOpenDevolucao(false)} title="Confirmar Devolução">
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm">
            <p className="text-blue-800"><strong>Equipamento:</strong> {devolucaoEntrega?.epiSnapshot?.nome}</p>
            <p className="text-blue-800"><strong>Colaborador:</strong> {devolucaoEntrega?.colaboradorId?.nome}</p>
          </div>
          <input value={devolucaoObs} onChange={(e) => setDevolucaoObs(e.target.value)} className="w-full border-gray-300 rounded-xl" placeholder="Condições do equipamento..." />
          <div className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 h-[150px]">
            <SignaturePad ref={sigPadDevolucaoRef} canvasProps={{ className: "w-full h-full" }} />
          </div>
          <button onClick={handleDevolucao} disabled={devolucaoLoading} className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-orange-700 uppercase text-xs tracking-widest">
            {devolucaoLoading ? "Gravando..." : "Confirmar Recebimento"}
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={openDelete}
        title="Remover Registro?"
        message="A exclusão retornará o item ao estoque, mas apagará o registro histórico."
        onClose={() => setOpenDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}