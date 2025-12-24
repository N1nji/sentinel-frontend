// src/components/AiChatModal.tsx
import { useState, useEffect } from "react";
import { XMarkIcon, ChevronLeftIcon } from "@heroicons/react/24/outline"; 
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
      {/* OVERLAY COM BLUR */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] animate-fadeIn"
        onClick={handleClose}
      />

      {/* MODAL RESPONSIVO */}
      <div
        className="
          fixed z-[70]
          top-1/2 left-1/2
          -translate-x-1/2 -translate-y-1/2
          bg-white dark:bg-slate-950 rounded-3xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)]
          flex w-[95vw] h-[90vh] max-w-7xl
          overflow-hidden border border-slate-200/50 dark:border-slate-800
          animate-scaleUp transition-colors
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* BOTÃO FECHAR - Superior Direito */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="
            absolute top-4 right-4 z-[100] 
            p-2 rounded-full bg-white dark:bg-slate-800 shadow-lg hover:bg-red-50 dark:hover:bg-red-950/30
            text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400
            transition-all duration-200 border border-slate-100 dark:border-slate-700
            group
          "
        >
          <XMarkIcon className="h-6 w-6 group-hover:rotate-90 transition-transform" />
        </button>

        {/* ESTRUTURA INTERNA COM LÓGICA MOBILE */}
        <div className="flex w-full h-full relative overflow-hidden">
          
          {/* SIDEBAR: No mobile, esconde se tiver chat selecionado */}
          <div className={`
            ${selectedChatId ? 'hidden md:flex' : 'flex'}
            w-full md:w-80 shrink-0 border-r border-slate-100 dark:border-slate-800 h-full
          `}>
            <ChatSidebar
              onSelect={setSelectedChatId}
              activeId={selectedChatId}
            />
          </div>

          {/* WINDOW: No mobile, ocupa tudo se tiver selecionado, senão esconde */}
          <div className={`
            ${!selectedChatId ? 'hidden md:flex' : 'flex'}
            flex-1 bg-white dark:bg-slate-950 relative h-full overflow-hidden flex-col
          `}>
            
            {/* Botão de voltar (Mobile Only) */}
            {selectedChatId && (
              <div className="md:hidden p-4 border-b border-slate-100 dark:border-slate-800 flex items-center bg-white dark:bg-slate-950">
                <button 
                  onClick={() => setSelectedChatId(null)}
                  className="p-2 -ml-2 text-slate-500 dark:text-slate-400 flex items-center gap-1 font-bold text-xs"
                >
                  <ChevronLeftIcon className="h-5 w-5" /> Voltar
                </button>
              </div>
            )}

            <div className="flex-1 relative overflow-hidden">
              {selectedChatId ? (
                <ChatWindow chatId={selectedChatId} />
              ) : (
                <div className="hidden md:flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-800">
                    <span className="text-3xl">🛡️</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Sentinel IA</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mt-1">
                    Selecione uma análise no menu lateral para visualizar os detalhes.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { 
            opacity: 0; 
            transform: translate(-50%, -50%) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1); 
          }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleUp { animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </>
  );
}