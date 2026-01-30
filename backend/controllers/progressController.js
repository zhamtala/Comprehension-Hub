import db from "../db.js";

export async function getUserProgress(req, res) {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT 
        activity_type,
        SUM(score) AS total_score,
        SUM(total) AS total_items
      FROM activity_attempts
      WHERE user_id = ?
      GROUP BY activity_type
      `,
      [userId]
    );

    const progress = {
      grammar: 0,
      comprehension: 0,
      reading: 0,
      listening: 0,
    };

    rows.forEach((row) => {
      if (row.total_items > 0) {
        progress[row.activity_type] = Math.round(
          (row.total_score / row.total_items) * 100
        );
      }
    });

    res.json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load progress" });
  }
}
