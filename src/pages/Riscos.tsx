import { useEffect, useState } from "react";
import axios from "axios";

import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import AiModal from "../components/AiModal";
import { sugerirEpi } from "../services/ia";

import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowsUpDownIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  BoltIcon,
} from "@heroicons/react/24/solid";

// ----------- TIPOS ----------------
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

  const itensPorPagina = 10;
  const [paginaAtual, setPaginaAtual] = useState(1);

  // modais
  const [openModal, setOpenModal] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // IA
  const [iaOpen, setIaOpen] = useState(false);
  const [iaTexto, setIaTexto] = useState("");
  const [iaLoading, setIaLoading] = useState(false);

  // formulário
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

  // ------- CARREGAR --------
  async function load() {
    const riscosRes = await axios.get("http://localhost:4000/riscos", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const setoresRes = await axios.get("http://localhost:4000/setores", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setRiscos(riscosRes.data);
    setSetores(setoresRes.data);
  }

  useEffect(() => {
    load();
  }, []);

  // ------ SALVAR ------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const data = {
      nome,
      categoria,
      setorId,
      descricao,
      probabilidade,
      severidade,
      medidas,
      responsavel,
      status,
    };

    if (editingId) {
      await axios.put(`http://localhost:4000/riscos/${editingId}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      await axios.post("http://localhost:4000/riscos", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    // reset
    setEditingId(null);
    setNome("");
    setDescricao("");
    setProbabilidade(1);
    setSeveridade(1);
    setMedidas("");
    setResponsavel("");
    setSetorId("");
    setCategoria("fisico");
    setStatus("ativo");

    setOpenModal(false);
    load();
  }

  // ------ DELETAR ------
  async function handleDelete(id: string) {
    await axios.delete(`http://localhost:4000/riscos/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setOpenDelete(false);
    load();
  }

  // ------ IA ------
  async function handleIa(riscoNome: string) {
    try {
      setIaOpen(true);
      setIaLoading(true);
      setIaTexto("");

      const resposta = await sugerirEpi(riscoNome);

      setIaTexto(resposta);
    } catch (e) {
      setIaTexto("⚠️ Erro ao consultar IA.");
    } finally {
      setIaLoading(false);
    }
  }

  // ------ FILTRO/PAGINAÇÃO ------
  const filtrados = riscos.filter((r) =>
    r.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const ordenados = [...filtrados].sort((a, b) =>
    ordem === "asc"
      ? a.nome.localeCompare(b.nome)
      : b.nome.localeCompare(a.nome)
  );

  const inicio = (paginaAtual - 1) * itensPorPagina;
  const pagina = ordenados.slice(inicio, inicio + itensPorPagina);

  const totalPaginas = Math.ceil(ordenados.length / itensPorPagina);

  // estilos classificação
  function getBadgeClass(c: string) {
    switch (c) {
      case "baixo":
        return "bg-green-200 text-green-800";
      case "moderado":
        return "bg-yellow-200 text-yellow-800";
      case "medio":
        return "bg-orange-200 text-orange-800";
      case "alto":
        return "bg-red-300 text-red-800";
      case "critico":
        return "bg-purple-300 text-purple-900";
      default:
        return "";
    }
  }

  function getIcon(c: string) {
    switch (c) {
      case "baixo":
        return <ShieldCheckIcon className="h-5 w-5 text-green-600" />;
      case "moderado":
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      case "medio":
        return <BoltIcon className="h-5 w-5 text-orange-600" />;
      case "alto":
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      case "critico":
        return <BoltIcon className="h-5 w-5 text-purple-700" />;
      default:
        return null;
    }
  }

  return (
    <div>
      {/* Título */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Riscos{" "}
          <span className="text-gray-500 text-lg">
            ({riscos.length} cadastrados)
          </span>
        </h1>

        <button
          className="bg-red-600 text-white flex items-center px-4 py-2 rounded shadow hover:bg-red-700"
          onClick={() => {
            setEditingId(null);
            setOpenModal(true);
          }}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Novo Risco
        </button>
      </div>

      {/* Busca */}
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar risco..."
          className="border p-2 rounded w-64"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        <button
          onClick={() =>
            setOrdem(ordem === "asc" ? "desc" : "asc")
          }
          className="flex items-center gap-1 border px-3 py-2 rounded shadow-sm hover:bg-gray-100"
        >
          <ArrowsUpDownIcon className="h-5 w-5" />
          {ordem === "asc" ? "A-Z" : "Z-A"}
        </button>
      </div>

      {/* Tabela */}
      <table className="w-full bg-white shadow rounded overflow-hidden">
        <thead className="bg-gray-200 text-left">
          <tr>
            <th className="p-3">Nome</th>
            <th className="p-3">Categoria</th>
            <th className="p-3">Setor</th>
            <th className="p-3">Classificação</th>
            <th className="p-3 w-32">Ações</th>
          </tr>
        </thead>

        <tbody>
          {pagina.map((r) => (
            <tr key={r._id} className="border-t">
              <td className="p-3">{r.nome}</td>
              <td className="p-3 capitalize">{r.categoria}</td>
              <td className="p-3">{r.setorId?.nome}</td>

              <td className="p-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 w-fit ${getBadgeClass(
                    r.classificacao
                  )}`}
                >
                  {getIcon(r.classificacao)}
                  {r.classificacao.toUpperCase()}
                </span>
              </td>

              <td className="p-3 flex gap-3">
                {/* editar */}
                <button
                  className="text-yellow-600 hover:text-yellow-800"
                  onClick={() => {
                    setEditingId(r._id);
                    setNome(r.nome);
                    setCategoria(r.categoria);
                    setSetorId(r.setorId?._id);
                    setDescricao(r.descricao);
                    setProbabilidade(r.probabilidade);
                    setSeveridade(r.severidade);
                    setMedidas(r.medidas);
                    setResponsavel(r.responsavel);
                    setStatus(r.status);
                    setOpenModal(true);
                  }}
                >
                  <PencilSquareIcon className="h-6 w-6" />
                </button>

                {/* IA */}
                <button
                  onClick={() => handleIa(r.nome)}
                  className="text-purple-600 hover:text-purple-800 font-semibold"
                >
                  IA ⚡
                </button>

                {/* deletar */}
                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={() => {
                    setDeleteId(r._id);
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

      {/* modal IA */}
      <AiModal
        open={iaOpen}
        onClose={() => setIaOpen(false)}
        conteudo={iaLoading ? "⌛ A IA está analisando o risco..." : iaTexto}
      />

      {/* modal formulário */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={editingId ? "Editar Risco" : "Novo Risco"}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            className="border p-2 w-full"
            placeholder="Nome do risco"
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
            <option value="fisico">Físico</option>
            <option value="quimico">Químico</option>
            <option value="biologico">Biológico</option>
            <option value="ergonomico">Ergonômico</option>
            <option value="acidente">Acidente</option>
          </select>

          <select
            className="border p-2 w-full"
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

          <textarea
            className="border p-2 w-full"
            placeholder="Descrição detalhada"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <div className="flex gap-3">
            <div className="flex-1">
              <label>Probabilidade (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                className="border p-2 w-full"
                value={probabilidade}
                onChange={(e) =>
                  setProbabilidade(Number(e.target.value))
                }
              />
            </div>

            <div className="flex-1">
              <label>Severidade (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                className="border p-2 w-full"
                value={severidade}
                onChange={(e) =>
                  setSeveridade(Number(e.target.value))
                }
              />
            </div>
          </div>

          <textarea
            className="border p-2 w-full"
            placeholder="Medidas de controle"
            value={medidas}
            onChange={(e) => setMedidas(e.target.value)}
          />

          <input
            type="text"
            className="border p-2 w-full"
            placeholder="Responsável"
            value={responsavel}
            onChange={(e) => setResponsavel(e.target.value)}
          />

          <select
            className="border p-2 w-full"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="ativo">Ativo</option>
            <option value="controlado">Controlado</option>
          </select>

          <button className="bg-red-600 text-white px-4 py-2 rounded w-full hover:bg-red-700">
            {editingId ? "Salvar alterações" : "Criar"}
          </button>
        </form>
      </Modal>

      {/* modal delete */}
      <ConfirmModal
        open={openDelete}
        title="Excluir risco"
        message="Tem certeza que deseja excluir este risco?"
        onClose={() => setOpenDelete(false)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
      />
    </div>
  );
}
