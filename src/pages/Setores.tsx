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
} from "@heroicons/react/24/solid";

interface Setor {
  _id: string;
  nome: string;
  descricao?: string;
}

export default function Setores() {
  const [setores, setSetores] = useState<Setor[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  // 🔵 BUSCA
  const [busca, setBusca] = useState("");

  // 🔄 ORDENAÇÃO
  const [ordem, setOrdem] = useState<"asc" | "desc">("asc");

  // 🔢 PAGINAÇÃO
  const itensPorPagina = 10;
  const [paginaAtual, setPaginaAtual] = useState(1);

  const token = localStorage.getItem("token");

  async function load() {
    const res = await api.get("/setores", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSetores(res.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const data = { nome, descricao };

    if (editingId) {
      await api.put(
        `/setores/${editingId}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } else {
      await api.post(
        "/setores",
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    setNome("");
    setDescricao("");
    setEditingId(null);
    setOpenModal(false);
    setLoading(false);

    load();
  }

  async function handleDelete(id: string) {
    await api.delete(`/setores/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    load();
    setOpenDelete(false);
  }

  // -----------------------------------------------------
  // 🔵 ETAPA 1 — FILTRAR POR BUSCA
  // -----------------------------------------------------
  const filtrados = setores.filter((s) =>
    s.nome.toLowerCase().includes(busca.toLowerCase())
  );

  // -----------------------------------------------------
  // 🔄 ETAPA 2 — ORDENAR
  // -----------------------------------------------------
  const ordenados = [...filtrados].sort((a, b) =>
    ordem === "asc"
      ? a.nome.localeCompare(b.nome)
      : b.nome.localeCompare(a.nome)
  );

  // -----------------------------------------------------
  // 🔢 ETAPA 3 — PAGINAÇÃO
  // -----------------------------------------------------
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const pagina = ordenados.slice(inicio, inicio + itensPorPagina);
  const totalPaginas = Math.ceil(ordenados.length / itensPorPagina);

  return (
    <div>

      {/* TOPO */}
      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">
          Setores
          <span className="text-gray-500 text-lg ml-2">
            ({setores.length} cadastrados)
          </span>
        </h1>

        <button
          className="bg-blue-600 text-white flex items-center px-4 py-2 rounded shadow hover:bg-blue-700"
          onClick={() => {
            setEditingId(null);
            setNome("");
            setDescricao("");
            setOpenModal(true);
          }}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Novo Setor
        </button>
      </div>

      {/* BARRA DE FERRAMENTAS */}
      <div className="flex items-center gap-4 mb-4">

        {/* BUSCA */}
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 absolute left-2 top-2.5" />
          <input
            type="text"
            placeholder="Buscar..."
            className="border pl-9 pr-3 py-2 rounded w-64"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPaginaAtual(1); // reseta paginação
            }}
          />
        </div>

        {/* ORDENAR */}
        <button
          onClick={() => setOrdem(ordem === "asc" ? "desc" : "asc")}
          className="flex items-center gap-1 border px-3 py-2 rounded shadow-sm hover:bg-gray-100"
        >
          <ArrowsUpDownIcon className="h-5 w-5" />
          {ordem === "asc" ? "A-Z" : "Z-A"}
        </button>
      </div>

      {/* TABELA */}
      <table className="w-full bg-white shadow-md rounded overflow-hidden">
        <thead className="bg-gray-200 text-left">
          <tr>
            <th className="p-3">Nome</th>
            <th className="p-3">Descrição</th>
            <th className="p-3 w-32">Ações</th>
          </tr>
        </thead>

        <tbody>
          {pagina.map((s) => (
            <tr key={s._id} className="border-t">
              <td className="p-3">{s.nome}</td>
              <td className="p-3">{s.descricao}</td>

              <td className="p-3 flex gap-3">
                {/* EDITAR */}
                <button
                  className="text-yellow-600 hover:text-yellow-800"
                  onClick={() => {
                    setEditingId(s._id);
                    setNome(s.nome);
                    setDescricao(s.descricao || "");
                    setOpenModal(true);
                  }}
                >
                  <PencilSquareIcon className="h-6 w-6" />
                </button>

                {/* EXCLUIR */}
                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={() => {
                    setDeleteId(s._id);
                    setOpenDelete(true);
                  }}
                >
                  <TrashIcon className="h-6 w-6" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINAÇÃO */}
      <div className="flex justify-center items-center gap-3 mt-4">

        <button
          disabled={paginaAtual === 1}
          onClick={() => setPaginaAtual((p) => p - 1)}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          Anterior
        </button>

        <span className="font-medium">
          Página {paginaAtual} de {totalPaginas}
        </span>

        <button
          disabled={paginaAtual === totalPaginas}
          onClick={() => setPaginaAtual((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          Próxima
        </button>

      </div>

      {/* MODAL CRIAR/EDITAR */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={editingId ? "Editar Setor" : "Novo Setor"}
      >
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nome"
            className="border p-2 w-full mb-3"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />

          <textarea
            placeholder="Descrição"
            className="border p-2 w-full mb-3"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <button
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
          >
            {loading ? "Salvando..." : editingId ? "Salvar" : "Criar"}
          </button>
        </form>
      </Modal>

      {/* MODAL DE EXCLUSÃO */}
      <ConfirmModal
        open={openDelete}
        title="Excluir Setor"
        message="Tem certeza que deseja excluir este setor? Esta ação não pode ser desfeita."
        onClose={() => setOpenDelete(false)}
        onConfirm={() => {
          if (deleteId) handleDelete(deleteId);
        }}
      />
    </div>
  );
}
