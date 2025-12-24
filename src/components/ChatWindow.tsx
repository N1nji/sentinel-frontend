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
  
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("chat-theme") === "dark";
  });

  const ref = useRef<HTMLDivElement | null>(null);

  const toggleTheme = () => {
    const newTheme = !dark;
    setDark(newTheme);
    localStorage.setItem("chat-theme", newTheme ? "dark" : "light");
  };

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

  if (!chatId) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-6 text-center ${dark ? "bg-slate-900 text-slate-600" : "bg-gray-50 text-gray-400"}`}>
        <SparklesIcon className="h-12 w-12 md:h-16 md:w-16 mb-4 opacity-20" />
        <p className="font-medium text-sm md:text-base">Como posso ajudar na segurança do trabalho hoje?</p>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden transition-colors duration-300 ${dark ? "bg-slate-900" : "bg-white"}`}>
      
      {/* HEADER: pr-16 no desktop, mas pr-12 no mobile para equilibrar */}
      <header className={`px-4 md:px-6 py-3 md:py-4 border-b flex items-center justify-between sticky top-0 z-10 backdrop-blur-md pr-14 md:pr-16 ${dark ? "border-slate-800 bg-slate-900/80 text-white" : "border-gray-100 bg-white/80"}`}>
        <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
          {!editingTitle ? (
            <div className="group flex items-center gap-2 overflow-hidden">
              <h3 className="text-sm md:text-lg font-bold tracking-tight truncate">{chat?.titulo}</h3>
              <button onClick={() => setEditingTitle(true)} className="md:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <PencilSquareIcon className="h-4 w-4 text-gray-400 hover:text-indigo-500" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full">
              <input 
                autoFocus
                value={titleValue} 
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={async () => {
                    await renomearChat(chatId, titleValue);
                    setEditingTitle(false);
                }}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                className={`text-xs md:text-sm px-2 py-1 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none w-full max-w-[150px] md:max-w-xs ${dark ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
          <button onClick={toggleTheme} className={`p-2 rounded-xl transition-all ${dark ? "bg-slate-800 text-yellow-400" : "bg-gray-100 text-gray-600"}`}>
            {dark ? <SunIcon className="h-4 w-4 md:h-5 md:w-5" /> : <MoonIcon className="h-4 w-4 md:h-5 md:w-5" />}
          </button>
          <button 
            onClick={handleExport} 
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold shadow-md transition-all active:scale-95"
          >
            <ArrowDownTrayIcon className="h-3.5 w-3.5 md:h-4 md:w-4" /> <span className="hidden xs:inline">PDF</span>
          </button>
        </div>
      </header>

      {/* ÁREA DE MENSAGENS: Otimizada para Mobile */}
      <div ref={ref} className="flex-1 overflow-y-auto px-3 md:px-4 py-6 md:py-8 space-y-6 scrollbar-thin scrollbar-thumb-gray-300">
        <div className="max-w-3xl mx-auto space-y-6">
          {chat?.mensagens?.map((m: any, i: number) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`
                relative max-w-[90%] md:max-w-[85%] px-4 py-2.5 md:px-5 md:py-3 rounded-2xl shadow-sm text-sm leading-relaxed
                ${m.role === "user" 
                  ? "bg-indigo-600 text-white rounded-br-none" 
                  : dark ? "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700" : "bg-gray-100 text-slate-800 rounded-bl-none"
                }
              `}>
                <span className={`text-[9px] md:text-[10px] font-black uppercase mb-1 block opacity-50`}>
                  {m.role === "user" ? "Você" : "Sentinel AI"}
                </span>
                <div className="whitespace-pre-wrap break-words">{m.content}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-pulse">
              <div className={`p-3 md:p-4 rounded-2xl rounded-bl-none ${dark ? "bg-slate-800" : "bg-gray-100"}`}>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ÁREA DE INPUT: Otimizada para Touch e Teclado Mobile */}
      <div className={`p-3 md:p-6 border-t ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
        <div className={`max-w-3xl mx-auto relative group rounded-2xl shadow-xl transition-all border ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 768) { e.preventDefault(); handleSend(); } }}
            placeholder="Pergunte sobre NR-6, EPIs..."
            rows={1}
            className={`w-full p-3.5 md:p-4 pr-12 md:pr-16 rounded-2xl resize-none outline-none text-sm bg-transparent ${dark ? "text-white" : "text-gray-800"}`}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={`absolute right-2 bottom-2 md:right-3 md:bottom-3 p-2 rounded-xl transition-all ${input.trim() ? "bg-indigo-600 text-white shadow-lg active:scale-90" : "text-gray-400"}`}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
        <p className="text-center text-[9px] md:text-[10px] text-gray-400 mt-2 md:mt-3 font-medium uppercase tracking-widest opacity-70">
          Sentinel AI • SST Intelligence
        </p>
      </div>
    </div>
  );
}