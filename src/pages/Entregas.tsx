import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { api } from "../services/api";
import SignaturePad from "react-signature-canvas";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import IAModal from "../components/IASelectModal";
import { SparklesIcon } from "@heroicons/react/24/solid";
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

  const [showToast, setShowToast] = useState<{show: boolean, msg: string}>({ show: false, msg: "" });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [openIA, setOpenIA] = useState(false);

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

  useEffect(() => {
    socket.on("nova_entrega", (data: any) => {
      setShowToast({ show: true, msg: data.msg || "Nova entrega registrada!" });
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(_e => {});
      }
      setTimeout(() => setShowToast({ show: false, msg: "" }), 5000);
      load();
    });

    const userTipo = localStorage.getItem("userTipo");
    setIsAdmin(userTipo === "admin");
    load(); 

    return () => { socket.off("nova_entrega"); };
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

    if (en.observacao) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const obsSplit = doc.splitTextToSize(`Observação Técnica: ${en.observacao}`, pageWidth - 20);
      doc.text(obsSplit, 10, 102);
      doc.setTextColor(0, 0, 0);
    }

    if (en.assinaturaBase64) {
      doc.setFont("helvetica", "bold");
      doc.text("Assinatura do Recebedor (Entrega):", 10, 125);
      doc.addImage(en.assinaturaBase64, "PNG", 10, 128, 50, 20);
      doc.line(10, 148, 70, 148);
    }

    if (en.devolvida && en.assinaturaDevolucaoBase64) {
      doc.setFont("helvetica", "bold");
      doc.text("Assinatura de Recebimento (Devolução):", 110, 125);
      doc.addImage(en.assinaturaDevolucaoBase64, "PNG", 110, 128, 50, 20);
      doc.line(110, 148, 170, 148);
      doc.setFontSize(8);
      doc.text(`Motivo/Obs Devolução: ${en.observacaoDevolucao || "N/A"}`, 110, 153);
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
      setDevolucaoObs("");
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
    <div className="p-4 md:p-6 max-w-7xl mx-auto bg-gray-50 dark:bg-slate-950 min-h-screen relative transition-colors">
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />

      {showToast.show && (
        <div className="fixed top-5 right-5 z-[100] bg-gray-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-2xl shadow-2xl border border-gray-700 dark:border-slate-200 flex items-center gap-4 animate-bounce">
          <div className="bg-emerald-500 p-2 rounded-lg">
            <BellAlertIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 dark:text-emerald-600">Novo Registro</p>
            <p className="text-sm font-bold">{showToast.msg}</p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Entregas de EPI</h1>
          <div className="flex items-center gap-2 mt-1">
            <CheckBadgeIcon className="h-5 w-5 text-emerald-500" />
            <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">Controle jurídico e operacional.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {alertLowStock && (
            <div className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-800 text-[10px] md:text-xs font-black flex items-center gap-2 animate-pulse">
              <ExclamationTriangleIcon className="h-4 w-4 shrink-0" /> ATENÇÃO: {alertLowStock}
            </div>
          )}
          <button onClick={() => setOpenModal(true)} className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all font-bold flex items-center justify-center gap-2 active:scale-95">
            <PlusIcon className="h-5 w-5" /> <span className="whitespace-nowrap">Nova Entrega</span>
          </button>
        </div>
      </div>

      {/* FILTROS */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-4 no-scrollbar">
        <div className="flex items-center gap-2 text-gray-400 dark:text-slate-500 mr-2 shrink-0">
          <FunnelIcon className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Filtrar:</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFiltroStatus("todos")} className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filtroStatus === 'todos' ? 'bg-gray-800 dark:bg-white text-white dark:text-slate-900 shadow-md' : 'bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-800'}`}>Todos</button>
          <button onClick={() => setFiltroStatus("ativos")} className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filtroStatus === 'ativos' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-emerald-600 border border-emerald-100 dark:border-emerald-900/50'}`}>Ativos</button>
          <button onClick={() => setFiltroStatus("devolvidos")} className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filtroStatus === 'devolvidos' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-blue-600 border border-blue-100 dark:border-blue-900/50'}`}>Devolvidos</button>
        </div>
      </div>

      {/* TABELA */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 text-gray-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">
                <th className="p-5">Colaborador / Equipamento</th>
                <th className="p-5 text-center">Qtd</th>
                <th className="p-5">Data / CA</th>
                <th className="p-5 text-center">Status</th>
                <th className="p-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {entregasFiltradas.map(en => {
                const isCAVencido = en.epiSnapshot?.validade_ca ? new Date(en.epiSnapshot.validade_ca) < new Date() : false;
                return (
                  <tr key={en._id} className="hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-all group">
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 dark:text-slate-200">{en.colaboradorId?.nome}</span>
                        <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 font-medium">
                          <InformationCircleIcon className="h-3.5 w-3.5" /> {en.epiSnapshot?.nome || en.epiId?.nome}
                        </span>
                        {en.observacao && (
                          <p className="text-[10px] text-gray-400 dark:text-slate-500 italic mt-1 max-w-[250px] truncate" title={en.observacao}>
                            "{en.observacao}"
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span className="bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-xs font-bold text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700">{en.quantidade}</span>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col text-[11px]">
                        <span className="text-gray-600 dark:text-slate-300 font-bold tracking-tight flex items-center gap-1">
                          <CalendarDaysIcon className="h-3.5 w-3.5 text-gray-400" />
                          {new Date(en.dataEntrega).toLocaleDateString()}
                        </span>
                        <span className={`${isCAVencido ? 'text-rose-500 dark:text-rose-400 font-black' : 'text-gray-400 dark:text-slate-500 font-medium'}`}>
                          CA: {en.epiSnapshot?.ca || '---'} {isCAVencido && ' (VENCIDO)'}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${en.devolvida ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900'}`}>
                        {en.devolvida ? 'Devolvido' : 'Ativo'}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-1 md:opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => generatePdfReceipt(en)} className="p-2 text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><ArrowDownTrayIcon className="h-5 w-5"/></button>
                        {!en.devolvida && (
                          <button onClick={() => { setDevolucaoEntrega(en); setOpenDevolucao(true);}} className="p-2 text-gray-400 dark:text-slate-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors"><ArrowPathRoundedSquareIcon className="h-5 w-5"/></button>
                        )}
                        {isAdmin && (
                          <button onClick={() => { setDeleteId(en._id); setOpenDelete(true); }} className="p-2 text-gray-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"><TrashIcon className="h-5 w-5"/></button>
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

      {/* MODAL NOVA ENTREGA */}
      <Modal open={openModal} onClose={() => setOpenModal(false)} title="Nova Entrega">
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Colaborador</label>
              <select value={colaboradorId} onChange={e => setColaboradorId(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white rounded-2xl p-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all">
                <option value="">Selecione Colaborador</option>
                {colaboradores.map(c => <option key={c._id} value={c._id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Equipamento (EPI)</label>
              <select value={epiId} onChange={e => setEpiId(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white rounded-2xl p-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all">
                <option value="">Selecione EPI</option>
                {epis.map(ep => <option key={ep._id} value={ep._id}>{ep.nome}</option>)}
              </select>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-32 space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Quantidade</label>
              <input type="number" min={1} value={quantidade} onChange={e => setQuantidade(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white rounded-2xl p-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" required />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Observações Técnicas</label>
              <div className="relative">
                <input type="text" value={observacao} onChange={e => setObservacao(e.target.value)} placeholder="Clique na estrela para IA..." className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white rounded-2xl p-3 pr-12 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
                <button type="button" onClick={() => setOpenIA(true)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
                  <SparklesIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Assinatura Digital (Toque ou Mouse)</label>
            <div ref={canvasContainerRef} className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl bg-gray-50 dark:bg-slate-800 h-[200px] relative overflow-hidden transition-colors">
              <SignaturePad ref={sigPadRef} canvasProps={{ className: "w-full h-full" }} penColor={document.documentElement.classList.contains('dark') ? 'white' : 'black'} />
              <button type="button" onClick={() => sigPadRef.current.clear()} className="absolute top-2 right-2 bg-white dark:bg-slate-900 dark:text-white px-3 py-1 text-[10px] font-bold rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">Limpar</button>
            </div>
          </div>

          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none uppercase text-xs tracking-widest transition-all active:scale-[0.98] disabled:opacity-50 mt-2">
            {loading ? "Processando..." : "Confirmar Entrega de EPI"}
          </button>
        </form>
      </Modal>

      {/* MODAL DE DEVOLUÇÃO */}
      <Modal open={openDevolucao} onClose={() => setOpenDevolucao(false)} title="Receber Devolução">
        <div className="space-y-4 pt-4">
          {devolucaoEntrega && (
            <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 p-4 rounded-2xl">
              <p className="text-[10px] font-black text-orange-400 dark:text-orange-500 uppercase tracking-widest mb-1">Colaborador / Item</p>
              <p className="text-sm font-bold text-gray-800 dark:text-slate-200">{devolucaoEntrega.colaboradorId?.nome}</p>
              <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mt-0.5">
                {devolucaoEntrega.epiSnapshot?.nome || devolucaoEntrega.epiId?.nome} ({devolucaoEntrega.quantidade} un)
              </p>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Estado do Item na Devolução</label>
            <input 
              value={devolucaoObs} 
              onChange={(e) => setDevolucaoObs(e.target.value)} 
              className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white rounded-2xl p-3 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm" 
              placeholder="Ex: Desgaste natural, danificado, troca periódica..." 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Assinatura de Recebimento</label>
            <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl bg-gray-50 dark:bg-slate-800 h-[150px] relative overflow-hidden transition-colors">
              <SignaturePad ref={sigPadDevolucaoRef} canvasProps={{ className: "w-full h-full" }} penColor={document.documentElement.classList.contains('dark') ? 'white' : 'black'} />
              <button type="button" onClick={() => sigPadDevolucaoRef.current.clear()} className="absolute top-2 right-2 bg-white dark:bg-slate-900 dark:text-white px-3 py-1 text-[10px] font-bold rounded-lg border border-gray-200 dark:border-slate-700 transition-colors">Limpar</button>
            </div>
          </div>

          <button onClick={handleDevolucao} disabled={devolucaoLoading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-200 dark:shadow-none uppercase text-xs tracking-widest transition-all active:scale-[0.98] disabled:opacity-50">
            {devolucaoLoading ? "Gravando..." : "Confirmar Recebimento de Devolução"}
          </button>
        </div>
      </Modal>

      <IAModal 
        open={openIA} 
        onClose={() => setOpenIA(false)}
        contextoInicial={
          epiId
          ? `Sugira uma observação técnica para a entrega de: ${epis.find(e => e._id === epiId)?.nome}`
          : "Descreva o cenário de uso para este EPI..."
        }
        onApply={(textoGerado: string) => {
          setObservacao(textoGerado);
          setOpenIA(false);
        }} 
      />

      <ConfirmModal
        open={openDelete}
        title="Remover Registro?"
        message="A exclusão retornará o item ao estoque e invalidará o recibo jurídico."
        onClose={() => setOpenDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}