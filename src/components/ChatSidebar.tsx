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

  // menu (...)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // confirm modal
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

  setChats((s) =>
    s.map((c) => (c._id === chatToRename._id ? atualizado : c))
  );

  setRenameOpen(false);
  setChatToRename(null);
}


  return (
    <>
      <aside className="w-72 bg-gray-900 text-white p-4 flex flex-col gap-3">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Conversas</h2>
          <button
            onClick={handleNovo}
            className="bg-blue-800 hover:bg-blue-900 px-3 py-1.5 rounded-md text-sm font-medium shadow transition"
          >
            + Novo chat
          </button>
        </div>

        {/* LISTA */}
        <div className="flex-1 overflow-auto space-y-1">
          {loading && <div className="text-sm">Carregando...</div>}

          {chats.map((c) => (
            <div
              key={c._id}
              className={`
                group relative p-2 rounded flex items-center gap-2 cursor-pointer
                ${
                  activeId === c._id
                    ? "bg-blue-600"
                    : "hover:bg-gray-800"
                }
              `}
            >
              {/* CONTEÚDO */}
              <button
                className="flex-1 text-left overflow-hidden"
                onClick={() => onSelect(c._id)}
              >
                <div className="font-medium truncate">{c.titulo}</div>
                <div className="text-xs text-gray-300">
                  {new Date(c.updatedAt || c.createdAt).toLocaleString()}
                </div>
              </button>

              {/* MENU (...) */}
              <button
                onClick={() =>
                  setMenuOpenId(menuOpenId === c._id ? null : c._id)
                }
                className="opacity-0 group-hover:opacity-100 transition"
              >
                <EllipsisVerticalIcon className="h-5 w-5 text-gray-300 hover:text-white" />
              </button>

              {/* DROPDOWN */}
              {menuOpenId === c._id && (
                <div
                ref={menuRef}
                className="absolute right-2 top-10 bg-gray-800 border border-gray-700 rounded shadow-lg z-50 w-36">
                  <button
                    onClick={() => openRenameModal(c)}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-700 w-full text-left"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                    Renomear
                  </button>

                  <button
                    onClick={() => openDeleteModal(c)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-700 w-full text-left"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Excluir
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* CONFIRM MODAL (REUTILIZANDO O SEU 💙) */}
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