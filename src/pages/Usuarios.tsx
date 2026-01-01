import { useEffect, useState } from "react";
import { api } from "../services/api";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import { useTheme } from "../context/ThemeContext"; // Importação do Context
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
  ClipboardDocumentIcon,
  CheckIcon
} from "@heroicons/react/24/outline";
import { UserCircleIcon } from "lucide-react";

interface IUsuario {
  _id: string;
  nome: string;
  email: string;
  tipo: "admin" | "comum";
}

export default function Usuarios() {
  const { darkMode } = useTheme(); // Agora vamos usar essa variável em todo o código
  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [tipo, setTipo] = useState<"admin" | "comum">("comum");
  const [senhaGerada, setSenhaGerada] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<"asc" | "desc">("asc");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 8;

  const token = localStorage.getItem("token");

  async function load() {
    try {
      const res = await api.get("/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarios(res.data);
    } catch (err) {
      console.error("Erro ao carregar usuários");
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/usuarios/${editingId}`, { nome, email, tipo }, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        const res = await api.post("/usuarios", { nome, email, tipo }, { headers: { Authorization: `Bearer ${token}` } });
        setSenhaGerada(res.data.senhaGerada);
      }
      setEditingId(null);
      setOpenModal(false);
      load();
    } catch (err) { alert("Erro na operação"); }
  }

  async function handleDelete(id: string) {
    await api.delete(`/usuarios/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    setOpenDelete(false);
    load();
  }

  const handleCopiarSenha = () => {
    navigator.clipboard.writeText(senhaGerada);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const filtrados = usuarios.filter((u) => u.nome.toLowerCase().includes(busca.toLowerCase()) || u.email.toLowerCase().includes(busca.toLowerCase()));
  const ordenados = [...filtrados].sort((a, b) => ordem === "asc" ? a.nome.localeCompare(b.nome) : b.nome.localeCompare(a.nome));
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const pagina = ordenados.slice(inicio, inicio + itensPorPagina);
  const totalPaginas = Math.ceil(ordenados.length / itensPorPagina);

  return (
    <div className={`p-1 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UserCircleIcon className={`h-8 w-8 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <h1 className={`text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Gestão de Acessos
            </h1>
          </div>
          <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} font-medium`}>
            {usuarios.length} usuários registrados no sistema
          </p>
        </div>

        <button
          className="bg-indigo-600 text-white flex items-center justify-center px-5 py-3 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95"
          onClick={() => {
            setEditingId(null); setNome(""); setEmail(""); setTipo("comum"); setSenhaGerada(""); setOpenModal(true);
          }}
        >
          <PlusIcon className="h-5 w-5 mr-2 stroke-2" />
          Novo Usuário
        </button>
      </div>

      {/* ALERT SENHA GERADA */}
      {senhaGerada && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-4 border ${
          darkMode ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-lg text-white">
              <CheckIcon className="h-5 w-5 stroke-[3]" />
            </div>
            <div>
              <p className={`text-sm font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-800'}`}>Usuário criado com sucesso!</p>
              <p className={`text-xs ${darkMode ? 'text-emerald-500' : 'text-emerald-600'}`}>
                Senha temporária: 
                <span className={`font-mono px-2 py-0.5 rounded border ml-1 ${
                  darkMode ? 'bg-slate-800 border-emerald-800' : 'bg-white border-emerald-200'
                }`}>
                  {senhaGerada}
                </span>
              </p>
            </div>
          </div>
          <button 
            onClick={handleCopiarSenha}
            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-colors ${
              darkMode ? 'text-emerald-400 hover:bg-emerald-800/50' : 'text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            {copiado ? <CheckIcon className="h-4 w-4" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
            {copiado ? "Copiado!" : "Copiar"}
          </button>
        </div>
      )}

      {/* BARRA DE FERRAMENTAS */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative w-full sm:max-w-xs">
          <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar nome ou e-mail..."
            className={`w-full border pl-12 pr-4 py-3 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm ${
              darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <button
          onClick={() => setOrdem(ordem === "asc" ? "desc" : "asc")}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 border px-4 py-3 rounded-2xl font-bold transition-all shadow-sm ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <ArrowsUpDownIcon className="h-5 w-5 text-slate-400" />
          {ordem === "asc" ? "A-Z" : "Z-A"}
        </button>
      </div>

      {/* TABELA ESTILIZADA */}
      <div className={`rounded-[2rem] border shadow-xl overflow-hidden ${
        darkMode ? 'bg-slate-900 border-slate-800 shadow-none' : 'bg-white border-slate-200 shadow-slate-200/50'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${darkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Usuário</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Permissão</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-50'}`}>
              {pagina.map((u) => (
                <tr key={u._id} className={`transition-colors group ${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/80'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        darkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-indigo-600'
                      }`}>
                        {u.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{u.nome}</p>
                        <p className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      u.tipo === "admin" 
                        ? (darkMode ? "bg-purple-900/30 text-purple-400" : "bg-purple-100 text-purple-700") 
                        : (darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600")
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${u.tipo === "admin" ? "bg-purple-500" : "bg-slate-400"}`}></div>
                      {u.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingId(u._id); setNome(u.nome); setEmail(u.email); setTipo(u.tipo); setOpenModal(true); }}
                        className={`p-2 rounded-xl transition-all ${darkMode ? 'text-slate-400 hover:text-indigo-400 hover:bg-indigo-900/30' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => { setDeleteId(u._id); setOpenDelete(true); }}
                        className={`p-2 rounded-xl transition-all ${darkMode ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-900/30' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`}
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
        
        {/* RODAPÉ / PAGINAÇÃO */}
        <div className={`px-6 py-4 border-t flex items-center justify-between ${
          darkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'
        }`}>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Página {paginaAtual} de {totalPaginas}</p>
          <div className="flex gap-2">
            <button 
              disabled={paginaAtual === 1} 
              onClick={() => setPaginaAtual(p => p - 1)}
              className={`px-4 py-2 text-xs font-bold border rounded-xl disabled:opacity-30 transition-all shadow-sm ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Anterior
            </button>
            <button 
              disabled={paginaAtual === totalPaginas} 
              onClick={() => setPaginaAtual(p => p + 1)}
              className={`px-4 py-2 text-xs font-bold border rounded-xl disabled:opacity-30 transition-all shadow-sm ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Próxima
            </button>
          </div>
        </div>
      </div>

      {/* FORM MODAL - Estilizado */}
      <Modal open={openModal} onClose={() => setOpenModal(false)} title={editingId ? "Editar Usuário" : "Novo Usuário"}>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className={`text-[10px] font-black uppercase ml-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Nome Completo</label>
            <input type="text" className={`w-full border p-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`} placeholder="Ex: João Silva" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className={`text-[10px] font-black uppercase ml-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>E-mail de Acesso</label>
            <input type="email" className={`w-full border p-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`} placeholder="joao@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className={`text-[10px] font-black uppercase ml-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Nível de Permissão</label>
            <select className={`w-full border p-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`} value={tipo} onChange={(e) => setTipo(e.target.value as any)} required>
              <option value="admin" className={darkMode ? "bg-slate-900" : ""}>Administrador (Acesso Total)</option>
              <option value="comum" className={darkMode ? "bg-slate-900" : ""}>Comum (Acesso Limitado)</option>
            </select>
          </div>
          <button className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95 mt-4">
            {editingId ? "Salvar Alterações" : "Criar Usuário"}
          </button>
        </form>
      </Modal>

      <ConfirmModal open={openDelete} title="Excluir Usuário" message="Esta ação não pode ser desfeita. O usuário perderá o acesso imediatamente." onClose={() => setOpenDelete(false)} onConfirm={() => deleteId && handleDelete(deleteId)} />
    </div>
  );
}