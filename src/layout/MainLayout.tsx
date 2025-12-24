import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import FloatingAIButton from "../components/FloatingAIButton";

export default function MainLayout() {
  return (
    // "flex-col lg:flex-row" faz ficar um embaixo do outro no celular e lado a lado no PC
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 overflow-hidden">
      
      {/* SIDEBAR: No celular ela precisa de um tratamento especial (ou sumir) */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <Header />
        
        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto custom-scrollbar">
          <div className="max-w-[1600px] mx-auto w-full">
            <Outlet />
          </div>
        </main>

        {/* Botão global da IA - Garante que ele não tampe nada importante no mobile */}
        <div className="fixed bottom-4 right-4 z-50 lg:bottom-8 lg:right-8">
          <FloatingAIButton />
        </div>
      </div>
    </div>
  );
}