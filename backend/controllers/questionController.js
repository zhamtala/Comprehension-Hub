import db from "../db.js";

export const getQuestions = async (req, res) => {
  const { activity = "grammar", difficulty = "standard" } = req.query;

  try {
    /* =====================================================
       1️⃣ Fetch Questions
    ===================================================== */
    const [questions] = await db.execute(
      `
      SELECT *
      FROM questions2
      WHERE activity = ? AND difficulty = ?
      ORDER BY id ASC
      `,
      [activity, difficulty]
    );

    if (!questions.length) {
      console.log("No questions found for:", activity, difficulty);
      return res.json([]);
    }

    /* =====================================================
       2️⃣ Fetch Options (ONLY for MCQ questions)
    ===================================================== */
    const mcqQuestionIds = questions
      .filter(q => q.question_type === "mcq")
      .map(q => q.id);

    let options = [];

    if (mcqQuestionIds.length > 0) {
      const placeholders = mcqQuestionIds.map(() => "?").join(",");

      const [rows] = await db.query(
        `
        SELECT question_id, option_text
        FROM question_options
        WHERE question_id IN (${placeholders})
        ORDER BY id ASC
        `,
        mcqQuestionIds
      );

      options = rows;
    }

    /* =====================================================
       3️⃣ Group Options by Question ID
    ===================================================== */
    const optionsMap = {};

    options.forEach(opt => {
      if (!optionsMap[opt.question_id]) {
        optionsMap[opt.question_id] = [];
      }
      optionsMap[opt.question_id].push(opt.option_text);
    });

    /* =====================================================
       4️⃣ Format Final Response (FRONTEND FORMAT)
    ===================================================== */
    const formatted = questions.map(q => {

      if (q.question_type === "mcq") {
        return {
          id: q.id,
          questionType: "mcq",
          sentence: q.question_text,
          options: optionsMap[q.id] || [], // always safe
          correctWord: q.correct_answer,
          explanation: q.explanation,
        };
      }

      if (q.question_type === "highlight") {
        return {
          id: q.id,
          questionType: "highlight",
          sentence: q.question_text,
          incorrectWord: q.incorrect_answer,
          explanation: q.explanation,
        };
      }

      return null;
    }).filter(Boolean);

    /* =====================================================
       5️⃣ Debug Logs (VERY IMPORTANT FOR YOU)
    ===================================================== */
    console.log("=== QUESTIONS FETCHED ===");
    console.log(questions);

    console.log("=== OPTIONS FETCHED ===");
    console.log(options);

    console.log("=== FINAL RESPONSE ===");
    console.log(formatted);

    return res.json(formatted);

  } catch (err) {
    console.error("Question fetch error:", err);
    return res.status(500).json({
      error: "Failed to fetch questions"
    });
  }
};
