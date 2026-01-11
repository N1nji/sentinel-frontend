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

  // 🔐 Admin master
  const loggedUser = JSON.parse(localStorage.getItem("usuario") || "{}");
  const MASTER_ADMIN_EMAIL = import.meta.env.VITE_MASTER_ADMIN_EMAIL;
  const isAdminMaster = loggedUser?.email === MASTER_ADMIN_EMAIL;

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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 space-y-8 animate-pulse">
        <div className="h-20 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-[2rem]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 space-y-8 transition-colors duration-500">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-none text-white">
            <Shield size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Centro de Segurança</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Monitoramento do ecossistema Sentinel</p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="group flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95"
        >
          <RefreshCcw size={18} className="text-indigo-500 group-hover:rotate-180 transition-transform duration-500" />
          Sincronizar Dados
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SecurityKpiCard label="Logins Sucesso" value={kpis.success} color="green" icon={<LogIn />} />
        <SecurityKpiCard label="Tentativas Falhas" value={kpis.failed} color="red" icon={<AlertCircle />} />
        <SecurityKpiCard label="Usuários Bloqueados" value={kpis.blocked} color="yellow" icon={<UserX />} />
      </div>

      {/* GRÁFICO */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600">
              <Activity size={20} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Frequência de Acesso</h3>
          </div>
          <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Tempo Real</span>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderRadius: "16px", border: "none", color: "#fff" }}
                itemStyle={{ color: "#818cf8" }}
              />
              <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABELA DE LOGS */}
      <SecurityLogsTable logs={logs} />

      {/* CONTROLE DE SESSÕES - MOBILE FRIENDLY RECUPERADO */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-8">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Controle de Sessões</h3>

        <div className="grid grid-cols-1 gap-4">
          {usuarios.map(u => {
            const podeGerenciar = u.tipo !== "admin" || isAdminMaster;

            return (
              <div
                key={u._id}
                className="group flex flex-col md:flex-row md:items-center justify-between border border-slate-100 dark:border-slate-800/50 
                           rounded-2xl p-4 md:px-6 md:py-4 transition-all hover:bg-slate-50/50 dark:hover:bg-slate-800/30 gap-4"
              >
                {/* INFO USUÁRIO */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-indigo-600 transition-colors">
                    <User size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{u.nome}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium truncate">{u.email}</p>
                  </div>
                </div>

                {/* AÇÕES */}
                <div className="flex items-center justify-between md:justify-end gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  <UserStatusBadge status={u.status} />
                  
                  {podeGerenciar && (
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 hidden md:block mx-1" />
                      
                      <BlockUserButton 
                        userId={u._id} 
                        status={u.status} 
                        onSuccess={() => {
                          toast.success("Status atualizado");
                          loadData();
                        }} 
                      />

                      <button
                        onClick={async () => {
                          try {
                            await encerrarSessao(u._id);
                            toast.success("Sessão encerrada");
                            loadData();
                          } catch {
                            toast.error("Erro ao encerrar sessão");
                          }
                        }}
                        className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all border border-transparent hover:border-rose-100"
                        title="Encerrar Sessão"
                      >
                        <LogOut size={18} />
                      </button>
                    </div>
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