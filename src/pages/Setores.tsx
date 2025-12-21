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
  responsavel?: string; // NOVO
  status?: "ativo" | "inativo"; // NOVO
}

export default function Setores() {
  const [setores, setSetores] = useState<Setor[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [responsavel, setResponsavel] = useState(""); // NOVO
  const [status, setStatus] = useState<"ativo" | "inativo">("ativo"); // NOVO

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true); // NOVO

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
    } finally {
      setIsPageLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const data = { nome, descricao, responsavel, status };

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
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    await api.delete(`/setores/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    load();
    setOpenDelete(false);
  }

  const filtrados = setores.filter((s) =>
    s.nome.toLowerCase().includes(busca.toLowerCase()) ||
    s.responsavel?.toLowerCase().includes(busca.toLowerCase())
  );

  const ordenados = [...filtrados].sort((a, b) =>
    ordem === "asc" ? a.nome.localeCompare(b.nome) : b.nome.localeCompare(a.nome)
  );

  const inicio = (paginaAtual - 1) * itensPorPagina;
  const pagina = ordenados.slice(inicio, inicio + itensPorPagina);
  const totalPaginas = Math.ceil(ordenados.length / itensPorPagina);

  return (
    <div className="p-2">
      {/* TOPO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Setores
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Gerencie as áreas e responsáveis da unidade ({setores.length} total)
          </p>
        </div>

        <button
          className="bg-indigo-600 text-white flex items-center px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all font-semibold"
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

      {/* BARRA DE FERRAMENTAS */}
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

      {/* TABELA ESTILIZADA */}
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
               <tr><td colSpan={4} className="p-10 text-center text-gray-400 animate-pulse">Carregando setores...</td></tr>
            ) : pagina.length === 0 ? (
               <tr><td colSpan={4} className="p-10 text-center text-gray-400">Nenhum setor encontrado.</td></tr>
            ) : pagina.map((s) => (
              <tr key={s._id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="p-4">
                  <div className="font-bold text-gray-800">{s.nome}</div>
                  <div className="text-xs text-gray-400 line-clamp-1">{s.descricao || "Sem descrição"}</div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <UserIcon className="h-4 w-4 text-gray-300" />
                    {s.responsavel || "Não atribuído"}
                  </div>
                </td>
                <td className="p-4">
                  {s.status === "ativo" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">
                      <CheckCircleIcon className="h-3 w-3" /> Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
                      <XCircleIcon className="h-3 w-3" /> Inativo
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                      onClick={() => {
                        setEditingId(s._id);
                        setNome(s.nome);
                        setDescricao(s.descricao || "");
                        setResponsavel(s.responsavel || "");
                        setStatus(s.status || "ativo");
                        setOpenModal(true);
                      }}
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
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
      <Modal open={openModal} onClose={() => setOpenModal(false)} title={editingId ? "Editar Setor" : "Novo Setor"}>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nome do Setor</label>
            <input
              type="text"
              className="w-full border-gray-200 rounded-xl mt-1 focus:ring-indigo-500 focus:border-indigo-500"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Responsável</label>
            <input
              type="text"
              placeholder="Ex: Eng. Roberto Silva"
              className="w-full border-gray-200 rounded-xl mt-1 focus:ring-indigo-500 focus:border-indigo-500"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Status</label>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value as "ativo" | "inativo")}
              className="w-full border-gray-200 rounded-xl mt-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Descrição</label>
            <textarea
              className="w-full border-gray-200 rounded-xl mt-1 focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {loading ? "Processando..." : editingId ? "Atualizar Setor" : "Criar Setor"}
          </button>
        </form>
      </Modal>

      <ConfirmModal
        open={openDelete}
        title="Excluir Setor"
        message="Atenção! Ao excluir um setor, você pode perder a associação histórica de EPIs entregues. Confirmar exclusão?"
        onClose={() => setOpenDelete(false)}
        onConfirm={() => { if (deleteId) handleDelete(deleteId); }}
      />
    </div>
  );
}