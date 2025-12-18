// src/pages/DashboardAdvanced.tsx
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
} from "recharts";
import dayjs from "dayjs";

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

const SOCKET_URL = "http://localhost:4000";
const API_URL = "http://localhost:4000";

const PALETTE = ["#8884d8", "#82ca9d", "#ff6b6b", "#ffa502", "#2ed573", "#70a1ff"];

// 🔮 Helper — transforma forecast em texto humano
function buildForecastText(result: {
  avg: number;
  values: number[];
  forecast: number[];
}) {
  const meses = result.forecast.length;
  const totalPrevisto = result.forecast.reduce((a, b) => a + b, 0);
  const estoqueMinimo = totalPrevisto + 2;

  return `
🔮 PREVISÃO DE CONSUMO DO EPI

• Consumo médio mensal: ${result.avg} unidades
• Histórico analisado: ${result.values.join(", ") || "sem histórico"}
• Previsão para ${meses} meses: ${totalPrevisto} unidades

✅ Recomendação:
Manter pelo menos ${estoqueMinimo} unidades em estoque
para evitar ruptura.
`;
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

  // ---------------- CARREGAR SETORES + EPIS ----------------
  async function loadFilters() {
    try {
      const token = localStorage.getItem("token");

      const [sRes, eRes] = await Promise.all([
        fetch(`${API_URL}/setores`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
        fetch(`${API_URL}/epis`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
      ]);

      setSetores(sRes);
      setEpis(eRes);
    } catch (err) {
      console.error("Erro ao carregar filtros:", err);
    }
  }

  // ---------------- CARREGAR DASHBOARD ----------------
  async function loadDashboard() {
    try {
      setLoading(true);

      const params: Record<string, string> = {
        from: filters.from,
        to: filters.to,
      };

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

  // ---------------- SOCKET ----------------
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

  // ---------------- TRANSFORMAÇÕES ----------------
  const pieData = (data?.topEpis ?? []).map((p) => ({
    name: p._id,
    total: p.total,
  }));

  const lineData = (data?.entregasPorMes ?? []).map((m) => {
    if (m._id?.year && m._id?.month) {
      return {
        mes: `${m._id.year}-${String(m._id.month).padStart(2, "0")}`,
        total: m.count ?? m.total ?? 0,
      };
    }
    return { mes: String(m._id), total: m.total ?? m.count ?? 0 };
  });

  // ---------------- INSIGHTS ----------------
  async function handleGenerateInsights() {
    if (!data) return;

    try {
      setInsightsLoading(true);

      const resumo = [
        "Top EPIs:",
        ...data.topEpis.slice(0, 5).map((e) => `${e._id} = ${e.total}`),
        "\nTop Setores:",
        ...data.entregasPorSetor.slice(0, 5).map((s) => `${s._id} = ${s.total}`),
      ].join("\n");

      const resp = await generateInsights(resumo);
      setInsightsText(resp?.insights || "Sem resposta da IA.");
      setInsightsOpen(true);
    } catch (err) {
      console.error(err);
      setInsightsText("⚠️ Erro ao gerar insights.");
      setInsightsOpen(true);
    } finally {
      setInsightsLoading(false);
    }
  }

  // ---------------- FORECAST ----------------
  async function handleForecast(epiId: string | undefined) {
    if (!epiId) return alert("Selecione um EPI antes!");

    try {
      setForecastLoading(true);

      const result = await fetchForecast(epiId, 12, 3);
      const texto = buildForecastText(result);

      setInsightsText(texto);
      setInsightsOpen(true);
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar forecast.");
    } finally {
      setForecastLoading(false);
    }
  }

  // ---------------- RENDER ----------------
  if (loading) return <p>Carregando dashboard...</p>;
  if (!data) return <p>Erro ao carregar dashboard.</p>;

  return (
    <div className="space-y-6">
      <FiltersPanel filters={filters} setFilters={setFilters} setores={setores} epis={epis} />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard label="Entregas" value={data.kpis.totalEntregas} color="bg-purple-600" />
        <KpiCard label="Unidades" value={data.kpis.totalUnidades} color="bg-blue-600" />
        <KpiCard label="Críticos" value={data.estoqueCritico.length} color="bg-red-600" />
      </div>

      {/* Linha + Pizza */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Entregas por mês">
          <LineChart width={520} height={300} data={lineData}>
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <CartesianGrid />
            <Line dataKey="total" stroke="#7b2cbf" strokeWidth={3} />
          </LineChart>
        </Card>

        <Card title="Top EPIs">
          <PieChart width={350} height={300}>
            <Pie data={pieData} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {pieData.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </Card>
      </div>

      {/* Entregas por setor */}
      <Card title="Entregas por setor">
        <BarChart width={900} height={300} data={data.entregasPorSetor}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="_id" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" fill="#4361ee" />
        </BarChart>
      </Card>

      {/* Ranking & Ações */}
      <Card title="Ranking & Ações">
        <div className="flex gap-3 mb-3">
          <button className="bg-green-600 hover:bg-green-800 text-white px-3 py-2 rounded" onClick={loadDashboard}>
            Refresh
          </button>

          <button
            className="bg-indigo-600 hover:bg-blue-800 text-white px-3 py-2 rounded"
            onClick={handleGenerateInsights}
            disabled={insightsLoading || forecastLoading}
          >
            {insightsLoading ? "Gerando..." : "Gerar Insights (IA)"}
          </button>

          <button
            className="bg-yellow-600 hover:bg-yellow-800 text-white px-3 py-2 rounded"
            onClick={() => handleForecast(epis[0]?._id)}
            disabled={forecastLoading || insightsLoading}
          >
            {forecastLoading ? "Prevendo..." : "Gerar Forecast"}
          </button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Colaborador</th>
              <th className="p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.rankingColabs.map((r, i) => (
              <tr key={i} className="border-b">
                <td className="p-2">{r._id}</td>
                <td className="p-2 text-right">{r.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* EPIs críticos */}
      <Card title="EPIs em estoque crítico">
        {data.estoqueCritico.length === 0 ? (
          <p className="text-green-600">Nenhum EPI crítico 🎉</p>
        ) : (
          data.estoqueCritico.map((epi) => (
            <div key={epi._id} className="p-3 bg-white border rounded mb-2">
              <strong>{epi.nome}</strong>
              <div>Estoque: {epi.estoque}</div>
            </div>
          ))
        )}
      </Card>

      <InsightsModal open={insightsOpen} onClose={() => setInsightsOpen(false)} text={insightsText} />
    </div>
  );
}
