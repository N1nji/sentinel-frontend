import { useEffect, useState, useMemo } from 'react';
import { User, Settings, ShieldCheck, ListChecks, PieChart, Lock, Clock, CalendarDays } from 'lucide-react';
import { useTheme } from "../context/ThemeContext"; // IMPORTADO
import { NavLink } from 'react-router-dom'; // IMPORTADO

interface Log {
  _id: string;
  acao: string;
  detalhes?: string;
  data: string;
}

interface Usuario {
  _id: string;
  nome: string;
  email: string;
  tipo: "admin" | "comum";
  cargo: string;
  dataCriacao: string;
}

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  if (diffSeconds < 60) return `${diffSeconds} segundos atrás`;
  if (diffMinutes < 60) return `${diffMinutes} minutos atrás`;
  if (diffHours < 24) return `${diffHours} horas atrás`;
  if (diffDays === 1) return `Ontem às ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function Profile() {
  const { darkMode } = useTheme(); // CONSUMINDO TEMA
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Usuário não autenticado.");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/auth/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.erro || "Falha ao carregar dados do perfil.");
        }

        const data = await response.json();
        setUsuario(data.usuario);
        setLogs(data.logs);
      } catch (err: any) {
        setError(err.message || "Erro desconhecido ao carregar perfil.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [API_URL]);

  const userPermissions = useMemo(() => {
    if (!usuario) return [];
    const colorClass = usuario.tipo === "admin" ? "text-emerald-500" : "text-blue-500";
    
    const base = [
      { icon: <ShieldCheck size={18} className={colorClass} />, text: "Acesso ao Inventário EPI" },
      { icon: <ListChecks size={18} className={colorClass} />, text: "Registrar Entregas e Devoluções" },
      { icon: <PieChart size={18} className={colorClass} />, text: "Visualizar Relatórios" },
    ];

    if (usuario.tipo === "admin") {
      return [
        { icon: <Lock size={18} className="text-emerald-500" />, text: "Acesso Total ao Sistema" },
        { icon: <User size={18} className="text-emerald-500" />, text: "Gerenciar Usuários" },
        ...base,
      ];
    }
    return base;
  }, [usuario]);

  if (loading) {
    return (
      <div className={`flex flex-col justify-center items-center h-screen ${darkMode ? 'bg-slate-950 text-indigo-400' : 'bg-gray-50 text-indigo-600'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <span className="mt-4 font-bold tracking-widest uppercase text-xs">Sincronizando Sentinel...</span>
      </div>
    );
  }

  return (
    <main className={`flex-1 p-6 transition-colors duration-300 min-h-screen ${darkMode ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className={`text-3xl font-black mb-8 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          <User size={32} className="text-indigo-600" /> Meu Perfil
        </h1>

        {/* Card Principal */}
        <div className={`rounded-[2.5rem] shadow-xl p-8 mb-8 border transition-all flex flex-col md:flex-row items-center md:items-start gap-8 ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-5xl font-black text-white shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-300">
            {usuario?.nome[0]?.toUpperCase()}
          </div>

          <div className="text-center md:text-left flex-1">
            <h2 className="text-3xl font-black tracking-tight mb-1">{usuario?.nome}</h2>
            <p className={`${darkMode ? 'text-slate-400' : 'text-gray-500'} font-medium mb-4`}>{usuario?.email}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3 items-center">
              <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 ${
                usuario?.tipo === "admin" ? "bg-emerald-500/10 text-emerald-500" : "bg-indigo-500/10 text-indigo-500"
              }`}>
                <ShieldCheck size={14} /> {usuario?.cargo || usuario?.tipo}
              </span>
              
              <span className={`text-xs font-bold flex items-center gap-1.5 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                <CalendarDays size={14} /> Membro desde: {usuario?.dataCriacao ? new Date(usuario.dataCriacao).toLocaleDateString('pt-BR') : '---'}
              </span>
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <NavLink 
              to="/settings" 
              className={`flex items-center justify-center md:justify-start gap-3 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
                darkMode ? 'bg-slate-800 hover:bg-indigo-600 text-white' : 'bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700'
              }`}
            >
              <Settings size={18} /> Configurações
            </NavLink>
            <button className={`flex items-center justify-center md:justify-start gap-3 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
              darkMode ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white' : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white'
            }`}>
              <Lock size={18} /> Alterar Senha
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Permissões */}
          <div className={`rounded-[2rem] p-8 border shadow-lg ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <h3 className="text-xl font-black mb-6 flex items-center gap-3">
              <ListChecks size={24} className="text-indigo-500" /> Permissões
            </h3>
            <ul className="space-y-4">
              {userPermissions.map((perm, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-bold opacity-85 leading-tight">
                  <span className="mt-0.5">{perm.icon}</span>
                  {perm.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Atividades */}
          <div className={`lg:col-span-2 rounded-[2rem] p-8 border shadow-lg ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <h3 className="text-xl font-black mb-6 flex items-center gap-3">
              <Clock size={24} className="text-indigo-500" /> Atividades Recentes
            </h3>
            <div className="space-y-6">
              {logs.length === 0 ? (
                <p className="text-center py-8 text-sm font-bold opacity-50">Nenhum log registrado.</p>
              ) : (
                logs.slice(0, 5).map(log => (
                  <div key={log._id} className="relative pl-8 before:absolute before:left-0 before:top-1 before:w-3 before:h-3 before:bg-indigo-500 before:rounded-full before:ring-4 before:ring-indigo-500/20">
                    <p className="text-sm font-black tracking-tight">{log.acao}</p>
                    {log.detalhes && <p className="text-xs opacity-60 font-medium mt-1">{log.detalhes}</p>}
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mt-2">{formatRelativeTime(log.data)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}