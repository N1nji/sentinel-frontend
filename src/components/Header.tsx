// src/components/Header.tsx
import { jwtDecode } from "jwt-decode";
import { useMemo } from "react";
import { LogOut, User } from "lucide-react";

interface TokenPayload {
  nome?: string;
  email?: string;
  tipo?: string;
}

export default function Header() {
  const token = localStorage.getItem("token");

  const user = useMemo(() => {
    if (!token) return null;
    try {
      return jwtDecode<TokenPayload>(token);
    } catch {
      return null;
    }
  }, [token]);

  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return (
    <header className="w-full bg-white border-b px-6 py-4 flex items-center justify-between">
      
      {/* ESQUERDA — TÍTULO */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          Painel de Controle
        </h2>
        <p className="text-sm text-gray-500">
          Monitoramento e gestão do sistema
        </p>
      </div>

      {/* DIREITA — USUÁRIO */}
      <div className="flex items-center gap-4">
        
        {/* INFO */}
        <div className="text-right">
          <div className="text-sm font-medium text-gray-800">
            {user?.nome || "Usuário"}
          </div>
          <div className="text-xs text-gray-500">
            {user?.email || "—"} • {user?.tipo?.toUpperCase()}
          </div>
        </div>

        {/* AVATAR + MENU */}
        <div className="relative group">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold cursor-pointer">
            {(user?.nome || "U")[0]}
          </div>

          {/* DROPDOWN */}
          <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition">
            
            <button
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <User size={16} />
              Perfil
            </button>

            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
