import { type SecurityLog } from "../types/SecurityLog";

interface SecurityLogsTableProps {
  logs: SecurityLog[];
}

export default function SecurityLogsTable({ logs }: SecurityLogsTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">
          📜 Logs de Segurança
        </h3>
        <p className="text-sm text-gray-500">
          Histórico de acessos, tentativas e bloqueios
        </p>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left">Data</th>
              <th className="px-6 py-3 text-left">Usuário</th>
              <th className="px-6 py-3 text-left">Ação</th>
              <th className="px-6 py-3 text-left">IP</th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <tr
                key={log._id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="px-6 py-3">
                  {new Date(log.createdAt).toLocaleString()}
                </td>

                <td className="px-6 py-3">
                  <div className="font-medium">
                    {log.userId?.nome || log.email || "—"}
                  </div>
                  {log.userId?.email && (
                    <div className="text-xs text-gray-500">
                      {log.userId.email}
                    </div>
                  )}
                </td>

                <td className="px-6 py-3">
                  <ActionBadge action={log.action} />
                </td>

                <td className="px-6 py-3 text-gray-500">{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE */}
      <div className="md:hidden divide-y">
        {logs.map((log) => (
          <div key={log._id} className="p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {new Date(log.createdAt).toLocaleString()}
              </span>
              <ActionBadge action={log.action} />
            </div>

            <div className="font-medium">
              {log.userId?.nome || log.email || "—"}
            </div>

            <div className="text-xs text-gray-500">{log.ip}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const map: Record<string, string> = {
    LOGIN_SUCCESS: "bg-green-100 text-green-700",
    LOGIN_FAILED: "bg-red-100 text-red-700",
    ACCESS_DENIED: "bg-yellow-100 text-yellow-700",
    USER_BLOCKED: "bg-red-100 text-red-700",
    USER_UNBLOCKED: "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        map[action] || "bg-gray-100 text-gray-600"
      }`}
    >
      {action}
    </span>
  );
}
