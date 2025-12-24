import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import FloatingAIButton from "../components/FloatingAIButton";
import { useTheme } from "../context/ThemeContext"; // 🔹 Importa o contexto do tema

export default function MainLayout() {
  // 🔹 Pega apenas o estado do darkMode
  const { darkMode } = useTheme();

  return (
    /* A mágica acontece aqui: 
       Removi o bg-gray-50 fixo e coloquei uma lógica que muda o fundo 
       da aplicação inteira baseada no ThemeContext.
    */
    <div className={`flex flex-col lg:flex-row h-screen overflow-hidden transition-colors duration-300 ${
      darkMode ? "bg-slate-950" : "bg-gray-50"
    }`}>
      
      {/* Sua Sidebar original. 
          Não passamos nenhuma prop para não dar erro de tipo, 
          já que ela controla o próprio estado mobile.
      */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <Header />
        
        {/* Área de conteúdo (Dashboard, Settings, etc).
            Também ajustamos o fundo aqui para garantir que não fique "buraco" branco.
        */}
        <main className={`flex-1 p-4 sm:p-6 overflow-auto custom-scrollbar transition-colors duration-300 ${
          darkMode ? "bg-slate-950" : "bg-gray-50"
        }`}>
          <div className="max-w-[1600px] mx-auto w-full">
            <Outlet />
          </div>
        </main>

        {/* Botão da IA flutuante */}
        <div className="fixed bottom-4 right-4 z-50 lg:bottom-8 lg:right-8">
          <FloatingAIButton />
        </div>
      </div>
    </div>
  );
}