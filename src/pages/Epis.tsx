import { useEffect, useState } from "react";
import { api } from "../services/api";

import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";

import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowsUpDownIcon,
  MagnifyingGlassIcon,
  ArchiveBoxIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

// -------------------------------
// Tipagem
// -------------------------------
interface IEpi {
  _id: string;
  nome: string;
  categoria: string;
  ca: number;
  validade_ca: string;
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
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

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

  async function load() {
    const res = await api.get("/epis", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setEpis(res.data);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      nome, categoria, ca,
      validade_ca: new Date(validadeCa + "T12:00:00"),
      estoque, nivel_protecao: nivelProtecao,
      descricao, riscosRelacionados, fotoUrl,
    };

    if (editingId) {
      await api.put(`/epis/${editingId}`, data, { headers: { Authorization: `Bearer ${token}` } });
    } else {
      await api.post("/epis", data, { headers: { Authorization: `Bearer ${token}` } });
    }

    resetForm();
    load();
  }

  function resetForm() {
    setNome(""); setCategoria("protecao_auditiva"); setCa(0); setValidadeCa("");
    setEstoque(0); setNivelProtecao(""); setDescricao(""); setRiscosRelacionados([]);
    setFotoUrl(""); setEditingId(null); setOpenModal(false);
  }

  async function handleDelete(id: string) {
    await api.delete(`/epis/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    setOpenDelete(false);
    load();
  }

  const filtrados = epis.filter((e) => e.nome.toLowerCase().includes(busca.toLowerCase()));
  const ordenados = [...filtrados].sort((a, b) => ordem === "asc" ? a.nome.localeCompare(b.nome) : b.nome.localeCompare(a.nome));
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const pagina = ordenados.slice(inicio, inicio + itensPorPagina);
  const totalPaginas = Math.ceil(ordenados.length / itensPorPagina);

  function getBadgeClass(status: string) {
    switch (status) {
      case "ativo": return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
      case "vencido": return "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800";
      case "sem_estoque": return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
      default: return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
    }
  }

  return (
    <div className="p-1 md:p-4 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheckIcon className="h-8 w-8 text-blue-600 dark:text-blue-500" />
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Gestão de EPIs <span className="text-slate-400 dark:text-slate-500 font-medium text-lg">({epis.length})</span>
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium md:ml-10 text-sm md:text-base">Controle de Certificados de Aprovação e estoque</p>
        </div>

        <button
          className="w-full md:w-auto bg-blue-600 text-white flex items-center justify-center px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all active:scale-95 text-sm md:text-base"
          onClick={() => { resetForm(); setOpenModal(true); }}
        >
          <PlusIcon className="h-5 w-5 mr-2 stroke-[3]" />
          Novo EPI
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative w-full sm:max-w-md">
          <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome do equipamento..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white pl-12 pr-4 py-3 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setPaginaAtual(1); }}
          />
        </div>

        <button
          onClick={() => setOrdem(ordem === "asc" ? "desc" : "asc")}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-3 rounded-2xl font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
        >
          <ArrowsUpDownIcon className="h-5 w-5 text-slate-400" />
          {ordem === "asc" ? "A-Z" : "Z-A"}
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Equipamento</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">CA / Validade</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Nível / Categoria</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Estoque</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Status</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {pagina.map((e) => (
                <tr key={e._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 font-bold shrink-0">
                        {e.nome.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-200 mb-0.5 truncate">{e.nome}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[150px]">{e.descricao || "Sem descrição"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">CA {e.ca}</p>
                      <p className={`text-[10px] font-medium ${new Date(e.validade_ca) < new Date() ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'}`}>
                        Venc: {new Date(e.validade_ca).toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md block w-fit">
                        {e.categoria.replace(/_/g, " ")}
                      </span>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 italic truncate max-w-[120px]">{e.nivel_protecao}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <ArchiveBoxIcon className={`h-4 w-4 ${e.estoque < 5 ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'}`} />
                      <span className={`text-sm font-black ${e.estoque < 5 ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'}`}>
                        {e.estoque} un
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black border uppercase tracking-wider ${getBadgeClass(e.status)}`}>
                      {e.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-1 md:opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all"
                        onClick={() => {
                          setEditingId(e._id); setNome(e.nome); setCategoria(e.categoria); setCa(e.ca);
                          setValidadeCa(new Date(e.validade_ca).toISOString().split("T")[0]);
                          setEstoque(e.estoque); setNivelProtecao(e.nivel_protecao);
                          setDescricao(e.descricao); setRiscosRelacionados(e.riscosRelacionados || []);
                          setFotoUrl(e.fotoUrl || ""); setOpenModal(true);
                        }}
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all"
                        onClick={() => { setDeleteId(e._id); setOpenDelete(true); }}
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
        <div className="px-6 py-5 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Página {paginaAtual} de {totalPaginas}</p>
          <div className="flex gap-2 w-full sm:w-auto">
            <button disabled={paginaAtual === 1} onClick={() => setPaginaAtual(p => p - 1)} className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">Anterior</button>
            <button disabled={paginaAtual === totalPaginas} onClick={() => setPaginaAtual(p => p + 1)} className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">Próxima</button>
          </div>
        </div>
      </div>

      {/* FORM MODAL */}
      <Modal open={openModal} onClose={() => setOpenModal(false)} title={editingId ? "Editar Equipamento" : "Cadastrar Novo EPI"}>
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[75vh] md:max-h-[80vh]">
          <div className="flex-1 overflow-y-auto px-1 py-4 space-y-5 scrollbar-hide">
            
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Nome do Equipamento</label>
              <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-3 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" placeholder="Ex: Protetor Auditivo Plug..." value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Categoria</label>
              <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-3 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer shadow-sm" value={categoria} onChange={(e) => setCategoria(e.target.value)} required>
                <option value="protecao_auditiva">Proteção auditiva</option>
                <option value="protecao_visual">Proteção visual</option>
                <option value="protecao_respiratoria">Proteção respiratória</option>
                <option value="protecao_maos">Proteção mãos</option>
                <option value="protecao_cabeca">Proteção cabeça</option>
                <option value="protecao_pes">Proteção pés</option>
                <option value="protecao_quedas">Proteção quedas</option>
                <option value="protecao_corpo">Proteção corpo</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Número do CA</label>
                <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-3 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" placeholder="00000" value={ca || ""} onChange={(e) => setCa(Number(e.target.value))} required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Validade do CA</label>
                <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-3 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" value={validadeCa} onChange={(e) => setValidadeCa(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Qtd em Estoque</label>
                <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-3 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" placeholder="0" value={estoque || ""} onChange={(e) => setEstoque(Number(e.target.value))} required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Nível de Proteção</label>
                <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-3 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" placeholder="Ex: 18dB, Classe B..." value={nivelProtecao} onChange={(e) => setNivelProtecao(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Descrição Detalhada</label>
              <textarea className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-3 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all h-24 resize-none shadow-sm" placeholder="Características técnicas do equipamento..." value={descricao} onChange={(e) => setDescricao(e.target.value)} />
            </div>
          </div>

          <div className="pt-4 pb-2 mt-2 border-t border-slate-100 dark:border-slate-800">
            <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all active:scale-95">
              {editingId ? "Salvar Alterações" : "Cadastrar EPI"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={openDelete} title="Excluir EPI" message="Tem certeza que deseja remover este equipamento? Esta ação não pode ser desfeita." onClose={() => setOpenDelete(false)} onConfirm={() => deleteId && handleDelete(deleteId)} />
    </div>
  );
}