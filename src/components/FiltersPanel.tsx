// src/components/FiltersPanel.tsx
import dayjs from "dayjs";
import { FunnelIcon, CalendarDaysIcon, MapPinIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../context/ThemeContext"; // Importado o contexto

export type Filters = {
  from: string;
  to: string;
  setorId: string;
  epiId: string;
};

export default function FiltersPanel({
  filters,
  setFilters,
  setores,
  epis,
}: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  setores: { _id: string; nome: string }[];
  epis: { _id: string; nome: string }[];
}) {
  const { darkMode } = useTheme(); //Consumindo o estado do tema

  return (
    <div className={`p-6 rounded-[2rem] border transition-all duration-300 mb-8 ${
      darkMode 
        ? "bg-slate-900 border-slate-800 shadow-none" 
        : "bg-white border-slate-200 shadow-xl shadow-slate-200/40"
    }`}>
      {/* TÍTULO DISCRETO DO PAINEL */}
      <div className="flex items-center gap-2 mb-6 px-1">
        <FunnelIcon className={`h-4 w-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
          Filtrar Resultados
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        
        {/* PERÍODO - INÍCIO */}
        <div className="space-y-1.5">
          <label className={`flex items-center gap-2 text-[10px] font-black uppercase ml-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            <CalendarDaysIcon className="h-3 w-3" />
            Início
          </label>
          <input
            type="date"
            className={`w-full p-3 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium ${
              darkMode 
                ? "bg-slate-800 border-slate-700 text-slate-200" 
                : "bg-slate-50 border-slate-200 text-slate-600"
            }`}
            value={filters.from}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, from: e.target.value }))
            }
          />
        </div>

        {/* PERÍODO - FIM */}
        <div className="space-y-1.5">
          <label className={`flex items-center gap-2 text-[10px] font-black uppercase ml-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            <CalendarDaysIcon className="h-3 w-3" />
            Término
          </label>
          <input
            type="date"
            className={`w-full p-3 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium ${
              darkMode 
                ? "bg-slate-800 border-slate-700 text-slate-200" 
                : "bg-slate-50 border-slate-200 text-slate-600"
            }`}
            value={filters.to}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, to: e.target.value }))
            }
          />
        </div>

        {/* SETOR */}
        <div className="space-y-1.5">
          <label className={`flex items-center gap-2 text-[10px] font-black uppercase ml-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            <MapPinIcon className="h-3 w-3" />
            Setor
          </label>
          <select
            className={`w-full p-3 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium cursor-pointer appearance-none ${
              darkMode 
                ? "bg-slate-800 border-slate-700 text-slate-200" 
                : "bg-slate-50 border-slate-200 text-slate-600"
            }`}
            value={filters.setorId}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, setorId: e.target.value }))
            }
          >
            <option value="">Todos os Setores</option>
            {setores.map((s) => (
              <option key={s._id} value={s._id}>
                {s.nome}
              </option>
            ))}
          </select>
        </div>

        {/* EPI */}
        <div className="space-y-1.5">
          <label className={`flex items-center gap-2 text-[10px] font-black uppercase ml-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            <ShieldCheckIcon className="h-3 w-3" />
            Equipamento
          </label>
          <select
            className={`w-full p-3 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium cursor-pointer appearance-none ${
              darkMode 
                ? "bg-slate-800 border-slate-700 text-slate-200" 
                : "bg-slate-50 border-slate-200 text-slate-600"
            }`}
            value={filters.epiId}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, epiId: e.target.value }))
            }
          >
            <option value="">Todos os EPIs</option>
            {epis.map((epi) => (
              <option key={epi._id} value={epi._id}>
                {epi.nome}
              </option>
            ))}
          </select>
        </div>

        {/* BOTÃO APLICAR */}
        <div className="lg:ml-2">
          <button
            className={`w-full font-black py-3.5 rounded-2xl transition-all active:scale-[0.97] uppercase text-[11px] tracking-widest ${
              darkMode 
                ? "bg-indigo-600 text-white shadow-none hover:bg-indigo-500" 
                : "bg-slate-900 text-white shadow-lg shadow-slate-200 hover:bg-blue-600"
            }`}
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                from: dayjs(prev.from).format("YYYY-MM-DD"),
                to: dayjs(prev.to).format("YYYY-MM-DD"),
              }))
            }
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  );
}