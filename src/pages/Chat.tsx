// src/pages/Chat.tsx (ou onde estiver seu ChatPage)
import { useState } from "react";
import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";
import { useTheme } from "../context/ThemeContext"; // 🔹 Importado para manter consistência

export default function ChatPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { darkMode } = useTheme();

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${
      darkMode ? "bg-slate-950" : "bg-white"
    }`}>
      
      {/* SIDEBAR: 
        No mobile: Se tiver um chat selecionado, 'hidden'. Se não tiver, 'flex' (ocupa a tela toda).
        No desktop (md): Sempre 'flex' com largura fixa de 80 (w-80).
      */}
      <div className={`${selectedId ? "hidden md:flex" : "flex"} w-full md:w-80 h-full`}>
        <ChatSidebar 
          onSelect={(id) => setSelectedId(id)} 
          activeId={selectedId} 
        />
      </div>

      {/* WINDOW: 
        No mobile: Se NÃO tiver chat selecionado, 'hidden'. Se tiver, 'flex' (ocupa a tela toda).
        No desktop (md): Sempre 'flex' ocupando o resto do espaço (flex-1).
      */}
      <div className={`${!selectedId ? "hidden md:flex" : "flex"} flex-1 h-full relative`}>
        <ChatWindow 
          chatId={selectedId} 
          onBack={() => setSelectedId(null)} // 🔹 A função que o botão de voltar do mobile vai usar
        />
      </div>
      
    </div>
  );
}