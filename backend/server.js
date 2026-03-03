import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import userRoutes from "./routes/users.js";
import authRoutes from "./routes/authRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";
import db from "./db.js";

const app = express();

/* =============================
   CORS Configuration
   ============================= */
const allowedOrigins = [
  "http://localhost:3000", // local frontend
  process.env.FRONTEND_URL, // production frontend (Vercel)
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow non-browser requests
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS not allowed"));
    },
    credentials: true,
  })
);

app.use(express.json());

/* =============================
   Health Check Route (IMPORTANT for Render)
   ============================= */
app.get("/", (req, res) => {
  res.json({ message: "Backend is running 🚀" });
});

/* =============================
   API Routes
   ============================= */
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stories", storyRoutes);

/* =============================
   Start Server After DB Check
   ============================= */
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await db.query("SELECT 1");
    console.log("✅ Database connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
}

startServer();