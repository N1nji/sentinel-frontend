import { XMarkIcon, SparklesIcon } from "@heroicons/react/24/outline";

interface AiModalProps {
  open: boolean;
  onClose: () => void;
  conteudo: string;
}

export default function AiModal({ open, onClose, conteudo }: AiModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-all">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl shadow-indigo-200/50 overflow-hidden relative animate-in fade-in zoom-in duration-300 border border-indigo-50">
        
        {/* HEADER COM GRADIENTE */}
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
          <div className="bg-indigo-50/30 border border-indigo-100/50 rounded-[2rem] p-6 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-200">
            {conteudo.includes("processando") ? (
              <div className="flex flex-col items-center justify-center py-10 gap-4">
                <div className="relative">
                   <div className="h-12 w-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                   <SparklesIcon className="h-5 w-5 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <p className="text-indigo-600 font-bold text-sm animate-pulse">Consultando base de dados...</p>
              </div>
            ) : (
              <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium text-sm md:text-base">
                {conteudo}
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Sugestão baseada em normas regulamentadoras (NRs)
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-[0.98] uppercase text-xs tracking-widest"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}