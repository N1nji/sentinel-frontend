import type { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: number | string;
  icon: ReactNode; // Adicionamos suporte a ícone
  color?: "indigo" | "rose" | "emerald" | "amber" | "blue"; // Cores pré-definidas para manter o padrão
  trend?: string; // Ex: "+12%" ou "Estável"
}

export default function KpiCard({
  label,
  value,
  icon,
  color = "indigo",
  trend,
}: KpiCardProps) {
  
  // Mapeamento de cores para manter o design system consistente
  const colorVariants = {
    indigo: "from-indigo-600 to-indigo-700 shadow-indigo-200 dark:shadow-none",
    rose: "from-rose-500 to-rose-600 shadow-rose-200 dark:shadow-none",
    emerald: "from-emerald-500 to-emerald-600 shadow-emerald-200 dark:shadow-none",
    amber: "from-amber-500 to-amber-600 shadow-amber-200 dark:shadow-none",
    blue: "from-blue-500 to-blue-600 shadow-blue-200 dark:shadow-none",
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