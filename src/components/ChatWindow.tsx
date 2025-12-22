import { useEffect, useRef, useState } from "react";
import { getChat, enviarMensagem, renomearChat, exportChatPdf } from "../services/chatService";
import { 
  PaperAirplaneIcon, 
  ArrowDownTrayIcon, 
  PencilSquareIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

export default function ChatWindow({ chatId }: { chatId: string | null }) {
  const [chat, setChat] = useState<any>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [dark, setDark] = useState(false);

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

  // MELHORIA PDF: Lógica de download robusta
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

  if (!chatId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
        <SparklesIcon className="h-16 w-16 mb-4 opacity-20" />
        <p className="font-medium">Como posso ajudar na segurança do trabalho hoje?</p>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden transition-colors duration-300 ${dark ? "bg-slate-900" : "bg-white"}`}>
      
      {/* HEADER ELEGANTE - Adicionado pr-16 para não bater no X do modal */}
      <header className={`px-6 py-4 border-b flex items-center justify-between sticky top-0 z-10 backdrop-blur-md pr-16 ${dark ? "border-slate-800 bg-slate-900/80 text-white" : "border-gray-100 bg-white/80"}`}>
        <div className="flex items-center gap-3">
          {!editingTitle ? (
            <div className="group flex items-center gap-2">
              <h3 className="text-lg font-bold tracking-tight">{chat?.titulo}</h3>
              <button onClick={() => setEditingTitle(true)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                <PencilSquareIcon className="h-4 w-4 text-gray-400 hover:text-indigo-500" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input 
                autoFocus
                value={titleValue} 
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={async () => {
                    await renomearChat(chatId, titleValue);
                    setEditingTitle(false);
                }}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                className={`text-sm px-3 py-1 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none ${dark ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setDark(!dark)} className={`p-2 rounded-xl transition-all ${dark ? "bg-slate-800 text-yellow-400 hover:bg-slate-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {dark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>
          <button 
            onClick={handleExport} 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95"
          >
            <ArrowDownTrayIcon className="h-4 w-4" /> PDF
          </button>
        </div>
      </header>

      {/* ÁREA DE MENSAGENS - Mantida com scrollbar */}
      <div ref={ref} className="flex-1 overflow-y-auto px-4 py-8 space-y-6 scrollbar-thin scrollbar-thumb-gray-300">
        <div className="max-w-3xl mx-auto space-y-6">
          {chat?.mensagens?.map((m: any, i: number) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`
                relative max-w-[85%] px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed
                ${m.role === "user" 
                  ? "bg-indigo-600 text-white rounded-br-none" 
                  : dark ? "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700" : "bg-gray-100 text-slate-800 rounded-bl-none"
                }
              `}>
                <span className={`text-[10px] font-black uppercase mb-1 block opacity-50`}>
                  {m.role === "user" ? "Você" : "Sentinel AI"}
                </span>
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-pulse">
              <div className={`p-4 rounded-2xl rounded-bl-none ${dark ? "bg-slate-800" : "bg-gray-100"}`}>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ÁREA DE INPUT FLUTUANTE - Fixa no fundo com fundo sólido para não traspassar mensagens */}
      <div className={`p-4 md:p-6 border-t ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
        <div className={`max-w-3xl mx-auto relative group rounded-2xl shadow-2xl transition-all border ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Pergunte algo sobre NR-6, vencimentos ou treinamentos..."
            rows={1}
            className={`w-full p-4 pr-16 rounded-2xl resize-none outline-none text-sm bg-transparent ${dark ? "text-white" : "text-gray-800"}`}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={`absolute right-3 bottom-3 p-2 rounded-xl transition-all ${input.trim() ? "bg-indigo-600 text-white shadow-lg hover:scale-110" : "text-gray-400"}`}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-3 font-medium uppercase tracking-widest">
          Sentinel AI • Assistente de Segurança do Trabalho
        </p>
      </div>
    </div>
  );
}