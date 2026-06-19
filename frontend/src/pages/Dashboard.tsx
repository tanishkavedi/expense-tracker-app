import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

interface Category {
  id: number;
  name: string;
  type: "income" | "expense";
}

interface Transaction {
  id: number;
  category_id: number;
  category_name: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  date: string;
}

interface Summary {
  total_income: number;
  total_expense: number;
  balance: number;
}

const emptyForm = {
  category_id: 0,
  type: "expense" as "income" | "expense",
  amount: 0,
  description: "",
  date: new Date().toISOString().split("T")[0],
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<Summary>({ total_income: 0, total_expense: 0, balance: 0 });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", type: "expense" as "income" | "expense" });
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchAll = async () => {
    try {
      const [tRes, cRes, sRes] = await Promise.all([
        api.get("/transactions"),
        api.get("/categories"),
        api.get("/transactions/summary"),
      ]);
      setTransactions(tRes.data);
      setCategories(cRes.data);
      setSummary(sRes.data);
    } catch (err) {
      setError("Failed to load data");
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await api.put(`/transactions/${editingId}`, form);
      } else {
        await api.post("/transactions", form);
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      fetchAll();
    } catch (err) {
      setError("Failed to save transaction");
    }
  };

  const handleEdit = (t: Transaction) => {
    setForm({
      category_id: t.category_id,
      type: t.type,
      amount: t.amount,
      description: t.description,
      date: t.date.split("T")[0],
    });
    setEditingId(t.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this transaction?")) return;
    await api.delete(`/transactions/${id}`);
    fetchAll();
  };

  const handleAddCategory = async () => {
    try {
      await api.post("/categories", newCategory);
      setNewCategory({ name: "", type: "expense" });
      setShowCategoryForm(false);
      fetchAll();
    } catch (err) {
      setError("Failed to add category");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const filtered = filter === "all"
    ? transactions
    : transactions.filter((t) => t.type === filter);

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <h2 style={styles.navTitle}>💰 Expense Tracker</h2>
        <div style={styles.navRight}>
          <span style={styles.welcome}>Hi, {user.name}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        {error && <p style={styles.error}>{error}</p>}

        {/* Summary Cards */}
        <div style={styles.cards}>
          <div style={{ ...styles.card, borderTop: "3px solid #22c55e" }}>
            <p style={styles.cardLabel}>Total Income</p>
            <p style={{ ...styles.cardAmount, color: "#22c55e" }}>
              ₹ {Number(summary.total_income).toLocaleString()}
            </p>
          </div>
          <div style={{ ...styles.card, borderTop: "3px solid #ef4444" }}>
            <p style={styles.cardLabel}>Total Expense</p>
            <p style={{ ...styles.cardAmount, color: "#ef4444" }}>
              ₹ {Number(summary.total_expense).toLocaleString()}
            </p>
          </div>
          <div style={{ ...styles.card, borderTop: "3px solid #4F46E5" }}>
            <p style={styles.cardLabel}>Balance</p>
            <p style={{ ...styles.cardAmount, color: Number(summary.balance) >= 0 ? "#22c55e" : "#ef4444" }}>
              ₹ {Number(summary.balance).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.actions}>
          <div style={styles.filters}>
            {(["all", "income", "expense"] as const).map((f) => (
              <button key={f} style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }}
                onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button style={styles.categoryBtn} onClick={() => setShowCategoryForm(true)}>
              + Category
            </button>
            <button style={styles.addBtn} onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}>
              + Transaction
            </button>
          </div>
        </div>

        {/* Category Form Modal */}
        {showCategoryForm && (
          <div style={styles.modal}>
            <div style={styles.modalCard}>
              <h3 style={styles.modalTitle}>Add Category</h3>
              <input style={styles.input} placeholder="Category name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} />
              <select style={styles.input} value={newCategory.type}
                onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as "income" | "expense" })}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <div style={styles.modalButtons}>
                <button style={styles.cancelBtn} onClick={() => setShowCategoryForm(false)}>Cancel</button>
                <button style={styles.saveBtn} onClick={handleAddCategory}>Save</button>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Form Modal */}
        {showForm && (
          <div style={styles.modal}>
            <div style={styles.modalCard}>
              <h3 style={styles.modalTitle}>{editingId ? "Edit Transaction" : "Add Transaction"}</h3>
              <select style={styles.input} value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as "income" | "expense" })}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <select style={styles.input} value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}>
                <option value={0}>Select Category</option>
                {categories.filter(c => c.type === form.type).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <input style={styles.input} type="number" placeholder="Amount"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
              <input style={styles.input} placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <input style={styles.input} type="date" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })} />
              <div style={styles.modalButtons}>
                <button style={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
                <button style={styles.saveBtn} onClick={handleSubmit}>Save</button>
              </div>
            </div>
          </div>
        )}

        {/* Transactions List */}
        {filtered.length === 0 ? (
          <p style={styles.empty}>No transactions yet. Add your first one!</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {["Date", "Description", "Category", "Type", "Amount", "Actions"].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} style={styles.tr}>
                    <td style={styles.td}>{new Date(t.date).toLocaleDateString()}</td>
                    <td style={styles.td}>{t.description}</td>
                    <td style={styles.td}>
                      <span style={styles.badge}>{t.category_name}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.typeBadge,
                        background: t.type === "income" ? "#14532d" : "#450a0a",
                        color: t.type === "income" ? "#22c55e" : "#ef4444",
                      }}>
                        {t.type}
                      </span>
                    </td>
                    <td style={{ ...styles.td, color: t.type === "income" ? "#22c55e" : "#ef4444", fontWeight: 500 }}>
                      {t.type === "income" ? "+" : "-"} ₹{Number(t.amount).toLocaleString()}
                    </td>
                    <td style={styles.td}>
                      <button style={styles.editBtn} onClick={() => handleEdit(t)}>Edit</button>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(t.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: "100vh", background: "#0f0f0f" },
  navbar: {
    background: "#1a1a1a", padding: "1rem 2rem",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    borderBottom: "1px solid #2a2a2a",
  },
  navTitle: { color: "#ffffff", margin: 0, fontSize: "18px", fontWeight: 600 },
  navRight: { display: "flex", alignItems: "center", gap: "1rem" },
  welcome: { color: "#9ca3af", fontSize: "14px" },
  logoutBtn: {
    padding: "0.4rem 1rem", borderRadius: "8px",
    background: "transparent", color: "#9ca3af",
    border: "1px solid #2e2e2e", cursor: "pointer", fontSize: "13px",
  },
  content: { padding: "2rem" },
  cards: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" },
  card: {
    background: "#1a1a1a", borderRadius: "12px",
    padding: "1.5rem", border: "1px solid #2a2a2a",
  },
  cardLabel: { margin: "0 0 0.5rem", fontSize: "13px", color: "#6b7280" },
  cardAmount: { margin: 0, fontSize: "28px", fontWeight: 700 },
  actions: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: "1.5rem",
  },
  filters: { display: "flex", gap: "0.5rem" },
  filterBtn: {
    padding: "0.4rem 1rem", borderRadius: "20px",
    background: "#1a1a1a", color: "#9ca3af",
    border: "1px solid #2a2a2a", cursor: "pointer", fontSize: "13px",
  },
  filterActive: { background: "#4F46E5", color: "#fff", border: "1px solid #4F46E5" },
  categoryBtn: {
    padding: "0.6rem 1.2rem", borderRadius: "8px",
    background: "#1a1a1a", color: "#9ca3af",
    border: "1px solid #2e2e2e", cursor: "pointer", fontSize: "14px",
  },
  addBtn: {
    padding: "0.6rem 1.2rem", borderRadius: "8px",
    background: "#4F46E5", color: "#fff",
    border: "none", cursor: "pointer", fontSize: "14px",
  },
  error: { color: "#f87171", marginBottom: "1rem" },
  empty: { textAlign: "center", color: "#6b7280", marginTop: "3rem" },
  tableWrapper: {
    background: "#1a1a1a", borderRadius: "12px",
    overflow: "hidden", border: "1px solid #2a2a2a",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "0.75rem 1rem", textAlign: "left",
    background: "#141414", fontSize: "12px", color: "#6b7280",
    borderBottom: "1px solid #2a2a2a", textTransform: "uppercase", letterSpacing: "0.05em",
  },
  tr: { borderBottom: "1px solid #222" },
  td: { padding: "0.85rem 1rem", fontSize: "14px", color: "#e5e5e5" },
  badge: {
    padding: "0.2rem 0.6rem", borderRadius: "20px",
    background: "#2e2748", color: "#a5b4fc", fontSize: "12px",
  },
  typeBadge: { padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "12px" },
  editBtn: {
    padding: "0.3rem 0.8rem", borderRadius: "6px", marginRight: "0.5rem",
    background: "#1e1b4b", color: "#818cf8",
    border: "1px solid #312e81", cursor: "pointer", fontSize: "13px",
  },
  deleteBtn: {
    padding: "0.3rem 0.8rem", borderRadius: "6px",
    background: "#2d1515", color: "#f87171",
    border: "1px solid #7f1d1d", cursor: "pointer", fontSize: "13px",
  },
  modal: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.7)", display: "flex",
    alignItems: "center", justifyContent: "center", zIndex: 1000,
  },
  modalCard: {
    background: "#1a1a1a", borderRadius: "16px", border: "1px solid #2a2a2a",
    padding: "2rem", width: "100%", maxWidth: "480px",
    display: "flex", flexDirection: "column", gap: "0.75rem",
  },
  modalTitle: { margin: 0, fontSize: "18px", color: "#ffffff", fontWeight: 600 },
  input: {
    padding: "0.65rem 1rem", borderRadius: "8px",
    border: "1px solid #2e2e2e", background: "#121212",
    color: "#e5e5e5", fontSize: "14px",
  },
  modalButtons: { display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" },
  cancelBtn: {
    padding: "0.6rem 1.2rem", borderRadius: "8px",
    background: "#2a2a2a", color: "#9ca3af",
    border: "1px solid #333", cursor: "pointer",
  },
  saveBtn: {
    padding: "0.6rem 1.2rem", borderRadius: "8px",
    background: "#4F46E5", color: "#fff", border: "none", cursor: "pointer",
  },
};