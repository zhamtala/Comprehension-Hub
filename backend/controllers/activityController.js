import db from "../db.js";
import { saveAttempt, updateProgress } from "../models/activityModel.js";

export async function submitActivity(req, res) {
  console.log("USER:", req.user);
  console.log("BODY:", req.body);

  try {
    const userId = req.user.id;
    const { activityType, difficulty, score, total } = req.body;

    if (!activityType || score == null || total == null) {
      return res.status(400).json({ message: "Missing activity data" });
    }

    // 1️⃣ Save raw attempt
    await saveAttempt({
      userId,
      activityType,
      difficulty,
      score,
      total,
    });

    // 2️⃣ Ensure progress row exists
    await db.query(
      "INSERT IGNORE INTO user_progress (user_id) VALUES (?)",
      [userId]
    );

    // 3️⃣ Update progress percentage
    await updateProgress(userId, activityType, score, total);

    // ✅ SEND RESPONSE ONCE
    return res.status(200).json({
      success: true,
      activityType,
      score,
      total,
    });
  } catch (err) {
    console.error("submitActivity error:", err);
    return res.status(500).json({ message: "Failed to submit activity" });
  }
}
