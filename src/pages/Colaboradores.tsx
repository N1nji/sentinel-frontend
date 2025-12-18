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

// -------------------------------
// TIPAGEM COMPLETA
// -------------------------------
interface ISetor {
  _id: string;
  nome: string;
}

interface IColaborador {
  _id: string;
  nome: string;
  matricula: string;
  funcao: string;
  telefone?: string;
  email?: string;
  setorId: ISetor;
}

export default function Colaboradores() {
  // -------------------------------
  // ESTADOS
  // -------------------------------
  const [colaboradores, setColaboradores] = useState<IColaborador[]>([]);
  const [setores, setSetores] = useState<ISetor[]>([]);

  const [openModal, setOpenModal] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [funcao, setFuncao] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [setorId, setSetorId] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  // FILTRO E ORDEM
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<"asc" | "desc">("asc");

  // PAGINAÇÃO
  const itensPorPagina = 10;
  const [paginaAtual, setPaginaAtual] = useState(1);

  const token = localStorage.getItem("token");

  // -------------------------------
  // CARREGAR DADOS
  // -------------------------------
  async function load() {
    const res = await api.get("/colaboradores", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setColaboradores(res.data);

    const setoresRes = await api.get("/setores", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSetores(setoresRes.data);
  }

  useEffect(() => {
    load();
  }, []);

  // -------------------------------
  // CRIAR / EDITAR
  // -------------------------------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const data = {
      nome,
      matricula,
      funcao,
      telefone,
      email,
      setorId,
    };

    if (editingId) {
      await api.put(
        `/colaboradores/${editingId}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } else {
      await api.post("/colaboradores", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    setNome("");
    setMatricula("");
    setFuncao("");
    setTelefone("");
    setEmail("");
    setSetorId("");
    setEditingId(null);
    setOpenModal(false);
    setLoading(false);

    load();
  }

  // -------------------------------
  // DELETAR
  // -------------------------------
  async function handleDelete(id: string) {
    await api.delete(`/colaboradores/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setOpenDelete(false);
    load();
  }

  // -------------------------------
  // BUSCA
  // -------------------------------
  const filtrados = colaboradores.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  // -------------------------------
  // ORDENAR
  // -------------------------------
  const ordenados = [...filtrados].sort((a, b) =>
    ordem === "asc"
      ? a.nome.localeCompare(b.nome)
      : b.nome.localeCompare(a.nome)
  );

  // -------------------------------
  // PAGINAÇÃO
  // -------------------------------
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const pagina: IColaborador[] = ordenados.slice(
    inicio,
    inicio + itensPorPagina
  );

  const totalPaginas = Math.ceil(ordenados.length / itensPorPagina);

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <div>
      {/* TOPO */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Colaboradores{" "}
          <span className="text-gray-500 text-lg">
            ({colaboradores.length} cadastrados)
          </span>
        </h1>

        <button
          className="bg-blue-600 text-white flex items-center px-4 py-2 rounded shadow hover:bg-blue-700"
          onClick={() => {
            setEditingId(null);
            setNome("");
            setMatricula("");
            setFuncao("");
            setTelefone("");
            setEmail("");
            setSetorId("");
            setOpenModal(true);
          }}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Novo Colaborador
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
            onChange={(e) => {
              setBusca(e.target.value);
              setPaginaAtual(1);
            }}
          />
        </div>

        {/* ORDEM */}
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
            <th className="p-3">Matrícula</th>
            <th className="p-3">Função</th>
            <th className="p-3">Setor</th>
            <th className="p-3 w-32">Ações</th>
          </tr>
        </thead>

        <tbody>
          {pagina.map((c) => (
            <tr key={c._id} className="border-t">
              <td className="p-3">{c.nome}</td>
              <td className="p-3">{c.matricula}</td>
              <td className="p-3">{c.funcao}</td>
              <td className="p-3">{c.setorId?.nome}</td>

              <td className="p-3 flex gap-3">
                {/* EDITAR */}
                <button
                  className="text-yellow-600 hover:text-yellow-800"
                  onClick={() => {
                    setEditingId(c._id);
                    setNome(c.nome);
                    setMatricula(c.matricula);
                    setFuncao(c.funcao);
                    setTelefone(c.telefone || "");
                    setEmail(c.email || "");
                    setSetorId(c.setorId?._id);

                    setOpenModal(true);
                  }}
                >
                  <PencilSquareIcon className="h-6 w-6" />
                </button>

                {/* EXCLUIR */}
                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={() => {
                    setDeleteId(c._id);
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
        title={editingId ? "Editar Colaborador" : "Novo Colaborador"}
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
            type="text"
            className="border p-2 w-full mb-3"
            placeholder="Matrícula"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            required
          />

          <input
            type="text"
            className="border p-2 w-full mb-3"
            placeholder="Função"
            value={funcao}
            onChange={(e) => setFuncao(e.target.value)}
            required
          />

          <input
            type="text"
            className="border p-2 w-full mb-3"
            placeholder="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />

          <input
            type="email"
            className="border p-2 w-full mb-3"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <select
            className="border p-2 w-full mb-3"
            value={setorId}
            onChange={(e) => setSetorId(e.target.value)}
            required
          >
            <option value="">Selecione o setor</option>
            {setores.map((s) => (
              <option key={s._id} value={s._id}>
                {s.nome}
              </option>
            ))}
          </select>

          <button
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
          >
            {loading ? "Salvando..." : editingId ? "Salvar" : "Criar"}
          </button>
        </form>
      </Modal>

      {/* MODAL DELETE */}
      <ConfirmModal
        open={openDelete}
        title="Excluir Colaborador"
        message="Tem certeza que deseja excluir este colaborador?"
        onClose={() => setOpenDelete(false)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
      />
    </div>
  );
}
