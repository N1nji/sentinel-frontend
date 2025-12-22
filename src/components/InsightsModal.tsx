// src/components/InsightsModal.tsx
import { XMarkIcon, LightBulbIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";

export default function InsightsModal({
  open,
  onClose,
  text,
}: {
  open: boolean;
  onClose: () => void;
  text: string;
}) {
  if (!open) return null;

  // Função para copiar os insights
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    alert("Insights copiados para a área de transferência!");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      {/* OVERLAY COM BLUR */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
        onClick={onClose} 
      />

      {/* CARD DO MODAL */}
      <div className="
        relative max-w-2xl w-full bg-white rounded-3xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.3)] 
        overflow-hidden border border-slate-100 animate-scaleUp
      ">
        
        {/* HEADER COM DEGRADÊ SUAVE */}
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl">
              <LightBulbIcon className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Insights de Segurança</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Análise gerada por IA</p>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* CONTEÚDO */}
        <div className="p-6">
          <div className="
            max-h-[60vh] overflow-auto pr-2
            text-slate-700 leading-relaxed text-sm font-medium
            whitespace-pre-wrap bg-slate-50/50 rounded-2xl p-6
            scrollbar-thin scrollbar-thumb-slate-200
          ">
            {text || "Nenhum insight disponível para este documento."}
          </div>
        </div>

        {/* FOOTER COM AÇÕES */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={handleCopy}
            className="
              flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 
              hover:bg-white hover:shadow-sm rounded-xl transition-all active:scale-95
            "
          >
            <DocumentDuplicateIcon className="h-4 w-4" />
            Copiar Texto
          </button>
          
          <button
            onClick={onClose}
            className="
              px-6 py-2.5 bg-slate-800 text-white text-sm font-bold rounded-xl 
              hover:bg-slate-900 transition-all shadow-lg shadow-slate-200 active:scale-95
            "
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
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleUp { animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}