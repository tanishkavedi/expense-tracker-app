import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {
  fetchTransactions,
  addTransaction,
  editTransaction,
  removeTransaction,
  fetchSummary,
  fetchMonthlyData,
  fetchCategoryBreakdown
} from "../controllers/transactionController";

const router = Router();

router.get("/", protect, fetchTransactions);
router.get("/summary", protect, fetchSummary);
router.get("/monthly", protect, fetchMonthlyData);
router.get("/category-breakdown", protect, fetchCategoryBreakdown);
router.post("/", protect, addTransaction);
router.put("/:id", protect, editTransaction);
router.delete("/:id", protect, removeTransaction);

export default router;