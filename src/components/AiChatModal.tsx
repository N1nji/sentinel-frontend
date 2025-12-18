// src/components/AiChatModal.tsx
import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";

export default function AiChatModal({ open, onClose }: any) {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  function handleClose() {
    setSelectedChatId(null); // limpa estado interno
    onClose();
  }

  if (!open) return null;

  return (
    <>
      {/* OVERLAY */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={handleClose}
      />

      {/* MODAL */}
      <div
        className="
          fixed z-50
          top-1/2 left-1/2
          -translate-x-1/2 -translate-y-1/2
          bg-white rounded-xl shadow-2xl
          flex w-[90vw] h-[85vh] max-w-6xl
        "
        onClick={(e) => e.stopPropagation()} // 🔥 ESSENCIAL
      >
        {/* BOTÃO FECHAR */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation(); // 🔥 ESSENCIAL
            handleClose();
          }}
          className="absolute top-3 right-3 z-50 text-gray-600 hover:text-black"
        >
          <XMarkIcon className="h-7 w-7" />
        </button>

        <ChatSidebar
          onSelect={setSelectedChatId}
          activeId={selectedChatId}
        />

        <ChatWindow chatId={selectedChatId} />
      </div>
    </>
  );
}