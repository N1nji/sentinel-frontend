import { useEffect, useState } from "react";
import { api } from "../services/api";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import { useTheme } from "../context/ThemeContext"; // 🔹 Importado o contexto

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
} from "@heroicons/react/24/solid";

interface Setor {
  _id: string;
  nome: string;
  descricao?: string;
  responsavel?: string;
  status?: "ativo" | "inativo";
}

export default function Setores() {
  const { darkMode } = useTheme(); // 🔹 Consumindo o tema
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
  const itensPorPagina = 10;

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const data = { nome, descricao, responsavel: responsavel || "Não informado", status };

    try {
      if (editingId) {
        await api.put(`/setores/${editingId}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post("/setores", data, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
      await api.delete(`/setores/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      load();
      setOpenDelete(false);
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  }

  const filtrados = setores.filter((s) =>
    s.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (s.responsavel && s.responsavel.toLowerCase().includes(busca.toLowerCase()))
  );

  const ordenados = [...filtrados].sort((a, b) =>
    ordem === "asc" ? a.nome.localeCompare(b.nome) : b.nome.localeCompare(a.nome)
  );

  const inicio = (paginaAtual - 1) * itensPorPagina;
  const pagina = ordenados.slice(inicio, inicio + itensPorPagina);
  const totalPaginas = Math.ceil(ordenados.length / itensPorPagina);

  return (
    <div className="p-2 sm:p-4 transition-colors duration-300">
      
      {/* CABEÇALHO RESPONSIVO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <BuildingOffice2Icon className="h-8 w-8 text-indigo-600" />
            <h1 className={`text-3xl font-extrabold tracking-tight ${darkMode ? "text-white" : "text-gray-900"}`}>
              Setores
            </h1>
          </div>
          <p className={`text-sm font-medium ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
            Gerenciamento de áreas e responsabilidades ({setores.length} total)
          </p>
        </div>

        <button
          className="w-full sm:w-auto bg-indigo-600 text-white flex items-center justify-center px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 transition-all font-bold"
          onClick={() => {
            setEditingId(null); setNome(""); setDescricao(""); setResponsavel(""); setStatus("ativo");
            setOpenModal(true);
          }}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Novo Setor
        </button>
      </div>

      {/* FILTROS DINÂMICOS */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative w-full sm:flex-1">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome ou responsável..."
            className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none ${
              darkMode 
                ? "bg-slate-900 border-slate-800 text-white placeholder:text-slate-500" 
                : "bg-white border-gray-200 text-gray-900"
            }`}
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setPaginaAtual(1); }}
          />
        </div>

        <button
          onClick={() => setOrdem(ordem === "asc" ? "desc" : "asc")}
          className={`flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl border font-bold transition-colors ${
            darkMode 
              ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800" 
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <ArrowsUpDownIcon className="h-5 w-5" />
          {ordem === "asc" ? "A-Z" : "Z-A"}
        </button>
      </div>

      {/* TABELA COM CONTAINER DE SCROLL MOBILE */}
      <div className={`rounded-2xl shadow-sm border overflow-hidden transition-colors ${
        darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className={`${darkMode ? "bg-slate-800/50" : "bg-gray-50/50"} border-b ${darkMode ? "border-slate-800" : "border-gray-100"}`}>
              <tr>
                <th className={`p-4 font-bold text-xs uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-gray-500"}`}>Setor</th>
                <th className={`p-4 font-bold text-xs uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-gray-500"}`}>Responsável</th>
                <th className={`p-4 font-bold text-xs uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-gray-500"}`}>Status</th>
                <th className={`p-4 font-bold text-xs uppercase tracking-wider text-center ${darkMode ? "text-slate-400" : "text-gray-500"}`}>Ações</th>
              </tr>
            </thead>

            <tbody className={`divide-y ${darkMode ? "divide-slate-800" : "divide-gray-50"}`}>
              {isPageLoading ? (
                <tr><td colSpan={4} className="p-10 text-center text-gray-400 animate-pulse">Sincronizando...</td></tr>
              ) : pagina.length === 0 ? (
                <tr><td colSpan={4} className="p-10 text-center text-gray-400">Nenhum setor encontrado.</td></tr>
              ) : pagina.map((s) => (
                <tr key={s._id} className={`transition-colors group ${darkMode ? "hover:bg-slate-800/40" : "hover:bg-gray-50/50"}`}>
                  <td className="p-4">
                    <div className={`font-bold ${darkMode ? "text-slate-200" : "text-gray-800"}`}>{s.nome}</div>
                    <div className="text-xs text-gray-400 line-clamp-1">{s.descricao || "Sem descrição"}</div>
                  </td>
                  <td className="p-4">
                    <div className={`flex items-center gap-2 text-sm font-medium ${darkMode ? "text-slate-400" : "text-gray-600"}`}>
                      <UserIcon className="h-4 w-4 opacity-40" />
                      {s.responsavel || "Não atribuído"}
                    </div>
                  </td>
                  <td className="p-4">
                    {(!s.status || s.status === "ativo") ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <CheckCircleIcon className="h-3 w-3" /> ATIVO
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-gray-500/10 text-gray-500 border border-gray-500/20">
                        <XCircleIcon className="h-3 w-3" /> INATIVO
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {/* AÇÕES: Visíveis por padrão no mobile, hover no desktop */}
                    <div className="flex justify-center gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-2.5 text-amber-500 hover:bg-amber-500/10 rounded-xl transition-colors"
                        onClick={() => {
                          setEditingId(s._id); setNome(s.nome); setDescricao(s.descricao || "");
                          setResponsavel(s.responsavel || ""); setStatus(s.status || "ativo");
                          setOpenModal(true);
                        }}
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
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
      </div>

      {/* PAGINAÇÃO TEMA DINÂMICO */}
      {totalPaginas > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
          <div className="flex gap-2">
            <button
              disabled={paginaAtual === 1}
              onClick={() => setPaginaAtual((p) => p - 1)}
              className={`px-5 py-2 text-sm font-bold border rounded-xl disabled:opacity-20 transition-all ${
                darkMode ? "border-slate-800 text-slate-300 bg-slate-900" : "border-gray-200 text-gray-600 bg-white"
              }`}
            >
              Anterior
            </button>
            <button
              disabled={paginaAtual === totalPaginas}
              onClick={() => setPaginaAtual((p) => p + 1)}
              className={`px-5 py-2 text-sm font-bold border rounded-xl disabled:opacity-20 transition-all ${
                darkMode ? "border-slate-800 text-slate-300 bg-slate-900" : "border-gray-200 text-gray-600 bg-white"
              }`}
            >
              Próxima
            </button>
          </div>
          <span className={`text-sm font-medium ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
            Página <span className="text-indigo-600 font-bold">{paginaAtual}</span> de {totalPaginas}
          </span>
        </div>
      )}

      {/* FORMULÁRIO INTERNO DO MODAL (ADAPTADO AO TEMA) */}
      <Modal open={openModal} onClose={() => setOpenModal(false)} title={editingId ? "Editar Setor" : "Novo Setor"}>
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className={`text-xs font-bold uppercase tracking-widest ml-1 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>Nome do Setor</label>
              <input
                type="text"
                className={`w-full p-3 rounded-xl mt-1 focus:ring-2 focus:ring-indigo-500 outline-none border transition-all ${
                  darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-200 text-gray-900"
                }`}
                value={nome} onChange={(e) => setNome(e.target.value)} required
              />
            </div>
            <div>
              <label className={`text-xs font-bold uppercase tracking-widest ml-1 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>Responsável</label>
              <input
                type="text"
                className={`w-full p-3 rounded-xl mt-1 focus:ring-2 focus:ring-indigo-500 outline-none border transition-all ${
                  darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-200 text-gray-900"
                }`}
                value={responsavel} onChange={(e) => setResponsavel(e.target.value)}
              />
            </div>
            <div>
              <label className={`text-xs font-bold uppercase tracking-widest ml-1 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>Status</label>
              <select 
                value={status} onChange={(e) => setStatus(e.target.value as "ativo" | "inativo")}
                className={`w-full p-3 rounded-xl mt-1 focus:ring-2 focus:ring-indigo-500 outline-none border transition-all ${
                  darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-200 text-gray-900"
                }`}
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
            <div>
              <label className={`text-xs font-bold uppercase tracking-widest ml-1 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>Descrição</label>
              <textarea
                className={`w-full p-3 rounded-xl mt-1 focus:ring-2 focus:ring-indigo-500 outline-none border transition-all ${
                  darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-200 text-gray-900"
                }`}
                rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? "Processando..." : editingId ? "Atualizar Setor" : "Cadastrar Setor"}
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