import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  LayoutDashboardIcon,
  MapIcon,
  UsersIcon,
  GroupIcon,
  AlertTriangleIcon,
  ShieldCheckIcon,
  ClipboardListIcon,
  BarChart3Icon,
  LogOutIcon,
  MenuIcon,
  XIcon,
} from "lucide-react"; // Ou Heroicons, usei nomes genéricos para facilitar

interface TokenPayload {
  id: string;
  tipo: string;
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  let isAdmin = false;

  if (token) {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      isAdmin = decoded.tipo === "admin";
    } catch {
      isAdmin = false;
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Estilização premium para os links
  const linkClass = (isActive: boolean) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-300 ${
      isActive
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
        : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
    }`;

  return (
    <>
      {/* BOTÃO MOBILE (Hambúrguer) - Só aparece em telas pequenas */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-xl shadow-xl"
      >
        {isOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
      </button>

      {/* OVERLAY MOBILE */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR PRINCIPAL */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-72 bg-slate-950 text-white p-6 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        
        {/* LOGO AREA */}
        <div className="mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShieldCheckIcon className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter">SENTINEL</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500/80">Safety System</p>
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO */}
        <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
          
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-4">Principal</p>

          <NavLink to="/dashboard" onClick={() => setIsOpen(false)} className={({ isActive }) => linkClass(isActive)}>
            <LayoutDashboardIcon size={20} /> Dashboard
          </NavLink>

          <NavLink to="/setores" onClick={() => setIsOpen(false)} className={({ isActive }) => linkClass(isActive)}>
            <MapIcon size={20} /> Setores
          </NavLink>

          {isAdmin && (
            <NavLink to="/usuarios" onClick={() => setIsOpen(false)} className={({ isActive }) => linkClass(isActive)}>
              <UsersIcon size={20} /> Usuários
            </NavLink>
          )}

          <NavLink to="/colaboradores" onClick={() => setIsOpen(false)} className={({ isActive }) => linkClass(isActive)}>
            <GroupIcon size={20} /> Colaboradores
          </NavLink>

          <NavLink to="/riscos" onClick={() => setIsOpen(false)} className={({ isActive }) => linkClass(isActive)}>
            <AlertTriangleIcon size={20} /> Mapa de Riscos
          </NavLink>

          <NavLink to="/epis" onClick={() => setIsOpen(false)} className={({ isActive }) => linkClass(isActive)}>
            <ShieldCheckIcon size={20} /> Inventário EPI
          </NavLink>

          <NavLink to="/entregas" onClick={() => setIsOpen(false)} className={({ isActive }) => linkClass(isActive)}>
            <ClipboardListIcon size={20} /> Entregas
          </NavLink>

          <NavLink to="/relatorios" onClick={() => setIsOpen(false)} className={({ isActive }) => linkClass(isActive)}>
            <BarChart3Icon size={20} /> Relatórios
          </NavLink>
        </nav>

        {/* FOOTER / LOGOUT */}
        <div className="mt-auto pt-6 border-t border-slate-900">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl font-bold transition-all group"
          >
            <LogOutIcon size={20} className="group-hover:translate-x-1 transition-transform" /> 
            Sair do Sistema
          </button>
          
          <div className="mt-4 px-4">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">v1.0.4 • Sentinel AI</p>
          </div>
        </div>
      </aside>
    </>
  );
}