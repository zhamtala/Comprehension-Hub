import express from "express";
import { getQuestions, createQuestion } from "../controllers/questionController.js";

const router = express.Router();

router.get("/", getQuestions);
router.post("/create", createQuestion);

export default router;
