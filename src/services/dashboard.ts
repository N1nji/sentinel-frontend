import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export async function getDashboard() {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API_URL}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}
