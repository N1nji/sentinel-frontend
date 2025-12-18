import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import FloatingAIButton from "../components/FloatingAIButton";

export default function MainLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6 bg-gray-100 min-h-0 overflow-auto">
          <Outlet />
        </main>

        {/* Botão global da IA */}
        <FloatingAIButton />
      </div>
    </div>
  );
}
