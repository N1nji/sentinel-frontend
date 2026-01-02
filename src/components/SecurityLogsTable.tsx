import type { JSX } from "react";
import { type SecurityLog } from "../types/SecurityLog";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ShieldOff,
  ShieldCheck,
  User,
  Globe,
  Clock,
} from "lucide-react";

interface SecurityLogsTableProps {
  logs: SecurityLog[];
}

export default function SecurityLogsTable({ logs }: SecurityLogsTableProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden transition-colors">
      {/* HEADER */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Logs de Segurança
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Histórico de acessos, tentativas e eventos críticos
        </p>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-6 py-3 text-left font-medium">
                <div className="flex items-center gap-2">
                  <Clock size={14} /> Data
                </div>
              </th>
              <th className="px-6 py-3 text-left font-medium">
                <div className="flex items-center gap-2">
                  <User size={14} /> Usuário
                </div>
              </th>
              <th className="px-6 py-3 text-left font-medium">Ação</th>
              <th className="px-6 py-3 text-left font-medium">
                <div className="flex items-center gap-2">
                  <Globe size={14} /> IP
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <tr
                key={log._id}
                className="border-t border-slate-200 dark:border-slate-800
                           hover:bg-slate-50 dark:hover:bg-slate-800/50
                           transition-colors"
              >
                <td className="px-6 py-3 text-slate-700 dark:text-slate-300">
                  {new Date(log.createdAt).toLocaleString()}
                </td>

                <td className="px-6 py-3">
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {log.userId?.nome || log.email || "—"}
                  </div>
                  {log.userId?.email && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {log.userId.email}
                    </div>
                  )}
                </td>

                <td className="px-6 py-3">
                  <ActionBadge action={log.action} />
                </td>

                <td className="px-6 py-3 text-slate-500 dark:text-slate-400">
                  {log.ip || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE */}
      <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-800">
        {logs.map((log) => (
          <div key={log._id} className="p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock size={12} />
                {new Date(log.createdAt).toLocaleString()}
              </span>
              <ActionBadge action={log.action} />
            </div>

            <div className="font-medium text-slate-900 dark:text-slate-100">
              {log.userId?.nome || log.email || "—"}
            </div>

            {log.userId?.email && (
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {log.userId.email}
              </div>
            )}

            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Globe size={12} />
              {log.ip || "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================
   ACTION BADGE
========================= */
function ActionBadge({ action }: { action: string }) {
  const map: Record<
    string,
    { label: string; className: string; icon: JSX.Element }
  > = {
    LOGIN_SUCCESS: {
      label: "Login sucesso",
      className:
        "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
      icon: <CheckCircle size={12} />,
    },
    LOGIN_FAILED: {
      label: "Login falhou",
      className:
        "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
      icon: <XCircle size={12} />,
    },
    ACCESS_DENIED: {
      label: "Acesso negado",
      className:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400",
      icon: <AlertTriangle size={12} />,
    },
    USER_BLOCKED: {
      label: "Usuário bloqueado",
      className:
        "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
      icon: <ShieldOff size={12} />,
    },
    USER_UNBLOCKED: {
      label: "Usuário liberado",
      className:
        "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
      icon: <ShieldCheck size={12} />,
    },
  };

  const config = map[action];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
        ${config?.className || "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}
      `}
    >
      {config?.icon}
      {config?.label || action.replaceAll("_", " ")}
    </span>
  );
}
