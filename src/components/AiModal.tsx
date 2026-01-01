import { XMarkIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../context/ThemeContext";

interface AiModalProps {
  open: boolean;
  onClose: () => void;
  conteudo: string;
}

export default function AiModal({ open, onClose, conteudo }: AiModalProps) {
  const { darkMode } = useTheme();

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 transition-all">
      {/* OVERLAY COM BLUR ADAPTATIVO */}
      <div 
        className={`absolute inset-0 backdrop-blur-sm animate-fadeIn ${
          darkMode ? "bg-slate-950/80" : "bg-slate-900/60"
        }`} 
        onClick={onClose} 
      />

      <div className={`
        w-full max-w-xl rounded-[2.5rem] overflow-hidden relative animate-zoomIn border transition-all duration-300
        ${darkMode 
          ? "bg-slate-900 border-slate-800 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.6)]" 
          : "bg-white border-indigo-50 shadow-2xl shadow-indigo-200/50"}
      `}>
        
        {/* HEADER COM GRADIENTE (Mantido para preservar a identidade da IA) */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 p-8 relative">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <SparklesIcon className="h-6 w-6 text-white stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Sentinel AI
              </h2>
              <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-[0.2em]">
                Análise de Segurança Inteligente
              </p>
            </div>
          </div>

          <button
            className="absolute right-6 top-8 text-white/70 hover:text-white bg-white/10 p-2 rounded-full transition-all hover:rotate-90"
            onClick={onClose}
          >
            <XMarkIcon className="h-5 w-5 stroke-[3]" />
          </button>
        </div>

        {/* CONTEÚDO */}
        <div className="p-8">
          <div className={`
            rounded-[2rem] p-6 max-h-[60vh] overflow-y-auto scrollbar-thin transition-colors border
            ${darkMode 
              ? "bg-slate-950 border-slate-800 scrollbar-thumb-slate-800" 
              : "bg-indigo-50/30 border-indigo-100/50 scrollbar-thumb-indigo-200"}
          `}>
            {conteudo.includes("processando") ? (
              <div className="flex flex-col items-center justify-center py-10 gap-4">
                <div className="relative">
                   <div className={`h-12 w-12 border-4 rounded-full animate-spin ${
                     darkMode ? "border-slate-800 border-t-indigo-500" : "border-indigo-100 border-t-indigo-600"
                   }`}></div>
                   <SparklesIcon className={`h-5 w-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse ${
                     darkMode ? "text-indigo-400" : "text-indigo-600"
                   }`} />
                </div>
                <p className={`font-bold text-sm animate-pulse ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>
                  Consultando base de dados...
                </p>
              </div>
            ) : (
              <div className={`whitespace-pre-wrap leading-relaxed font-medium text-sm md:text-base transition-colors ${
                darkMode ? "text-slate-300" : "text-slate-700"
              }`}>
                {conteudo}
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
              darkMode ? "bg-slate-800/50 border-slate-800" : "bg-slate-50 border-slate-100"
            }`}>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${
                darkMode ? "text-slate-500" : "text-slate-400"
              }`}>
                Sugestão baseada em normas regulamentadoras (NRs)
              </p>
            </div>
            
            <button
              onClick={onClose}
              className={`
                w-full font-black py-4 rounded-2xl transition-all active:scale-[0.98] uppercase text-xs tracking-widest shadow-xl
                ${darkMode 
                  ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-900/20" 
                  : "bg-slate-900 text-white hover:bg-indigo-600 shadow-slate-200"}
              `}
            >
              Entendido
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn { 
          from { opacity: 0; transform: scale(0.95); } 
          to { opacity: 1; transform: scale(1); } 
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-zoomIn { animation: zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}