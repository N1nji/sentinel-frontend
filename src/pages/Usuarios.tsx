import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";

import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/solid";

// -------------------------------
// TIPOS
// -------------------------------
interface IUsuario {
  _id: string;
  nome: string;
  email: string;
  tipo: "admin" | "comum";
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);

  const [openModal, setOpenModal] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [tipo, setTipo] = useState<"admin" | "comum">("comum");
  const [senhaGerada, setSenhaGerada] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // FILTRO, ORDENAR, PAGINAR
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<"asc" | "desc">("asc");

  const itensPorPagina = 10;
  const [paginaAtual, setPaginaAtual] = useState(1);

  const token = localStorage.getItem("token");

  // -------------------------------------------------------
  // CARREGAR USUÁRIOS
  // -------------------------------------------------------
  async function load() {
    const res = await axios.get("http://localhost:4000/usuarios", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsuarios(res.data);
  }

  useEffect(() => {
    load();
  }, []);

  // -------------------------------------------------------
  // CRIAR / EDITAR
  // -------------------------------------------------------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editingId) {
      await axios.put(
        `http://localhost:4000/usuarios/${editingId}`,
        { nome, email, tipo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      setOpenModal(false);
      load();
      return;
    }

    // criar usuário novo
    const res = await axios.post(
      "http://localhost:4000/usuarios",
      { nome, email, tipo },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setSenhaGerada(res.data.senhaGerada);
    setOpenModal(false);
    load();
  }

  // -------------------------------------------------------
  // DELETAR
  // -------------------------------------------------------
  async function handleDelete(id: string) {
    await axios.delete(`http://localhost:4000/usuarios/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setOpenDelete(false);
    load();
  }

  // -------------------------------------------------------
  // BUSCA / ORDEM / PAGINAÇÃO
  // -------------------------------------------------------
  const filtrados = usuarios.filter((u) =>
    u.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const ordenados = [...filtrados].sort((a, b) =>
    ordem === "asc"
      ? a.nome.localeCompare(b.nome)
      : b.nome.localeCompare(a.nome)
  );

  const inicio = (paginaAtual - 1) * itensPorPagina;
  const pagina = ordenados.slice(inicio, inicio + itensPorPagina);
  const totalPaginas = Math.ceil(ordenados.length / itensPorPagina);

  return (
    <div>
      {/* TÍTULO */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Usuários{" "}
          <span className="text-gray-500 text-lg">
            ({usuarios.length} cadastrados)
          </span>
        </h1>

        <button
          className="bg-blue-600 text-white flex items-center px-4 py-2 rounded shadow hover:bg-blue-700"
          onClick={() => {
            setEditingId(null);
            setNome("");
            setEmail("");
            setTipo("comum");
            setOpenModal(true);
          }}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Novo Usuário
        </button>
      </div>

      {/* FERRAMENTAS */}
      <div className="flex items-center gap-4 mb-4">
        {/* BUSCA */}
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 absolute left-2 top-2.5" />
          <input
            type="text"
            placeholder="Buscar..."
            className="border pl-9 pr-3 py-2 rounded w-64"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
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

      {/* MENSAGEM DE SENHA */}
      {senhaGerada && (
        <div className="p-4 bg-yellow-100 border border-yellow-500 mb-4 rounded">
          <strong>Senha gerada:</strong> {senhaGerada}
        </div>
      )}

      {/* TABELA */}
      <table className="w-full bg-white shadow rounded overflow-hidden">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-3">Nome</th>
            <th className="p-3">Email</th>
            <th className="p-3">Tipo</th>
            <th className="p-3 w-32">Ações</th>
          </tr>
        </thead>

        <tbody>
          {pagina.map((u) => (
            <tr key={u._id} className="border-t">
              <td className="p-3">{u.nome}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    u.tipo === "admin"
                      ? "bg-purple-200 text-purple-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {u.tipo}
                </span>
              </td>

              <td className="p-3 flex gap-3">
                {/* EDITAR */}
                <button
                  className="text-yellow-600 hover:text-yellow-800"
                  onClick={() => {
                    setEditingId(u._id);
                    setNome(u.nome);
                    setEmail(u.email);
                    setTipo(u.tipo);
                    setOpenModal(true);
                  }}
                >
                  <PencilSquareIcon className="h-6 w-6" />
                </button>

                {/* EXCLUIR */}
                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={() => {
                    setDeleteId(u._id);
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

      {/* MODAL FORM */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={editingId ? "Editar Usuário" : "Novo Usuário"}
      >
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="border p-2 w-full mb-3"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />

          <input
            type="email"
            className="border p-2 w-full mb-3"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <select
            className="border p-2 w-full mb-3"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as "admin" | "comum")}
            required
          >
            <option value="admin">Administrador</option>
            <option value="comum">Comum</option>
          </select>

          <button className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700">
            {editingId ? "Salvar" : "Criar"}
          </button>
        </form>
      </Modal>

      {/* MODAL DELETE */}
      <ConfirmModal
        open={openDelete}
        title="Excluir Usuário"
        message="Tem certeza que deseja excluir este usuário?"
        onClose={() => setOpenDelete(false)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
      />
    </div>
  );
}
