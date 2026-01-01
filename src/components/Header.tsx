import { jwtDecode } from "jwt-decode";
import { useMemo, useState, useEffect, useRef } from "react";
import { LogOut, User, ChevronDown, Settings, Bell, CheckCircle2, AlertTriangle, Package, Moon, Sun } from "lucide-react";
import { io } from "socket.io-client";
import { NavLink } from "react-router-dom";
import { useTheme } from "../context/ThemeContext"; // IMPORTADO

interface TokenPayload {
  id: string;
  nome?: string;
  email?: string;
  tipo?: string;
}

interface INotification {
  _id: string; 
  titulo: string;
  mensagem: string;
  tipo: "estoque" | "entrega" | "vencimento";
  dataCriacao: string;
  lida: boolean;
}

export default function Header() {
  const { darkMode, toggleTheme } = useTheme(); // CONSUMINDO TEMA
  const [isOpen, setIsOpen] = useState(false);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem("token");

  const API_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";
  const [notificacoes, setNotificacoes] = useState<INotification[]>([]);

  const unreadCount = useMemo(() => notificacoes.filter(n => !n.lida).length, [notificacoes]);

  const user = useMemo(() => {
    if (!token) return null;
    try {
      return jwtDecode<TokenPayload>(token);
    } catch {
      return null;
    }
  }, [token]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${API_URL}/notifications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setNotificacoes(data);
        }
      } catch (err) {
        console.error("Erro ao buscar notificações", err);
      }
    };

    if (token) fetchNotifications();

    const socket = io(API_URL);
    socket.on("nova_entrega", (data: any) => {
      if (data.notificacao) {
        setNotificacoes((prev) => [data.notificacao, ...prev]);
      }
    });

    return () => { socket.disconnect(); };
  }, [token, API_URL]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) setIsBellOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const marcarComoLida = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setNotificacoes(prev => prev.map(n => n._id === id ? { ...n, lida: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case "estoque": return <Package size={16} className="text-orange-500" />;
      case "vencimento": return <AlertTriangle size={16} className="text-rose-500" />;
      default: return <CheckCircle2 size={16} className="text-emerald-500" />;
    }
  };

  return (
    <header className={`w-full backdrop-blur-md border-b px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-[40] transition-colors duration-300 ${
      darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-gray-100'
    }`}>
      
      <div className="flex items-center gap-3">
        <div className="w-12 lg:hidden" />
        <div className="flex flex-col">
          <h2 className={`text-base sm:text-lg font-bold leading-tight tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>Painel</h2>
          <div className="flex items-center gap-1.5">
            <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <p className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Sentinel</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* BOTÃO TOGGLE THEME (Opcional, mas útil ter no header) */}
        <button 
          onClick={toggleTheme}
          className={`p-2 rounded-xl transition-all ${darkMode ? 'text-yellow-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-gray-100'}`}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* NOTIFICAÇÕES */}
        <div className="relative" ref={bellRef}>
          <button 
            onClick={() => setIsBellOpen(!isBellOpen)}
            className={`relative p-2 rounded-xl transition-all ${
              isBellOpen 
                ? (darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-blue-50 text-blue-600') 
                : (darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-400 hover:bg-gray-50')
            }`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                {unreadCount}
              </span>
            )}
          </button>

          {isBellOpen && (
            <div className={`absolute right-[-40px] sm:right-0 mt-3 w-[280px] sm:w-80 border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150 origin-top-right ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
            }`}>
              <div className={`px-4 py-3 border-b flex justify-between items-center ${darkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-gray-50/50 border-gray-50'}`}>
                <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Notificações</span>
                <span className="text-[10px] bg-blue-100 dark:bg-indigo-500/20 text-blue-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Recentes</span>
              </div>
              
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                {notificacoes.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-xs">Nenhuma notificação por enquanto.</div>
                ) : (
                  notificacoes.map((n) => (
                    <div 
                      key={n._id} 
                      onClick={() => marcarComoLida(n._id)}
                      className={`p-4 border-b transition-colors cursor-pointer flex gap-3 ${
                        darkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-gray-50 hover:bg-gray-50'
                      } ${!n.lida ? (darkMode ? 'bg-indigo-500/5' : 'bg-blue-50/30') : ''}`}
                    >
                      <div className="mt-1">{getIcon(n.tipo)}</div>
                      <div className="flex-1">
                        <p className={`text-xs ${!n.lida ? (darkMode ? 'font-bold text-white' : 'font-bold text-gray-900') : 'text-gray-500'}`}>{n.titulo}</p>
                        <p className={`text-[11px] line-clamp-2 mt-0.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{n.mensagem}</p>
                        <p className="text-[9px] text-gray-400 mt-1 font-medium italic">
                          {new Date(n.dataCriacao).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                ))}
              </div>
              <button 
                onClick={() => setNotificacoes([])} 
                className={`w-full py-3 text-[11px] font-bold text-red-500 transition-colors border-t uppercase tracking-widest ${
                  darkMode ? 'hover:bg-red-500/10 border-slate-800' : 'hover:bg-red-50 border-gray-50'
                }`}
              >
                Limpar todas
              </button>
            </div>
          )}
        </div>

        <div className={`h-8 w-[1px] hidden xs:block ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`} />

        {/* USUÁRIO */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className={`flex items-center gap-2 sm:gap-3 p-1 rounded-full transition-all duration-200 ${
              isOpen ? (darkMode ? 'bg-slate-800' : 'bg-gray-100') : (darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-50')
            }`}
          >
            <div className="text-right hidden sm:block pl-2">
              <p className={`text-sm font-bold leading-none mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {user?.nome?.split(' ')[0] || "Usuário"}
              </p>
              <p className="text-[9px] font-semibold text-blue-600 dark:text-indigo-400 uppercase tracking-tighter text-right">
                {user?.tipo}
              </p>
            </div>

            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-400 text-white flex items-center justify-center font-bold shadow-sm border-2 border-white dark:border-slate-800 text-xs sm:text-base">
              {(user?.nome || "U")[0].toUpperCase()}
            </div>
            
            <ChevronDown size={14} className={`text-gray-400 hidden sm:block transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className={`absolute right-0 mt-3 w-52 sm:w-56 border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150 origin-top-right ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
            }`}>
              <div className="p-1.5">
                <NavLink to="/profile" className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors group ${
                  darkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                }`}>
                  <User size={18} className="text-gray-400 group-hover:text-indigo-500" />
                  <span className="font-medium">Meu Perfil</span>
                </NavLink>
                <NavLink to="/settings" className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors group ${
                  darkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                }`}>
                  <Settings size={18} className="text-gray-400 group-hover:text-indigo-500" />
                  <span className="font-medium">Configurações</span>
                </NavLink>
                <div className={`h-[1px] my-1.5 ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`} />
                <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors group">
                  <LogOut size={18} className="text-red-400 group-hover:text-red-600" />
                  <span className="font-semibold">Sair</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}