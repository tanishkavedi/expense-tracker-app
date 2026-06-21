import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
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

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

interface CategoryData {
  category: string;
  type: string;
  total: number;
}

const emptyForm = {
  category_id: 0,
  type: "expense" as "income" | "expense",
  amount: 0,
  description: "",
  date: new Date().toISOString().split("T")[0],
};

const PIE_COLORS = ["#4ade80", "#22c55e", "#16a34a", "#f87171", "#ef4444", "#dc2626", "#86efac", "#fca5a5"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<Summary>({ total_income: 0, total_expense: 0, balance: 0 });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", type: "expense" as "income" | "expense" });
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
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

    
    try {
      const [mRes, cbRes] = await Promise.all([
        api.get("/transactions/monthly"),
        api.get("/transactions/category-breakdown"),
      ]);
      setMonthlyData(mRes.data);
      setCategoryData(cbRes.data);
    } catch {
      console.warn("Charts data not available yet");
    }

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

  const filtered = transactions
    .filter((t) => filter === "all" || t.type === filter)
    .filter((t) => !search || t.description.toLowerCase().includes(search.toLowerCase()) || t.category_name.toLowerCase().includes(search.toLowerCase()))
    .filter((t) => !dateFrom || t.date >= dateFrom)
    .filter((t) => !dateTo || t.date <= dateTo);

  return (
    <div style={s.page}>

      {/* Sidebar */}
      <div style={s.sidebar}>
        <div>
          <h1 style={s.logo}>💰</h1>
          <p style={s.logoText}>Expense<br />Tracker</p>
        </div>
        <nav style={s.nav}>
          {(["all", "income", "expense"] as const).map((f) => (
            <button key={f} style={{ ...s.navBtn, ...(filter === f ? s.navBtnActive : {}) }}
              onClick={() => setFilter(f)}>
              {f === "all" ? "📊" : f === "income" ? "📈" : "📉"}
              <span style={{ marginLeft: "0.6rem", textTransform: "capitalize" }}>{f}</span>
            </button>
          ))}
        </nav>
        <div style={s.sidebarBottom}>
          <p style={s.userName}>{user.name}</p>
          <p style={s.userEmail}>{user.email}</p>
          <button style={s.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Main */}
      <div style={s.main}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <h2 style={s.headerTitle}>Good day, {user.name}! 👋</h2>
            <p style={s.headerSub}>Here's your financial overview</p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button style={s.secBtn} onClick={() => setShowCategoryForm(true)}>+ Category</button>
            <button style={s.primaryBtn} onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}>
              + Transaction
            </button>
          </div>
        </div>

        {error && <p style={s.error}>{error}</p>}

        {/* Summary Cards */}
        <div style={s.summaryGrid}>
          <div style={{ ...s.summaryCard, background: "linear-gradient(135deg, #14532d, #166534)" }}>
            <p style={s.summaryLabel}>💵 Total Income</p>
            <p style={s.summaryAmount}>₹ {Number(summary.total_income).toLocaleString()}</p>
            <p style={s.summaryNote}>All time earnings</p>
          </div>
          <div style={{ ...s.summaryCard, background: "linear-gradient(135deg, #450a0a, #7f1d1d)" }}>
            <p style={s.summaryLabel}>💸 Total Expense</p>
            <p style={s.summaryAmount}>₹ {Number(summary.total_expense).toLocaleString()}</p>
            <p style={s.summaryNote}>All time spending</p>
          </div>
          <div style={{
            ...s.summaryCard,
            background: Number(summary.balance) >= 0
              ? "linear-gradient(135deg, #052e16, #14532d)"
              : "linear-gradient(135deg, #2d0a0a, #450a0a)"
          }}>
            <p style={s.summaryLabel}>🏦 Balance</p>
            <p style={{ ...s.summaryAmount, color: Number(summary.balance) >= 0 ? "#4ade80" : "#f87171" }}>
              ₹ {Number(summary.balance).toLocaleString()}
            </p>
            <p style={s.summaryNote}>{Number(summary.balance) >= 0 ? "You're doing great!" : "Overspent!"}</p>
          </div>
        </div>

        {/* Charts */}
        {monthlyData.length > 0 && (
          <div style={s.chartsGrid}>
            {/* Bar Chart */}
            <div style={s.chartCard}>
              <h3 style={s.chartTitle}>📊 Monthly Overview</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData} barGap={4}>
                  <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#0f1a0f", border: "1px solid #1a2e1a", borderRadius: "8px", color: "#e5e5e5" }}
                    formatter={(value: number) => [`₹${Number(value).toLocaleString()}`]}
                  />
                  <Bar dataKey="income" fill="#4ade80" radius={[4, 4, 0, 0]} name="Income" />
                  <Bar dataKey="expense" fill="#f87171" radius={[4, 4, 0, 0]} name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div style={s.chartCard}>
              <h3 style={s.chartTitle}>🥧 Category Breakdown</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="total"
                    nameKey="category"
                    cx="50%" cy="50%"
                    outerRadius={80}
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#0f1a0f", border: "1px solid #1a2e1a", borderRadius: "8px", color: "#e5e5e5" }}
                    formatter={(value: number) => [`₹${Number(value).toLocaleString()}`]}
                  />
                  <Legend wrapperStyle={{ color: "#6b7280", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Search & Filter */}
        <div style={s.searchBar}>
          <input style={s.searchInput} placeholder="🔍 Search by description or category..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
          <input style={s.dateInput} type="date" value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)} />
          <span style={{ color: "#6b7280", fontSize: "13px" }}>to</span>
          <input style={s.dateInput} type="date" value={dateTo}
            onChange={(e) => setDateTo(e.target.value)} />
          {(dateFrom || dateTo || search) && (
            <button style={s.clearBtn} onClick={() => { setSearch(""); setDateFrom(""); setDateTo(""); }}>
              Clear
            </button>
          )}
        </div>

        {/* Transaction Cards */}
        <div style={s.sectionHeader}>
          <h3 style={s.sectionTitle}>
            Transactions <span style={s.count}>{filtered.length}</span>
          </h3>
        </div>

        {filtered.length === 0 ? (
          <div style={s.emptyState}>
            <p style={s.emptyIcon}>🪙</p>
            <p style={s.emptyText}>No transactions found</p>
            <p style={s.emptySubText}>Try adjusting your filters or add a new transaction</p>
          </div>
        ) : (
          <div style={s.transactionGrid}>
            {filtered.map((t) => (
              <div key={t.id} style={s.transactionCard}>
                <div style={s.transactionTop}>
                  <div style={{ ...s.typeIcon, background: t.type === "income" ? "#14532d" : "#450a0a" }}>
                    {t.type === "income" ? "📈" : "📉"}
                  </div>
                  <div style={s.transactionInfo}>
                    <p style={s.transactionDesc}>{t.description || "No description"}</p>
                    <p style={s.transactionCategory}>{t.category_name}</p>
                  </div>
                  <div style={s.transactionRight}>
                    <p style={{ ...s.transactionAmount, color: t.type === "income" ? "#4ade80" : "#f87171" }}>
                      {t.type === "income" ? "+" : "-"}₹{Number(t.amount).toLocaleString()}
                    </p>
                    <p style={s.transactionDate}>
                      {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div style={s.transactionActions}>
                  <button style={s.editBtn} onClick={() => handleEdit(t)}>✏️ Edit</button>
                  <button style={s.deleteBtn} onClick={() => handleDelete(t.id)}>🗑️ Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Modal */}
      {showCategoryForm && (
        <div style={s.modal}>
          <div style={s.modalCard}>
            <h3 style={s.modalTitle}>Add Category</h3>
            <input style={s.input} placeholder="Category name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} />
            <select style={s.input} value={newCategory.type}
              onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as "income" | "expense" })}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <div style={s.modalButtons}>
              <button style={s.cancelBtn} onClick={() => setShowCategoryForm(false)}>Cancel</button>
              <button style={s.saveBtn} onClick={handleAddCategory}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showForm && (
        <div style={s.modal}>
          <div style={s.modalCard}>
            <h3 style={s.modalTitle}>{editingId ? "Edit Transaction" : "Add Transaction"}</h3>
            <select style={s.input} value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as "income" | "expense" })}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <select style={s.input} value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}>
              <option value={0}>Select Category</option>
              {categories.filter(c => c.type === form.type).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input style={s.input} type="number" placeholder="Amount" value={form.amount}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
            <input style={s.input} placeholder="Description" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input style={s.input} type="date" value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <div style={s.modalButtons}>
              <button style={s.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button style={s.saveBtn} onClick={handleSubmit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { display: "flex", minHeight: "100vh", background: "#0a0f0a" },
  sidebar: {
    width: "220px", minHeight: "100vh", background: "#0f1a0f",
    borderRight: "1px solid #1a2e1a", padding: "2rem 1rem",
    display: "flex", flexDirection: "column", justifyContent: "space-between",
    position: "sticky", top: 0, height: "100vh",
  },
  logo: { fontSize: "36px", textAlign: "center" },
  logoText: { textAlign: "center", color: "#4ade80", fontWeight: 700, fontSize: "15px", lineHeight: 1.4, marginTop: "0.5rem" },
  nav: { display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "2rem" },
  navBtn: {
    padding: "0.7rem 1rem", borderRadius: "10px",
    background: "transparent", color: "#6b7280",
    border: "none", cursor: "pointer", fontSize: "14px",
    textAlign: "left", display: "flex", alignItems: "center",
  },
  navBtnActive: { background: "#14532d", color: "#4ade80" },
  sidebarBottom: { borderTop: "1px solid #1a2e1a", paddingTop: "1rem" },
  userName: { color: "#e5e5e5", fontSize: "14px", fontWeight: 500, margin: "0 0 0.2rem" },
  userEmail: { color: "#6b7280", fontSize: "12px", margin: "0 0 0.75rem" },
  logoutBtn: {
    width: "100%", padding: "0.5rem", borderRadius: "8px",
    background: "transparent", color: "#6b7280",
    border: "1px solid #1f2f1f", cursor: "pointer", fontSize: "13px",
  },
  main: { flex: 1, padding: "2rem", overflowY: "auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" },
  headerTitle: { color: "#ffffff", fontSize: "22px", fontWeight: 700, margin: 0 },
  headerSub: { color: "#6b7280", fontSize: "14px", margin: "0.25rem 0 0" },
  primaryBtn: {
    padding: "0.6rem 1.2rem", borderRadius: "8px",
    background: "#16a34a", color: "#fff",
    border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 500,
  },
  secBtn: {
    padding: "0.6rem 1.2rem", borderRadius: "8px",
    background: "#0f1a0f", color: "#4ade80",
    border: "1px solid #16a34a", cursor: "pointer", fontSize: "14px",
  },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "2rem" },
  summaryCard: { borderRadius: "16px", padding: "1.5rem", border: "1px solid #1a2e1a" },
  summaryLabel: { margin: "0 0 0.5rem", fontSize: "13px", color: "rgba(255,255,255,0.7)" },
  summaryAmount: { margin: "0 0 0.25rem", fontSize: "26px", fontWeight: 700, color: "#fff" },
  summaryNote: { margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.5)" },
  chartsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" },
  chartCard: { background: "#0f1a0f", borderRadius: "12px", border: "1px solid #1a2e1a", padding: "1.5rem" },
  chartTitle: { color: "#e5e5e5", fontSize: "14px", fontWeight: 600, margin: "0 0 1rem" },
  searchBar: { display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap" },
  searchInput: {
    flex: 1, padding: "0.65rem 1rem", borderRadius: "8px",
    border: "1px solid #1f2f1f", background: "#0f1a0f",
    color: "#e5e5e5", fontSize: "14px", minWidth: "200px",
  },
  dateInput: {
    padding: "0.65rem 1rem", borderRadius: "8px",
    border: "1px solid #1f2f1f", background: "#0f1a0f",
    color: "#e5e5e5", fontSize: "14px",
  },
  clearBtn: {
    padding: "0.65rem 1rem", borderRadius: "8px",
    background: "#2d1515", color: "#f87171",
    border: "1px solid #7f1d1d", cursor: "pointer", fontSize: "13px",
  },
  sectionHeader: { display: "flex", alignItems: "center", marginBottom: "1rem" },
  sectionTitle: { color: "#e5e5e5", fontSize: "16px", fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" },
  count: { background: "#14532d", color: "#4ade80", padding: "0.1rem 0.5rem", borderRadius: "20px", fontSize: "12px" },
  transactionGrid: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  transactionCard: { background: "#0f1a0f", borderRadius: "12px", border: "1px solid #1a2e1a", padding: "1rem 1.25rem" },
  transactionTop: { display: "flex", alignItems: "center", gap: "1rem" },
  typeIcon: { width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 },
  transactionInfo: { flex: 1 },
  transactionDesc: { margin: "0 0 0.2rem", color: "#e5e5e5", fontSize: "14px", fontWeight: 500 },
  transactionCategory: { margin: 0, color: "#6b7280", fontSize: "12px" },
  transactionRight: { textAlign: "right" },
  transactionAmount: { margin: "0 0 0.2rem", fontSize: "16px", fontWeight: 700 },
  transactionDate: { margin: 0, color: "#6b7280", fontSize: "12px" },
  transactionActions: { display: "flex", gap: "0.5rem", marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #1a2e1a" },
  editBtn: { padding: "0.3rem 0.8rem", borderRadius: "6px", background: "#14532d", color: "#4ade80", border: "1px solid #16a34a", cursor: "pointer", fontSize: "12px" },
  deleteBtn: { padding: "0.3rem 0.8rem", borderRadius: "6px", background: "#2d1515", color: "#f87171", border: "1px solid #7f1d1d", cursor: "pointer", fontSize: "12px" },
  emptyState: { textAlign: "center", padding: "4rem 0" },
  emptyIcon: { fontSize: "48px", margin: "0 0 1rem" },
  emptyText: { color: "#e5e5e5", fontSize: "18px", fontWeight: 500, margin: "0 0 0.5rem" },
  emptySubText: { color: "#6b7280", fontSize: "14px", margin: 0 },
  modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalCard: { background: "#0f1a0f", borderRadius: "16px", border: "1px solid #1a2e1a", padding: "2rem", width: "100%", maxWidth: "440px", display: "flex", flexDirection: "column", gap: "0.75rem" },
  modalTitle: { margin: 0, fontSize: "18px", color: "#4ade80", fontWeight: 600 },
  input: { padding: "0.65rem 1rem", borderRadius: "8px", border: "1px solid #1f2f1f", background: "#0a0f0a", color: "#e5e5e5", fontSize: "14px" },
  modalButtons: { display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" },
  cancelBtn: { padding: "0.6rem 1.2rem", borderRadius: "8px", background: "#0f1a0f", color: "#6b7280", border: "1px solid #1f2f1f", cursor: "pointer" },
  saveBtn: { padding: "0.6rem 1.2rem", borderRadius: "8px", background: "#16a34a", color: "#fff", border: "none", cursor: "pointer", fontWeight: 500 },
  error: { color: "#f87171", marginBottom: "1rem" },
};