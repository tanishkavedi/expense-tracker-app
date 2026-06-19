import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { getCategories, createCategory, deleteCategory } from "../models/categoryModel";

export const fetchCategories = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const categories = await getCategories(req.user!.userId);
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: (err as Error).message });
  }
};

export const addCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, type } = req.body;
    const category = await createCategory(name, type, req.user!.userId);
    res.status(201).json({ message: "Category created", category });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: (err as Error).message });
  }
};

export const removeCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    await deleteCategory(Number(req.params.id));
    res.status(200).json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: (err as Error).message });
  }
};