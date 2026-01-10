import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// 🔐 INTERCEPTOR GLOBAL — LOGOUT REMOTO
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      error.response?.data?.erro === "Sessão encerrada"
    ) {
      // Remove token
      localStorage.removeItem("token");

      // Redireciona para login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);
