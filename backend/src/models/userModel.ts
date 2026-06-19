import pool from "../config/db";
import { User } from "../types";

export const createUser = async (
  name : string,
  email: string,
  hashedPassword: string
): Promise<User> => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3) RETURNING *`,
    [name, email, hashedPassword]
    
  );
  return result.rows[0];
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );

  return result.rows[0] || null;

};