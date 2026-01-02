import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";

// Layouts e Componentes de Rota
import MainLayout from "./layout/MainLayout";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";

// Páginas
import Login from "./pages/Login";
import DashboardAdvanced from "./pages/DashboardAdvanced";
import Setores from "./pages/Setores";
import Usuarios from "./pages/Usuarios";
import Colaboradores from "./pages/Colaboradores";
import Riscos from "./pages/Riscos";
import EPIs from "./pages/Epis";
import Entregas from "./pages/Entregas";
import ChatPage from "./pages/Chat";
import Relatorios from "./pages/Relatorios";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import SecurityDashboard from "./pages/SecurityDashboard";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota pública */}
          <Route path="/login" element={<Login />} />

          {/* Rotas protegidas com layout principal */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            {/* Redirecionamento inicial */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* Dashboard e Core */}
            <Route path="dashboard" element={<DashboardAdvanced />} />
            
            {/* Rota Administrativa / Segurança */}
            <Route 
              path="security" 
              element={
                <AdminRoute>
                  <SecurityDashboard />
                </AdminRoute>
              } 
            />

            {/* Gestão e Operacional */}
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="setores" element={<Setores />} />
            <Route path="colaboradores" element={<Colaboradores />} />
            <Route path="riscos" element={<Riscos />} />
            <Route path="epis" element={<EPIs />} />
            <Route path="entregas" element={<Entregas />} />
            
            {/* Extras */}
            <Route path="chat" element={<ChatPage />} />
            <Route path="relatorios" element={<Relatorios />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Fallback para páginas não encontradas */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}