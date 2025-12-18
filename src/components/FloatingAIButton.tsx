// src/components/FloatingAIButton.tsx
import { useState } from "react";
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/solid";
import AiChatModal from "./AiChatModal";

export default function FloatingAIButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Assistente IA"
        className="fixed bottom-6 right-6 z-50 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-xl flex items-center justify-center"
      >
        <ChatBubbleBottomCenterTextIcon className="h-6 w-6" />
      </button>

      <AiChatModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
