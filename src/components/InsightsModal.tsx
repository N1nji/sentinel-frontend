// src/components/InsightsModal.tsx
import { useState } from "react";
import { XMarkIcon, LightBulbIcon, DocumentDuplicateIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../context/ThemeContext";

export default function InsightsModal({
  open,
  onClose,
  text,
}: {
  open: boolean;
  onClose: () => void;
  text: string;
}) {
  const [showToast, setShowToast] = useState(false);
  const { darkMode } = useTheme();

  if (!open) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      {/* OVERLAY COM BLUR ADAPTATIVO */}
      <div 
        className={`absolute inset-0 backdrop-blur-md transition-colors ${
          darkMode ? "bg-slate-950/80" : "bg-slate-900/60"
        }`} 
        onClick={onClose} 
      />

      {/* TOAST NOTIFICATION (FLUTUANTE) */}
      {showToast && (
        <div className={`
          fixed top-10 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl border animate-slideDown
          ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-900 text-white border-slate-700"}
        `}>
          <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-bold tracking-wide">Copiado para a área de transferência!</span>
        </div>
      )}

      {/* CARD DO MODAL */}
      <div className={`
        relative max-w-2xl w-full rounded-3xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)] 
        overflow-hidden border animate-scaleUp transition-colors duration-300
        ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}
      `}>
        
        {/* HEADER COM DEGRADÊ SUAVE */}
        <div className={`
          px-6 py-5 border-b flex justify-between items-center transition-colors
          ${darkMode ? "bg-slate-800/50 border-slate-800" : "bg-slate-50 border-slate-100"}
        `}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${darkMode ? "bg-amber-500/10" : "bg-amber-100"}`}>
              <LightBulbIcon className={`h-6 w-6 ${darkMode ? "text-amber-400" : "text-amber-600"}`} />
            </div>
            <div>
              <h3 className={`text-lg font-black tracking-tight ${darkMode ? "text-white" : "text-slate-800"}`}>
                Insights de Segurança
              </h3>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                Análise gerada por IA
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className={`p-2 rounded-full transition-colors ${
              darkMode ? "text-slate-500 hover:bg-slate-800 hover:text-slate-300" : "text-slate-400 hover:bg-slate-200 hover:text-slate-600"
            }`}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* CONTEÚDO COM MELHORIA DE FORMATAÇÃO */}
        <div className="p-6">
          <div className={`
            max-h-[60vh] overflow-auto pr-2
            leading-relaxed text-sm font-medium
            whitespace-pre-wrap rounded-2xl p-6
            scrollbar-thin transition-colors
            ${darkMode 
              ? "bg-slate-950/40 text-slate-300 scrollbar-thumb-slate-700" 
              : "bg-slate-50/50 text-slate-700 scrollbar-thumb-slate-200"
            }
          `}>
              {text ? (
                text.split('\n').map((line, i) => {
                  const isTitle = /^[📊📈🔮💡🛒🚀⚠️📌]/.test(line.trim());
                  const isSeparator = line.startsWith('---');

                  if (isSeparator) {
                    return <hr key={i} className={`my-6 ${darkMode ? "border-slate-800" : "border-slate-200"}`} />;
                  }

                  if (!line.trim()) return <div key={i} className="h-2" />;

                  return (
                    <p key={i} className={`
                      ${isTitle 
                        ? (darkMode ? 'text-white font-black text-base mt-6 mb-2 flex items-center gap-2' : 'text-slate-900 font-black text-base mt-6 mb-2 flex items-center gap-2') 
                        : (darkMode ? 'text-slate-400 font-medium mb-1 pl-1' : 'text-slate-600 font-medium mb-1 pl-1')}
                      ${line.includes('Gerado automaticamente') 
                        ? 'text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-4' 
                        : ''}
                    `}>
                      {line}
                    </p>
                  );
                })
              ) : (
                <p className="text-center text-slate-500 py-10 font-bold">Nenhum insight disponível no momento.</p>
              )}
          </div>
        </div>

        {/* FOOTER COM AÇÕES */}
        <div className={`px-6 py-4 border-t flex justify-end gap-3 transition-colors ${
          darkMode ? "bg-slate-800/50 border-slate-800" : "bg-slate-50 border-slate-100"
        }`}>
          <button
            onClick={handleCopy}
            className={`
              flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all active:scale-95
              ${darkMode 
                ? "text-slate-400 hover:bg-slate-800 hover:text-white" 
                : "text-slate-600 hover:bg-white hover:shadow-sm"
              }
            `}
          >
            <DocumentDuplicateIcon className="h-4 w-4" />
            Copiar Texto
          </button>
          
          <button
            onClick={onClose}
            className={`
              px-6 py-2.5 text-sm font-bold rounded-xl transition-all shadow-lg active:scale-95
              ${darkMode 
                ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-900/20" 
                : "bg-slate-800 text-white hover:bg-slate-900 shadow-slate-200"
              }
            `}
          >
            Fechar
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { 
          from { opacity: 0; transform: scale(0.95) translateY(10px); } 
          to { opacity: 1; transform: scale(1) translateY(0); } 
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleUp { animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-slideDown { animation: slideDown 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28); }
      `}</style>
    </div>
  );
}