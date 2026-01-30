import express from "express";
import { loginUser, registerUser, requestPasswordReset, resetPassword } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);

// Password reset routes
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);

export default router;
