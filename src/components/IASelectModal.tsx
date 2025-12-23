import { useState } from "react";
import { api } from "../services/api";
import { SparklesIcon, XMarkIcon, CheckIcon, CpuChipIcon } from "@heroicons/react/24/outline";

interface IAModalProps {
  open: boolean;
  onClose: () => void;
  onApply?: (text: string) => void;
}

export default function IAModal({ open, onClose, onApply }: IAModalProps) {
  const [texto, setTexto] = useState("");
  const [resposta, setResposta] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function consultarIA() {
    if (!texto) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        "/ia/sugerir",
        { descricaoRisco: texto },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResposta(res.data.recomendacao);
    } catch {
      setResposta("Houve um erro ao processar sua solicitação com a IA.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop com Blur */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={onClose} />

      <div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden border border-purple-100 flex flex-col">
        
        {/* Header com degradê sutil */}
        <div className="bg-gradient-to-r from-purple-50 to-white px-8 py-6 flex items-center justify-between border-b border-purple-100">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-2 rounded-xl shadow-lg shadow-purple-200">
              <CpuChipIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-800 tracking-tight">Sentinel Assist</h2>
              <p className="text-[10px] text-purple-600 font-bold uppercase tracking-widest">Análise de Riscos NR-6</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase ml-1">Descrição do Cenário / Risco</label>
            <textarea
              className="w-full border-2 border-gray-100 rounded-2xl p-4 h-32 focus:border-purple-500 focus:ring-0 transition-all resize-none text-gray-700 placeholder:text-gray-300 bg-gray-50/50"
              placeholder="Ex: Colaborador vai realizar solda em altura com exposição a faíscas..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
          </div>

          <button
            onClick={consultarIA}
            disabled={loading || !texto}
            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${
              loading ? 'bg-gray-100 text-gray-400' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-200 active:scale-95'
            }`}
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <SparklesIcon className="h-5 w-5" />
                Consultar Inteligência Sentinel
              </>
            )}
          </button>

          {resposta && (
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
              <div className="relative bg-white border border-purple-100 p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-purple-600">
                  <SparklesIcon className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-tighter">Recomendação Gerada</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed italic">"{resposta}"</p>

                {onApply && (
                  <button
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
                    onClick={() => onApply(resposta)}
                  >
                    <CheckIcon className="h-4 w-4" />
                    Aplicar ao Formulário
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}