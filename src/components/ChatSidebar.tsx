// src/components/ChatSidebar.tsx
import { useEffect, useState, useRef } from "react";
import {
  listarChats,
  criarChat,
  deletarChat,
  renomearChat,
} from "../services/chatService";
import { useTheme } from "../context/ThemeContext"; // 🔹 Melhoria 1: Import do Tema
import {
  EllipsisVerticalIcon,
  TrashIcon,
  PencilSquareIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon
} from "@heroicons/react/24/outline";
import ConfirmModal from "./ConfirmModal";
import RenameChatModal from "./RenameChatModal";

export default function ChatSidebar({
  onSelect,
  activeId,
}: {
  onSelect: (id: string) => void;
  activeId?: string | null;
}) {
  const { darkMode } = useTheme(); // 🔹 Melhoria 1: Consumindo o modo escuro
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<any>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [chatToRename, setChatToRename] = useState<any>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  async function load() {
    setLoading(true);
    const data = await listarChats();
    setChats(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleNovo() {
    const novo = await criarChat("Novo chat");
    setChats((s) => [novo, ...s]);
    onSelect(novo._id);
  }

  function openDeleteModal(chat: any) {
    setChatToDelete(chat);
    setConfirmOpen(true);
    setMenuOpenId(null);
  }

  async function confirmDelete() {
    if (!chatToDelete) return;
    await deletarChat(chatToDelete._id);
    setChats((s) => s.filter((c) => c._id !== chatToDelete._id));
    setConfirmOpen(false);
    setChatToDelete(null);
  }

  function openRenameModal(chat: any) {
    setChatToRename(chat);
    setRenameOpen(true);
    setMenuOpenId(null);
  }

  async function confirmRename(value: string) {
    if (!chatToRename) return;
    const atualizado = await renomearChat(chatToRename._id, value);
    setChats((s) => s.map((c) => (c._id === chatToRename._id ? atualizado : c)));
    setRenameOpen(false);
    setChatToRename(null);
  }

  return (
    <>
      {/* Ajustado: Cores dinâmicas baseadas no darkMode */}
      <aside className={`w-full md:w-80 p-4 flex flex-col gap-4 border-r h-full transition-all duration-300 ${
        darkMode 
          ? "bg-slate-950 text-white border-slate-800" 
          : "bg-gray-50 text-slate-900 border-gray-200"
      }`}>
        
        {/* HEADER - Melhoria 2: pt-12 no mobile resolve o conflito com o botão X */}
        <div className="flex items-center justify-between mb-2 pt-12 md:pt-0">
          <div className="flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-indigo-500" />
            <h2 className={`text-sm font-black uppercase tracking-widest ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Conversas
            </h2>
          </div>
          <button
            onClick={handleNovo}
            className="bg-indigo-600 hover:bg-indigo-500 p-2.5 md:p-2 rounded-xl shadow-lg shadow-indigo-900/20 transition-all active:scale-95 group"
            title="Novo Chat"
          >
            <PlusIcon className="h-5 w-5 text-white group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* LISTA */}
        <div className={`flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin ${darkMode ? "scrollbar-thumb-slate-800" : "scrollbar-thumb-gray-300"}`}>
          {loading && (
            <div className="flex items-center gap-2 text-slate-500 animate-pulse p-3">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <span className="text-xs font-bold uppercase tracking-tighter">Sincronizando...</span>
            </div>
          )}

          {!loading && chats.length === 0 && (
            <div className="text-center py-10">
              <p className="text-slate-600 text-[10px] font-bold uppercase">Nenhuma conversa encontrada</p>
            </div>
          )}

          {chats.map((c) => (
            <div
              key={c._id}
              className={`
                group relative p-3.5 md:p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all duration-200
                ${
                  activeId === c._id
                    ? "bg-indigo-600 shadow-xl shadow-indigo-900/40 text-white"
                    : darkMode
                      ? "hover:bg-slate-900 bg-slate-900/30 border border-transparent hover:border-slate-700 text-slate-200"
                      : "hover:bg-white bg-white border border-transparent hover:border-gray-200 text-slate-700 shadow-sm"
                }
              `}
            >
              {/* CONTEÚDO */}
              <button
                className="flex-1 text-left overflow-hidden outline-none"
                onClick={() => onSelect(c._id)}
              >
                <div className="font-bold truncate text-sm">
                  {c.titulo}
                </div>
                <div className={`text-[10px] mt-0.5 font-medium ${activeId === c._id ? "text-indigo-200" : "text-slate-500"}`}>
                  {new Date(c.updatedAt || c.createdAt).toLocaleDateString()} • {new Date(c.updatedAt || c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </button>

              {/* MENU (...) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(menuOpenId === c._id ? null : c._id);
                }}
                className={`p-2 rounded-lg transition-all ${
                  activeId === c._id 
                  ? "hover:bg-indigo-500 text-indigo-200" 
                  : darkMode
                    ? "opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-slate-800 text-slate-400"
                    : "opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-gray-100 text-gray-400"
                }`}
              >
                <EllipsisVerticalIcon className="h-5 w-5" />
              </button>

              {/* DROPDOWN */}
              {menuOpenId === c._id && (
                <div
                  ref={menuRef}
                  className={`absolute right-2 top-12 border rounded-xl shadow-2xl z-[110] w-44 overflow-hidden backdrop-blur-xl animate-scaleUp ${
                    darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"
                  }`}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); openRenameModal(c); }}
                    className={`flex items-center gap-3 px-4 py-4 md:py-3 text-xs font-bold w-full text-left transition-colors ${
                      darkMode ? "hover:bg-slate-800 text-slate-300 hover:text-white" : "hover:bg-gray-50 text-gray-600 hover:text-indigo-600"
                    }`}
                  >
                    <PencilSquareIcon className="h-4 w-4 text-indigo-400" />
                    RENOMEAR
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); openDeleteModal(c); }}
                    className={`flex items-center gap-3 px-4 py-4 md:py-3 text-xs font-bold text-red-400 hover:bg-red-500/10 w-full text-left transition-colors border-t ${
                      darkMode ? "border-slate-800" : "border-gray-100"
                    }`}
                  >
                    <TrashIcon className="h-4 w-4" />
                    EXCLUIR
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* FOOTER DISCRETO */}
        <div className={`pt-4 border-t text-[10px] font-bold uppercase tracking-widest text-center shrink-0 ${
          darkMode ? "border-slate-800 text-slate-600" : "border-gray-200 text-gray-400"
        }`}>
          Sentinel AI History
        </div>
      </aside>

      <ConfirmModal
        open={confirmOpen}
        title="Excluir conversa"
        message={`Tem certeza que deseja excluir a conversa "${chatToDelete?.titulo}"? Essa ação não pode ser desfeita.`}
        onConfirm={confirmDelete}
        onClose={() => {
          setConfirmOpen(false);
          setChatToDelete(null);
        }}
      />

      <RenameChatModal
        open={renameOpen}
        initialValue={chatToRename?.titulo || ""}
        onConfirm={confirmRename}
        onClose={() => {
          setRenameOpen(false);
          setChatToRename(null);
        }}
      />

      <style>{`
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: ${darkMode ? "#1e293b" : "#cbd5e1"}; border-radius: 10px; }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scaleUp { animation: scaleUp 0.15s ease-out; }
      `}</style>
    </>
  );
}