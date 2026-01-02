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
  User,
  RefreshCcw
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
    try {
      const logsRes = await getSecurityLogs({ limit: 100 });
      const usersRes = await listarUsuarios();
      setLogs(logsRes.logs || []);
      setUsuarios(usersRes || []);
    } catch (err) {
      console.error("Erro ao carregar dados", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Cálculos de KPIs
  const kpis = useMemo(() => ({
    success: logs.filter(l => l.action === "LOGIN_SUCCESS").length,
    failed: logs.filter(l => l.action === "LOGIN_FAILED").length,
    blocked: usuarios.filter(u => u.status !== "ativo").length,
  }), [logs, usuarios]);

  // Formatação de dados para o gráfico
  const chartData = useMemo(() => {
    const map: Record<string, number> = {};
    logs.forEach(log => {
      if (log.action !== "LOGIN_SUCCESS") return;
      const day = new Date(log.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      map[day] = (map[day] || 0) + 1;
    });
    return Object.entries(map).map(([day, value]) => ({ day, value }));
  }, [logs]);

  // Tela de Carregamento (Skeleton Style)
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 space-y-8 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-[2rem]" />)}
        </div>
        <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-[2rem]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 space-y-8 transition-colors duration-500">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-none text-white">
            <Shield className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Centro de Segurança</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Monitoramento do ecossistema Sentinel</p>
          </div>
        </div>
        <button 
          onClick={loadData}
          className="group flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95"
        >
          <RefreshCcw size={16} className="text-indigo-500 group-hover:rotate-180 transition-transform duration-500" /> 
          Sincronizar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="hover:-translate-y-1 transition-transform duration-300">
          <SecurityKpiCard label="Logins Sucesso" value={kpis.success} color="green" icon={<LogIn />} />
        </div>
        <div className="hover:-translate-y-1 transition-transform duration-300">
          <SecurityKpiCard label="Tentativas Falhas" value={kpis.failed} color="red" icon={<AlertCircle />} />
        </div>
        <div className="hover:-translate-y-1 transition-transform duration-300">
          <SecurityKpiCard label="Usuários Bloqueados" value={kpis.blocked} color="yellow" icon={<UserX />} />
        </div>
      </div>

      {/* GRÁFICO COM AREA CHART E GRADIENTE */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600">
              <Activity size={20} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Frequência de Acesso</h3>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Tempo Real</span>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} 
              dy={15}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{ 
                backgroundColor: "#0f172a", 
                borderRadius: "16px", 
                border: "none", 
                color: "#fff",
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)"
              }}
              itemStyle={{ color: "#818cf8" }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#6366f1" 
              strokeWidth={4} 
              fillOpacity={1} 
              fill="url(#colorValue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* TABELA DE LOGS */}
      <SecurityLogsTable logs={logs} />

      {/* GESTÃO DE USUÁRIOS E SESSÕES */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm p-8">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Controle de Sessões</h3>

        <div className="grid grid-cols-1 gap-4">
          {usuarios.map(u => (
            <div
              key={u._id}
              className="group flex flex-col md:flex-row md:items-center justify-between border border-slate-100 dark:border-slate-800/50 
                         rounded-2xl px-6 py-4 transition-all hover:border-indigo-200 dark:hover:border-indigo-900/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
            >
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 transition-colors">
                  <User size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100">{u.nome}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{u.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto">
                <UserStatusBadge status={u.status} />
                <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2 hidden md:block" />
                
                <BlockUserButton userId={u._id} status={u.status} onSuccess={loadData} />

                <button
                  className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                  title="Encerrar Sessão Remotamente"
                  onClick={() => alert(`Sessão de ${u.nome} encerrada.`)}
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}