import db from "../db.js";

/* =====================================================
   GET QUESTIONS
===================================================== */
export const getQuestions = async (req, res) => {
  const { activity, difficulty, storyId } = req.query;

  try {
    if (!activity || !difficulty) {
      return res.status(400).json({
        error: "Activity and difficulty are required",
      });
    }

    /* ============================
       BUILD QUERY (JOIN STORIES)
    ============================ */
    let query = `
    SELECT 
      q.id,
      q.activity,
      q.difficulty,
      q.question_type,
      q.question_text,
      q.correct_answer,
      q.incorrect_answer,
      q.explanation,
      q.story_id,
      s.title AS storyTitle,
      s.passage AS storyText
    FROM questions2 q
    LEFT JOIN stories s ON q.story_id = s.id
    WHERE q.activity = ?
    AND q.difficulty = ?
  `;

    const params = [activity, difficulty];

    if (activity === "reading" && storyId) {
      query += ` AND q.story_id = ?`;
      params.push(storyId);
    }

    query += ` ORDER BY q.id ASC`;

    const [questions] = await db.execute(query, params);

    if (!questions.length) {
      return res.json([]); // Always return array
    }

    /* ============================
       FETCH MCQ OPTIONS
    ============================ */
    const mcqIds = questions
      .filter((q) => q.question_type === "mcq")
      .map((q) => q.id);

    let options = [];

    if (mcqIds.length > 0) {
      const placeholders = mcqIds.map(() => "?").join(",");

      const [rows] = await db.query(
        `
        SELECT question_id, option_text
        FROM question_options
        WHERE question_id IN (${placeholders})
        ORDER BY id ASC
        `,
        mcqIds
      );

      options = rows;
    }

    const optionsMap = {};
    options.forEach((opt) => {
      if (!optionsMap[opt.question_id]) {
        optionsMap[opt.question_id] = [];
      }
      optionsMap[opt.question_id].push(opt.option_text);
    });

    /* ============================
       FORMAT RESPONSE
    ============================ */

    let formatted = [];

    // =========================
    // READING
    // =========================
    if (activity === "reading") {
      formatted = questions.map((q) => ({
        id: q.id,
        storyTitle: q.storyTitle,
        question: q.question_text,
        options: optionsMap[q.id] || [],
        answer: q.correct_answer,
        explanation: q.explanation,
      }));
    }

    // =========================
    // LISTENING
    // =========================
    else if (activity === "listening") {
      formatted = questions.map((q) => ({
        id: q.id,
        storyTitle: q.storyTitle,
        storyText: q.storyText,
        question: q.question_text,
        options: optionsMap[q.id] || [],
        answer: q.correct_answer,
        explanation: q.explanation,
      }));
    }

    // =========================
    // GRAMMAR / OTHERS
    // =========================
    else {
      formatted = questions
        .map((q) => {
          if (q.question_type === "mcq") {
            return {
              id: q.id,
              questionType: "mcq",
              sentence: q.question_text,
              options: optionsMap[q.id] || [],
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
        })
        .filter(Boolean);
    }

    return res.json(formatted); // ALWAYS raw array
  } catch (err) {
    console.error("Question fetch error:", err);
    return res.status(500).json({
      error: "Failed to fetch questions",
    });
  }
};

/* =====================================================
   CREATE QUESTION
===================================================== */
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
    explanation,
    storyId, // optional for grammar
  } = req.body;

  try {
    const validActivities = [
      "grammar",
      "reading",
      "comprehension",
      "listening",
    ];

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

    const finalCorrectAnswer =
      questionType === "highlight"
        ? incorrectAnswer
        : correctAnswer;

    const [result] = await db.execute(
      `
      INSERT INTO questions2
      (activity, difficulty, question_type, question_text, passage, correct_answer, incorrect_answer, explanation, story_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        activity,
        difficulty,
        questionType,
        questionText,
        passage || null,
        finalCorrectAnswer,
        incorrectAnswer || null,
        explanation || null,
        storyId || null,
      ]
    );

    const questionId = result.insertId;

    // Insert MCQ options
    if (questionType === "mcq") {
      if (!options || options.length < 2) {
        return res.status(400).json({
          error: "MCQ must have at least 2 options",
        });
      }

      const cleanOptions = options.filter((opt) => opt.trim() !== "");

      const optionValues = cleanOptions.map((opt) => [
        questionId,
        opt,
      ]);

      await db.query(
        `INSERT INTO question_options (question_id, option_text) VALUES ?`,
        [optionValues]
      );
    }

    return res.status(201).json({
      message: "Question created successfully",
      questionId,
    });
  } catch (err) {
    console.error("Create question error:", err);
    return res.status(500).json({
      error: "Failed to create question",
    });
  }
};