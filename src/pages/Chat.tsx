import { useState } from "react";
import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";

export default function ChatPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="flex h-full">
      <ChatSidebar onSelect={(id)=> setSelectedId(id)} />
      <ChatWindow chatId={selectedId} />
    </div>
  );
}
