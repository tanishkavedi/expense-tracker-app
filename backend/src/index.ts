import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./config/db";
import authRoutes from "./routes/authRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import transactionRoutes from "./routes/transactionRoutes";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/transactions", transactionRoutes);


app.use((req, res) => {
  console.log("Hit route:", req.method, req.url);
  res.status(404).json({ message: `Route not found: ${req.url}` });
});



app.get("/", (req: Request, res: Response) => {
  res.send("Expense Tracker API running");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});