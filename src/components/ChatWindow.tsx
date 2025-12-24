import { useEffect, useRef, useState } from "react";
import { getChat, enviarMensagem, renomearChat, exportChatPdf } from "../services/chatService";
import { useTheme } from "../context/ThemeContext"; // 🔹 Importado o contexto global
import { 
  PaperAirplaneIcon, 
  ArrowDownTrayIcon, 
  PencilSquareIcon,
  SparklesIcon,
  ChevronLeftIcon // Adicionado para mobile
} from "@heroicons/react/24/outline";

export default function ChatWindow({ chatId, onBack }: { chatId: string | null; onBack?: () => void; }) {
  const { darkMode } = useTheme(); // 🔹 Consumindo o tema global
  const [chat, setChat] = useState<any>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chatId) {
      setChat(null);
      return;
    }
    (async () => {
      const data = await getChat(chatId);
      setChat(data);
      setTitleValue(data.titulo || "Novo chat");
    })();
  }, [chatId]);

  useEffect(() => {
    if (ref.current) ref.current.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' });
  }, [chat, loading]);

  async function handleExport() {
    if (!chatId) return;
    try {
      const blob = await exportChatPdf(chatId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${chat?.titulo || "chat-sentinel"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Erro ao exportar PDF");
    }
  }

  async function handleSend() {
    if (!chatId || !input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setLoading(true);
    try {
      const res = await enviarMensagem(chatId, msg);
      setChat(res.chat);
    } catch {
      alert("Erro ao enviar mensagem");
    } finally {
      setLoading(false);
    }
  }

  // PLACEHOLDER QUANDO NÃO HÁ CHAT SELECIONADO
  if (!chatId) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-4 text-center transition-colors ${darkMode ? "bg-slate-950 text-slate-500" : "bg-gray-50 text-gray-400"}`}>
        <SparklesIcon className="h-16 w-16 mb-4 opacity-20" />
        <h2 className={`text-xl font-bold mb-2 ${darkMode ? "text-slate-300" : "text-gray-600"}`}>Sentinel AI</h2>
        <p className="max-w-xs text-sm">Selecione uma conversa ao lado ou inicie um novo atendimento de segurança.</p>
      </div>
    );
  }

  return (
    /* Ajuste Mobile: h-full e min-h-0 garantem que o flexbox 
       não "estoure" a tela do celular 
    */
    <div className={`flex-1 flex flex-col h-full min-h-0 transition-colors duration-300 ${darkMode ? "bg-slate-950" : "bg-white"}`}>
      
      {/* HEADER DINÂMICO */}
      <header className={`px-4 sm:px-6 py-4 border-b flex items-center justify-between sticky top-0 z-10 backdrop-blur-md ${
        darkMode ? "border-slate-800 bg-slate-950/80 text-white" : "border-gray-100 bg-white/80"
      }`}>
        <div className="flex items-center gap-3 overflow-hidden">
          {/* 🔹 BOTÃO VOLTAR (Só aparece no Mobile) */}
          <button 
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-gray-500/10 rounded-full md:hidden transition-colors"
          >
            <ChevronLeftIcon className="h-6 w-6 text-indigo-500" />
          </button>
          {/* Botão de voltar (opcional, útil se você quiser esconder a lista no mobile) */}
          <div className="flex items-center gap-2 group overflow-hidden">
            {!editingTitle ? (
              <>
                <h3 className="text-base sm:text-lg font-bold truncate tracking-tight">{chat?.titulo}</h3>
                <button onClick={() => setEditingTitle(true)} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <PencilSquareIcon className="h-4 w-4 text-gray-400" />
                </button>
              </>
            ) : (
              <input 
                autoFocus
                value={titleValue} 
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={async () => {
                    await renomearChat(chatId, titleValue);
                    setEditingTitle(false);
                }}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                className={`text-sm px-3 py-1 rounded-lg border outline-none w-full max-w-[200px] ${
                  darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-black"
                }`}
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button 
            onClick={handleExport} 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
          >
            <ArrowDownTrayIcon className="h-4 w-4" /> <span className="hidden sm:inline">Exportar</span> PDF
          </button>
        </div>
      </header>

      {/* ÁREA DE MENSAGENS RESPONSIVA */}
      <div 
        ref={ref} 
        className={`flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar ${
          darkMode ? "bg-slate-950" : "bg-gray-50/30"
        }`}
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {chat?.mensagens?.map((m: any, i: number) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`
                relative max-w-[90%] sm:max-w-[85%] px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed
                ${m.role === "user" 
                  ? "bg-indigo-600 text-white rounded-br-none" 
                  : darkMode 
                    ? "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700" 
                    : "bg-white text-slate-800 rounded-bl-none border border-gray-100"
                }
              `}>
                <span className={`text-[9px] font-black uppercase mb-1 block opacity-60 tracking-widest`}>
                  {m.role === "user" ? "Operador" : "Sentinel AI"}
                </span>
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className={`p-4 rounded-2xl rounded-bl-none ${darkMode ? "bg-slate-800" : "bg-white border border-gray-100"}`}>
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* INPUT FIXO NO RODAPÉ */}
      <footer className={`p-4 md:p-6 border-t transition-colors ${
        darkMode ? "bg-slate-950 border-slate-800" : "bg-white border-gray-100"
      }`}>
        <div className={`max-w-3xl mx-auto relative group rounded-2xl shadow-lg transition-all border ${
          darkMode ? "bg-slate-900 border-slate-800 focus-within:border-indigo-500" : "bg-gray-50 border-gray-200 focus-within:border-indigo-400"
        }`}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Digite sua dúvida técnica..."
            rows={1}
            className={`w-full p-4 pr-14 rounded-2xl resize-none outline-none text-sm bg-transparent ${
              darkMode ? "text-white placeholder:text-slate-600" : "text-gray-800 placeholder:text-gray-400"
            }`}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={`absolute right-2 bottom-2 p-2.5 rounded-xl transition-all ${
              input.trim() 
                ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-700" 
                : "text-gray-400"
            }`}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
        <p className="text-center text-[9px] text-gray-500 mt-3 font-bold uppercase tracking-[0.2em] opacity-50">
          Powered by Sentinel AI 
        </p>
      </footer>
    </div>
  );
}