import type { ReactNode } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Camada de fundo com desfoque */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-fadeIn" 
        onClick={onClose} 
      />

      {/* Container do Modal */}
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-zoomIn">
        
        {/* Header Superior */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Conteúdo (Children) */}
        <div className="p-6">
          {children}
        </div>

      </div>
    </div>
  );
}