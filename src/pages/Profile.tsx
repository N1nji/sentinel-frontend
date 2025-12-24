import { useEffect, useState, useMemo } from 'react';
import { User, Settings, ShieldCheck, ListChecks, PieChart, Lock, Clock, CalendarDays } from 'lucide-react';

// Interfaces para os dados que vêm do backend
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
  tipo: "admin" | "comum"; // Ajustado para "comum"
  cargo: string;
  dataCriacao: string;
}

// Para formatar a data dos logs de forma mais amigável
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
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // URL da API, igual ao Header.tsx
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

        const response = await fetch(`${API_URL}/auth/me`, { // Sua nova rota /auth/me
          headers: {
            "Authorization": `Bearer ${token}`
          }
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
        console.error("Erro no perfil:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [API_URL]);

  const userPermissions = useMemo(() => {
    if (!usuario) return [];

    if (usuario.tipo === "admin") {
      return [
        { icon: <Lock size={18} className="text-emerald-500" />, text: "Acesso Total ao Sistema" },
        { icon: <User size={18} className="text-emerald-500" />, text: "Gerenciar Usuários e Permissões" },
        { icon: <ShieldCheck size={18} className="text-emerald-500" />, text: "Acesso Completo a Inventário EPI" },
        { icon: <ListChecks size={18} className="text-emerald-500" />, text: "Gerenciar Entregas e Devoluções" },
        { icon: <PieChart size={18} className="text-emerald-500" />, text: "Visualizar e Exportar Relatórios Detalhados" },
      ];
    } else { // Tipo "comum"
      return [
        { icon: <ShieldCheck size={18} className="text-blue-500" />, text: "Acessar Inventário EPI" },
        { icon: <ListChecks size={18} className="text-blue-500" />, text: "Registrar Entregas e Devoluções" },
        { icon: <PieChart size={18} className="text-blue-500" />, text: "Visualizar Relatórios Básicos" },
      ];
    }
  }, [usuario]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-indigo-400">
        <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="ml-3 text-lg">Carregando perfil...</span>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-500 text-center">{error}</div>;
  }

  if (!usuario) {
    return <div className="p-8 text-gray-500 text-center">Nenhum dado de usuário encontrado.</div>;
  }

  return (
    <main className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
          <User size={28} className="text-indigo-600" /> Meu Perfil Sentinel
        </h1>

        {/* Card de Informações Básicas */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-blue-400 flex items-center justify-center text-4xl font-bold text-white shadow-xl flex-shrink-0">
            {usuario.nome[0]?.toUpperCase() || 'U'}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{usuario.nome}</h2>
            <p className="text-gray-600 mb-3">{usuario.email}</p>
            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide
              ${usuario.tipo === "admin" ? "bg-indigo-100 text-indigo-700" : "bg-blue-100 text-blue-700"}
            `}>
              <ShieldCheck size={14} className="mr-2" /> {usuario.cargo || usuario.tipo}
            </span>
            <p className="text-xs text-gray-400 mt-2 flex items-center justify-center sm:justify-start gap-1">
                <CalendarDays size={12} /> Membro desde: {new Date(usuario.dataCriacao).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="sm:ml-auto flex flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0">
             <button className="flex items-center justify-center sm:justify-start gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
                <Settings size={18} className="text-gray-500" /> Configurações <span className="ml-auto text-[10px] text-gray-400 font-bold bg-gray-100 px-2 py-0.5 rounded-full">EM BREVE</span>
            </button>
            <button className="flex items-center justify-center sm:justify-start gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors border border-rose-200">
                <Lock size={18} className="text-rose-500" /> Alterar Senha <span className="ml-auto text-[10px] text-rose-400 font-bold bg-rose-100 px-2 py-0.5 rounded-full">EM BREVE</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card de Permissões */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
              <ListChecks size={22} className="text-indigo-500" /> Minhas Permissões
            </h3>
            <ul className="space-y-3">
              {userPermissions.map((permission, index) => (
                <li key={index} className="flex items-center gap-3 text-gray-700 font-medium">
                  {permission.icon}
                  {permission.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Card de Atividades Recentes */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
              <Clock size={22} className="text-indigo-500" /> Atividades Recentes
            </h3>
            {logs.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm bg-gray-50 rounded-lg">Nenhuma atividade registrada ainda.</div>
            ) : (
              <ul className="space-y-4">
                {logs.map(log => (
                  <li key={log._id} className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-indigo-400 before:shadow-md before:shadow-indigo-200">
                    <p className="text-sm text-gray-800 font-medium">{log.acao}</p>
                    {log.detalhes && <p className="text-xs text-gray-600 mt-1">{log.detalhes}</p>}
                    <p className="text-[10px] text-gray-400 mt-1">{formatRelativeTime(log.data)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}