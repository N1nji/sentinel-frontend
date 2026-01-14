import { useEffect, useState } from "react";
import { api } from "../services/api";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import { useTheme } from "../context/ThemeContext";
import { jwtDecode } from "jwt-decode"; // 🔥 Importação necessária
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
  ClipboardDocumentIcon,
  CheckIcon
} from "@heroicons/react/24/outline";
import { 
  UserCircleIcon, 
  UsersIcon, 
  ShieldCheckIcon, 
  UserPlusIcon, 
  SearchX 
} from "lucide-react";

interface IUsuario {
  _id: string;
  nome: string;
  email: string;
  tipo: "admin" | "comum";
}

// Interface para o payload do seu JWT (conforme definido no seu auth.ts do backend)
interface TokenPayload {
  id: string;
  email: string;
  tipo: string;
  iat: number;
  exp: number;
}

export default function Usuarios() {
  const { darkMode } = useTheme();
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

  const [emailLogado, setEmailLogado] = useState("");
  const token = localStorage.getItem("token");

  async function load() {
    try {
      const res = await api.get("/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarios(res.data.usuarios);
    } catch (err) {
      console.error("Erro ao carregar usuários");
    }
  }

  useEffect(() => {
    //  Extrai o e-mail do token assim que o componente carrega
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        setEmailLogado(decoded.email);
      } catch (error) {
        console.error("Erro ao decodificar token:", error);
      }
    }
    load();
  }, [token]);

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
    <div className="p-1 transition-colors duration-300">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UserCircleIcon className={`h-8 w-8 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Gestão de Acessos</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Controle de permissões e usuários do Sentinel</p>
        </div>

        <button
          className="bg-indigo-600 text-white flex items-center justify-center px-5 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95"
          onClick={() => {
            setEditingId(null); setNome(""); setEmail(""); setTipo("comum"); setSenhaGerada(""); setOpenModal(true);
          }}
        >
          <PlusIcon className="h-5 w-5 mr-2 stroke-2" />
          Novo Usuário
        </button>
      </div>

      {/* CARDS DE STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <UsersIcon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Total Usuários</p>
              <h4 className="text-2xl font-black text-slate-800 dark:text-white">{usuarios.length}</h4>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-2xl text-purple-600 dark:text-purple-400">
              <ShieldCheckIcon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Administradores</p>
              <h4 className="text-2xl font-black text-slate-800 dark:text-white">
                {usuarios.filter(u => u.tipo === 'admin').length}
              </h4>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <UserPlusIcon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Logado como</p>
              <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[120px]">
                {emailLogado || "---"}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* ALERT SENHA GERADA */}
      {senhaGerada && (
        <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-lg text-white">
              <CheckIcon className="h-5 w-5 stroke-[3]" />
            </div>
            <div>
              <p className="text-emerald-800 dark:text-emerald-400 text-sm font-bold">Usuário criado com sucesso!</p>
              <p className="text-emerald-600 dark:text-emerald-500 text-xs">
                Senha temporária: 
                <span className="font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 ml-1">
                  {senhaGerada}
                </span>
              </p>
            </div>
          </div>
          <button 
            onClick={handleCopiarSenha}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 px-4 py-2 rounded-xl transition-colors"
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
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white pl-12 pr-4 py-3 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <button
          onClick={() => setOrdem(ordem === "asc" ? "desc" : "asc")}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-2xl font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
        >
          <ArrowsUpDownIcon className="h-5 w-5 text-slate-400" />
          {ordem === "asc" ? "Nome A-Z" : "Nome Z-A"}
        </button>
      </div>

      {/* TABELA */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        {ordenados.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Usuário</th>
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Permissão</th>
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {pagina.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                            {u.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-800 dark:text-slate-200">{u.nome}</p>
                              {/* 🔥 COMPARAÇÃO REAL AQUI */}
                              {u.email === emailLogado && (
                                <span className="text-[8px] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-md font-black uppercase">Você</span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          u.tipo === "admin" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${u.tipo === "admin" ? "bg-purple-500" : "bg-slate-400"}`}></div>
                          {u.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setEditingId(u._id); setNome(u.nome); setEmail(u.email); setTipo(u.tipo); setOpenModal(true); }}
                            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => { setDeleteId(u._id); setOpenDelete(true); }}
                            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all"
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
            
            <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">Página {paginaAtual} de {totalPaginas}</p>
              <div className="flex gap-2">
                <button 
                  disabled={paginaAtual === 1} 
                  onClick={() => setPaginaAtual(p => p - 1)}
                  className="px-4 py-2 text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                >
                  Anterior
                </button>
                <button 
                  disabled={paginaAtual === totalPaginas} 
                  onClick={() => setPaginaAtual(p => p + 1)}
                  className="px-4 py-2 text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                >
                  Próxima
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4">
              <SearchX size={48} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Nenhum resultado</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs text-center mt-2 font-medium">
              Não encontramos nenhum usuário para "{busca}". Verifique a ortografia ou adicione um novo perfil.
            </p>
            <button 
              onClick={() => setBusca("")}
              className="mt-6 text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline"
            >
              Limpar pesquisa
            </button>
          </div>
        )}
      </div>

      <Modal open={openModal} onClose={() => setOpenModal(false)} title={editingId ? "Editar Usuário" : "Novo Usuário"}>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Nome Completo</label>
            <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" placeholder="Ex: João Silva" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">E-mail de Acesso</label>
            <input type="email" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" placeholder="joao@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Nível de Permissão</label>
            <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none font-medium" value={tipo} onChange={(e) => setTipo(e.target.value as any)} required>
              <option value="admin">Administrador (Acesso Total)</option>
              <option value="comum">Comum (Acesso Limitado)</option>
            </select>
          </div>
          <button className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95 mt-4 uppercase tracking-widest text-sm">
            {editingId ? "Salvar Alterações" : "Criar Usuário"}
          </button>
        </form>
      </Modal>

      <ConfirmModal open={openDelete} title="Excluir Usuário" message="Esta ação não pode ser desfeita. O usuário perderá o acesso imediatamente." onClose={() => setOpenDelete(false)} onConfirm={() => deleteId && handleDelete(deleteId)} />
    </div>
  );
}