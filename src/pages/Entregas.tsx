import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { api } from "../services/api";
import SignaturePad from "react-signature-canvas";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import jsPDF from "jspdf";
import { io } from "socket.io-client";

import {
  TrashIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  ArrowPathRoundedSquareIcon,
  CheckBadgeIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  FunnelIcon,
  BellAlertIcon
} from "@heroicons/react/24/outline";

// Criamos a instância fora para não resetar a cada renderização
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const socket = io(SOCKET_URL, { autoConnect: true });

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

  const [filtroStatus, setFiltroStatus] = useState<"todos" | "ativos" | "devolvidos">("todos");
  const [isAdmin, setIsAdmin] = useState(false); 
  const token = localStorage.getItem("token");

  // --- STATES DE NOTIFICAÇÃO ---
  const [showToast, setShowToast] = useState<{show: boolean, msg: string}>({ show: false, msg: "" });
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

      const itensCriticos = resEpis.data.filter((e: any) => e.estoque <= 5);
      if (itensCriticos.length > 0) {
        setAlertLowStock(itensCriticos.length === 1 
          ? `${itensCriticos[0].nome} (${itensCriticos[0].estoque} un)`
          : `${itensCriticos.length} itens em nível crítico!`);
      } else {
        setAlertLowStock(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // --- CONFIGURAÇÃO DO SOCKET ---
  useEffect(() => {
    // Escuta o evento que o Back-end emite
    socket.on("notificacao_entrega", (data: any) => {
      console.log("Recebi notificação via Socket:", data);
      setShowToast({ show: true, msg: data.msg || "Nova entrega registrada!" });
      
      // Toca o som (Link direto sem erro 403)
      if (audioRef.current) {
        audioRef.current.currentTime = 0; // Reinicia se já estiver tocando
        audioRef.current.play().catch(_e => console.log("Áudio bloqueado pelo navegador até o primeiro clique."));
      }

      setTimeout(() => setShowToast({ show: false, msg: "" }), 5000);
      load(); // Recarrega a lista
    });

    const userTipo = localStorage.getItem("userTipo");
    setIsAdmin(userTipo === "admin");
    load(); 

    return () => { 
      socket.off("notificacao_entrega"); // Limpa o listener ao sair da página
    };
  }, []);

  const entregasFiltradas = entregas.filter(en => {
    if (filtroStatus === "ativos") return !en.devolvida;
    if (filtroStatus === "devolvidos") return en.devolvida;
    return true;
  });

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
    const termo = `Declaramos para os devidos fins que recebi da empresa os Equipamentos de Proteção Individual (EPIs) abaixo listados, novos e em perfeitas condições de uso, em conformidade com a NR-6. Comprometo-me a utilizá-los apenas para a finalidade a que se destinam.`;
    const splitTermo = doc.splitTextToSize(termo, pageWidth - 20);
    doc.text(splitTermo, 10, 35);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`Colaborador: ${en.colaboradorId?.nome || "---"}`, 10, 55);
    doc.text(`Matrícula: ${en.colaboradorId?.matricula || "---"}`, 120, 55);
    const dataHora = new Date(en.dataEntrega);
    doc.text(`Data da Entrega: ${dataHora.toLocaleDateString()} às ${dataHora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 10, 62);
    if (en.devolvida && en.dataDevolucao) {
      const dataDev = new Date(en.dataDevolucao);
      doc.setTextColor(200, 0, 0);
      doc.text(`DATA DA DEVOLUÇÃO: ${dataDev.toLocaleDateString()} às ${dataDev.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 10, 68);
      doc.setTextColor(0, 0, 0);
    }
    doc.setFillColor(245, 245, 245);
    doc.rect(10, 75, pageWidth - 20, 10, "F");
    doc.text("Item / Equipamento", 12, 82);
    doc.text("CA", 100, 82);
    doc.text("Validade CA", 130, 82);
    doc.text("Qtd", 175, 82);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(en.epiSnapshot?.nome || en.epiId?.nome || "---", 12, 92);
    doc.text(String(en.epiSnapshot?.ca || "---"), 100, 92);
    const validadeStr = en.epiSnapshot?.validade_ca ? new Date(en.epiSnapshot.validade_ca).toLocaleDateString() : "---";
    doc.text(validadeStr, 130, 92);
    doc.text(String(en.quantidade), 175, 92);
    if (en.assinaturaBase64) {
      doc.setFont("helvetica", "bold");
      doc.text("Assinatura do Recebedor (Entrega):", 10, 115);
      doc.addImage(en.assinaturaBase64, "PNG", 10, 118, 50, 20);
      doc.line(10, 138, 70, 138);
    }
    if (en.devolvida && en.assinaturaDevolucaoBase64) {
      doc.setFont("helvetica", "bold");
      doc.text("Assinatura de Recebimento (Devolução):", 110, 115);
      doc.addImage(en.assinaturaDevolucaoBase64, "PNG", 110, 118, 50, 20);
      doc.line(110, 138, 170, 138);
      doc.setFontSize(8);
      doc.text(`Motivo/Obs: ${en.observacaoDevolucao || "N/A"}`, 110, 142);
    }
    doc.setFontSize(8);
    doc.text(`ID do Registro: ${en._id}`, 10, 280);
    doc.text(`Recibo gerado em: ${new Date().toLocaleString()}`, 10, 285);
    doc.save(`Recibo_EPI_${en.colaboradorId?.nome.replace(/\s+/g, '_')}.pdf`);
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
      
      // Emitimos usando a instância global para não precisar reconectar
      socket.emit("nova_entrega", { msg: "Entrega realizada com sucesso!" });

      setOpenModal(false);
      setColaboradorId("");
      setEpiId("");
      setQuantidade(1);
      setObservacao("");
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
    try {
      await api.delete(`/entregas/${deleteId}`, { headers: { Authorization: `Bearer ${token}` } });
      setOpenDelete(false);
      load();
    } catch (err: any) {
      alert(err.response?.data?.erro || "Erro ao excluir");
      setOpenDelete(false);
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen relative">
      {/* Link de som direto do Mixkit que não dá 403 */}
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />

      {/* TOAST DE NOTIFICAÇÃO */}
      {showToast.show && (
        <div className="fixed top-5 right-5 z-[100] bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-gray-700 flex items-center gap-4 animate-bounce">
          <div className="bg-emerald-500 p-2 rounded-lg">
            <BellAlertIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Novo Registro</p>
            <p className="text-sm font-bold text-gray-100">{showToast.msg}</p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Entregas de EPI</h1>
          <div className="flex items-center gap-2 mt-1">
            <CheckBadgeIcon className="h-5 w-5 text-emerald-500" />
            <p className="text-gray-500 text-sm font-medium">Controle jurídico e operacional.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {alertLowStock && (
            <div className="bg-rose-100 text-rose-700 px-4 py-2 rounded-xl border border-rose-200 text-xs font-black flex items-center gap-2 animate-pulse">
              <ExclamationTriangleIcon className="h-4 w-4" /> ATENÇÃO: {alertLowStock}
            </div>
          )}
          <button onClick={() => setOpenModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl shadow-lg transition-all font-bold flex items-center gap-2">
            <PlusIcon className="h-5 w-5" /> Nova Entrega
          </button>
        </div>
      </div>

      {/* FILTROS */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <div className="flex items-center gap-2 text-gray-400 mr-2">
          <FunnelIcon className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Filtrar:</span>
        </div>
        <button onClick={() => setFiltroStatus("todos")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filtroStatus === 'todos' ? 'bg-gray-800 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-100'}`}>Todos</button>
        <button onClick={() => setFiltroStatus("ativos")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filtroStatus === 'ativos' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-emerald-600 border border-emerald-100 hover:bg-emerald-50'}`}>Somente Ativos</button>
        <button onClick={() => setFiltroStatus("devolvidos")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filtroStatus === 'devolvidos' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-blue-600 border border-blue-100 hover:bg-blue-50'}`}>Devolvidos</button>
      </div>

      {/* TABELA */}
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
              {entregasFiltradas.map(en => {
                const isCAVencido = en.epiSnapshot?.validade_ca ? new Date(en.epiSnapshot.validade_ca) < new Date() : false;
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
                      <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${en.devolvida ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {en.devolvida ? 'Devolvido' : 'Ativo'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => generatePdfReceipt(en)} className="p-2 text-gray-400 hover:text-blue-600"><ArrowDownTrayIcon className="h-5 w-5"/></button>
                        {!en.devolvida && (
                          <button onClick={() => { setDevolucaoEntrega(en); setOpenDevolucao(true);}} className="p-2 text-gray-400 hover:text-orange-600"><ArrowPathRoundedSquareIcon className="h-5 w-5"/></button>
                        )}
                        {isAdmin && (
                          <button onClick={() => { setDeleteId(en._id); setOpenDelete(true); }} className="p-2 text-gray-400 hover:text-red-600"><TrashIcon className="h-5 w-5"/></button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAIS */}
      <Modal open={openModal} onClose={() => setOpenModal(false)} title="Nova Entrega">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select value={colaboradorId} onChange={e => setColaboradorId(e.target.value)} required className="w-full border-gray-300 rounded-xl">
              <option value="">Selecione Colaborador</option>
              {colaboradores.map(c => <option key={c._id} value={c._id}>{c.nome}</option>)}
            </select>
            <select value={epiId} onChange={e => setEpiId(e.target.value)} required className="w-full border-gray-300 rounded-xl">
              <option value="">Selecione EPI</option>
              {epis.map(ep => <option key={ep._id} value={ep._id}>{ep.nome}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <input type="number" min={1} value={quantidade} onChange={e => setQuantidade(Number(e.target.value))} className="w-24 border-gray-300 rounded-xl" required />
            <input type="text" value={observacao} onChange={e => setObservacao(e.target.value)} placeholder="Observação..." className="flex-1 border-gray-300 rounded-xl" />
          </div>
          <div ref={canvasContainerRef} className="border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 h-[200px] relative">
            <SignaturePad ref={sigPadRef} canvasProps={{ className: "w-full h-full" }} />
            <button type="button" onClick={() => sigPadRef.current.clear()} className="absolute top-2 right-2 bg-white px-2 py-1 text-[9px] rounded border">Limpar</button>
          </div>
          <button disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg uppercase text-xs">
            {loading ? "Registrando..." : "Confirmar Entrega"}
          </button>
        </form>
      </Modal>

      <Modal open={openDevolucao} onClose={() => setOpenDevolucao(false)} title="Confirmar Devolução">
        <div className="space-y-4">
          <input value={devolucaoObs} onChange={(e) => setDevolucaoObs(e.target.value)} className="w-full border-gray-300 rounded-xl" placeholder="Observações..." />
          <div className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 h-[150px]">
            <SignaturePad ref={sigPadDevolucaoRef} canvasProps={{ className: "w-full h-full" }} />
          </div>
          <button onClick={handleDevolucao} disabled={devolucaoLoading} className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg uppercase text-xs">
            {devolucaoLoading ? "Gravando..." : "Confirmar Recebimento"}
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={openDelete}
        title="Remover Registro?"
        message="A exclusão retornará o item ao estoque."
        onClose={() => setOpenDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}