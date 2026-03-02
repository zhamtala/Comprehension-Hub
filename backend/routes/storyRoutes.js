import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, title, passage FROM stories ORDER BY id ASC"
    );

    return res.status(200).json(rows); // ✅ RETURN ARRAY DIRECTLY
  } catch (err) {
    console.error("Error fetching stories:", err);
    return res.status(500).json({
      error: "Server error fetching stories",
      details: err.message,
    });
  }
});

export default router;