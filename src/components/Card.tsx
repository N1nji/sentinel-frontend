// src/components/Card.tsx
import React from "react";
import { useTheme } from "../context/ThemeContext"; // Importado o contexto

export default function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  const { darkMode } = useTheme(); // Consumindo o estado do tema

  return (
    <div className={`
      p-8 rounded-[2rem] border transition-all duration-300
      ${darkMode 
        ? "bg-slate-900 border-slate-800 shadow-none text-white" 
        : "bg-white border-slate-100 shadow-xl shadow-slate-200/50 text-slate-900"
      }
    `}>
      {title && (
        <div className="flex items-center gap-3 mb-6">
          {/* Detalhe visual na lateral do título */}
          <div className="h-4 w-1 bg-indigo-600 rounded-full" />
          <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            {title}
          </h3>
        </div>
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}