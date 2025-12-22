// src/components/ChatSidebar.tsx
import { useEffect, useState, useRef } from "react";
import {
  listarChats,
  criarChat,
  deletarChat,
  renomearChat,
} from "../services/chatService";
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
      <aside className="w-80 bg-slate-950 text-white p-4 flex flex-col gap-4 border-r border-slate-800">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-indigo-500" />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Conversas</h2>
          </div>
          <button
            onClick={handleNovo}
            className="bg-indigo-600 hover:bg-indigo-500 p-2 rounded-xl shadow-lg shadow-indigo-900/20 transition-all active:scale-95 group"
            title="Novo Chat"
          >
            <PlusIcon className="h-5 w-5 text-white group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* LISTA */}
        <div className="flex-1 overflow-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
          {loading && (
            <div className="flex items-center gap-2 text-slate-500 animate-pulse p-3">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <span className="text-xs font-bold uppercase">Sincronizando...</span>
            </div>
          )}

          {chats.map((c) => (
            <div
              key={c._id}
              className={`
                group relative p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all duration-200
                ${
                  activeId === c._id
                    ? "bg-indigo-600 shadow-xl shadow-indigo-900/40"
                    : "hover:bg-slate-900 bg-slate-900/30 border border-transparent hover:border-slate-700"
                }
              `}
            >
              {/* CONTEÚDO */}
              <button
                className="flex-1 text-left overflow-hidden"
                onClick={() => onSelect(c._id)}
              >
                <div className={`font-bold truncate text-sm ${activeId === c._id ? "text-white" : "text-slate-200"}`}>
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
                className={`p-1 rounded-lg transition-all ${
                  activeId === c._id 
                  ? "hover:bg-indigo-500 text-indigo-200" 
                  : "opacity-0 group-hover:opacity-100 hover:bg-slate-800 text-slate-400"
                }`}
              >
                <EllipsisVerticalIcon className="h-5 w-5" />
              </button>

              {/* DROPDOWN */}
              {menuOpenId === c._id && (
                <div
                  ref={menuRef}
                  className="absolute right-2 top-12 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 w-40 overflow-hidden backdrop-blur-xl"
                >
                  <button
                    onClick={() => openRenameModal(c)}
                    className="flex items-center gap-2 px-4 py-3 text-xs font-bold hover:bg-slate-800 w-full text-left transition-colors text-slate-300 hover:text-white"
                  >
                    <PencilSquareIcon className="h-4 w-4 text-indigo-400" />
                    RENOMEAR
                  </button>

                  <button
                    onClick={() => openDeleteModal(c)}
                    className="flex items-center gap-2 px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-500/10 w-full text-left transition-colors"
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
        <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-600 font-bold uppercase tracking-widest text-center">
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
    </>
  );
}