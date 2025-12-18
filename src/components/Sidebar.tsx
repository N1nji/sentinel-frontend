import { NavLink } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  id: string;
  tipo: string;
}

export default function Sidebar() {
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

  const linkClass = (isActive: boolean) =>
    `block p-2 rounded ${
      isActive ? "bg-blue-600 text-white" : "text-gray-200 hover:bg-gray-700"
    }`;

  return (
    <aside className="h-screen w-64 bg-gray-900 text-white p-6 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Sentinel</h1>
        <p className="text-sm text-gray-300 mt-1">Gestão de Riscos & EPIs</p>
      </div>

      <nav className="flex-1 space-y-1">

        <NavLink to="/dashboard" className={({ isActive }) => linkClass(isActive)}>
          Dashboard
        </NavLink>

        <NavLink to="/setores" className={({ isActive }) => linkClass(isActive)}>
          Setores
        </NavLink>

        {/* SOMENTE ADMIN ENXERGA */}
        {isAdmin && (
          <NavLink to="/usuarios" className={({ isActive }) => linkClass(isActive)}>
            Usuários
          </NavLink>
        )}

        <NavLink to="/colaboradores" className={({ isActive }) => linkClass(isActive)}>
          Colaboradores
        </NavLink>

        <NavLink to="/riscos" className={({ isActive }) => linkClass(isActive)}>
          Riscos
        </NavLink>

        <NavLink to="/epis" className={({ isActive }) => linkClass(isActive)}>
          EPIs
        </NavLink>

        <NavLink to="/entregas" className={({ isActive }) => linkClass(isActive)}>
          Entregas
        </NavLink>

        <NavLink to="/relatorios" className={({ isActive }) => linkClass(isActive)}>
          Relatórios
        </NavLink>

      </nav>

      <div className="mt-6 text-xs text-gray-400">v0.1 • Sentinel</div>
    </aside>
  );
}
