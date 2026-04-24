import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import {
  createUser,
  findUserByEmail,
  saveResetToken,
  findUserByResetToken,
  updatePassword,
} from "../models/userModel.js";
import { validatePassword } from "../utils/passwordValidator.js";
import { sendResetEmail } from "../utils/mailer.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  throw new Error("❌ JWT_SECRET is not defined in .env");
}

/* =========================
   LOGIN
========================= */
export async function loginUser(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: user.id,        // ✅ REQUIRED by authMiddleware
        role: user.role,    // ✅ REQUIRED by authMiddleware
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      success: true,
      token,
      userId: user.id,
      role: user.role,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

/* =========================
   REGISTER
========================= */
export async function registerUser(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const { valid, failedRules } = validatePassword(password);
  if (!valid) {
    return res.status(400).json({
      error: "Password does not meet security requirements",
      failedRules,
    });
  }

  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = await createUser(name, email, hashedPassword);

    return res.status(201).json({
      success: true,
      userId,
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

/* =========================
   REQUEST PASSWORD RESET
========================= */
export async function requestPasswordReset(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.json({ success: true }); // prevent enumeration
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await saveResetToken(user.id, hashedToken, expiry);

    await sendResetEmail(email, rawToken);

    return res.json({ success: true });

  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

/* =========================
   RESET PASSWORD
========================= */
export async function resetPassword(req, res) {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: "Invalid request" });
  }

  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await findUserByResetToken(hashedToken);
    if (!user) {
      return res.status(400).json({ error: "Token expired or invalid" });
    }

    const { valid, failedRules } = validatePassword(password);
    if (!valid) {
      return res.status(400).json({
        error: "Password does not meet requirements",
        failedRules,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await updatePassword(user.id, hashedPassword);

    return res.json({ success: true });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ error: "Server error" });
  }
  
  console.log("=== EMAIL DEBUG ===");
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);
  console.log("===================");
}
