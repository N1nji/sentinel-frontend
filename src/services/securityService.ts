// src/services/securityService.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
}

/* ==========================
   SECURITY LOGS
========================== */
export async function getSecurityLogs(params?: {
  page?: number;
  limit?: number;
  action?: string;
  email?: string;
}) {
  const res = await axios.get(`${API_URL}/security/logs`, {
    params,
    headers: authHeaders(),
  });
  return res.data;
}

/* ==========================
   BLOQUEAR / DESBLOQUEAR
========================== */
export async function bloquearUsuario(userId: string) {
  const res = await axios.post(
    `${API_URL}/sessions/usuarios/${userId}/bloquear`,
    {},
    { headers: authHeaders() }
  );
  return res.data;
}

export async function desbloquearUsuario(userId: string) {
  const res = await axios.post(
    `${API_URL}/sessions/usuarios/${userId}/desbloquear`,
    {},
    { headers: authHeaders() }
  );
  return res.data;
}

/* ==========================
   LOGOUT REMOTO
========================== */
export async function encerrarSessao(userId: string) {
  const res = await axios.post(
    `${API_URL}/sessions/logout/${userId}`,
    {},
    { headers: authHeaders() }
  );
  return res.data;
}

/* ==========================
   LISTAR USUÁRIOS
========================== */
export async function listarUsuarios() {
  const res = await axios.get(`${API_URL}/usuarios`, {
    headers: authHeaders(),
  });
  return res.data;
}
