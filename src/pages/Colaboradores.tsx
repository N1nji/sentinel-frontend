import { useEffect, useState } from "react";
import { api } from "../services/api";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import { useTheme } from "../context/ThemeContext"; // IMPORTADO

import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
  UserGroupIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

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
  const { darkMode } = useTheme(); // CONSUMINDO O TEMA
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
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<"asc" | "desc">("asc");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 8;

  const token = localStorage.getItem("token");

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

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const data = { nome, matricula, funcao, telefone, email, setorId };
    try {
      if (editingId) {
        await api.put(`/colaboradores/${editingId}`, data, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await api.post("/colaboradores", data, { headers: { Authorization: `Bearer ${token}` } });
      }
      setOpenModal(false);
      load();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    await api.delete(`/colaboradores/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    setOpenDelete(false);
    load();
  }

  const filtrados = colaboradores.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) || 
    c.matricula.toLowerCase().includes(busca.toLowerCase())
  );

  const ordenados = [...filtrados].sort((a, b) =>
    ordem === "asc" ? a.nome.localeCompare(b.nome) : b.nome.localeCompare(a.nome)
  );

  const inicio = (paginaAtual - 1) * itensPorPagina;
  const pagina = ordenados.slice(inicio, inicio + itensPorPagina);
  const totalPaginas = Math.ceil(ordenados.length / itensPorPagina);

  return (
    <div className="p-1 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UserGroupIcon className={`h-8 w-8 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Colaboradores</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Gerencie a equipe e suas alocações de setor</p>
        </div>

        <button
          className="bg-indigo-600 text-white flex items-center justify-center px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95"
          onClick={() => {
            setEditingId(null); setNome(""); setMatricula(""); setFuncao(""); setTelefone(""); setEmail(""); setSetorId(""); setOpenModal(true);
          }}
        >
          <PlusIcon className="h-5 w-5 mr-2 stroke-[3]" />
          Novo Colaborador
        </button>
      </div>

      {/* FERRAMENTAS */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative w-full sm:max-w-md">
          <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome ou matrícula..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white pl-12 pr-4 py-3 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
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

      {/* TABELA */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Colaborador</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Cargo / Setor</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Contatos</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {pagina.map((c) => (
                <tr key={c._id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-100 dark:shadow-none">
                        {c.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 leading-none mb-1">{c.nome}</p>
                        <p className="text-xs font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 inline-block px-1.5 py-0.5 rounded">ID: {c.matricula}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{c.funcao}</span>
                      <span className="inline-flex items-center w-fit px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 uppercase">
                        {c.setorId?.nome || "Sem Setor"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      {c.email && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <EnvelopeIcon className="h-3.5 w-3.5" /> {c.email}
                        </div>
                      )}
                      {c.telefone && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <PhoneIcon className="h-3.5 w-3.5" /> {c.telefone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => { setEditingId(c._id); setNome(c.nome); setMatricula(c.matricula); setFuncao(c.funcao); setTelefone(c.telefone || ""); setEmail(c.email || ""); setSetorId(c.setorId?._id); setOpenModal(true); }}
                        className="p-2.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => { setDeleteId(c._id); setOpenDelete(true); }}
                        className="p-2.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all"
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
        
        {/* FOOTER PAGINAÇÃO */}
        <div className="px-6 py-5 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Página {paginaAtual} de {totalPaginas}</p>
          <div className="flex gap-2">
            <button 
              disabled={paginaAtual === 1} 
              onClick={() => setPaginaAtual(p => p - 1)}
              className="px-4 py-2 text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95"
            >
              Anterior
            </button>
            <button 
              disabled={paginaAtual === totalPaginas} 
              onClick={() => setPaginaAtual(p => p + 1)}
              className="px-4 py-2 text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>

      {/* MODAL FORM */}
      <Modal open={openModal} onClose={() => setOpenModal(false)} title={editingId ? "Editar Colaborador" : "Novo Colaborador"}>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Nome Completo</label>
              <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" placeholder="Nome do colaborador" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Matrícula / ID</label>
              <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" placeholder="Ex: 100250" value={matricula} onChange={(e) => setMatricula(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Função</label>
              <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" placeholder="Ex: Técnico de Segurança" value={funcao} onChange={(e) => setFuncao(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Setor Alocado</label>
              <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none" value={setorId} onChange={(e) => setSetorId(e.target.value)} required>
                <option value="" className="dark:bg-slate-900">Selecione o setor...</option>
                {setores.map((s) => <option key={s._id} value={s._id} className="dark:bg-slate-900">{s.nome}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Telefone</label>
              <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" placeholder="(00) 00000-0000" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">E-mail</label>
              <input type="email" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" placeholder="email@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <button disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95 mt-4 disabled:opacity-50">
            {loading ? "Processando..." : editingId ? "Atualizar Cadastro" : "Cadastrar Colaborador"}
          </button>
        </form>
      </Modal>

      <ConfirmModal open={openDelete} title="Excluir Colaborador" message="Tem certeza que deseja excluir? Todos os registros de EPI vinculados a este colaborador serão mantidos, mas o cadastro dele será removido." onClose={() => setOpenDelete(false)} onConfirm={() => deleteId && handleDelete(deleteId)} />
    </div>
  );
}