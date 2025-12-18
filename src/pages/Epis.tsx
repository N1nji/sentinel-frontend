// src/pages/EPIs.tsx
import { useEffect, useState } from "react";
import axios from "axios";

import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";

import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/solid";

// -------------------------------
// Tipagem
// -------------------------------
interface IEpi {
  _id: string;
  nome: string;
  categoria: string;
  ca: number;
  validade_ca: string; // string data ISO
  estoque: number;
  nivel_protecao: string;
  descricao: string;
  riscosRelacionados?: string[];
  fotoUrl?: string;
  status: "ativo" | "vencido" | "sem_estoque";
}

export default function EPIs() {
  const [epis, setEpis] = useState<IEpi[]>([]);

  const [openModal, setOpenModal] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<"asc" | "desc">("asc");

  const itensPorPagina = 10;
  const [paginaAtual, setPaginaAtual] = useState(1);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("protecao_auditiva");
  const [ca, setCa] = useState(0);
  const [validadeCa, setValidadeCa] = useState("");
  const [estoque, setEstoque] = useState(0);
  const [nivelProtecao, setNivelProtecao] = useState("");
  const [descricao, setDescricao] = useState("");
  const [riscosRelacionados, setRiscosRelacionados] = useState<string[]>([]);
  const [fotoUrl, setFotoUrl] = useState("");

  const token = localStorage.getItem("token");

  // -------------------------------
  // Carregar lista
  // -------------------------------
  async function load() {
    const res = await axios.get("http://localhost:4000/epis", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setEpis(res.data);
  }

  useEffect(() => {
    load();
  }, []);

  // -------------------------------
  // Criar / Editar — com CORREÇÃO DE DATA
  // -------------------------------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const data = {
      nome,
      categoria,
      ca,

      // CORREÇÃO DEFINITIVA: evita dia anterior no Mongo (timezone fix)
      validade_ca: new Date(validadeCa + "T12:00:00"),

      estoque,
      nivel_protecao: nivelProtecao,
      descricao,
      riscosRelacionados,
      fotoUrl,
    };

    if (editingId) {
      await axios.put(
        `http://localhost:4000/epis/${editingId}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } else {
      await axios.post("http://localhost:4000/epis", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    // limpar
    setNome("");
    setCategoria("protecao_auditiva");
    setCa(0);
    setValidadeCa("");
    setEstoque(0);
    setNivelProtecao("");
    setDescricao("");
    setRiscosRelacionados([]);
    setFotoUrl("");
    setEditingId(null);
    setOpenModal(false);
    load();
  }

  // -------------------------------
  // Deletar
  // -------------------------------
  async function handleDelete(id: string) {
    await axios.delete(`http://localhost:4000/epis/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setOpenDelete(false);
    load();
  }

  // -------------------------------
  // Filtros e paginação
  // -------------------------------
  const filtrados = epis.filter((e) =>
    e.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const ordenados = [...filtrados].sort((a, b) =>
    ordem === "asc"
      ? a.nome.localeCompare(b.nome)
      : b.nome.localeCompare(a.nome)
  );

  const inicio = (paginaAtual - 1) * itensPorPagina;
  const pagina = ordenados.slice(inicio, inicio + itensPorPagina);
  const totalPaginas = Math.ceil(ordenados.length / itensPorPagina);

  // -------------------------------
  // Badge
  // -------------------------------
  function getBadgeClass(status: string) {
    switch (status) {
      case "ativo":
        return "bg-green-200 text-green-800";
      case "vencido":
        return "bg-red-300 text-red-800";
      case "sem_estoque":
        return "bg-orange-200 text-orange-800";
      default:
        return "bg-gray-200 text-gray-700";
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          EPIs <span className="text-gray-500 text-lg">({epis.length})</span>
        </h1>

        <button
          className="bg-blue-600 text-white flex items-center px-4 py-2 rounded shadow hover:bg-blue-700"
          onClick={() => {
            setEditingId(null);
            setNome("");
            setCategoria("protecao_auditiva");
            setCa(0);
            setValidadeCa("");
            setEstoque(0);
            setNivelProtecao("");
            setDescricao("");
            setRiscosRelacionados([]);
            setFotoUrl("");
            setOpenModal(true);
          }}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Novo EPI
        </button>
      </div>

      {/* ferramentas */}
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar..."
          className="border p-2 rounded w-64"
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPaginaAtual(1);
          }}
        />

        <button
          onClick={() => setOrdem(ordem === "asc" ? "desc" : "asc")}
          className="flex items-center gap-1 border px-3 py-2 rounded shadow-sm hover:bg-gray-100"
        >
          <ArrowsUpDownIcon className="h-5 w-5" />
          {ordem === "asc" ? "A-Z" : "Z-A"}
        </button>
      </div>

      {/* tabela */}
      <table className="w-full bg-white shadow rounded overflow-hidden">
        <thead className="bg-gray-200 text-left">
          <tr>
            <th className="p-3">Nome</th>
            <th className="p-3">Categoria</th>
            <th className="p-3">CA</th>
            <th className="p-3">Validade</th>
            <th className="p-3">Estoque</th>
            <th className="p-3">Status</th>
            <th className="p-3 w-32">Ações</th>
          </tr>
        </thead>

        <tbody>
          {pagina.map((e) => (
            <tr key={e._id} className="border-t">
              <td className="p-3">{e.nome}</td>
              <td className="p-3 capitalize">{e.categoria.replace(/_/g, " ")}</td>
              <td className="p-3">{e.ca}</td>

              {/* EXIBIÇÃO CORRETA */}
              <td className="p-3">
                {new Date(e.validade_ca).toLocaleDateString()}
              </td>

              <td className="p-3">{e.estoque}</td>

              <td className="p-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${getBadgeClass(
                    e.status
                  )}`}
                >
                  {e.status.toUpperCase().replace("_", " ")}
                </span>
              </td>

              <td className="p-3 flex gap-3">
                <button
                  className="text-yellow-600 hover:text-yellow-800"
                  onClick={() => {
                    setEditingId(e._id);
                    setNome(e.nome);
                    setCategoria(e.categoria);
                    setCa(e.ca);

                    // CORREÇÃO DEFINITIVA NO EDITAR:
                    setValidadeCa(
                      new Date(e.validade_ca).toISOString().split("T")[0]
                    );

                    setEstoque(e.estoque);
                    setNivelProtecao(e.nivel_protecao);
                    setDescricao(e.descricao);
                    setRiscosRelacionados(e.riscosRelacionados || []);
                    setFotoUrl(e.fotoUrl || "");
                    setOpenModal(true);
                  }}
                >
                  <PencilSquareIcon className="h-6 w-6" />
                </button>

                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={() => {
                    setDeleteId(e._id);
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

      {/* paginação */}
      <div className="flex justify-center items-center gap-3 mt-4">
        <button
          disabled={paginaAtual === 1}
          onClick={() => setPaginaAtual((p) => p - 1)}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          Anterior
        </button>

        <span>
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

      {/* modal form */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={editingId ? "Editar EPI" : "Novo EPI"}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            className="border p-2 w-full"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />

          <select
            className="border p-2 w-full"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            required
          >
            <option value="protecao_auditiva">Proteção auditiva</option>
            <option value="protecao_visual">Proteção visual</option>
            <option value="protecao_respiratoria">Proteção respiratória</option>
            <option value="protecao_maos">Proteção mãos</option>
            <option value="protecao_cabeca">Proteção cabeça</option>
            <option value="protecao_pes">Proteção pés</option>
            <option value="protecao_quedas">Proteção quedas</option>
            <option value="protecao_corpo">Proteção corpo</option>
          </select>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              className="border p-2 w-full"
              placeholder="CA"
              value={ca || ""}
              onChange={(e) => setCa(Number(e.target.value))}
              required
            />

            <input
              type="date"
              className="border p-2 w-full"
              placeholder="Validade do CA"
              value={validadeCa}
              onChange={(e) => setValidadeCa(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              className="border p-2 w-full"
              placeholder="Estoque"
              value={estoque || ""}
              onChange={(e) => setEstoque(Number(e.target.value))}
              required
            />

            <input
              type="text"
              className="border p-2 w-full"
              placeholder="Nível de proteção"
              value={nivelProtecao}
              onChange={(e) => setNivelProtecao(e.target.value)}
              required
            />
          </div>

          <textarea
            className="border p-2 w-full"
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <button className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700">
            {editingId ? "Salvar alterações" : "Criar EPI"}
          </button>
        </form>
      </Modal>

      {/* modal delete */}
      <ConfirmModal
        open={openDelete}
        title="Excluir EPI"
        message="Tem certeza que deseja excluir este EPI?"
        onClose={() => setOpenDelete(false)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
      />
    </div>
  );
}
