import db from "../db.js";

/* =========================================================
   ✅ VALIDATE QUESTIONS FORMAT (NO DB INSERT)
========================================================= */
export const validateQuestions = (req, res) => {
  const questions = req.body;

  if (!Array.isArray(questions)) {
    return res.status(400).json({ error: "Expected an array of questions" });
  }

  const errors = [];

  questions.forEach((q, index) => {
    const label = `Question ${index + 1}`;

    // 🔹 Common validations
    if (!q.question_text) {
      errors.push(`${label}: missing question_text`);
    }

    if (!q.module) {
      errors.push(`${label}: missing module`);
    }

    if (!q.difficulty) {
      errors.push(`${label}: missing difficulty`);
    }

    if (!["mcq", "highlight"].includes(q.question_type)) {
      errors.push(`${label}: invalid question_type`);
    }

    // 🔹 MCQ validation
    if (q.question_type === "mcq") {
      if (!q.option_a || !q.option_b || !q.option_c || !q.option_d) {
        errors.push(`${label}: MCQ requires option_a, option_b, option_c, option_d`);
      }

      if (!["A", "B", "C", "D"].includes(q.correct_answer)) {
        errors.push(`${label}: correct_answer must be A, B, C, or D`);
      }
    }

    // 🔹 Highlight validation
    if (q.question_type === "highlight") {
      if (!q.incorrect_answer) {
        errors.push(`${label}: missing incorrect_answer`);
      } else if (!q.question_text.includes(q.incorrect_answer)) {
        errors.push(`${label}: incorrect_answer not found in question_text`);
      }
    }
  });

  if (errors.length > 0) {
    return res.status(422).json({
      valid: false,
      errors,
    });
  }

  return res.json({
    valid: true,
    message: "All questions passed validation",
  });
};


/* =========================================================
   ✅ UPLOAD QUESTIONS TO DATABASE
========================================================= */
export const uploadQuestions = async (req, res) => {
  const questions = req.body;

  if (!Array.isArray(questions)) {
    return res.status(400).json({ error: "Expected an array of questions" });
  }

  const connection = await db.getConnection();

  try {
    // 🔥 START TRANSACTION
    await connection.beginTransaction();

    for (const q of questions) {

      /* ---------------------------
         1️⃣ INSERT INTO questions2
      ---------------------------- */
      const [result] = await connection.execute(
        `
        INSERT INTO questions2
        (activity, difficulty, question_type, question_text, passage, correct_answer, incorrect_answer, explanation)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          q.module,
          q.difficulty,
          q.question_type,
          q.question_text,
          q.passage || null,
          q.correct_answer || null,
          q.incorrect_answer || null,
          q.explanation || null
        ]
      );

      const questionId = result.insertId;

      /* ---------------------------
         2️⃣ INSERT OPTIONS IF MCQ
      ---------------------------- */
      if (q.question_type === "mcq") {

        const options = [
          { key: "A", text: q.option_a },
          { key: "B", text: q.option_b },
          { key: "C", text: q.option_c },
          { key: "D", text: q.option_d }
        ];

        for (const opt of options) {
          await connection.execute(
            `
            INSERT INTO question_options (question_id, option_text)
            VALUES (?, ?)
            `,
            [questionId, opt.text]
          );
        }
      }

    }

    // 🔥 COMMIT ALL INSERTS
    await connection.commit();
    connection.release();

    res.json({
      success: true,
      message: "Questions uploaded successfully"
    });

  } catch (err) {

    // ❌ ROLLBACK IF ERROR
    await connection.rollback();
    connection.release();

    console.error("Upload error:", err);

    res.status(500).json({
      error: "Failed to upload questions"
    });
  }
};
