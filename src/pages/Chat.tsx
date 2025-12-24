import { useState, useEffect } from "react";
import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function ChatPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Sincroniza o Dark Mode com a preferência salva
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("chat-theme") === "dark";
  });

  useEffect(() => {
    const checkTheme = () => {
      const isDark = localStorage.getItem("chat-theme") === "dark";
      setDark(isDark);
    };
    // Verifica mudanças a cada segundo para manter sincronia com o Header/Modal
    const interval = setInterval(checkTheme, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`
      flex h-full w-full overflow-hidden transition-colors duration-300
      ${dark ? "bg-slate-950" : "bg-white"}
    `}>
      
      {/* SIDEBAR: No mobile, esconde se um chat estiver aberto */}
      <div className={`
        ${selectedId ? "hidden md:flex" : "flex"} 
        w-full md:w-80 lg:w-96 shrink-0 border-r 
        ${dark ? "border-slate-800" : "border-gray-100"}
      `}>
        <ChatSidebar 
          onSelect={(id) => setSelectedId(id)} 
          activeId={selectedId} 
        />
      </div>

      {/* WINDOW (Área do Chat): No mobile, ocupa tudo quando selecionado */}
      <div className={`
        ${!selectedId ? "hidden md:flex" : "flex"} 
        flex-1 h-full flex-col relative
      `}>
        
        {/* Botão de Voltar (Mobile Only) */}
        {selectedId && (
          <div className={`
            md:hidden p-4 border-b flex items-center
            ${dark ? "bg-slate-950 border-slate-800" : "bg-white border-gray-100"}
          `}>
            <button 
              onClick={() => setSelectedId(null)}
              className="p-2 -ml-2 text-indigo-500 flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
            >
              <ChevronLeftIcon className="h-5 w-5" /> 
              Conversas
            </button>
          </div>
        )}

        {/* Se não houver chat selecionado no Desktop, mostra um estado vazio */}
        {!selectedId ? (
          <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-8">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-4 border 
              ${dark ? "bg-slate-900 border-slate-800" : "bg-indigo-50 border-indigo-100"}`}
            >
              <span className="text-4xl">🛡️</span>
            </div>
            <h2 className={`text-xl font-black uppercase tracking-tight 
              ${dark ? "text-white" : "text-slate-800"}`}
            >
              Sentinel IA
            </h2>
            <p className="text-slate-500 max-w-xs mt-2 text-sm font-medium">
              Selecione uma análise técnica ao lado para visualizar os detalhes ou iniciar uma nova consulta.
            </p>
          </div>
        ) : (
          <ChatWindow chatId={selectedId} />
        )}
      </div>
    </div>
  );
}