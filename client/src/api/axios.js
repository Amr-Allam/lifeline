import axios from "axios";

// Single axios instance used by every API call.
// VITE_API_URL comes from client/.env (see .env.example).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach the JWT (saved at login/register) to every request as a Bearer token.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
