import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layout/MainLayout";
import DashboardAdvanced from "./pages/DashboardAdvanced";
import Setores from "./pages/Setores";
import Usuarios from "./pages/Usuarios";
import Colaboradores from "./pages/Colaboradores";
import Login from "./pages/Login";
import Riscos from "./pages/Riscos";
import EPIs from "./pages/Epis";
import Entregas from "./pages/Entregas";
import PrivateRoute from "./components/PrivateRoute";
import ChatPage from "./pages/Chat";
import Relatorios from "./pages/Relatorios";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import SecurityDashboard from "./pages/SecurityDashboard";
import AdminRoute from "./components/AdminRoute";
import { ThemeProvider } from "./context/ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
    <BrowserRouter>
      <Routes>
        {/* Rota pública */}
        <Route path="/login" element={<Login />} />

        <Route
          path="security"
          element={
            <AdminRoute>
              <SecurityDashboard />
            </AdminRoute>
          }
        />

        {/* Rotas protegidas com layout */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardAdvanced />} />

          <Route path="security" element={<SecurityDashboard />} />

          <Route path="setores" element={<Setores />} />
          

          {/* NOVA ROTA DE GESTÃO DE USUÁRIOS */}
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="colaboradores" element={<Colaboradores />} />
          <Route path="riscos" element={<Riscos />} />
          <Route path="epis" element={<EPIs />} />
          <Route path="entregas" element={<Entregas />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  </ThemeProvider>
  );
}