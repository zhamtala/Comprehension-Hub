import db from "../db.js";

/* =========================================================
   ✅ TEXT ANSWER GRADER (SHORT + LONG)
========================================================= */
function gradeTextAnswer(correct_answer, student_answer) {
  if (!correct_answer || !student_answer) return 0;

  const keywords = correct_answer
    .toLowerCase()
    .split("\n")
    .map(k => k.trim())
    .filter(k => k.length > 0);

  if (keywords.length === 0) return 0;

  const answer = student_answer.toLowerCase();

  const matched = new Set();

  keywords.forEach(keyword => {
    if (answer.includes(keyword)) {
      matched.add(keyword);
    }
  });

  let score = Math.round((matched.size / keywords.length) * 100);

  // Prevent super short spam answers
  if (student_answer.length < 30) {
    score = Math.min(score, 30);
  }

  return score;
}

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

    if (!q.activity) {
      errors.push(`${label}: missing activity`);
    }

    if (!q.difficulty) {
      errors.push(`${label}: missing difficulty`);
    }

    if (!["mcq", "highlight", "short_answer", "long_answer"].includes(q.question_type)) {
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

    // 🔹 Short Answer validation
    if (q.question_type === "short_answer") {
      if (!q.correct_answer) {
        errors.push(`${label}: short_answer requires correct_answer`);
      }
    }

    // 🔹 Long Answer validation
    if (q.question_type === "long_answer") {
      if (!q.correct_answer) {
        errors.push(`${label}: long_answer requires guide keywords/answer`);
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
          q.activity,
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

    /* =========================================================
    ✅ GET ALL QUESTIONS
  ========================================================= */
  export const getAllQuestions = async (req, res) => {
    try {
      const [questions] = await db.query(`
        SELECT q.*, s.title AS story_title
        FROM questions2 q
        LEFT JOIN stories s ON q.story_id = s.id
        ORDER BY q.id DESC
      `);

      const [options] = await db.query(`
        SELECT * FROM question_options
      `);

      const optionsMap = {};

      options.forEach(opt => {
        if (!optionsMap[opt.question_id]) {
          optionsMap[opt.question_id] = [];
        }
        optionsMap[opt.question_id].push(opt.option_text);
      });

      const formatted = questions.map(q => ({
        id: q.id,
        activity: q.activity,
        difficulty: q.difficulty,
        question_type: q.question_type,
        question_text: q.question_text,
        correct_answer: q.correct_answer,
        incorrect_answer: q.incorrect_answer,
        explanation: q.explanation,
        story_id: q.story_id,
        options: optionsMap[q.id] || []
      }));

      res.json(formatted);

    } catch (err) {
      console.error("🔥 GET ALL QUESTIONS ERROR:", err);
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  };

  export const createSingleQuestion = async (req, res) => {
    const {
      activity,
      difficulty,
      question_type,
      question_text,
      correct_answer,
      incorrect_answer,
      explanation,
      options,
      story_id,
      story,
    } = req.body;

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      let finalStoryId = story_id || null;

      /* =========================
        1️⃣ HANDLE STORY
      ========================== */
      if (!finalStoryId && story?.title && story?.passage) {

        // 🔍 Check if story already exists
        const [existing] = await connection.execute(
          `SELECT id FROM stories WHERE title = ? LIMIT 1`,
          [story.title]
        );

        if (existing.length > 0) {
          // ✅ Reuse existing story
          finalStoryId = existing[0].id;
        } else {
          // 🆕 Create new story (FIXED QUERY)
          const [storyResult] = await connection.execute(
            `INSERT INTO stories (title, passage)
            VALUES (?, ?)`,
            [story.title, story.passage]
          );

          finalStoryId = storyResult.insertId;
        }
      }

      /* =========================
        ❗ SAFETY CHECK
      ========================== */
      if (activity === "comprehension" && !finalStoryId) {
        throw new Error("Story is required for comprehension questions");
      }

      /* =========================
        2️⃣ INSERT QUESTION
      ========================== */
      const [result] = await connection.execute(
        `INSERT INTO questions2
        (activity, difficulty, question_type, question_text,
          correct_answer, incorrect_answer, explanation, story_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          activity,
          difficulty,
          question_type,
          question_text,
          correct_answer || null,
          incorrect_answer || null,
          explanation || null,
          finalStoryId,
        ]
      );

      const questionId = result.insertId;

      /* =========================
        3️⃣ INSERT OPTIONS (MCQ ONLY)
      ========================== */
      if (question_type === "mcq" && options?.length) {
        for (const opt of options) {
          await connection.execute(
            `INSERT INTO question_options (question_id, option_text)
            VALUES (?, ?)`,
            [questionId, opt]
          );
        }
      }

      await connection.commit();
      connection.release();

      res.json({ success: true });

    } catch (err) {
      await connection.rollback();
      connection.release();
      console.error("🔥 CREATE QUESTION ERROR:", err);
      res.status(500).json({ error: "Create failed", details: err.message });
    }
  };

  export const deleteQuestion = async (req, res) => {
  const { id } = req.params;

  try {
    await db.execute(`DELETE FROM questions2 WHERE id = ?`, [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
};

  export const updateQuestion = async (req, res) => {
    const id = req.params.id;
    const {
      activity,
      difficulty,
      question_type,
      question_text,
      correct_answer,
      incorrect_answer,
      explanation,
      options,
      story_id
    } = req.body;

    const connection = await db.getConnection();

      if (!question_text) {
      return res.status(400).json({ error: "question_text is required" });
    }
    
    try {
      await connection.beginTransaction();

      /* =========================
        FORCE CLEAN DATA PER TYPE
      ========================== */

      let finalCorrect = null;
      let finalIncorrect = null;

      if (question_type === "mcq") {
        finalCorrect = correct_answer || null;
        finalIncorrect = null; // highlight field must be cleared
      }

      if (question_type === "highlight") {
        finalCorrect = null; // mcq field cleared
        finalIncorrect = incorrect_answer || null;
      }

      if (question_type === "short_answer") {
        finalCorrect = correct_answer || null;
        finalIncorrect = null;
      }

      if (question_type === "long_answer") {
        finalCorrect = correct_answer || null;
        finalIncorrect = null;
      }

      /* =========================
        UPDATE QUESTION
      ========================== */

      await connection.execute(
        `UPDATE questions2 SET
          activity=?,
          difficulty=?,
          question_type=?,
          question_text=?,
          correct_answer=?,
          incorrect_answer=?,
          explanation=?,
          story_id=?
        WHERE id=?`,
        [
          activity,
          difficulty,
          question_type,
          question_text || null,
          finalCorrect,
          finalIncorrect,
          explanation || null,
          story_id || null,
          id
        ]
      );

      /* =========================
        DELETE OLD OPTIONS
      ========================== */

      await connection.execute(
        `DELETE FROM question_options WHERE question_id=?`,
        [id]
      );

      /* =========================
        INSERT NEW OPTIONS (MCQ)
      ========================== */

      if (question_type === "mcq" && options?.length) {
        for (const opt of options) {
          await connection.execute(
            `INSERT INTO question_options (question_id, option_text)
            VALUES (?, ?)`,
            [id, opt]
          );
        }
      }

      await connection.commit();
      connection.release();

      res.json({ success: true });

    } catch (err) {
      await connection.rollback();
      connection.release();
      console.error(err);
      res.status(500).json({ error: "Update failed" });
    }
  };

  export const getComprehensionContent = async (req, res) => {
    const { difficulty, storyId } = req.query;

    try {
      const [rows] = await db.query(
        `SELECT q.*, s.title AS story_title, s.passage AS story_passage, o.option_text
        FROM questions2 q
        LEFT JOIN stories s ON q.story_id = s.id
        LEFT JOIN question_options o ON q.id = o.question_id
        WHERE q.activity = 'comprehension'
        AND q.difficulty = ?
        AND q.story_id = ?`,
        [difficulty, storyId]
      );

      if (rows.length === 0) {
        return res.json({ title: null, story: null, questions: [] });
      }

      const selectedRows = rows;

      // 🔥 Group by question
      const questionsMap = {};
      
      selectedRows.forEach(row => {
        if (!questionsMap[row.id]) {
          questionsMap[row.id] = {
            id: row.id,
            q: row.question_text,
            a: [],
            correct: row.correct_answer,
            type: row.question_type
          };
        }

        if (row.option_text) {
          questionsMap[row.id].a.push(row.option_text);
        }
      });

      res.json({
        title: selectedRows[0].story_title || "Untitled Story",
        story: selectedRows[0].story_passage || null,
        questions: Object.values(questionsMap)
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  };

  export const getReadingContent = async (req, res) => {
    const { difficulty } = req.query;

    try {
      const [rows] = await db.query(
        `SELECT q.*, s.title AS story_title, s.passage AS story_passage, o.option_text
        FROM questions2 q
        LEFT JOIN stories s ON q.story_id = s.id
        LEFT JOIN question_options o ON q.id = o.question_id
        WHERE q.activity = 'reading'
        AND q.difficulty = ?`,
        [difficulty]
      );

      if (rows.length === 0) {
        return res.json({ title: null, story: null, questions: [] });
      }

      const questionsMap = {};
      rows.forEach(row => {
        if (!questionsMap[row.id]) {
          questionsMap[row.id] = {
            id: row.id,
            q: row.question_text,
            a: [],
            correct: row.correct_answer,
            story_title: row.story_title,
            story_passage: row.story_passage,
            type: row.question_type
          };
        }

        if (row.option_text) {
          questionsMap[row.id].a.push(row.option_text);
        }
      });

      const first = Object.values(questionsMap)[0];

      res.json({
        title: first.story_title || "Untitled Story",
        story: first.story_passage || null,
        questions: Object.values(questionsMap)
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  };

  export const getListeningContent = async (req, res) => {
  const { difficulty } = req.query;

  try {
    const [rows] = await db.query(
      `SELECT q.*, s.title AS story_title, s.passage AS story_passage, o.option_text
       FROM questions2 q
       LEFT JOIN stories s ON q.story_id = s.id
       LEFT JOIN question_options o ON q.id = o.question_id
       WHERE q.activity = 'listening'
       AND q.difficulty = ?`,
      [difficulty]
    );

    if (rows.length === 0) {
      return res.json({ story: null, title: null, questions: [] });
    }

    const grouped = {};
    rows.forEach((row) => {
      const storyId = row.story_id || "no_story";
      if (!grouped[storyId]) grouped[storyId] = [];
      grouped[storyId].push(row);
    });

    const storyIds = Object.keys(grouped);
    const randomStoryId = storyIds[Math.floor(Math.random() * storyIds.length)];

    const selectedQuestions = grouped[randomStoryId];

    const formatted = {};
    selectedQuestions.forEach((row) => {
      if (!formatted[row.id]) {
        formatted[row.id] = {
          id: row.id,
          q: row.question_text,
          a: [],
          correct: row.correct_answer,
          story_title: row.story_title,
          story_passage: row.story_passage,
          type: row.question_type
        };
      }
      if (row.option_text) formatted[row.id].a.push(row.option_text);
    });

    res.json({
      title: selectedQuestions[0].story_title || "Untitled Story",
      story: selectedQuestions[0].story_passage || null,
      questions: Object.values(formatted),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

  export const getStories = async (req, res) => {
    const { activity, difficulty } = req.query;

    try {
      const [rows] = await db.query(
        "SELECT id, title, passage FROM stories ORDER BY id ASC"
      );

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch stories" });
    }
  };

  export const getSingleQuestion = async (req, res) => {
  const { id } = req.params;

  try {

    // Question
    const [questions] = await db.execute(
      `SELECT * FROM questions2 WHERE id=?`,
      [id]
    );

    if (!questions.length) {
      return res.status(404).json({
        error:"Question not found"
      });
    }

    const question = questions[0];

    // Options
    const [options] = await db.execute(
      `SELECT option_text
       FROM question_options
       WHERE question_id=?`,
      [id]
    );

    // Story
    let story=null;

    if(question.story_id){

      const [stories]=await db.execute(
        `SELECT id,title,passage
         FROM stories
         WHERE id=?`,
        [question.story_id]
      );

      story=stories[0];
    }

    res.json({

      question,
      options:options.map(o=>o.option_text),
      story

    });

  } catch(err){

    console.error(err);

    res.status(500).json({
      error:"Failed to load question"
    });

  }
};