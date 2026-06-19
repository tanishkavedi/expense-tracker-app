import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary
} from "../models/transactionModel";

export const fetchTransactions = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const transactions = await getTransactions(req.user!.userId);
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: (err as Error).message });
  }
};

export const addTransaction = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { category_id, type, amount, description, date } = req.body;
    const transaction = await createTransaction(
      req.user!.userId, category_id, type, amount, description, date
    );
    res.status(201).json({ message: "Transaction added", transaction });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: (err as Error).message });
  }
};

export const editTransaction = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { category_id, type, amount, description, date } = req.body;
    const transaction = await updateTransaction(
      Number(req.params.id), category_id, type, amount, description, date
    );
    res.status(200).json({ message: "Transaction updated", transaction });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: (err as Error).message });
  }
};

export const removeTransaction = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    await deleteTransaction(Number(req.params.id));
    res.status(200).json({ message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: (err as Error).message });
  }
};

export const fetchSummary = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const summary = await getSummary(req.user!.userId);
    res.status(200).json(summary);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: (err as Error).message });
  }
};