import express from "express";
import { registerUser } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// public
router.post("/register", registerUser);

// protected example
router.get("/me", authMiddleware, (req, res) => {
  res.json({ message: "Protected data", user: req.user });
});

export default router;
