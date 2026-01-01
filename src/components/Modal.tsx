import type { ReactNode } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../context/ThemeContext";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  const { darkMode } = useTheme();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Overlay com desfoque adaptativo */}
      <div 
        className={`absolute inset-0 backdrop-blur-sm animate-fadeIn transition-colors duration-500 ${
          darkMode ? "bg-slate-950/80" : "bg-gray-900/60"
        }`} 
        onClick={onClose} 
      />

      {/* Container do Modal */}
      <div className={`
        relative w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-zoomIn border transition-all duration-300
        ${darkMode 
          ? "bg-slate-900 border-slate-800 shadow-black/50" 
          : "bg-white border-gray-100 shadow-gray-200"
        }
      `}>
        
        {/* Header Superior com gradiente sutil no Dark Mode */}
        <div className={`
          flex items-center justify-between px-8 py-5 border-b transition-colors
          ${darkMode ? "border-slate-800 bg-slate-900/50" : "border-gray-100 bg-white"}
        `}>
          <div>
            <h2 className={`text-xl font-black tracking-tight ${darkMode ? "text-white" : "text-gray-800"}`}>
              {title}
            </h2>
            {/* Linha decorativa abaixo do título para dar um charme */}
            <div className="h-1 w-8 bg-blue-600 rounded-full mt-1" />
          </div>

          <button 
            onClick={onClose}
            className={`
              p-2 rounded-2xl transition-all active:scale-90
              ${darkMode 
                ? "text-slate-500 hover:bg-slate-800 hover:text-slate-300" 
                : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              }
            `}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Conteúdo (Children) */}
        <div className={`p-8 ${darkMode ? "text-slate-300" : "text-gray-600"}`}>
          {children}
        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-zoomIn { animation: zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}