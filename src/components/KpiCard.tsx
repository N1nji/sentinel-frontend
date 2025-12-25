// src/components/KpiCard.tsx
import type { ReactNode } from "react";
import { useTheme } from "../context/ThemeContext"; // 🔹 Importado o contexto

interface KpiCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  color?: "indigo" | "rose" | "emerald" | "amber" | "blue";
  trend?: string;
}

export default function KpiCard({
  label,
  value,
  icon,
  color = "indigo",
  trend,
}: KpiCardProps) {
  const { darkMode } = useTheme(); // 🔹 Consumindo o estado do tema
  
  // Mapeamento de cores mantido, usando o darkMode para controlar as sombras
  const colorVariants = {
    indigo: `from-indigo-600 to-indigo-700 ${darkMode ? "shadow-none" : "shadow-indigo-200"}`,
    rose: `from-rose-500 to-rose-600 ${darkMode ? "shadow-none" : "shadow-rose-200"}`,
    emerald: `from-emerald-500 to-emerald-600 ${darkMode ? "shadow-none" : "shadow-emerald-200"}`,
    amber: `from-amber-500 to-amber-600 ${darkMode ? "shadow-none" : "shadow-amber-200"}`,
    blue: `from-blue-500 to-blue-600 ${darkMode ? "shadow-none" : "shadow-blue-200"}`,
  };

  return (
    <div className={`
      relative overflow-hidden
      bg-gradient-to-br ${colorVariants[color]}
      p-6 rounded-[2rem] 
      shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1
      flex flex-col justify-between
      min-h-[160px] group
    `}>
      
      {/* Círculo de Luz Decorativo ao fundo */}
      <div className="absolute -right-4 -top-4 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />

      <div className="flex justify-between items-start z-10">
        <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white shadow-inner">
          {icon}
        </div>
        
        {trend && (
          <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
            {trend}
          </span>
        )}
      </div>

      <div className="mt-4 z-10 text-white">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">
          {label}
        </p>
        <h3 className="text-3xl font-black tracking-tighter leading-none">
          {value}
        </h3>
      </div>
    </div>
  );
}