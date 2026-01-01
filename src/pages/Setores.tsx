import { useEffect, useState, useMemo } from "react";
import { api } from "../services/api";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import { useTheme } from "../context/ThemeContext";

import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOffice2Icon,
  ChartBarIcon,
} from "@heroicons/react/24/solid";

interface Setor {
  _id: string;
  nome: string;
  descricao?: string;
  responsavel?: string;
  status?: "ativo" | "inativo";
}

export default function Setores() {
  const { darkMode } = useTheme();
  const [setores, setSetores] = useState<Setor[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  // Estados do Formulário
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [status, setStatus] = useState<"ativo" | "inativo">("ativo");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<"asc" | "desc">("asc");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 8;

  const token = localStorage.getItem("token");

  async function load() {
    try {
      setIsPageLoading(true);
      const res = await api.get("/setores", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSetores(res.data);
    } catch (error) {
      console.error("Erro ao carregar setores:", error);
    } finally {
      setIsPageLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // --- LÓGICA DE FILTRO E PAGINAÇÃO ---
  const ordenados = useMemo(() => {
    const filtrados = setores.filter((s) =>
      s.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (s.responsavel && s.responsavel.toLowerCase().includes(busca.toLowerCase()))
    );
    return [...filtrados].sort((a, b) =>
      ordem === "asc" ? a.nome.localeCompare(b.nome) : b.nome.localeCompare(a.nome)
    );
  }, [setores, busca, ordem]);

  const totalPaginas = Math.ceil(ordenados.length / itensPorPagina);
  const pagina = ordenados.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);

  // --- ESTATÍSTICAS ---
  const stats = {
    total: setores.length,
    ativos: setores.filter(s => s.status !== 'inativo').length,
    inativos: setores.filter(s => s.status === 'inativo').length
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const data = { nome, descricao, responsavel: responsavel || "Não informado", status };
    try {
      if (editingId) {
        await api.put(`/setores/${editingId}`, data, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await api.post("/setores", data, { headers: { Authorization: `Bearer ${token}` } });
      }
      setOpenModal(false);
      load();
    } catch (error) {
      console.error("Erro ao salvar setor:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/setores/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      load();
      setOpenDelete(false);
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  }

  return (
    <div className="p-2 sm:p-4 animate-in fade-in duration-500">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <BuildingOffice2Icon className="h-8 w-8 text-indigo-600" />
            <h1 className={`text-3xl font-black tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
              Setores
            </h1>
          </div>
          <p className={`text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            Gerenciamento de áreas e responsabilidades
          </p>
        </div>

        <button
          className="w-full sm:w-auto bg-indigo-600 text-white flex items-center justify-center px-6 py-3 rounded-2xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 transition-all font-bold"
          onClick={() => {
            setEditingId(null); setNome(""); setDescricao(""); setResponsavel(""); setStatus("ativo");
            setOpenModal(true);
          }}
        >
          <PlusIcon className="h-5 w-5 mr-2 stroke-[3]" />
          Novo Setor
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total de Setores", value: stats.total, color: "text-indigo-600", bg: "bg-indigo-500/10" },
          { label: "Setores Ativos", value: stats.ativos, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Setores Inativos", value: stats.inativos, color: "text-rose-500", bg: "bg-rose-500/10" }
        ].map((item, i) => (
          <div key={i} className={`p-5 rounded-3xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"} shadow-sm`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{item.label}</p>
            <div className="flex items-center justify-between">
              <span className={`text-3xl font-black ${darkMode ? "text-white" : "text-slate-900"}`}>{item.value}</span>
              <div className={`p-2 rounded-xl ${item.bg} ${item.color}`}>
                <ChartBarIcon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FILTROS */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative w-full sm:flex-1">
          <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome ou responsável..."
            className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border transition-all shadow-sm focus:ring-4 focus:ring-indigo-500/10 outline-none ${
              darkMode ? "bg-slate-900 border-slate-800 text-white placeholder:text-slate-600" : "bg-white border-slate-200 text-slate-900"
            }`}
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setPaginaAtual(1); }}
          />
        </div>

        <button
          onClick={() => setOrdem(ordem === "asc" ? "desc" : "asc")}
          className={`flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-2xl border font-bold transition-all ${
            darkMode ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <ArrowsUpDownIcon className="h-5 w-5" />
          {ordem === "asc" ? "A-Z" : "Z-A"}
        </button>
      </div>

      {/* TABELA */}
      <div className={`rounded-3xl border overflow-hidden transition-all ${
        darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-xl shadow-slate-200/50"
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className={`${darkMode ? "bg-slate-800/30" : "bg-slate-50/50"} border-b ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
              <tr>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-slate-400">Setor / Descrição</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-slate-400">Responsável</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-slate-400 text-center">Status</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-slate-400 text-right">Ações</th>
              </tr>
            </thead>

            <tbody className={`divide-y ${darkMode ? "divide-slate-800" : "divide-slate-50"}`}>
              {isPageLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="p-5"><div className={`h-12 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}></div></td>
                  </tr>
                ))
              ) : pagina.length === 0 ? (
                <tr><td colSpan={4} className="p-20 text-center font-bold text-slate-400">Nenhum setor encontrado.</td></tr>
              ) : pagina.map((s) => (
                <tr key={s._id} className={`transition-all group ${darkMode ? "hover:bg-slate-800/40" : "hover:bg-gray-50/50"}`}>
                  <td className="p-5">
                    <div className={`font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>{s.nome}</div>
                    <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">{s.descricao || "Sem descrição"}</div>
                  </td>
                  <td className="p-5">
                    <div className={`flex items-center gap-2 text-sm font-semibold ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                      {/* Ícone de Usuário re-adicionado */}
                      <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <UserIcon className="h-4 w-4" />
                      </div>
                      {s.responsavel || "Não atribuído"}
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-wider ${
                      (!s.status || s.status === "ativo") 
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                      : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                    }`}>
                      {/* Ícones de Status re-adicionados */}
                      {(!s.status || s.status === "ativo") ? (
                        <CheckCircleIcon className="h-4 w-4" />
                      ) : (
                        <XCircleIcon className="h-4 w-4" />
                      )}
                      {s.status || "ativo"}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex justify-end gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                      <button
                        className="p-2.5 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all"
                        onClick={() => {
                          setEditingId(s._id); setNome(s.nome); setDescricao(s.descricao || "");
                          setResponsavel(s.responsavel || ""); setStatus(s.status || "ativo");
                          setOpenModal(true);
                        }}
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                        onClick={() => { setDeleteId(s._id); setOpenDelete(true); }}
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
        <div className={`px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4 ${darkMode ? "bg-slate-800/30 border-slate-800" : "bg-slate-50/30 border-slate-50"}`}>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Página <span className="text-indigo-600">{paginaAtual}</span> de {totalPaginas || 1}
          </span>
          <div className="flex gap-2">
            <button
              disabled={paginaAtual === 1}
              onClick={() => setPaginaAtual(p => p - 1)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border ${
                darkMode ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-white shadow-sm"
              } disabled:opacity-20`}
            >
              Anterior
            </button>
            <button
              disabled={paginaAtual === totalPaginas || totalPaginas === 0}
              onClick={() => setPaginaAtual(p => p + 1)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border ${
                darkMode ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-white shadow-sm"
              } disabled:opacity-20`}
            >
              Próxima
            </button>
          </div>
        </div>
      </div>

      {/* MODAL FORM */}
      <Modal open={openModal} onClose={() => setOpenModal(false)} title={editingId ? "Editar Setor" : "Novo Setor"}>
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Nome do Setor</label>
              <input
                type="text"
                className={`w-full p-4 rounded-2xl mt-1.5 focus:ring-4 focus:ring-indigo-500/10 outline-none border transition-all ${
                  darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
                value={nome} onChange={(e) => setNome(e.target.value)} required
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Responsável</label>
              <input
                type="text"
                className={`w-full p-4 rounded-2xl mt-1.5 focus:ring-4 focus:ring-indigo-500/10 outline-none border transition-all ${
                  darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
                value={responsavel} onChange={(e) => setResponsavel(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Status</label>
              <select 
                value={status} onChange={(e) => setStatus(e.target.value as "ativo" | "inativo")}
                className={`w-full p-4 rounded-2xl mt-1.5 focus:ring-4 focus:ring-indigo-500/10 outline-none border transition-all font-bold ${
                  darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Descrição</label>
              <textarea
                className={`w-full p-4 rounded-2xl mt-1.5 focus:ring-4 focus:ring-indigo-500/10 outline-none border transition-all resize-none ${
                  darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
                rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? "PROCESSANDO..." : editingId ? "ATUALIZAR SETOR" : "CADASTRAR SETOR"}
          </button>
        </form>
      </Modal>

      <ConfirmModal
        open={openDelete}
        title="Excluir Setor?"
        message="Esta ação é permanente. Verifique se não há colaboradores vinculados a este setor antes de prosseguir."
        onClose={() => setOpenDelete(false)}
        onConfirm={() => { if (deleteId) handleDelete(deleteId); }}
      />
    </div>
  );
}