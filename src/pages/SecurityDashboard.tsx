import { useEffect, useMemo, useState } from "react";
import type { SecurityLog } from "../types/SecurityLog";
import {
  getSecurityLogs,
  listarUsuarios,
  encerrarSessao,
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
  User,
  RefreshCcw,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { toast } from "sonner";

interface Usuario {
  _id: string;
  nome: string;
  email: string;
  status: string;
  tipo?: string;
}

export default function SecurityDashboard() {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔐 Admin master (simples e funcional)
  const loggedUser = JSON.parse(localStorage.getItem("usuario") || "{}");
  const isAdminMaster = loggedUser?.email === "SEU_EMAIL_ADMIN@EMAIL.COM";

  async function loadData() {
    setLoading(true);
    try {
      const logsRes = await getSecurityLogs({ limit: 100 });
      const usersRes = await listarUsuarios();
      setLogs(logsRes.logs || []);
      setUsuarios(usersRes || []);
    } catch (err) {
      toast.error("Erro ao carregar dados de segurança");
    } finally {
      setLoading(false);
    }
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
      const day = new Date(log.createdAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });
      map[day] = (map[day] || 0) + 1;
    });
    return Object.entries(map).map(([day, value]) => ({ day, value }));
  }, [logs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 animate-pulse" />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 space-y-8">

      {/* HEADER */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-600 text-white">
            <Shield size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">
              Centro de Segurança
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Monitoramento do ecossistema Sentinel
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border rounded-xl"
        >
          <RefreshCcw size={16} />
          Sincronizar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SecurityKpiCard label="Logins Sucesso" value={kpis.success} color="green" icon={<LogIn />} />
        <SecurityKpiCard label="Tentativas Falhas" value={kpis.failed} color="red" icon={<AlertCircle />} />
        <SecurityKpiCard label="Usuários Bloqueados" value={kpis.blocked} color="yellow" icon={<UserX />} />
      </div>

      {/* GRÁFICO */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8">
        <div className="flex items-center gap-3 mb-6">
          <Activity size={20} />
          <h3 className="text-xl font-bold">Frequência de Acesso</h3>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeOpacity={0.05} />
            <XAxis dataKey="day" />
            <YAxis hide />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#6366f1"
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* LOGS */}
      <SecurityLogsTable logs={logs} />

      {/* CONTROLE DE SESSÕES */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6">
        <h3 className="text-xl font-bold mb-6">Controle de Sessões</h3>

        <div className="space-y-4">
          {usuarios.map(u => {
            const podeGerenciar =
              u.tipo !== "admin" || isAdminMaster;

            return (
              <div
                key={u._id}
                className="flex flex-col md:flex-row justify-between gap-4 p-4 border rounded-2xl"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
                    <User />
                  </div>
                  <div>
                    <p className="font-bold">{u.nome}</p>
                    <p className="text-sm text-slate-500">{u.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <UserStatusBadge status={u.status} />

                  {podeGerenciar && (
                    <>
                      <BlockUserButton
                        userId={u._id}
                        status={u.status}
                        onSuccess={() => {
                          toast.success("Status do usuário atualizado");
                          loadData();
                        }}
                      />

                      <button
                        onClick={async () => {
                          try {
                            await encerrarSessao(u._id);
                            toast.success("Sessão encerrada com sucesso");
                            loadData();
                          } catch {
                            toast.error("Você não tem permissão para essa ação");
                          }
                        }}
                        className="p-2 rounded-xl hover:bg-rose-100"
                      >
                        <LogOut size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
