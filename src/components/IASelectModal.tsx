import { useState, useEffect } from "react";
import { api } from "../services/api";
import { SparklesIcon, XMarkIcon, CheckIcon, CpuChipIcon } from "@heroicons/react/24/outline";

interface IAModalProps {
  open: boolean;
  onClose: () => void;
  onApply?: (text: string) => void;
  contextoInicial?: string; // Novo: para receber o EPI/Obs selecionada
}

export default function IAModal({ open, onClose, onApply, contextoInicial }: IAModalProps) {
  const [texto, setTexto] = useState("");
  const [resposta, setResposta] = useState("");
  const [loading, setLoading] = useState(false);

  // Toda vez que o modal abrir, ele carrega o contexto do formulário principal
  useEffect(() => {
    if (open) {
      setTexto(contextoInicial || "");
      setResposta(""); // Limpa a resposta anterior ao abrir novo
    }
  }, [open, contextoInicial]);

  if (!open) return null;

  async function consultarIA() {
    if (!texto.trim()) return;
    setLoading(true);
    setResposta(""); // Limpa enquanto carrega a nova
    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        "/ia/sugerir",
        { risco: texto },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResposta(res.data.resposta);
    } catch (err) {
      setResposta("Houve um erro ao processar sua solicitação com a IA. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop com Blur - Clique fora fecha */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-fadeIn" onClick={onClose} />

      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-purple-100 flex flex-col animate-zoomIn">
        
        {/* Header Superior */}
        <div className="bg-gradient-to-r from-purple-50 via-white to-white px-8 py-6 flex items-center justify-between border-b border-purple-100">
          <div className="flex items-center gap-4">
            <div className="bg-purple-600 p-2.5 rounded-2xl shadow-lg shadow-purple-200">
              <CpuChipIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-800 tracking-tight">Sentinel Assist</h2>
              <p className="text-[10px] text-purple-600 font-bold uppercase tracking-widest leading-none">Inteligência NR-6</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contexto do Risco</label>
              <span className="text-[10px] font-bold text-purple-400 italic">O que está acontecendo?</span>
            </div>
            <textarea
              className="w-full border-2 border-gray-100 rounded-[1.5rem] p-5 h-36 focus:border-purple-500 focus:ring-0 transition-all resize-none text-gray-700 placeholder:text-gray-300 bg-gray-50/50 text-sm leading-relaxed outline-none"
              placeholder="Descreva o serviço ou o EPI necessário..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
          </div>

          <button
            onClick={consultarIA}
            disabled={loading || !texto.trim()}
            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl ${
              loading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-200 active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <SparklesIcon className="h-5 w-5" />
                Analisar com IA
              </>
            )}
          </button>

          {/* Área de Resposta */}
          {resposta && (
            <div className="relative group animate-fadeIn">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
              <div className="relative bg-white border border-purple-100 p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-2 text-purple-600">
                  <div className="p-1 bg-purple-100 rounded-lg">
                    <SparklesIcon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Sugestão Sentinel</span>
                </div>
                
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  {resposta}
                </p>

                {onApply && !loading && (
                  <button
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-[0.15em] py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 active:scale-95"
                    onClick={() => onApply(resposta)}
                  >
                    <CheckIcon className="h-4 w-4" />
                    Aplicar Recomendação
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