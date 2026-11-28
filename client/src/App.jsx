import { Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

// Temporary home: shows who is logged in. Replaced by role dashboards and
// route guards in C6.
function Home() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (
    <main>
      <h1>LifeLine</h1>
      <p>Blood Donation and Emergency Help Network</p>
      {user ? (
        <p>
          Signed in as {user.name} ({user.role}) <button onClick={logout}>Log out</button>
        </p>
      ) : (
        <p>
          <Link to="/login">Log in</Link> | <Link to="/register">Register</Link>
        </p>
      )}
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}
