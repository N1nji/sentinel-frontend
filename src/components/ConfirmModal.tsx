import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../context/ThemeContext";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const { darkMode } = useTheme();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Overlay com Blur */}
      <div 
        className={`absolute inset-0 backdrop-blur-sm animate-fadeIn transition-colors ${
          darkMode ? "bg-slate-950/80" : "bg-slate-900/60"
        }`} 
        onClick={onClose} 
      />

      {/* Card do Modal */}
      <div className={`
        relative w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border animate-scaleUp transition-all duration-300
        ${darkMode ? "bg-slate-900 border-slate-800 shadow-black/50" : "bg-white border-slate-100 shadow-gray-200"}
      `}>
        
        {/* Botão de Fechar Rápido */}
        <button 
          onClick={onClose}
          className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${
            darkMode ? "text-slate-500 hover:bg-slate-800 hover:text-slate-300" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          }`}
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Ícone de Alerta Animado */}
          <div className={`mb-6 p-4 rounded-3xl animate-pulse ${
            darkMode ? "bg-rose-500/10 text-rose-500" : "bg-rose-50 text-rose-600"
          }`}>
            <ExclamationTriangleIcon className="h-10 w-10" />
          </div>

          <h2 className={`text-2xl font-black tracking-tight mb-2 ${
            darkMode ? "text-white" : "text-slate-800"
          }`}>
            {title}
          </h2>
          
          <p className={`text-sm font-medium leading-relaxed mb-8 ${
            darkMode ? "text-slate-400" : "text-slate-500"
          }`}>
            {message}
          </p>

          <div className="flex flex-col w-full gap-3">
            <button
              className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-rose-900/20 active:scale-95"
              onClick={onConfirm}
            >
              Confirmar Exclusão
            </button>

            <button
              className={`w-full py-4 bg-transparent rounded-2xl font-bold transition-all ${
                darkMode 
                  ? "text-slate-500 hover:text-slate-300 hover:bg-slate-800" 
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              }`}
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { 
          from { opacity: 0; transform: scale(0.9) translateY(20px); } 
          to { opacity: 1; transform: scale(1) translateY(0); } 
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleUp { animation: scaleUp 0.3s cubic-bezier(0.17, 0.89, 0.32, 1.1); }
      `}`</style>
    </div>
  );
}