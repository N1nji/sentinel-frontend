interface UserStatusBadgeProps {
  status: string;
}

export default function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const isActive = status === "ativo";

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium
        ${
          isActive
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }
      `}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          isActive ? "bg-green-500" : "bg-red-500"
        }`}
      />
      {isActive ? "Ativo" : "Bloqueado"}
    </span>
  );
}
