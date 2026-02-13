import express from "express";
import { getQuestions } from "../controllers/questionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getQuestions);

export default router;
