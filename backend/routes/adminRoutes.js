import express from "express";
import {
  getAllQuestions,
  createSingleQuestion,
  deleteQuestion,
  updateQuestion,
  getSingleQuestion,
  getComprehensionContent,
  getReadingContent,
  getListeningContent,
  getStories,
} from "../controllers/adminController.js";
import { verifyAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// ============================
// QUESTIONS CRUD
// ============================
router.get("/questions", verifyAdmin, getAllQuestions);
router.post("/questions", verifyAdmin, createSingleQuestion);
router.put("/questions/:id", verifyAdmin, updateQuestion);
router.delete("/questions/:id", verifyAdmin, deleteQuestion);

// ============================
// QUESTIONS EDITING (FOR ADMIN) - GET SINGLE QUESTION
// ============================
router.get("/questions/:id", verifyAdmin, getSingleQuestion);

// ============================
// STORIES (FOR READING/LISTENING/COMPREHENSION)
// ============================
router.get("/stories", verifyAdmin, getStories); // 👈 THIS FIXES YOUR 404

// ============================
// CONTENT FETCH (STUDENT SIDE)
// ============================
router.get("/comprehension", getComprehensionContent);
router.get("/reading", getReadingContent);
router.get("/listening", getListeningContent);

export default router;
