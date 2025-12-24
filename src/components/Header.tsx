import { jwtDecode } from "jwt-decode";
import { useMemo, useState, useEffect, useRef } from "react";
import { LogOut, User, ChevronDown, Settings, Bell, CheckCircle2, AlertTriangle, Package } from "lucide-react";

interface TokenPayload {
  nome?: string;
  email?: string;
  tipo?: string;
}

interface INotification {
  id: string;
  titulo: string;
  msg: string;
  tipo: "estoque" | "entrega" | "vencimento";
  data: string;
  lida: boolean;
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem("token");

  const [notificacoes, setNotificacoes] = useState<INotification[]>([
    { id: "1", titulo: "Estoque Baixo", msg: "Luva de Vaqueta restam apenas 5 un.", tipo: "estoque", data: "10 min", lida: false },
    { id: "2", titulo: "Nova Entrega", msg: "José Silva recebeu um novo Capacete.", tipo: "entrega", data: "1 hora", lida: false },
    { id: "3", titulo: "CA Vencendo", msg: "Protetor Auricular vence em 15 dias.", tipo: "vencimento", data: "2 horas", lida: true },
  ]);

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
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsBellOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-[40]">
      
      {/* ESQUERDA — TÍTULO (Com padding para o botão da Sidebar no Mobile) */}
      <div className="flex items-center gap-3">
        {/* Este div vazio de w-12 garante que o título não fique embaixo do botão hambúrguer no mobile */}
        <div className="w-12 lg:hidden" />
        
        <div className="flex flex-col">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight tracking-tight">
            Painel
          </h2>
          <div className="flex items-center gap-1.5">
            <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
              Sentinel
            </p>
          </div>
        </div>
      </div>

      {/* DIREITA — AÇÕES E USUÁRIO */}
      <div className="flex items-center gap-2 sm:gap-6">
        
        {/* DROPDOWN DE NOTIFICAÇÕES */}
        <div className="relative" ref={bellRef}>
          <button 
            onClick={() => setIsBellOpen(!isBellOpen)}
            className={`relative p-2 rounded-xl transition-all ${isBellOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {isBellOpen && (
            <div className="absolute right-[-40px] sm:right-0 mt-3 w-[280px] sm:w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150 origin-top-right">
              <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <span className="text-sm font-bold text-gray-800">Notificações</span>
                <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Recentes</span>
              </div>
              
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                {notificacoes.map((n) => (
                  <div key={n.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${!n.lida ? 'bg-blue-50/30' : ''}`}>
                    <div className="mt-1">{getIcon(n.tipo)}</div>
                    <div className="flex-1">
                      <p className={`text-xs ${!n.lida ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{n.titulo}</p>
                      <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{n.msg}</p>
                      <p className="text-[9px] text-gray-400 mt-1 font-medium">{n.data} atrás</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full py-3 text-[11px] font-bold text-blue-600 hover:bg-blue-50 transition-colors border-t border-gray-50 uppercase tracking-widest">
                Ver todas
              </button>
            </div>
          )}
        </div>

        <div className="h-8 w-[1px] bg-gray-100 hidden xs:block" />

        {/* CONTAINER DO USUÁRIO */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 sm:gap-3 p-1 rounded-full transition-all duration-200 ${
              isOpen ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`}
          >
            <div className="text-right hidden sm:block pl-2">
              <p className="text-sm font-bold text-gray-800 leading-none mb-1">
                {user?.nome?.split(' ')[0] || "Usuário"}
              </p>
              <p className="text-[9px] font-semibold text-blue-600 uppercase tracking-tighter">
                {user?.tipo}
              </p>
            </div>

            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 text-white flex items-center justify-center font-bold shadow-sm border-2 border-white text-xs sm:text-base">
              {(user?.nome || "U")[0].toUpperCase()}
            </div>
            
            <ChevronDown size={14} className={`text-gray-400 hidden sm:block transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-3 w-52 sm:w-56 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150 origin-top-right">
              <div className="p-1.5">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors group">
                  <User size={18} className="text-gray-400 group-hover:text-blue-600" />
                  <span className="font-medium">Meu Perfil</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors group">
                  <Settings size={18} className="text-gray-400 group-hover:text-blue-600" />
                  <span className="font-medium">Configurações</span>
                </button>
                <div className="h-[1px] bg-gray-100 my-1.5" />
                <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors group">
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