import axios from "axios";
const API = "http://localhost:4000";

export async function criarChat(titulo = "Nova conversa") {
  const token = localStorage.getItem("token");
  const res = await axios.post(`${API}/chat/novo`, { titulo }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
}
export async function listarChats() {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API}/chat`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
}
export async function getChat(id:string) {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API}/chat/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
}
export async function enviarMensagem(chatId:string, content:string) {
  const token = localStorage.getItem("token");
  const res = await axios.post(`${API}/chat/${chatId}/mensagem`, { content }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
}
export async function deletarChat(chatId:string) {
  const token = localStorage.getItem("token");
  const res = await axios.delete(`${API}/chat/${chatId}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
}
export async function renomearChat(chatId:string, titulo:string) {
  const token = localStorage.getItem("token");
  const res = await axios.put(`${API}/chat/${chatId}/rename`, { titulo }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
}
export async function exportChatPdf(chatId:string) {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API}/chat/${chatId}/export`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob"
  });
  return res.data;
}
