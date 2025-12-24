import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import FloatingAIButton from "../components/FloatingAIButton";

export default function MainLayout() {
  // Sincroniza o Dark Mode do Layout com o que o usuário escolheu no chat
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("chat-theme") === "dark";
  });

  // Listener para atualizar o layout caso o usuário mude o tema dentro do ChatWindow
  useEffect(() => {
    const checkTheme = () => {
      const isDark = localStorage.getItem("chat-theme") === "dark";
      setDark(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // Verifica ao montar e escuta mudanças no storage
    checkTheme();
    window.addEventListener("storage", checkTheme);
    
    // Criamos um intervalo pequeno para garantir sincronia imediata entre componentes
    const interval = setInterval(checkTheme, 1000);
    
    return () => {
      window.removeEventListener("storage", checkTheme);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={`
      flex flex-col lg:flex-row h-screen overflow-hidden transition-colors duration-300
      ${dark ? "bg-slate-950 text-white" : "bg-gray-50 text-gray-900"}
    `}>
      
      {/* SIDEBAR: Visível apenas em Desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-screen relative">
        <Header />
        
        {/* CONTEÚDO PRINCIPAL */}
        <main className={`
          flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar mb-16 lg:mb-0
          ${dark ? "scrollbar-dark" : ""}
        `}>
          <div className="max-w-[1600px] mx-auto w-full">
            <Outlet />
          </div>
        </main>

        {/* FLOATING AI BUTTON - Ajustado para não colidir com o menu mobile */}
        <div className="fixed bottom-20 right-4 z-40 lg:bottom-8 lg:right-8 animate-bounce-subtle">
          <FloatingAIButton />
        </div>

        {/* BOTTOM NAV (MOBILE ONLY) - Atalhos rápidos para o Sentinel no celular */}
        <nav className={`
          lg:hidden fixed bottom-0 left-0 right-0 h-16 border-t z-50 flex items-center justify-around px-6
          ${dark ? "bg-slate-900/90 border-slate-800 backdrop-blur-lg" : "bg-white/90 border-gray-200 backdrop-blur-lg"}
        `}>
          {/* Aqui você pode replicar os ícones principais da sua Sidebar */}
          <button className="flex flex-col items-center gap-1 text-indigo-500">
            <div className="p-1 rounded-lg bg-indigo-500/10">🏠</div>
            <span className="text-[10px] font-bold uppercase">Início</span>
          </button>
          <div className="w-12"></div> {/* Espaço para o Floating Button se quiser centralizar */}
          <button className={`flex flex-col items-center gap-1 ${dark ? "text-slate-400" : "text-gray-500"}`}>
            <div className="p-1">⚙️</div>
            <span className="text-[10px] font-bold uppercase">Ajustes</span>
          </button>
        </nav>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: ${dark ? '#1e293b' : '#e2e8f0'}; 
          border-radius: 10px; 
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle { animation: bounce-subtle 3s infinite ease-in-out; }
      `}</style>
    </div>
  );
}