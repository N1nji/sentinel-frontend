import { InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../context/ThemeContext";

interface AlertModalProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export default function AlertModal({ open, title, message, onClose }: AlertModalProps) {
  const { darkMode } = useTheme();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      {/* Overlay com Blur Adaptativo */}
      <div 
        className={`absolute inset-0 backdrop-blur-sm animate-fadeIn transition-colors ${
          darkMode ? "bg-slate-950/80" : "bg-gray-900/60"
        }`} 
        onClick={onClose} 
      />

      {/* Card do Modal */}
      <div className={`
        relative w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border animate-scaleUp transition-all duration-300
        ${darkMode ? "bg-slate-900 border-slate-800 shadow-black/50" : "bg-white border-slate-100 shadow-gray-200"}
      `}>
        
        {/* Botão de Fechar no canto */}
        <button 
          onClick={onClose}
          className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${
            darkMode ? "text-slate-500 hover:bg-slate-800 hover:text-slate-300" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          }`}
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Ícone de Info Estilizado */}
          <div className={`mb-6 p-4 rounded-3xl ${
            darkMode ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
          }`}>
            <InformationCircleIcon className="h-12 w-12 animate-pulse" />
          </div>

          <h2 className={`text-2xl font-black tracking-tight mb-3 ${
            darkMode ? "text-white" : "text-slate-800"
          }`}>
            {title}
          </h2>
          
          <p className={`text-sm font-medium leading-relaxed mb-8 whitespace-pre-line ${
            darkMode ? "text-slate-400" : "text-slate-500"
          }`}>
            {message}
          </p>

          <button
            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 ${
              darkMode 
                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20" 
                : "bg-slate-800 text-white hover:bg-slate-900 shadow-slate-200"
            }`}
            onClick={onClose}
          >
            Entendido
          </button>
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
      `}</style>
    </div>
  );
}