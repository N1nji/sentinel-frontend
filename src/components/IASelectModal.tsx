import { useState } from "react";
import axios from "axios";

interface IAModalProps {
  open: boolean;
  onClose: () => void;
  onApply?: (text: string) => void;
}

export default function IAModal({ open, onClose, onApply }: IAModalProps) {
  const [texto, setTexto] = useState("");
  const [resposta, setResposta] = useState("");

  if (!open) return null;

  async function consultarIA() {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:4000/ia/sugerir",
        { descricaoRisco: texto },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResposta(res.data.recomendacao);
    } catch {
      setResposta("Erro ao consultar IA.");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-xl w-full max-w-lg space-y-4">
        <h2 className="text-2xl font-bold">Recomendação de EPI (IA)</h2>

        <textarea
          className="border p-2 w-full h-24"
          placeholder="Descreva o risco..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />

        <button
          onClick={consultarIA}
          className="bg-purple-600 text-white px-4 py-2 rounded w-full hover:bg-purple-700"
        >
          Consultar IA
        </button>

        {resposta && (
          <div className="bg-gray-100 p-3 rounded border">
            <strong>IA recomenda:</strong>
            <p className="whitespace-pre-line mt-1">{resposta}</p>

            {onApply && (
              <button
                className="mt-3 bg-green-600 text-white w-full py-2 rounded hover:bg-green-700"
                onClick={() => onApply(resposta)}
              >
                Aplicar recomendação
              </button>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="bg-gray-300 w-full py-2 rounded hover:bg-gray-400"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
