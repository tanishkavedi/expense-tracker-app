import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect()
  .then(() => console.log("✅ PostgreSQL connected"))
  .catch((err: Error) => console.error("❌ DB connection error:", err.message));

export default pool;