import { useEffect, useState } from "react";

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

  // mantém sincronizado se abrir outro chat
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm animate-fadeIn">

        <h2 className="text-xl font-bold mb-4">Renomear conversa</h2>

        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="border w-full p-2 rounded mb-4"
          placeholder="Nome do chat"
          autoFocus
        />

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => {
              if (value.trim()) onConfirm(value.trim());
            }}
          >
            Salvar
          </button>
        </div>

      </div>
    </div>
  );
}
