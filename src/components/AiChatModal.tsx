// src/components/AiChatModal.tsx
import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline"; 
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import { useTheme } from "../context/ThemeContext"; // Importado o tema

export default function AiChatModal({ open, onClose }: any) {
  const { darkMode } = useTheme(); // Consumindo o tema
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // Fecha o modal ao apertar ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  function handleClose() {
    setSelectedChatId(null);
    onClose();
  }

  if (!open) return null;

  return (
    <>
      {/* OVERLAY COM BLUR */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] animate-fadeIn"
        onClick={handleClose}
      />

      {/* MODAL RESPONSIVO */}
      <div
        className={`
          fixed z-[70]
          top-1/2 left-1/2
          -translate-x-1/2 -translate-y-1/2
          rounded-3xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)]
          flex w-[95vw] h-[90vh] max-w-7xl
          overflow-hidden border transition-colors duration-300
          animate-scaleUp
          ${darkMode ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200/50"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* BOTÃO FECHAR - Cores adaptáveis */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className={`
            absolute top-4 right-4 z-[100] 
            p-2 rounded-full shadow-lg transition-all duration-200 border group
            ${darkMode 
              ? "bg-slate-900 border-slate-700 text-slate-400 hover:text-red-400 hover:bg-slate-800" 
              : "bg-white border-slate-100 text-slate-500 hover:text-red-600 hover:bg-red-50"
            }
          `}
        >
          <XMarkIcon className="h-6 w-6 group-hover:rotate-90 transition-transform" />
        </button>

        {/* ESTRUTURA INTERNA - Lógica de Mobile (Um por vez) */}
        <div className="flex w-full h-full relative overflow-hidden">
          
          {/* SIDEBAR: No mobile, some se tiver um chat selecionado */}
          <div className={`${selectedChatId ? "hidden md:flex" : "flex"} w-full md:w-80 h-full`}>
            <ChatSidebar
              onSelect={setSelectedChatId}
              activeId={selectedChatId}
            />
          </div>

          {/* WINDOW: No mobile, só aparece se tiver chat selecionado */}
          <div className={`
            ${!selectedChatId ? "hidden md:flex" : "flex"} 
            flex-1 relative h-full overflow-hidden transition-colors
            ${darkMode ? "bg-slate-950" : "bg-white"}
          `}>
            <ChatWindow 
              chatId={selectedChatId} 
              onBack={() => setSelectedChatId(null)} // Permite voltar para a lista no mobile
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleUp { animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </>
  );
}