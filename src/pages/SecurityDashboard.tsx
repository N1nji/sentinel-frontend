import { useEffect, useMemo, useState } from "react";
import type { SecurityLog } from "../types/SecurityLog";

import {
  getSecurityLogs,
  listarUsuarios,
} from "../services/securityService";

import SecurityKpiCard from "../components/SecurityKpiCard";
import SecurityLogsTable from "../components/SecurityLogsTable";
import BlockUserButton from "../components/BlockUserButton";
import UserStatusBadge from "../components/UserStatusBadge";

import {
  Shield,
  LogIn,
  AlertCircle,
  UserX,
  Activity,
  LogOut,
} from "lucide-react";

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

  /* ======================
     KPIs
  ====================== */
  const kpis = useMemo(() => ({
    success: logs.filter(l => l.action === "LOGIN_SUCCESS").length,
    failed: logs.filter(l => l.action === "LOGIN_FAILED").length,
    blocked: usuarios.filter(u => u.status !== "ativo").length,
  }), [logs, usuarios]);

  /* ======================
     GRÁFICO
  ====================== */
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
    return (
      <div className="p-6 text-slate-500 dark:text-slate-400">
        Carregando dados de segurança…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-6 space-y-10 transition-colors">

      {/* HEADER */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20">
          <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>

        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
            Segurança
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Monitoramento de acessos, tentativas e controle de usuários
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SecurityKpiCard
          label="Logins com sucesso"
          value={kpis.success}
          color="green"
          icon={<LogIn />}
        />

        <SecurityKpiCard
          label="Tentativas falhas"
          value={kpis.failed}
          color="red"
          icon={<AlertCircle />}
        />

        <SecurityKpiCard
          label="Usuários bloqueados"
          value={kpis.blocked}
          color="yellow"
          icon={<UserX />}
        />
      </div>

      {/* GRÁFICO */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 transition-colors">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Logins por dia
          </h3>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
            <XAxis dataKey="day" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#020617",
                borderRadius: "12px",
                border: "none",
                color: "#fff",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#6366f1"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* LOGS */}
      <SecurityLogsTable logs={logs} />

      {/* USUÁRIOS */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Usuários
        </h3>

        <div className="space-y-3">
          {usuarios.map(u => (
            <div
              key={u._id}
              className="flex justify-between items-center border border-slate-200 dark:border-slate-800
                         rounded-lg px-4 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  {u.nome}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {u.email}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <UserStatusBadge status={u.status} />

                <BlockUserButton
                  userId={u._id}
                  status={u.status}
                  onSuccess={loadData}
                />

                <button
                  className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400
                             hover:text-indigo-800 dark:hover:text-indigo-300 transition"
                  onClick={() =>
                    alert("Logout remoto será implementado no backend")
                  }
                >
                  <LogOut size={14} />
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
