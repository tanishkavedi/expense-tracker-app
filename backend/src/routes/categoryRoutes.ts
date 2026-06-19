import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import { fetchCategories, addCategory, removeCategory } from "../controllers/categoryController";

const router = Router();

router.get("/", protect, fetchCategories);
router.post("/", protect, addCategory);
router.delete("/:id", protect, removeCategory);

export default router;