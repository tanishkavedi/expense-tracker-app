import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./config/db";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);


app.get("/", (req: Request, res: Response) => {
  res.send("Expense Tracker API running");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});