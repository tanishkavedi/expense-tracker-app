import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>💰 Expense Tracker</h2>
        <p style={styles.subtitle}>Login to your account</p>
        {error && <p style={styles.error}>{error}</p>}
        <input style={styles.input} type="email" placeholder="Email"
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <input style={styles.input} type="password" placeholder="Password"
          value={password} onChange={(e) => setPassword(e.target.value)} />
        <button style={styles.button} onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        <p style={styles.link}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh", display: "flex",
    alignItems: "center", justifyContent: "center", background: "#0f0f0f",
  },
  card: {
    background: "#1a1a1a", padding: "2.5rem", borderRadius: "16px",
    border: "1px solid #2a2a2a", width: "100%", maxWidth: "400px",
    display: "flex", flexDirection: "column", gap: "1rem",
  },
  title: { textAlign: "center", margin: 0, fontSize: "24px", color: "#ffffff" },
  subtitle: { textAlign: "center", margin: 0, fontSize: "14px", color: "#6b7280" },
  input: {
    padding: "0.75rem 1rem", borderRadius: "10px",
    border: "1px solid #2e2e2e", background: "#121212",
    color: "#e5e5e5", fontSize: "14px",
  },
  button: {
    padding: "0.75rem", borderRadius: "10px", background: "#4F46E5",
    color: "#fff", border: "none", fontSize: "15px", cursor: "pointer",
  },
  error: { color: "#f87171", fontSize: "13px", margin: 0, textAlign: "center" },
  link: { textAlign: "center", fontSize: "13px", color: "#9ca3af" },
};