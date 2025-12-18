import axios from "axios";

const API_URL = "http://localhost:4000";

// ================================
// IA SIMPLES — SUGESTÃO DE EPI
// ================================
export async function sugerirEpi(risco: string): Promise<string> {
  const token = localStorage.getItem("token");

  const res = await axios.post(
    `${API_URL}/ia/sugerir`,
    { risco },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.data.resposta;
}

// ================================
// IA — CHAT LIVRE (SEM CONTEXTO)
// ================================
export async function chatLivre(mensagem: string): Promise<string> {
  const token = localStorage.getItem("token");

  const res = await axios.post(
    `${API_URL}/ia/chat`,
    { mensagem },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.data.resposta;
}

// ================================
// 🧠 IA — CHAT COM CONTEXTO DO SISTEMA
// (colaboradores, setores, EPIs, NR-38)
// ================================
export async function chatComContext(mensagem: string): Promise<string> {
  const token = localStorage.getItem("token");

  const res = await axios.post(
    `${API_URL}/ia-context/context`,
    { mensagem },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.data.resposta;
}
