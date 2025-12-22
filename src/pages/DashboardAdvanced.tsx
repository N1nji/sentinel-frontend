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
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import { RefreshCw, BrainCircuit, LineChart as ForecastIcon, AlertTriangle } from "lucide-react";

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

  return `📊 RELATÓRIO DE PREVISÃO DE DEMANDA

📈 MÉTRICAS DE CONSUMO
• Média Mensal: ${result.avg.toFixed(2)} unidades
• Base Histórica: ${result.values.join(" → ") || "Sem dados"}

🔮 PROJEÇÃO PARA ${meses} MESES
• Demanda Estimada: ${totalPrevisto} unidades distribuídas

💡 RECOMENDAÇÃO ESTRATÉGICA
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
    const handler = () => loadDashboard();
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
    const originalText = resp?.insights || "Sem resposta da IA.";

    // MELHORIA: Regex mais inteligente. 
    // ^\s* -> Garante que só pega o marcador se for no INÍCIO da linha
    const cleanText = originalText
      .replace(/^\s*[\d\.]+\s*/gm, '💡 ') // Troca "1." por lâmpada
      .replace(/^\s*[•*-]\s*/gm, '  • '); // Mantém bullet points normais para não virar tudo título

    const formattedInsights = `📊 ANÁLISE ESTRATÉGICA DA IA

${cleanText}

---
Gerado automaticamente pelo motor de IA Sentinel.`;
    
    setInsightsText(formattedInsights);
    setInsightsOpen(true);
  } catch (err) {
    setInsightsText("⚠️ Não foi possível processar os insights agora. Tente novamente em instantes.");
    setInsightsOpen(true);
  } finally {
    setInsightsLoading(false);
  }
}

async function handleForecast(epiId: string | undefined) {
  if (!epiId) return; // Filtro já validado pela interface

  try {
    setForecastLoading(true);
    const result = await fetchForecast(epiId, 12, 3);
    
    // Validar se o backend retornou valores zerados
    if (!result.values || result.values.length < 2) {
      setInsightsText(`⚠️ DADOS INSUFICIENTES

A inteligência ainda não possui histórico de movimentação suficiente para este EPI específico para gerar uma previsão confiável.

💡 Recomendação: Continue registrando as entregas normalmente. O sistema precisa de pelo menos 2 a 3 meses de histórico para calcular a tendência de consumo.`);
      setInsightsOpen(true);
      return;
    }

    setInsightsText(buildForecastText(result));
    setInsightsOpen(true);
  } catch (err) {
    // Em vez de alert genérico, explica o que pode ter ocorrido
    setInsightsText(`📌 AVISO DE PROCESSAMENTO

Não conseguimos calcular a previsão para este item. Isso geralmente acontece quando:
1. O item é novo no estoque.
2. Não houve consumo nos últimos meses.

Tente selecionar um EPI com maior volume de saídas.`);
    setInsightsOpen(true);
  } finally {
    setForecastLoading(false);
  }
}
  if (loading) return <div className="p-10 text-center animate-pulse text-gray-500">🚀 Sincronizando dados...</div>;
  if (!data) return <div className="p-10 text-center text-red-500">❌ Falha na conexão com o servidor.</div>;

  return (
    <div className="space-y-6 pb-10">
      {/* PAINEL DE FILTROS */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100">
        <FiltersPanel filters={filters} setFilters={setFilters} setores={setores} epis={epis} />
      </section>

      {/* KPIs - Agora com ícones e melhor acabamento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard label="Total de Entregas" value={data.kpis.totalEntregas} color="bg-indigo-600" />
        <KpiCard label="Unidades Distribuídas" value={data.kpis.totalUnidades} color="bg-emerald-600" />
        <KpiCard label="Itens em Crítico" value={data.estoqueCritico.length} color="bg-rose-600" />
      </div>

      {/* AÇÕES DE IA & REFRESH - Centralizado e moderno */}
      <div className="flex flex-wrap gap-3 bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
        <button onClick={loadDashboard} className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg border shadow-sm transition-all active:scale-95">
          <RefreshCw size={18} /> <span className="font-medium">Atualizar</span>
        </button>

        <button 
          onClick={handleGenerateInsights} 
          disabled={insightsLoading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50"
        >
          <BrainCircuit size={18} /> 
          <span className="font-medium">{insightsLoading ? "Analisando..." : "Insights IA"}</span>
        </button>

        <button 
          onClick={() => handleForecast(epis[0]?._id)} 
          disabled={forecastLoading}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50"
        >
          <ForecastIcon size={18} /> 
          <span className="font-medium">{forecastLoading ? "Calculando..." : "Previsão de Demanda"}</span>
        </button>
      </div>

      {/* GRÁFICOS PRINCIPAIS */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="📊 Evolução Mensal de Entregas">
          <div className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={4} dot={{r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="🥧 Distribuição por EPI (Top)">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="total" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5}>
                  {pieData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="none" />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* GRÁFICO DE BARRAS TOTAL */}
      <Card title="🏢 Entregas Consolidadas por Setor">
        <div className="h-[350px] w-full pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.entregasPorSetor}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="_id" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#f8fafc'}} />
              <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* RANKING E ESTOQUE CRÍTICO */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="🏆 Ranking de Consumo por Colaborador">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 font-semibold text-gray-500 text-sm italic pl-2">Colaborador</th>
                    <th className="pb-3 font-semibold text-gray-500 text-sm italic text-right pr-2">Total Entregue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.rankingColabs.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 pl-2 text-gray-700 font-medium">
                        <span className="text-gray-300 mr-2 text-xs font-mono">#{i+1}</span> {r._id}
                      </td>
                      <td className="py-3 pr-2 text-right font-bold text-indigo-600">{r.total} <span className="text-[10px] text-gray-400 font-normal">un</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div>
          <Card title="⚠️ Estoque Crítico">
            <div className="space-y-3">
              {data.estoqueCritico.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-3xl mb-2 text-emerald-500">✅</div>
                  <p className="text-sm text-gray-500">Tudo sob controle no estoque!</p>
                </div>
              ) : (
                data.estoqueCritico.map((epi) => (
                  <div key={epi._id} className="flex items-center justify-between p-3 bg-rose-50 border border-rose-100 rounded-lg">
                    <div>
                      <div className="text-sm font-bold text-rose-900">{epi.nome}</div>
                      <div className="text-xs text-rose-700 font-medium">Qtd Atual: {epi.estoque}</div>
                    </div>
                    <AlertTriangle size={20} className="text-rose-500" />
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