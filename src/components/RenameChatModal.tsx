import { useEffect, useState } from "react";
import { PencilIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../context/ThemeContext"; // Importando o contexto de tema

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
  const { darkMode } = useTheme(); // Acessando o estado do dark mode

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] animate-fadeIn">
      {/* OVERLAY DISCRETO */}
      <div 
        className={`absolute inset-0 backdrop-blur-sm transition-colors ${
          darkMode ? "bg-slate-950/60" : "bg-slate-900/40"
        }`} 
        onClick={onClose} 
      />

      {/* BOX DO MODAL */}
      <div className={`
        relative rounded-3xl shadow-2xl p-8 w-full max-w-sm 
        border animate-scaleUp transition-colors duration-300
        ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}
      `}>
        {/* ÍCONE E TÍTULO */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-lg ${darkMode ? "bg-indigo-500/10" : "bg-indigo-50"}`}>
            <PencilIcon className={`h-5 w-5 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`} />
          </div>
          <h2 className={`text-xl font-black tracking-tight ${darkMode ? "text-white" : "text-slate-800"}`}>
            Renomear conversa
          </h2>
        </div>

        <p className={`text-xs font-bold uppercase tracking-widest mb-2 ml-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
          Novo Título
        </p>
        
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`
            w-full rounded-2xl p-4 mb-8
            font-medium outline-none transition-all border-2
            ${darkMode 
              ? "bg-slate-800 border-slate-700 text-white focus:border-indigo-500 focus:bg-slate-800/50 focus:ring-4 focus:ring-indigo-500/10" 
              : "bg-slate-50 border-slate-100 text-slate-700 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            }
          `}
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
            className={`
              w-full py-4 text-white rounded-2xl font-bold 
              hover:bg-indigo-700 transition-all shadow-lg active:scale-95
              ${darkMode ? "bg-indigo-500 shadow-indigo-900/20" : "bg-indigo-600 shadow-indigo-200"}
            `}
            onClick={() => {
              if (value.trim()) onConfirm(value.trim());
            }}
          >
            Salvar Alteração
          </button>
          
          <button
            className={`
              w-full py-4 bg-transparent rounded-2xl font-bold transition-all
              ${darkMode ? "text-slate-500 hover:text-slate-300 hover:bg-slate-800" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}
            `}
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