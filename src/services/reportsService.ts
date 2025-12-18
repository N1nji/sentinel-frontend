const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
}

// --------------------
// RISCOS POR SETOR
// --------------------
export async function getRiscosPorSetor(_params: any) {
  const res = await fetch(`${API_URL}/reports/riscos-por-setor`, {
    headers: authHeaders(),
  });
  return res.json();
}

// --------------------
// STATUS DOS EPIs
// --------------------
export async function getEpisStatus(_params: any) {
  const res = await fetch(`${API_URL}/reports/epis-status`, {
    headers: authHeaders(),
  });
  return res.json();
}

// --------------------
// COLABORADORES POR SETOR
// --------------------
export async function getColaboradoresPorSetor(_params: any) {
  const res = await fetch(`${API_URL}/reports/colaboradores-por-setor`, {
    headers: authHeaders(),
  });
  return res.json();
}
