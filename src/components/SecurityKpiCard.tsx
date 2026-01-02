interface SecurityKpiCardProps {
  label: string;
  value: number;
  icon?: React.ReactNode;
  color?: "green" | "red" | "yellow" | "blue" | "gray";
}

export default function SecurityKpiCard({
  label,
  value,
  icon,
  color = "gray",
}: SecurityKpiCardProps) {
  const colorMap: Record<string, string> = {
    green:
      "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/15",
    red:
      "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/15",
    yellow:
      "text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-500/15",
    blue:
      "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/15",
    gray:
      "text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800",
  };

  return (
    <div
      className="
        bg-white dark:bg-slate-900
        rounded-xl p-6
        shadow-sm
        transition-all duration-300
        hover:shadow-md hover:-translate-y-0.5
        border border-transparent
        dark:border-slate-800
      "
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>

        {icon && (
          <div
            className={`
              p-2 rounded-lg
              ${colorMap[color]}
              transition-colors
            `}
          >
            {icon}
          </div>
        )}
      </div>

      {/* VALUE */}
      <p
        className={`
          mt-4 text-3xl font-semibold tracking-tight
          ${colorMap[color].split(" ")[0]}
        `}
      >
        {value}
      </p>
    </div>
  );
}
