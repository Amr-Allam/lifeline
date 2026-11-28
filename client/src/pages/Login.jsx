import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Could not reach the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>Log in</h1>
      <form onSubmit={onSubmit}>
        <p>
          <label>
            Email <input name="email" type="email" value={form.email} onChange={onChange} required />
          </label>
        </p>
        <p>
          <label>
            Password{" "}
            <input name="password" type="password" value={form.password} onChange={onChange} required />
          </label>
        </p>
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p>
        No account? <Link to="/register">Register</Link>
      </p>
    </main>
  );
}
