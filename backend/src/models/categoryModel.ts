import pool from "../config/db";
import { Category } from "../types";

export const getCategories = async (userId: number): Promise<Category[]> => {
  const result = await pool.query(
    `SELECT * FROM categories WHERE user_id = $1 ORDER BY name`,
    [userId]
  );
  return result.rows;
};

export const createCategory = async (
  name: string,
  type: "income" | "expense",
  userId: number
): Promise<Category> => {
  const result = await pool.query(
    `INSERT INTO categories (name, type, user_id)
     VALUES ($1, $2, $3) RETURNING *`,
    [name, type, userId]
  );
  return result.rows[0];
};

export const deleteCategory = async (id: number): Promise<void> => {
  await pool.query(`DELETE FROM categories WHERE id = $1`, [id]);
};