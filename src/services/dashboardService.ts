// src/services/dashboardService.ts

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// -------------------------
// TIPAGENS CORRETAS
// -------------------------
export interface DashboardPayload {
  kpis: {
    totalEntregas: number;
    totalUnidades: number;
  };
  entregasPorMes: { _id: any; total?: number; count?: number }[];
  topEpis: { _id: string; total: number }[]; // <-- CORRETO
  entregasPorSetor: { _id: string; total: number }[];
  rankingColabs: { _id: string; total: number }[];
  estoqueCritico: { _id: string; nome: string; estoque: number }[];
}

// -------------------------
// DASHBOARD ADVANCED
// -------------------------
export async function fetchDashboardAdvanced(params: Record<string, string>) {
  const token = localStorage.getItem("token");
  const query = new URLSearchParams(params).toString();

  const res = await fetch(`${API_URL}/dashboard/advanced?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return await res.json();
}

// -------------------------
// FORECAST — rota corrigida
// -------------------------
export async function fetchForecast(epiId: string, months: number, future: number) {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${API_URL}/forecast/epi/${epiId}/forecast?months=${months}&future=${future}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return await res.json();
}

// -------------------------
// INSIGHTS IA
// -------------------------
export async function generateInsights(resumoDados: string) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/insights`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ resumoDados }),
  });

  return await res.json();
}
