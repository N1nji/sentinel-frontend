import { CheckCircle2, XCircle } from "lucide-react";

type UserStatusBadgeProps = {
  status: string;
};

export default function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const isActive = status === "ativo";

  return (
    <span
      className={[
        "inline-flex items-center gap-2",
        "px-3 py-1 rounded-full text-xs font-semibold",
        "transition-colors",
        isActive
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
          : "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
      ].join(" ")}
    >
      {isActive ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <XCircle className="h-3.5 w-3.5" />
      )}

      <span>{isActive ? "Ativo" : "Bloqueado"}</span>
    </span>
  );
}
