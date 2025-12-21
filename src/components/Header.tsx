import { jwtDecode } from "jwt-decode";
import { useMemo, useState, useEffect, useRef } from "react";
import { LogOut, User, ChevronDown, Settings, Bell } from "lucide-react";

interface TokenPayload {
  nome?: string;
  email?: string;
  tipo?: string;
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem("token");

  const user = useMemo(() => {
    if (!token) return null;
    try {
      return jwtDecode<TokenPayload>(token);
    } catch {
      return null;
    }
  }, [token]);

  // Fecha o dropdown ao clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-3 flex items-center justify-between sticky top-0 z-50">
      
      {/* ESQUERDA — TÍTULO */}
      <div className="flex flex-col">
        <h2 className="text-lg font-bold text-gray-900 leading-tight tracking-tight">
          Painel de Controle
        </h2>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Sentinel System
          </p>
        </div>
      </div>

      {/* DIREITA — AÇÕES E USUÁRIO */}
      <div className="flex items-center gap-6">
        
        {/* ÍCONES DE APOIO (Opcional, mas melhora a cara de Dashboard) */}
        <button className="text-gray-400 hover:text-gray-600 transition-colors hidden sm:block">
          <Bell size={20} />
        </button>

        {/* DIVISOR */}
        <div className="h-8 w-[1px] bg-gray-100 hidden sm:block" />

        {/* CONTAINER DO USUÁRIO */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-3 p-1.5 rounded-full transition-all duration-200 ${
              isOpen ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`}
          >
            {/* INFO (Desktop) */}
            <div className="text-right hidden md:block pl-2">
              <p className="text-sm font-bold text-gray-800 leading-none mb-1">
                {user?.nome || "Usuário"}
              </p>
              <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-tighter">
                {user?.tipo || "Acesso"}
              </p>
            </div>

            {/* AVATAR */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 text-white flex items-center justify-center font-bold shadow-sm border-2 border-white">
              {(user?.nome || "U")[0].toUpperCase()}
            </div>

            <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* DROPDOWN MENU */}
          {isOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150 origin-top-right">
              
              {/* HEADER DO DROPDOWN (Mobile) */}
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 md:hidden">
                <p className="text-sm font-bold text-gray-800">{user?.nome}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>

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

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                >
                  <LogOut size={18} className="text-red-400 group-hover:text-red-600" />
                  <span className="font-semibold">Sair do sistema</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}