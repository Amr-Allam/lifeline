import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    role: "requester",
    name: "",
    email: "",
    password: "",
    phone: "",
    bloodGroup: "O+",
    city: "",
    available: true,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { role, name, email, password, phone, bloodGroup, city, available } = form;
      const body = { role, name, email, password, phone };
      if (role === "donor") Object.assign(body, { bloodGroup, city, available });

      const { data } = await api.post("/auth/register", body);
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
      <h1>Register</h1>
      <form onSubmit={onSubmit}>
        <p>
          I am a:{" "}
          <label>
            <input type="radio" name="role" value="requester" checked={form.role === "requester"} onChange={onChange} />{" "}
            Requester
          </label>{" "}
          <label>
            <input type="radio" name="role" value="donor" checked={form.role === "donor"} onChange={onChange} /> Donor
          </label>
        </p>
        <p>
          <label>
            Name <input name="name" value={form.name} onChange={onChange} required />
          </label>
        </p>
        <p>
          <label>
            Email <input name="email" type="email" value={form.email} onChange={onChange} required />
          </label>
        </p>
        <p>
          <label>
            Password{" "}
            <input name="password" type="password" value={form.password} onChange={onChange} minLength={8} required />
          </label>
        </p>
        <p>
          <label>
            Phone <input name="phone" value={form.phone} onChange={onChange} required />
          </label>
        </p>
        {form.role === "donor" && (
          <>
            <p>
              <label>
                Blood group{" "}
                <select name="bloodGroup" value={form.bloodGroup} onChange={onChange}>
                  {BLOOD_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </label>
            </p>
            <p>
              <label>
                City <input name="city" value={form.city} onChange={onChange} required />
              </label>
            </p>
            <p>
              <label>
                <input name="available" type="checkbox" checked={form.available} onChange={onChange} /> Available to
                donate
              </label>
            </p>
          </>
        )}
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
      <p>
        Already registered? <Link to="/login">Log in</Link>
      </p>
    </main>
  );
}
