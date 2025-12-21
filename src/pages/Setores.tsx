import { useEffect, useState } from "react";
import { api } from "../services/api";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";

import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";

interface Setor {
  _id: string;
  nome: string;
  descricao?: string;
  responsavel?: string;
  status?: "ativo" | "inativo";
}

export default function Setores() {
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

  // Função para carregar dados
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

  // Submit Criar/Editar
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const data = { 
      nome, 
      descricao, 
      responsavel: responsavel || "Não informado", // Fallback se vazio
      status 
    };

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
      alert("Erro ao salvar dados. Verifique o console.");
    } finally {
      setLoading(false);
    }
  }

  // Deletar
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

  // Lógica de Filtro e Ordenação
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
    <div className="p-2">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Setores</h1>
          <p className="text-gray-500 text-sm font-medium">
            Gerenciamento de áreas e responsabilidades ({setores.length} total)
          </p>
        </div>

        <button
          className="bg-indigo-600 text-white flex items-center px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all font-semibold"
          onClick={() => {
            setEditingId(null);
            setNome("");
            setDescricao("");
            setResponsavel("");
            setStatus("ativo");
            setOpenModal(true);
          }}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Novo Setor
        </button>
      </div>

      {/* FILTROS */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[280px]">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome ou responsável..."
            className="w-full border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pl-10 pr-4 py-2.5 rounded-xl border transition-all shadow-sm"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPaginaAtual(1);
            }}
          />
        </div>

        <button
          onClick={() => setOrdem(ordem === "asc" ? "desc" : "asc")}
          className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl shadow-sm hover:bg-gray-50 text-gray-600 font-medium transition-colors"
        >
          <ArrowsUpDownIcon className="h-5 w-5 text-gray-400" />
          {ordem === "asc" ? "A-Z" : "Z-A"}
        </button>
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-semibold text-gray-600 text-sm">Setor</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Responsável</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
              <th className="p-4 font-semibold text-gray-600 text-sm text-center">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {isPageLoading ? (
              <tr><td colSpan={4} className="p-10 text-center text-gray-400 animate-pulse">Sincronizando banco de dados...</td></tr>
            ) : pagina.length === 0 ? (
              <tr><td colSpan={4} className="p-10 text-center text-gray-400 font-medium">Nenhum setor encontrado para esta busca.</td></tr>
            ) : pagina.map((s) => (
              <tr key={s._id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="p-4">
                  <div className="font-bold text-gray-800">{s.nome}</div>
                  <div className="text-xs text-gray-400 line-clamp-1">{s.descricao || "Sem descrição disponível"}</div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                    <UserIcon className="h-4 w-4 text-gray-300" />
                    {s.responsavel || "Não atribuído"}
                  </div>
                </td>
                <td className="p-4">
                  {/* TRATAMENTO DE STATUS: Se for nulo ou 'ativo', mostra verde */}
                  {(!s.status || s.status === "ativo") ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <CheckCircleIcon className="h-3 w-3" /> Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-50 text-gray-500 border border-gray-100">
                      <XCircleIcon className="h-3 w-3" /> Inativo
                    </span>
                  )}
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Editar"
                      onClick={() => {
                        setEditingId(s._id);
                        setNome(s.nome);
                        setDescricao(s.descricao || "");
                        setResponsavel(s.responsavel || "");
                        setStatus(s.status || "ativo"); // Mantém padrão caso esteja nulo no banco
                        setOpenModal(true);
                      }}
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Excluir"
                      onClick={() => {
                        setDeleteId(s._id);
                        setOpenDelete(true);
                      }}
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
      {totalPaginas > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            disabled={paginaAtual === 1}
            onClick={() => setPaginaAtual((p) => p - 1)}
            className="px-4 py-2 text-sm font-bold text-gray-600 border rounded-xl disabled:opacity-30 hover:bg-gray-50 transition-colors"
          >
            Anterior
          </button>
          <span className="text-sm font-medium text-gray-500">
            Página <span className="text-indigo-600 font-bold">{paginaAtual}</span> de {totalPaginas}
          </span>
          <button
            disabled={paginaAtual === totalPaginas}
            onClick={() => setPaginaAtual((p) => p + 1)}
            className="px-4 py-2 text-sm font-bold text-gray-600 border rounded-xl disabled:opacity-30 hover:bg-gray-50 transition-colors"
          >
            Próxima
          </button>
        </div>
      )}

      {/* MODAL CRIAR/EDITAR */}
      <Modal open={openModal} onClose={() => setOpenModal(false)} title={editingId ? "Editar Detalhes do Setor" : "Cadastrar Novo Setor"}>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Nome do Setor</label>
            <input
              type="text"
              className="w-full border-gray-200 rounded-xl mt-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Almoxarifado"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Responsável Técnico</label>
            <input
              type="text"
              placeholder="Ex: Engenheiro Carlos Souza"
              className="w-full border-gray-200 rounded-xl mt-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Status Operacional</label>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value as "ativo" | "inativo")}
              className="w-full border-gray-200 rounded-xl mt-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Descrição</label>
            <textarea
              className="w-full border-gray-200 rounded-xl mt-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              rows={3}
              value={descricao}
              placeholder="Detalhes sobre as atividades do setor..."
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
          >
            {loading ? "Gravando dados..." : editingId ? "Salvar Alterações" : "Concluir Cadastro"}
          </button>
        </form>
      </Modal>

      {/* CONFIRMAR EXCLUSÃO */}
      <ConfirmModal
        open={openDelete}
        title="Excluir Setor permanentemente?"
        message="Esta ação não pode ser desfeita. Recomenda-se apenas 'Inativar' o setor para manter o histórico de EPIs vinculados a ele."
        onClose={() => setOpenDelete(false)}
        onConfirm={() => { if (deleteId) handleDelete(deleteId); }}
      />
    </div>
  );
}