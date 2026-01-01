import { useState, useEffect } from "react";
import { api } from "../services/api";
import { SparklesIcon, XMarkIcon, CheckIcon, CpuChipIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../context/ThemeContext";

interface IAModalProps {
  open: boolean;
  onClose: () => void;
  onApply?: (text: string) => void;
  contextoInicial?: string;
}

export default function IAModal({ open, onClose, onApply, contextoInicial }: IAModalProps) {
  const [texto, setTexto] = useState("");
  const [resposta, setResposta] = useState("");
  const [loading, setLoading] = useState(false);
  const { darkMode } = useTheme();

  useEffect(() => {
    if (open) {
      setTexto(contextoInicial || "");
      setResposta("");
    }
  }, [open, contextoInicial]);

  if (!open) return null;

  async function consultarIA() {
    if (!texto.trim()) return;
    setLoading(true);
    setResposta("");
    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        "/ia/sugerir",
        { risco: texto + ". (Responda em no máximo 10 linhas)" },
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
      {/* Backdrop adaptativo */}
      <div 
        className={`absolute inset-0 backdrop-blur-md animate-fadeIn transition-colors ${
          darkMode ? "bg-slate-950/80" : "bg-gray-900/60"
        }`} 
        onClick={onClose} 
      />

      <div className={`
        relative w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-zoomIn border transition-all duration-300
        ${darkMode ? "bg-slate-900 border-slate-800 shadow-black/50" : "bg-white border-purple-100"}
      `}>
        
        {/* Header Superior com gradientes adaptativos */}
        <div className={`
          px-8 py-6 flex items-center justify-between border-b transition-colors
          ${darkMode 
            ? "bg-gradient-to-r from-slate-800 to-slate-900 border-slate-800" 
            : "bg-gradient-to-r from-purple-50 via-white to-white border-purple-100"}
        `}>
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-2xl shadow-lg transition-all ${
              darkMode ? "bg-purple-500 shadow-purple-900/40" : "bg-purple-600 shadow-purple-200"
            }`}>
              <CpuChipIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-black tracking-tight ${darkMode ? "text-white" : "text-gray-800"}`}>
                Sentinel Assist
              </h2>
              <p className={`text-[10px] font-bold uppercase tracking-widest leading-none ${
                darkMode ? "text-purple-400" : "text-purple-600"
              }`}>Inteligência NR-6</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className={`p-2 rounded-full transition-all ${
              darkMode ? "text-slate-500 hover:text-slate-300 hover:bg-slate-800" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            }`}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
                Contexto do Risco
              </label>
              <span className={`text-[10px] font-bold italic ${darkMode ? "text-purple-400" : "text-purple-400"}`}>
                O que está acontecendo?
              </span>
            </div>
            <textarea
              className={`
                w-full rounded-[1.5rem] p-5 h-36 focus:ring-0 transition-all resize-none text-sm leading-relaxed outline-none border-2
                ${darkMode 
                  ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-purple-500 placeholder:text-slate-700" 
                  : "bg-gray-50/50 border-gray-100 text-gray-700 focus:border-purple-500 placeholder:text-gray-300"}
              `}
              placeholder="Descreva o serviço ou o EPI necessário..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
          </div>

          <button
            onClick={consultarIA}
            disabled={loading || !texto.trim()}
            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98] ${
              loading 
                ? (darkMode ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed')
                : (darkMode ? 'bg-purple-500 text-white hover:bg-purple-400 shadow-purple-900/20' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-200')
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
              <div className={`absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl blur opacity-10 group-hover:opacity-25 transition duration-1000`}></div>
              <div className={`
                relative border p-6 rounded-3xl space-y-4 transition-colors
                ${darkMode ? "bg-slate-950 border-purple-900/30" : "bg-white border-purple-100"}
              `}>
                <div className={`flex items-center gap-2 ${darkMode ? "text-purple-400" : "text-purple-600"}`}>
                  <div className={`p-1 rounded-lg ${darkMode ? "bg-purple-500/10" : "bg-purple-100"}`}>
                    <SparklesIcon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Sugestão Sentinel</span>
                </div>
                
                <p className={`text-sm leading-relaxed font-medium ${darkMode ? "text-slate-300" : "text-gray-600"}`}>
                  {resposta}
                </p>

                {onApply && !loading && (
                  <button
                    className={`w-full font-black text-[10px] uppercase tracking-[0.15em] py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                      darkMode 
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20" 
                        : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-100"
                    }`}
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