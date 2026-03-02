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
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stories", storyRoutes);

const PORT = process.env.PORT || 5000;

// Test DB connection before starting
async function startServer() {
  try {
    await db.query("SELECT 1"); // test connection
    console.log("Database connected!");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
}

startServer();
