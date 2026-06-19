import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/register", { name, email, password });
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>💰 Expense Tracker</h2>
        <p style={styles.subtitle}>Create your account</p>
        {error && <p style={styles.error}>{error}</p>}
        <input style={styles.input} type="text" placeholder="Name"
          value={name} onChange={(e) => setName(e.target.value)} />
        <input style={styles.input} type="email" placeholder="Email"
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <input style={styles.input} type="password" placeholder="Password"
          value={password} onChange={(e) => setPassword(e.target.value)} />
        <button style={styles.button} onClick={handleRegister} disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
        <p style={styles.link}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh", display: "flex",
    alignItems: "center", justifyContent: "center",
    background: "#0a0f0a",
  },
  card: {
    background: "#0f1a0f", padding: "2.5rem", borderRadius: "16px",
    border: "1px solid #1a2e1a", width: "100%", maxWidth: "400px",
    display: "flex", flexDirection: "column", gap: "1rem",
    boxShadow: "0 0 40px rgba(74,222,128,0.05)",
  },
  title: { textAlign: "center", margin: 0, fontSize: "26px", color: "#4ade80", fontWeight: 700 },
  subtitle: { textAlign: "center", margin: 0, fontSize: "14px", color: "#4b5563" },
  input: {
    padding: "0.75rem 1rem", borderRadius: "10px",
    border: "1px solid #1f2f1f", background: "#0a0f0a",
    color: "#e5e5e5", fontSize: "14px", outline: "none",
  },
  button: {
    padding: "0.75rem", borderRadius: "10px",
    background: "#16a34a", color: "#fff",
    border: "none", fontSize: "15px", fontWeight: 600, cursor: "pointer",
  },
  error: { color: "#f87171", fontSize: "13px", margin: 0, textAlign: "center" },
  link: { textAlign: "center", fontSize: "13px", color: "#6b7280" },
};