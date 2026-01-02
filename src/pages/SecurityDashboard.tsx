import { useEffect, useMemo, useState } from "react";
import { type SecurityLog } from "../types/SecurityLog";

import {
  getSecurityLogs,
  listarUsuarios,
} from "../services/securityService";

import SecurityKpiCard from "../components/SecurityKpiCard";
import SecurityLogsTable from "../components/SecurityLogsTable";
import BlockUserButton from "../components/BlockUserButton";
import UserStatusBadge from "../components/UserStatusBadge";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface Usuario {
  _id: string;
  nome: string;
  email: string;
  status: string;
}

export default function SecurityDashboard() {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const logsRes = await getSecurityLogs({ limit: 100 });
    const usersRes = await listarUsuarios();

    setLogs(logsRes.logs);
    setUsuarios(usersRes);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const kpis = useMemo(() => ({
    success: logs.filter(l => l.action === "LOGIN_SUCCESS").length,
    failed: logs.filter(l => l.action === "LOGIN_FAILED").length,
    blocked: usuarios.filter(u => u.status !== "ativo").length,
  }), [logs, usuarios]);

  const chartData = useMemo(() => {
    const map: Record<string, number> = {};
    logs.forEach(log => {
      if (log.action !== "LOGIN_SUCCESS") return;
      const day = new Date(log.createdAt).toLocaleDateString();
      map[day] = (map[day] || 0) + 1;
    });
    return Object.entries(map).map(([day, value]) => ({ day, value }));
  }, [logs]);

  if (loading) {
    return <p className="p-6 text-gray-500">Carregando segurança…</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">🔐 Segurança</h1>
        <p className="text-gray-500">
          Monitoramento de acessos e controle de usuários
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SecurityKpiCard label="Logins com sucesso" value={kpis.success} color="green" />
        <SecurityKpiCard label="Tentativas falhas" value={kpis.failed} color="red" />
        <SecurityKpiCard label="Usuários bloqueados" value={kpis.blocked} color="yellow" />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">📈 Logins por dia</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <SecurityLogsTable logs={logs} />

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">👤 Usuários</h3>

        <div className="space-y-3">
          {usuarios.map(u => (
            <div key={u._id} className="flex justify-between items-center border rounded-lg px-4 py-3">
              <div>
                <div className="font-medium">{u.nome}</div>
                <div className="text-sm text-gray-500">{u.email}</div>
              </div>

              <div className="flex items-center gap-4">
                <UserStatusBadge status={u.status} />
                <BlockUserButton userId={u._id} status={u.status} onSuccess={loadData} />
                <button
                  className="text-xs text-blue-600 hover:underline"
                  onClick={() => alert("Logout remoto será implementado no backend")}
                >
                  Encerrar sessões
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
