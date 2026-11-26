import axios from "axios";

// Single axios instance used by every API call.
// VITE_API_URL comes from client/.env (see .env.example).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

export default api;
