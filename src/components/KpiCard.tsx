// src/components/KpiCard.tsx
export default function KpiCard({
  label,
  value,
  color = "bg-gray-600",
}: {
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <div className={`p-4 rounded text-white ${color}`}>
      <div className="text-sm opacity-80">{label}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}
