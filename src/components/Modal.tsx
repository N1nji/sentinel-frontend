import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl animate-fadeIn p-6">

        <h2 className="text-xl font-bold mb-4">{title}</h2>

        {children}

        <button
          className="mt-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          onClick={onClose}
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
