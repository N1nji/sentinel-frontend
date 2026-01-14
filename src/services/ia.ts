import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

interface IHistorico {
  role: "user" | "assistant";
  content: string;
}

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
// IA — CHAT COM CONTEXTO DO SISTEMA
// (colaboradores, setores, EPIs, NR-38)
// ================================
export async function chatComContext(mensagem: string, historico: IHistorico[] = []
): Promise<string> {
  const token = localStorage.getItem("token");

  const res = await axios.post(
    `${API_URL}/ia-context/context`,
    { mensagem, historico },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.data.resposta;
}
