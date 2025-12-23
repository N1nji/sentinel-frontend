import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import { 
  RefreshCw, 
  BrainCircuit, 
  LineChart as ForecastIcon, 
  AlertTriangle,
  ClipboardList,
  PackageSearch,
  AlertOctagon,
  CheckCircle2,
  Zap,
  Award,
} from "lucide-react";

import Card from "../components/Card";
import KpiCard from "../components/KpiCard";
import FiltersPanel, { type Filters } from "../components/FiltersPanel";
import InsightsModal from "../components/InsightsModal";

import type { DashboardPayload } from "../services/dashboardService";
import {
  fetchDashboardAdvanced,
  fetchForecast,
  generateInsights,
} from "../services/dashboardService";

const API_URL = import.meta.env.VITE_API_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

const PALETTE = ["#6366f1", "#10b981", "#f43f5e", "#f59e0b", "#3b82f6", "#8b5cf6"];

function buildForecastText(result: { avg: number; values: number[]; forecast: number[] }) {
  const meses = result.forecast.length;
  const totalPrevisto = result.forecast.reduce((a, b) => a + b, 0);
  const estoqueMinimo = totalPrevisto + 2;

  return `RELATÓRIO DE PREVISÃO DE DEMANDA

MÉTRICAS DE CONSUMO
• Média Mensal: ${result.avg.toFixed(2)} unidades
• Base Histórica: ${result.values.join(" → ") || "Sem dados"}

PROJEÇÃO PARA ${meses} MESES
• Demanda Estimada: ${totalPrevisto} unidades distribuídas

RECOMENDAÇÃO ESTRATÉGICA
Para garantir a segurança operacional e evitar rupturas, recomendamos manter um estoque de segurança de no mínimo ${estoqueMinimo} unidades.

---
Gerado automaticamente pelo motor de IA Sentinel.`;
}

export default function DashboardAdvanced() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [setores, setSetores] = useState<{ _id: string; nome: string }[]>([]);
  const [epis, setEpis] = useState<{ _id: string; nome: string }[]>([]);
  const [filters, setFilters] = useState<Filters>({
    from: dayjs().startOf("month").format("YYYY-MM-DD"),
    to: dayjs().format("YYYY-MM-DD"),
    setorId: "",
    epiId: "",
  });

  const [insightsOpen, setInsightsOpen] = useState(false);
  const [insightsText, setInsightsText] = useState("");
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [forecastLoading, setForecastLoading] = useState(false);
  
  // --- NOVA FEATURE: ESTADO DE ALERTA ---
  const [newAlert, setNewAlert] = useState(false);
  // --------------------------------------

  const socketRef = useRef<Socket | null>(null);

  async function loadFilters() {
    try {
      const token = localStorage.getItem("token");
      const [sRes, eRes] = await Promise.all([
        fetch(`${API_URL}/setores`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        fetch(`${API_URL}/epis`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      ]);
      setSetores(sRes);
      setEpis(eRes);
    } catch (err) {
      console.error("Erro ao carregar filtros:", err);
    }
  }

  async function loadDashboard() {
    try {
      setLoading(true);
      const params: Record<string, string> = { from: filters.from, to: filters.to };
      if (filters.setorId) params.setorId = filters.setorId;
      if (filters.epiId) params.epiId = filters.epiId;
      const payload = await fetchDashboardAdvanced(params);
      setData(payload);
    } catch (err) {
      console.error("Erro carregando dashboard:", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFilters();
    loadDashboard();
    
    socketRef.current = io(SOCKET_URL);
    
    const handler = (payload: any) => {
      console.log("📡 EVENTO RECEBIDO:", payload);

      // --- NOVA FEATURE: SOM E PULSE NO HANDLER ---
      const audio = new Audio("https://cdn.pixabay.com/audio/2022/03/15/audio_730248443e.mp3");
      audio.volume = 0.7;
      audio.play().catch(_e => console.warn("Áudio bloqueado pelo navegador. Clique na tela para liberar."));
      
      setNewAlert(true);
      loadDashboard();
      
      // Remove o alerta visual após 8 segundos
      setTimeout(() => setNewAlert(false), 8000);
      // --------------------------------------------
    };

    socketRef.current.on("nova_entrega", handler);
    
    return () => {
      socketRef.current?.off("nova_entrega", handler);
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [filters]);

  const pieData = (data?.topEpis ?? []).map((p) => ({ name: p._id, total: p.total }));
  const lineData = (data?.entregasPorMes ?? []).map((m) => ({
    mes: m._id?.year ? `${m._id.year}-${String(m._id.month).padStart(2, "0")}` : String(m._id),
    total: m.count ?? m.total ?? 0,
  }));

  async function handleGenerateInsights() {
    if (!data) return;
    try {
      setInsightsLoading(true);
      const resumo = [
        "Top EPIs:", 
        ...data.topEpis.slice(0, 5).map((e) => `${e._id} = ${e.total}`), 
        "\nTop Setores:", 
        ...data.entregasPorSetor.slice(0, 5).map((s) => `${s._id} = ${s.total}`)
      ].join("\n");
      
      const resp = await generateInsights(resumo);
      let txt = resp?.insights || "Sem resposta da IA.";

      txt = txt.replace(/\*\*/g, '');
      txt = txt.replace(/^\s*\d\.\s*(.*Insights.*)/gim, 'ANÁLISE $1');
      txt = txt.replace(/^\s*\d\.\s*(.*Ações.*)/gim, 'AÇÕES $1');
      txt = txt.replace(/^\s*\d\.\s*(.*Sugestão.*)/gim, 'SUGESTÃO $1');

      const formattedInsights = `ANÁLISE ESTRATÉGICA SENTINEL

${txt.replace(/^\s*[-•*]\s*/gm, '  • ')}

---
Gerado automaticamente pelo motor de IA Sentinel.`;
      
      setInsightsText(formattedInsights);
      setInsightsOpen(true);
    } catch (err) {
      setInsightsText("Erro ao gerar insights.");
      setInsightsOpen(true);
    } finally {
      setInsightsLoading(false);
    }
  }

  async function handleForecast(epiId: string | undefined) {
    if (!epiId) {
      setInsightsText(`SELECIONE UM EPI\n\nPara gerar uma previsão de demanda, você precisa selecionar um item específico no filtro de EPIs acima.`);
      setInsightsOpen(true);
      return;
    }
    try {
      setForecastLoading(true);
      const result = await fetchForecast(epiId, 12, 3);
      if (!result || !result.values || result.values.length < 2) {
        setInsightsText(`DADOS INSUFICIENTES\n\nNão encontramos histórico de entregas suficiente para este EPI.`);
        setInsightsOpen(true);
        return;
      }
      setInsightsText(buildForecastText(result));
      setInsightsOpen(true);
    } catch (err) {
      setInsightsText(`FALHA NO PROCESSAMENTO\n\nOcorreu um erro ao tentar calcular a previsão de demanda.`);
      setInsightsOpen(true);
    } finally {
      setForecastLoading(false);
    }
  }
  
  if (loading) return (
    <div className="p-10 text-center flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <RefreshCw className="animate-spin text-indigo-600 h-10 w-10" />
      <p className="font-black uppercase tracking-widest text-[10px] text-slate-400">Sincronizando Sentinel...</p>
    </div>
  );

  if (!data) return <div className="p-10 text-center text-rose-500 font-black">FALHA NA CONEXÃO COM O SERVIDOR.</div>;

  return (
    <div className="space-y-8 pb-10 relative">
      
      {/* --- NOVA FEATURE: NOTIFICAÇÃO FLOATING --- */}
      {newAlert && (
        <div className="fixed bottom-10 right-10 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-indigo-600 text-white px-6 py-4 rounded-[2rem] shadow-2xl shadow-indigo-500/50 flex items-center gap-4 border border-indigo-400">
            <div className="bg-white/20 p-2 rounded-xl animate-pulse">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">Sentinel Real-time</p>
              <p className="text-xs font-bold">Nova entrega registrada!</p>
            </div>
          </div>
        </div>
      )}
      {/* ------------------------------------------ */}

      {/* PAINEL DE FILTROS */}
      <section className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
        <FiltersPanel filters={filters} setFilters={setFilters} setores={setores} epis={epis} />
      </section>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard 
          label="Total de Entregas" 
          value={data.kpis.totalEntregas} 
          color="indigo" 
          icon={<ClipboardList size={24} />}
          trend="Fluxo Ativo"
        />
        <KpiCard 
          label="Unidades Distribuídas" 
          value={data.kpis.totalUnidades} 
          color="emerald" 
          icon={<PackageSearch size={24} />}
          trend="Monitorado"
        />
        <KpiCard 
          label="Itens em Crítico" 
          value={data.estoqueCritico.length} 
          color="rose" 
          icon={<AlertOctagon size={24} />}
          trend="Urgência"
        />
      </div>

      {/* BARRA DE IA E AÇÕES */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-6 rounded-[2rem] shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/40">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h3 className="text-white font-black text-xs uppercase tracking-[0.2em]">Motor de IA Sentinel</h3>
            <p className="text-indigo-300 text-[10px] font-bold uppercase opacity-70">Inteligência Preditiva</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={loadDashboard} className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 border border-slate-700">
            <RefreshCw size={14} /> Atualizar
          </button>

          <button 
            onClick={handleGenerateInsights} 
            disabled={insightsLoading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {insightsLoading ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />} 
            {insightsLoading ? "Analisando..." : "Gerar Insights"}
          </button>

          <button 
            onClick={() => handleForecast(filters.epiId || epis[0]?._id)} 
            disabled={forecastLoading}
            className="bg-amber-500 hover:bg-amber-400 text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            <ForecastIcon size={14} /> {forecastLoading ? "Calculando..." : "Previsão IA"}
          </button>
        </div>
      </div>

      {/* GRÁFICOS */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card title="Evolução de Consumo">
          <div className="h-[320px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={4} dot={{r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Mix de Equipamentos">
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={pieData} 
                  dataKey="total" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={70} 
                  outerRadius={100} 
                  paddingAngle={8}
                  cornerRadius={10}
                >
                  {pieData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="none" />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* RANKING E ALERTAS */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card title="Ranking de Requisições">
            <div className="mt-4 space-y-2">
              {data.rankingColabs.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-700 text-[10px] font-black text-slate-500">
                      {i === 0 ? <Award size={14} className="text-amber-500" /> : `#${i+1}`}
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-tight">{r._id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-indigo-600">{r.total}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">UN</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card title="Status de Suprimentos">
            <div className="mt-4 space-y-3">
              {data.estoqueCritico.length === 0 ? (
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-8 rounded-[2rem] text-center border border-emerald-100 dark:border-emerald-900/30">
                  <div className="h-12 w-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-200">
                    <CheckCircle2 size={24} />
                  </div>
                  <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest leading-tight">Operação Segura<br/>Sem Rupturas</p>
                </div>
              ) : (
                data.estoqueCritico.map((epi) => (
                  <div key={epi._id} className="p-4 bg-rose-300 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-rose-500 rounded-lg text-white shadow-lg">
                        <AlertTriangle size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-rose-900 dark:text-rose-200 uppercase tracking-tighter leading-none mb-1">{epi.nome}</p>
                        <p className="text-xs font-black text-rose-600 uppercase">Qtd: {epi.estoque}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      <InsightsModal open={insightsOpen} onClose={() => setInsightsOpen(false)} text={insightsText} />
    </div>
  );
}