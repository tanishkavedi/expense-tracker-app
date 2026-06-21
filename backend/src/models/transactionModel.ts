import pool from "../config/db";
import { Transaction } from "../types";

export const getTransactions = async (userId: number): Promise<Transaction[]> => {
  const result = await pool.query(
    `SELECT t.*, c.name as category_name
     FROM transactions t
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE t.user_id = $1
     ORDER BY t.date DESC`,
    [userId]
  );
  return result.rows;
};

export const createTransaction = async (
  userId: number,
  categoryId: number,
  type: "income" | "expense",
  amount: number,
  description: string,
  date: string
): Promise<Transaction> => {
  const result = await pool.query(
    `INSERT INTO transactions (user_id, category_id, type, amount, description, date)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [userId, categoryId, type, amount, description, date]
  );
  return result.rows[0];
};

export const updateTransaction = async (
  id: number,
  categoryId: number,
  type: "income" | "expense",
  amount: number,
  description: string,
  date: string
): Promise<Transaction> => {
  const result = await pool.query(
    `UPDATE transactions
     SET category_id=$1, type=$2, amount=$3, description=$4, date=$5
     WHERE id=$6 RETURNING *`,
    [categoryId, type, amount, description, date, id]
  );
  return result.rows[0];
};

export const deleteTransaction = async (id: number): Promise<void> => {
  await pool.query(`DELETE FROM transactions WHERE id = $1`, [id]);
};

export const getSummary = async (userId: number) => {
  const result = await pool.query(
    `SELECT
       COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END), 0) AS total_income,
       COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) AS total_expense,
       COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE -amount END), 0) AS balance
     FROM transactions
     WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0];
};


export const getMonthlyData = async (userId: number) => {
  const result = await pool.query(
    `SELECT
       TO_CHAR(date, 'Mon YYYY') as month,
       TO_CHAR(date, 'YYYY-MM') as month_key,
       SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
       SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense
     FROM transactions
     WHERE user_id = $1
     GROUP BY month, month_key
     ORDER BY month_key ASC
     LIMIT 6`,
    [userId]
  );
  return result.rows;
};

export const getCategoryBreakdown = async (userId: number) => {
  const result = await pool.query(
    `SELECT
       c.name as category,
       c.type,
       SUM(t.amount) as total
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE t.user_id = $1
     GROUP BY c.name, c.type
     ORDER BY total DESC`,
    [userId]
  );
  return result.rows;
};