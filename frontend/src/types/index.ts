export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Category {
  id: number;
  name: string;
  type: "income" | "expense";
}

export interface Transaction {
  id: number;
  category_id: number;
  category_name: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  date: string;
}

export interface Summary {
  total_income: number;
  total_expense: number;
  balance: number;
}