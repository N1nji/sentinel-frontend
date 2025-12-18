// src/components/ChatWindow.tsx
import { useEffect, useRef, useState } from "react";
import { getChat, enviarMensagem, renomearChat, exportChatPdf } from "../services/chatService";

export default function ChatWindow({ chatId }: { chatId: string | null }) {
  const [chat, setChat] = useState<any>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [dark, setDark] = useState(false);

  const ref = useRef<HTMLDivElement | null>(null);

  // Carrega o chat selecionado
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

  // Auto-scroll
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [chat]);

  // Enviar mensagem
  async function handleSend() {
    if (!chatId || !input.trim()) return;
    setLoading(true);
    try {
      const res = await enviarMensagem(chatId, input.trim());
      setChat(res.chat);
      setInput("");
    } catch {
      alert("Erro ao enviar mensagem");
    } finally {
      setLoading(false);
    }
  }

  // Renomear
  async function handleRename() {
    if (!chatId) return;
    try {
      const res = await renomearChat(chatId, titleValue.trim() || "Sem título");
      setChat(res);
      setEditingTitle(false);
    } catch {
      alert("Erro ao renomear");
    }
  }

  // Exportar PDF
  async function handleExport() {
    if (!chatId) return;
    try {
      const blob = await exportChatPdf(chatId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${chat.titulo || "chat"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Erro ao exportar PDF");
    }
  }

  // Caso nenhum chat esteja selecionado
  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Selecione ou crie uma conversa
      </div>
    );
  }

  return (
    <div
      className={`flex-1 flex flex-col ${
        dark ? "bg-gray-800 text-white" : "bg-white text-black"
      }`}
    >
      {/* HEADER */}
      <div className="p-4 border-b flex items-center justify-between pr-20 relative">

        {/* TÍTULO */}
        <div>
          {!editingTitle ? (
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">{chat?.titulo}</h3>
              <span className="ml-4 text-xs text-gray-400">
                Você está neste chat
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                className="border p-1 rounded"
              />
              <button
                onClick={handleRename}
                className="bg-blue-600 text-white px-2 py-1 rounded"
              >
                Salvar
              </button>
              <button
                onClick={() => {
                  setEditingTitle(false);
                  setTitleValue(chat?.titulo || "");
                }}
                className="text-sm text-gray-500"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        {/* BOTÕES DO HEADER */}
        <div className="flex items-center gap-2 z-10">
          <button
            onClick={() => setDark((d) => !d)}
            className="bg-blue-800 hover:bg-blue-900 px-2 py-1 border rounded text-sm font-medium shadow transition"
          >
            {dark ? "Modo claro" : "Modo escuro"}
          </button>

          <button
            onClick={handleExport}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg shadow text-sm"
          >
            Exportar PDF
          </button>
        </div>
      </div>

      {/* MENSAGENS */}
      <div
        ref={ref}
        className="flex-1 p-4 overflow-auto space-y-3"
      >
        {chat?.mensagens?.map((m: any, i: number) => (
          <div
            key={i}
            className={`max-w-[85%] p-3 rounded shadow-sm ${
              m.role === "user"
                ? "ml-auto bg-blue-600 text-white"
                : "bg-gray-100 text-black"
            }`}
          >
            <div className="text-sm opacity-80">
              {m.role === "user" ? "Você" : "IA"}
            </div>
            <div className="mt-1 whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}

        {loading && (
          <div className="p-3 rounded bg-gray-200 animate-pulse w-fit">
            IA está digitando...
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="p-4 border-t flex gap-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border p-2 rounded"
          rows={2}
          placeholder="Digite sua mensagem..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />

        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
        >
          {loading ? "..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}
