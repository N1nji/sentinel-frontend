import { useEffect, useState } from "react";
import { api } from "../services/api";

import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import AiModal from "../components/AiModal";
import { sugerirEpi } from "../services/ia";
import { useTheme } from "../context/ThemeContext"; // IMPORTADO

import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowsUpDownIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

interface ISetor {
  _id: string;
  nome: string;
}

interface IRisco {
  _id: string;
  nome: string;
  categoria: string;
  setorId: ISetor;
  descricao: string;
  probabilidade: number;
  severidade: number;
  nivel: number;
  classificacao: string;
  medidas: string;
  responsavel: string;
  status: string;
}

export default function Riscos() {
  const { darkMode } = useTheme(); // CONSUMINDO O TEMA
  const [riscos, setRiscos] = useState<IRisco[]>([]);
  const [setores, setSetores] = useState<ISetor[]>([]);
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<"asc" | "desc">("asc");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 8;

  const [openModal, setOpenModal] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [iaOpen, setIaOpen] = useState(false);
  const [iaTexto, setIaTexto] = useState("");
  const [iaLoading, setIaLoading] = useState(false);

  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("fisico");
  const [setorId, setSetorId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [probabilidade, setProbabilidade] = useState(1);
  const [severidade, setSeveridade] = useState(1);
  const [medidas, setMedidas] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [status, setStatus] = useState("ativo");

  const token = localStorage.getItem("token");

  async function load() {
    const [riscosRes, setoresRes] = await Promise.all([
      api.get("/riscos", { headers: { Authorization: `Bearer ${token}` } }),
      api.get("/setores", { headers: { Authorization: `Bearer ${token}` } })
    ]);
    setRiscos(riscosRes.data);
    setSetores(setoresRes.data);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = { nome, categoria, setorId, descricao, probabilidade, severidade, medidas, responsavel, status };
    if (editingId) {
      await api.put(`/riscos/${editingId}`, data, { headers: { Authorization: `Bearer ${token}` } });
    } else {
      await api.post("/riscos", data, { headers: { Authorization: `Bearer ${token}` } });
    }
    setOpenModal(false);
    resetForm();
    load();
  }

  function resetForm() {
    setEditingId(null); setNome(""); setDescricao(""); setProbabilidade(1);
    setSeveridade(1); setMedidas(""); setResponsavel(""); setSetorId("");
    setCategoria("fisico"); setStatus("ativo");
  }

  async function handleDelete(id: string) {
    await api.delete(`/riscos/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    setOpenDelete(false);
    load();
  }

  async function handleIa(riscoNome: string) {
    try {
      setIaOpen(true);
      setIaLoading(true);
      setIaTexto("");
      const resposta = await sugerirEpi(riscoNome);
      setIaTexto(resposta);
    } catch (e) {
      setIaTexto("⚠️ Erro ao consultar Sentinel AI.");
    } finally {
      setIaLoading(false);
    }
  }

  const filtrados = riscos.filter((r) => r.nome.toLowerCase().includes(busca.toLowerCase()));
  const ordenados = [...filtrados].sort((a, b) => ordem === "asc" ? a.nome.localeCompare(b.nome) : b.nome.localeCompare(a.nome));
  const pagina = ordenados.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);
  const totalPaginas = Math.ceil(ordenados.length / itensPorPagina);

  function getBadgeClass(c: string) {
    switch (c) {
      case "baixo": return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "moderado": return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case "medio": return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800";
      case "alto": return "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800";
      case "critico": return "bg-red-200 dark:bg-red-900/50 text-red-900 dark:text-red-300 border-red-300 dark:border-red-700 animate-pulse";
      default: return "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400";
    }
  }

  return (
    <div className="p-1 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ExclamationTriangleIcon className={`h-8 w-8 ${darkMode ? 'text-rose-400' : 'text-rose-600'}`} />
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Mapa de Riscos</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium ml-10 text-sm md:text-base">Identificação e controle de perigos por setor</p>
        </div>

        <button
          className="bg-rose-600 text-white flex items-center justify-center px-6 py-3 rounded-2xl font-bold shadow-lg shadow-rose-200 dark:shadow-none hover:bg-rose-700 transition-all active:scale-95 text-sm md:text-base"
          onClick={() => { resetForm(); setOpenModal(true); }}
        >
          <PlusIcon className="h-5 w-5 mr-2 stroke-[3]" />
          Novo Risco
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative w-full sm:max-w-md">
          <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar risco ou perigo..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white pl-12 pr-4 py-3 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all shadow-sm"
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setPaginaAtual(1); }}
          />
        </div>

        <button
          onClick={() => setOrdem(ordem === "asc" ? "desc" : "asc")}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-3 rounded-2xl font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
        >
          <ArrowsUpDownIcon className="h-5 w-5 text-slate-400" />
          {ordem === "asc" ? "A-Z" : "Z-A"}
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Risco / Categoria</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Setor</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Classificação / Status</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Responsável</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Sentinel AI</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {pagina.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mb-0.5">{r.nome}</p>
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{r.categoria}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg whitespace-nowrap border dark:border-slate-700">
                      {r.setorId?.nome}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-wider ${getBadgeClass(r.classificacao)}`}>
                        <span className="relative flex h-2 w-2">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${r.classificacao === 'critico' ? 'bg-red-400' : 'hidden'}`}></span>
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${r.classificacao === 'critico' ? 'bg-red-500' : 'bg-current'}`}></span>
                        </span>
                        {r.classificacao}
                      </span>
                      <span className={`text-[9px] font-bold uppercase flex items-center gap-1 ${r.status === 'ativo' ? 'text-rose-500' : 'text-emerald-500'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${r.status === 'ativo' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                        {r.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex-shrink-0">
                        {r.responsavel?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[100px]">{r.responsavel || "N/D"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button
                      onClick={() => handleIa(r.nome)}
                      className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100 dark:border-indigo-800"
                    >
                      <SparklesIcon className="h-4 w-4" />
                      Analisar
                    </button>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-1 md:opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => { setEditingId(r._id); setNome(r.nome); setCategoria(r.categoria); setSetorId(r.setorId?._id); setDescricao(r.descricao); setProbabilidade(r.probabilidade); setSeveridade(r.severidade); setMedidas(r.medidas); setResponsavel(r.responsavel); setStatus(r.status); setOpenModal(true); }}
                        className="p-2 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-xl transition-all"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => { setDeleteId(r._id); setOpenDelete(true); }}
                        className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINAÇÃO */}
        <div className="px-6 py-5 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Página {paginaAtual} de {totalPaginas}</p>
          <div className="flex gap-2">
            <button disabled={paginaAtual === 1} onClick={() => setPaginaAtual(p => p - 1)} className="px-4 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Anterior</button>
            <button disabled={paginaAtual === totalPaginas} onClick={() => setPaginaAtual(p => p + 1)} className="px-4 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Próxima</button>
          </div>
        </div>
      </div>

      {/* IA MODAL */}
      <AiModal
        open={iaOpen}
        onClose={() => setIaOpen(false)}
        conteudo={iaLoading ? "⌛ Sentinel está processando os dados de segurança..." : iaTexto}
      />

      {/* FORM MODAL */}
      <Modal open={openModal} onClose={() => setOpenModal(false)} title={editingId ? "Ajustar Risco" : "Registrar Novo Risco"}>
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[75vh] md:max-h-[80vh]">
          <div className="flex-1 overflow-y-auto px-1 py-4 space-y-6 scrollbar-hide">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1 tracking-wider">Identificação do Risco</label>
              <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm" placeholder="Ex: Ruído excessivo..." value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1 tracking-wider">Categoria</label>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500/20 appearance-none shadow-sm cursor-pointer" value={categoria} onChange={(e) => setCategoria(e.target.value)} required>
                  <option value="fisico" className="dark:bg-slate-900">Físico</option>
                  <option value="quimico" className="dark:bg-slate-900">Químico</option>
                  <option value="biologico" className="dark:bg-slate-900">Biológico</option>
                  <option value="ergonomico" className="dark:bg-slate-900">Ergonômico</option>
                  <option value="acidente" className="dark:bg-slate-900">Acidente</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1 tracking-wider">Setor</label>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500/20 appearance-none shadow-sm cursor-pointer" value={setorId} onChange={(e) => setSetorId(e.target.value)} required>
                  <option value="" className="dark:bg-slate-900">Onde ocorre?</option>
                  {setores.map((s) => <option key={s._id} value={s._id} className="dark:bg-slate-900">{s.nome}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <p className="text-[10px] font-black uppercase text-rose-600 dark:text-rose-400 text-center tracking-[0.2em]">Matriz de Criticidade</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4 text-center">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">Probabilidade</label>
                    <span className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-3 py-1 rounded-full text-xs font-black">{probabilidade}</span>
                  </div>
                  <input type="range" min="1" max="5" className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-600" value={probabilidade} onChange={(e) => setProbabilidade(Number(e.target.value))} />
                </div>
                <div className="space-y-4 text-center">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">Severidade</label>
                    <span className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-3 py-1 rounded-full text-xs font-black">{severidade}</span>
                  </div>
                  <input type="range" min="1" max="5" className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-600" value={severidade} onChange={(e) => setSeveridade(Number(e.target.value))} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1 tracking-wider">Medidas de Controle</label>
              <textarea className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500/20 transition-all h-24 resize-none shadow-sm" placeholder="Medidas adotadas..." value={medidas} onChange={(e) => setMedidas(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1 tracking-wider">Responsável</label>
                <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500/20 transition-all text-sm shadow-sm" placeholder="Nome do gestor" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1 tracking-wider">Status</label>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500/20 appearance-none font-bold text-sm shadow-sm cursor-pointer" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="ativo" className="dark:bg-slate-900 text-rose-500">⚠️ ATIVO</option>
                  <option value="controlado" className="dark:bg-slate-900 text-emerald-500">✅ CONTROLADO</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6 pb-2 mt-2 border-t border-slate-100 dark:border-slate-800">
            <button className="w-full bg-rose-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-rose-200 dark:shadow-none hover:bg-rose-700 transition-all active:scale-[0.98]">
              {editingId ? "Salvar Alterações" : "Registrar Risco"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={openDelete} title="Remover Risco" message="Tem certeza?" onClose={() => setOpenDelete(false)} onConfirm={() => deleteId && handleDelete(deleteId)} />
    </div>
  );
}