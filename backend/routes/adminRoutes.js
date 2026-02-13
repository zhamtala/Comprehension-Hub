import express from "express";
import { validateQuestions, uploadQuestions } from "../controllers/adminController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/validate-questions", authMiddleware, validateQuestions);
router.post("/upload-questions", authMiddleware, uploadQuestions);

export default router;
