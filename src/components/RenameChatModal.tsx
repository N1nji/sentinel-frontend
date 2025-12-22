import { useEffect, useState } from "react";
import { PencilIcon } from "@heroicons/react/24/outline";

interface RenameChatModalProps {
  open: boolean;
  initialValue: string;
  onConfirm: (value: string) => void;
  onClose: () => void;
}

export default function RenameChatModal({
  open,
  initialValue,
  onConfirm,
  onClose,
}: RenameChatModalProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] animate-fadeIn">
      {/* OVERLAY DISCRETO */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
        onClick={onClose} 
      />

      {/* BOX DO MODAL */}
      <div className="
        relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm 
        border border-slate-100 animate-scaleUp
      ">
        {/* ÍCONE E TÍTULO */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <PencilIcon className="h-5 w-5 text-indigo-600" />
          </div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Renomear conversa
          </h2>
        </div>

        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
          Novo Título
        </p>
        
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="
            w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 mb-8
            text-slate-700 font-medium outline-none transition-all
            focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10
          "
          placeholder="Ex: Análise de EPIs - Setor A"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter" && value.trim()) onConfirm(value.trim());
            if (e.key === "Escape") onClose();
          }}
        />

        {/* BOTÕES DE AÇÃO */}
        <div className="flex flex-col gap-2">
          <button
            className="
              w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold 
              hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 
              active:scale-95
            "
            onClick={() => {
              if (value.trim()) onConfirm(value.trim());
            }}
          >
            Salvar Alteração
          </button>
          
          <button
            className="
              w-full py-4 bg-transparent text-slate-400 rounded-2xl font-bold 
              hover:text-slate-600 hover:bg-slate-50 transition-all
            "
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { 
          from { opacity: 0; transform: scale(0.95) translateY(10px); } 
          to { opacity: 1; transform: scale(1) translateY(0); } 
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleUp { animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}