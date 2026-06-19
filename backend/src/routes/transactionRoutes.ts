import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {
  fetchTransactions,
  addTransaction,
  editTransaction,
  removeTransaction,
  fetchSummary
} from "../controllers/transactionController";

const router = Router();

router.get("/", protect, fetchTransactions);
router.get("/summary", protect, fetchSummary);
router.post("/", protect, addTransaction);
router.put("/:id", protect, editTransaction);
router.delete("/:id", protect, removeTransaction);

export default router;