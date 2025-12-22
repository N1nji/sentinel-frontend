import { useEffect, useState } from "react";
import { api } from "../services/api";

import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import AiModal from "../components/AiModal";
import { sugerirEpi } from "../services/ia";

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
      case "baixo": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "moderado": return "bg-amber-100 text-amber-700 border-amber-200";
      case "medio": return "bg-orange-100 text-orange-700 border-orange-200";
      case "alto": return "bg-rose-100 text-rose-700 border-rose-200";
      case "critico": return "bg-red-200 text-red-900 border-red-300 animate-pulse";
      default: return "bg-gray-100 text-gray-600";
    }
  }

  return (
    <div className="p-1">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <ExclamationTriangleIcon className="h-8 w-8 text-indigo-600" />
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mapa de Riscos</h1>
          <p className="text-slate-500 font-medium">Identificação e controle de perigos por setor</p>
        </div>

        <button
          className="bg-rose-600 text-white flex items-center justify-center px-6 py-3 rounded-2xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95"
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
            className="w-full bg-white border border-slate-200 pl-12 pr-4 py-3 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all shadow-sm"
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setPaginaAtual(1); }}
          />
        </div>

        <button
          onClick={() => setOrdem(ordem === "asc" ? "desc" : "asc")}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-slate-200 px-5 py-3 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
        >
          <ArrowsUpDownIcon className="h-5 w-5 text-slate-400" />
          {ordem === "asc" ? "A-Z" : "Z-A"}
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Risco / Categoria</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Setor</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Classificação</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Sentinel AI</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pagina.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-5">
                    <div>
                      <p className="font-bold text-slate-800 mb-0.5">{r.nome}</p>
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{r.categoria}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                      {r.setorId?.nome}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-wider ${getBadgeClass(r.classificacao)}`}>
                      <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${r.classificacao === 'critico' ? 'bg-red-400' : 'hidden'}`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${r.classificacao === 'critico' ? 'bg-red-500' : 'bg-current'}`}></span>
                      </span>
                      {r.classificacao}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button
                      onClick={() => handleIa(r.nome)}
                      className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100"
                    >
                      <SparklesIcon className="h-4 w-4" />
                      Analisar EPI
                    </button>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => { setEditingId(r._id); setNome(r.nome); setCategoria(r.categoria); setSetorId(r.setorId?._id); setDescricao(r.descricao); setProbabilidade(r.probabilidade); setSeveridade(r.severidade); setMedidas(r.medidas); setResponsavel(r.responsavel); setStatus(r.status); setOpenModal(true); }}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => { setDeleteId(r._id); setOpenDelete(true); }}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
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
        <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Página {paginaAtual} de {totalPaginas}</p>
          <div className="flex gap-2">
            <button disabled={paginaAtual === 1} onClick={() => setPaginaAtual(p => p - 1)} className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all">Anterior</button>
            <button disabled={paginaAtual === totalPaginas} onClick={() => setPaginaAtual(p => p + 1)} className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all">Próxima</button>
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
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Identificação do Risco</label>
            <input type="text" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all" placeholder="Ex: Ruído excessivo, Queda de altura..." value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Categoria</label>
              <select className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500/20 appearance-none" value={categoria} onChange={(e) => setCategoria(e.target.value)} required>
                <option value="fisico">Físico</option>
                <option value="quimico">Químico</option>
                <option value="biologico">Biológico</option>
                <option value="ergonomico">Ergonômico</option>
                <option value="acidente">Acidente</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Setor</label>
              <select className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500/20 appearance-none" value={setorId} onChange={(e) => setSetorId(e.target.value)} required>
                <option value="">Onde ocorre?</option>
                {setores.map((s) => <option key={s._id} value={s._id}>{s.nome}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-3 text-center tracking-widest text-rose-600">Matriz de Criticidade</p>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2 text-center">
                <label className="text-xs font-bold text-slate-600">Probabilidade: {probabilidade}</label>
                <input type="range" min="1" max="5" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600" value={probabilidade} onChange={(e) => setProbabilidade(Number(e.target.value))} />
              </div>
              <div className="space-y-2 text-center">
                <label className="text-xs font-bold text-slate-600">Severidade: {severidade}</label>
                <input type="range" min="1" max="5" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600" value={severidade} onChange={(e) => setSeveridade(Number(e.target.value))} />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Medidas de Controle Atuais</label>
            <textarea className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500/20 transition-all h-20" placeholder="O que já está sendo feito?" value={medidas} onChange={(e) => setMedidas(e.target.value)} />
          </div>

          <button className="w-full bg-rose-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95">
            {editingId ? "Salvar Alterações" : "Registrar Risco"}
          </button>
        </form>
      </Modal>

      <ConfirmModal open={openDelete} title="Remover Risco" message="Tem certeza? Isso removerá o risco do mapa de calor e dos relatórios de segurança." onClose={() => setOpenDelete(false)} onConfirm={() => deleteId && handleDelete(deleteId)} />
    </div>
  );
}