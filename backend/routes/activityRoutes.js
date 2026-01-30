import express from "express";
import { submitActivity } from "../controllers/activityController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/submit", authMiddleware, submitActivity);

export default router;
