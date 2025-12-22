// src/components/AiChatModal.tsx
import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline"; // Mudei para outline para combinar com o resto
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";

export default function AiChatModal({ open, onClose }: any) {
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
      {/* OVERLAY COM BLUR (EFEITO VIDRO) */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] animate-fadeIn"
        onClick={handleClose}
      />

      {/* MODAL COM ANIMAÇÃO SCALE */}
      <div
        className="
          fixed z-[70]
          top-1/2 left-1/2
          -translate-x-1/2 -translate-y-1/2
          bg-white rounded-3xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)]
          flex w-[95vw] h-[90vh] max-w-7xl
          overflow-hidden border border-slate-200/50
          animate-scaleUp
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* BOTÃO FECHAR FLUTUANTE */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="
            absolute top-4 right-4 z-[80] 
            p-2 rounded-full bg-slate-100/50 hover:bg-red-50 
            text-slate-500 hover:text-red-600 
            transition-all duration-200 backdrop-blur-md
            group
          "
        >
          <XMarkIcon className="h-6 w-6 group-hover:rotate-90 transition-transform" />
        </button>

        {/* ESTRUTURA INTERNA */}
        <div className="flex w-full h-full relative">
          <ChatSidebar
            onSelect={setSelectedChatId}
            activeId={selectedChatId}
          />

          <div className="flex-1 bg-white relative">
            <ChatWindow chatId={selectedChatId} />
          </div>
        </div>
      </div>

      {/* ESTILOS DE ANIMAÇÃO (Pode colocar no seu index.css ou usar Tailwind arbitrary values) */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: translate(-1/2%, -1/2%) scale(0.95); }
          to { opacity: 1; transform: translate(-1/2%, -1/2%) scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleUp { animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </>
  );
}