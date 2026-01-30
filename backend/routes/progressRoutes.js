import express from "express";
import { getSkillBreakdown } from "../controllers/progressController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/breakdown", authMiddleware, getSkillBreakdown);

export default router;
