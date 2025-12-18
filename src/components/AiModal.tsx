import { XMarkIcon } from "@heroicons/react/24/solid";

interface AiModalProps {
  open: boolean;
  onClose: () => void;
  conteudo: string;
}

export default function AiModal({ open, onClose, conteudo }: AiModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded shadow-lg p-6 relative animate-fadeIn">
        
        {/* botão fechar */}
        <button
          className="absolute right-3 top-3 text-gray-600 hover:text-black"
          onClick={onClose}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          🤖 Recomendação da IA
        </h2>

        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
          {conteudo}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
