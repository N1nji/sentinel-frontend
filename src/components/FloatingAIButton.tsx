import { useState } from "react";
import { ChatBubbleBottomCenterTextIcon, SparklesIcon } from "@heroicons/react/24/solid";
import AiChatModal from "./AiChatModal";

export default function FloatingAIButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 1. Subi de bottom-6 para bottom-24 para fugir da paginação.
          2. Adicionei 'group' na div pai para a label funcionar.
      */}
      <div className="fixed bottom-24 right-6 z-50 flex flex-col items-center group">
        
        {/* Label flutuante: Adicionado pointer-events-none para não atrapalhar o clique */}
        <span className="mb-2 px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-2xl translate-y-2 group-hover:translate-y-0">
          Sentinel IA
        </span>

        <button
          onClick={() => setOpen(true)}
          className="relative flex items-center justify-center p-4 bg-gradient-to-tr from-purple-600 to-indigo-500 text-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(124,58,237,0.5)] hover:shadow-[0_20px_50px_-10px_rgba(124,58,237,0.7)] hover:-translate-y-1 active:scale-95 transition-all duration-300"
        >
          {/* Efeito de Ondas (Pulso) */}
          <span className="absolute inset-0 rounded-2xl bg-purple-400 animate-ping opacity-20 group-hover:opacity-40"></span>
          
          {/* Ícone Principal */}
          <ChatBubbleBottomCenterTextIcon className="h-6 w-6 relative z-10" />
          
          {/* Ícone de Brilho (IA) no cantinho */}
          <SparklesIcon className="h-3 w-3 absolute top-3 right-3 text-purple-200 animate-pulse z-20" />
        </button>
      </div>

      <AiChatModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}