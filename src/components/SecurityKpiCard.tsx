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
    green: "text-green-600",
    red: "text-red-600",
    yellow: "text-yellow-600",
    blue: "text-blue-600",
    gray: "text-gray-800",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>

      <p
        className={`mt-3 text-3xl font-semibold tracking-tight ${
          colorMap[color]
        }`}
      >
        {value}
      </p>
    </div>
  );
}
