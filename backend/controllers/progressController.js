import db from "../db.js";

export async function getSkillBreakdown(req, res) {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT 
        activity_type,
        difficulty,
        SUM(score) AS total_score,
        SUM(total) AS total_items
      FROM activity_attempts
      WHERE user_id = ?
      GROUP BY activity_type, difficulty
      `,
      [userId]
    );

    const breakdown = {};

    rows.forEach((row) => {
      if (!breakdown[row.activity_type]) {
        breakdown[row.activity_type] = [];
      }

      breakdown[row.activity_type].push({
        difficulty: row.difficulty,
        percentage:
          row.total_items > 0
            ? Math.round((row.total_score / row.total_items) * 100)
            : 0,
      });
    });

    res.json(breakdown);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load skill breakdown" });
  }
}
