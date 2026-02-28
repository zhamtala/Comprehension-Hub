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

export const createQuestion = async (req, res) => {
  const {
    activity,
    difficulty,
    questionType,
    questionText,
    passage,
    correctAnswer,
    incorrectAnswer,
    options,
    explanation
  } = req.body;

  try {
    // ==============================
    // 1️⃣ Validate ENUM values manually (extra safety)
    // ==============================
    const validActivities = ["grammar", "reading", "comprehension", "listening"];
    const validDifficulties = ["easy", "standard", "average", "hard"];
    const validTypes = ["mcq", "highlight"];

    if (!validActivities.includes(activity)) {
      return res.status(400).json({ error: "Invalid activity type" });
    }

    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({ error: "Invalid difficulty level" });
    }

    if (!validTypes.includes(questionType)) {
      return res.status(400).json({ error: "Invalid question type" });
    }

    // ==============================
    // 2️⃣ Insert Question
    // ==============================

    const finalCorrectAnswer =
      questionType === "highlight"
        ? incorrectAnswer // must satisfy NOT NULL
        : correctAnswer;

    const [result] = await db.execute(
      `
      INSERT INTO questions2
      (activity, difficulty, question_type, question_text, passage, correct_answer, incorrect_answer, explanation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        activity,
        difficulty,
        questionType,
        questionText,
        passage || null,
        finalCorrectAnswer,
        incorrectAnswer || null,
        explanation || null
      ]
    );

    const questionId = result.insertId;

    // ==============================
    // 3️⃣ Insert MCQ Options
    // ==============================
    if (questionType === "mcq") {
      if (!options || options.length < 2) {
        return res.status(400).json({ error: "MCQ must have at least 2 options" });
      }

      const cleanOptions = options.filter(opt => opt.trim() !== "");

      const optionValues = cleanOptions.map(opt => [questionId, opt]);

      await db.query(
        `INSERT INTO question_options (question_id, option_text) VALUES ?`,
        [optionValues]
      );
    }

    return res.status(201).json({
      message: "Question created successfully",
      questionId
    });

  } catch (err) {
    console.error("Create question error:", err);
    return res.status(500).json({
      error: "Failed to create question"
    });
  }
};

