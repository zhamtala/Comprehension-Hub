import db from "../db.js";

export async function saveAttempt({ userId, activityType, difficulty, score, total }) {
  await db.query(
    `INSERT INTO activity_attempts (user_id, activity_type, difficulty, score, total)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, activityType, difficulty, score, total]
  );
}

export async function updateProgress(userId, activityType) {
  const [rows] = await db.query(
    `SELECT SUM(score) AS correct, SUM(total) AS total
     FROM activity_attempts
     WHERE user_id = ? AND activity_type = ?`,
    [userId, activityType]
  );

  const progress = rows[0].total
    ? Math.round((rows[0].correct / rows[0].total) * 100)
    : 0;

  await db.query(
    `INSERT INTO user_progress (user_id, ${activityType})
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE ${activityType} = ?`,
    [userId, progress, progress]
  );
}
