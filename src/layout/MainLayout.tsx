import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import FloatingAIButton from "../components/FloatingAIButton";
import { useTheme } from "../context/ThemeContext";

export default function MainLayout() {
  const { darkMode } = useTheme();

  return (
    <div className={`flex flex-col lg:flex-row h-screen overflow-hidden transition-colors duration-300 ${
      darkMode ? "bg-slate-950" : "bg-gray-50"
    }`}>
      
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <Header />
        
        <main className={`flex-1 p-4 sm:p-6 overflow-auto custom-scrollbar transition-colors duration-300 ${
          darkMode ? "bg-slate-950" : "bg-gray-50"
        }`}>
          {/* O segredo: pb-24 (mobile) e lg:pb-12 (desktop). 
              Isso cria um espaço vazio no final de toda página, 
              permitindo que os botões de paginação subam e fiquem visíveis.
          */}
          <div className="max-w-[1600px] mx-auto w-full pb-24 lg:pb-16">
            <Outlet />
          </div>
        </main>

        {/* Botão da IA posicionado de forma inteligente:
            No mobile ele fica mais centralizado/espaçado, 
            no desktop ele se aloca no canto.
        */}
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
          <div className="pointer-events-auto">
             <FloatingAIButton />
          </div>
        </div>
      </div>
    </div>
  );
}