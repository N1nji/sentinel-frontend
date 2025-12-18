import dayjs from "dayjs";

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
  return (
    <div className="bg-white p-4 rounded shadow flex gap-3 items-end flex-wrap">

      {/* FROM */}
      <div>
        <label className="block text-sm">Início</label>
        <input
          type="date"
          className="border p-2 rounded"
          value={filters.from}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, from: e.target.value }))
          }
        />
      </div>

      {/* TO */}
      <div>
        <label className="block text-sm">Fim</label>
        <input
          type="date"
          className="border p-2 rounded"
          value={filters.to}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, to: e.target.value }))
          }
        />
      </div>

      {/* SETOR */}
      <div>
        <label className="block text-sm">Setor</label>
        <select
          className="border p-2 rounded"
          value={filters.setorId}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, setorId: e.target.value }))
          }
        >
          <option value="">Todos</option>
          {setores.map((s) => (
            <option key={s._id} value={s._id}>
              {s.nome}
            </option>
          ))}
        </select>
      </div>

      {/* EPI */}
      <div>
        <label className="block text-sm">EPI</label>
        <select
          className="border p-2 rounded"
          value={filters.epiId}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, epiId: e.target.value }))
          }
        >
          <option value="">Todos</option>
          {epis.map((epi) => (
            <option key={epi._id} value={epi._id}>
              {epi.nome}
            </option>
          ))}
        </select>
      </div>

      {/* BOTÃO APLICAR */}
      <div className="ml-auto">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() =>
            setFilters((prev) => ({
              ...prev,
              from: dayjs(prev.from).format("YYYY-MM-DD"),
              to: dayjs(prev.to).format("YYYY-MM-DD"),
            }))
          }
        >
          Aplicar
        </button>
      </div>
    </div>
  );
}
