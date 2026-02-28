"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Story {
  id: number;
  title: string;
  passage: string;
}

export default function CreateQuestionPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    activity: "grammar",
    difficulty: "easy",
    question_type: "mcq",
    question_text: "",
    passage: "",
    story_id: "",
    new_story_title: "",
    new_story_passage: "",
    correct_answer: "",
    incorrect_answer: "",
    explanation: "",
    options: ["", "", "", ""],
  });

  const [stories, setStories] = useState<Story[]>([]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...form.options];
    updated[index] = value;
    setForm({ ...form, options: updated });
  };

  const showPassage =
    form.activity === "comprehension" ||
    form.activity === "listening" ||
    form.activity === "reading";

  const fetchStories = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/admin/stories?activity=${form.activity}&difficulty=${form.difficulty}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setStories(data);
    } catch (err) {
      console.error("Failed to fetch stories", err);
    }
  };

  useEffect(() => {
    if (showPassage) {
      fetchStories();
    }
  }, [form.activity, form.difficulty]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const payload = {
    ...form,
    options: form.question_type === "mcq" ? form.options : [],
    story_id: form.story_id || undefined,
    story:
      showPassage &&
      !form.story_id &&
      form.new_story_title &&
      form.new_story_passage
        ? {
            title: form.new_story_title,
            passage: form.new_story_passage,
          }
        : undefined,
  };

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/admin/questions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Question created successfully!");
        router.push("/admin/questions");
      } else {
        alert(data.message || "Failed to create question.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex">

      {/* SIDEBAR */}
      <aside className="w-64 bg-black/60 border-r border-white/10 p-6 hidden md:flex flex-col">
        <h2 className="text-xl font-bold text-cyan-400 mb-8">Admin Panel</h2>
        <nav className="flex flex-col gap-4 text-sm">
          <button
            onClick={() => router.push("/admin/create")}
            className="text-left text-cyan-400"
          >
            Create Question
          </button>
          <button
            onClick={() => router.push("/admin/questions")}
            className="text-left hover:text-cyan-400 transition"
          >
            Manage Questions
          </button>
          <button
            onClick={() => router.push("/admin")}
            className="text-left hover:text-cyan-400 transition mt-8 text-gray-400"
          >
            Back to Dashboard
          </button>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cyan-400">Create Question</h1>
          <p className="text-gray-400 text-sm mt-2">
            Add a new question for Grammar, Reading, Listening, or Comprehension.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Activity */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Activity</label>
              <select
                name="activity"
                value={form.activity}
                onChange={handleChange}
                className="w-full bg-black/60 text-white border border-white/20 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
              >
                <option value="grammar">Grammar</option>
                <option value="comprehension">Comprehension</option>
                <option value="reading">Reading</option>
                <option value="listening">Listening</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Difficulty</label>
              <select
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                className="w-full bg-black/60 text-white border border-white/20 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
              >
                <option value="easy">Easy</option>
                <option value="average">Average</option>
                <option value="hard">Hard</option>
                <option value="standard">Standard</option>
              </select>
            </div>

            {/* Question Type */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Question Type</label>
              <select
                name="question_type"
                value={form.question_type}
                onChange={handleChange}
                className="w-full bg-black/60 text-white border border-white/20 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
              >
                <option value="mcq">Multiple Choice</option>
                <option value="highlight">Highlight the Incorrect Word</option>
                <option value="short_answer">Short Answer</option>
              </select>
            </div>

            {/* Story Selection / Creation */}
            {showPassage && (
              <div>
                <label className="block text-sm text-gray-300 mb-2">Story / Passage</label>

                {/* Select existing story */}
                {stories.length > 0 && (
                  <select
                    name="story_id"
                    value={form.story_id}
                    onChange={handleChange}
                    className="w-full bg-black/60 text-white border border-white/20 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition mb-4"
                  >
                    <option value="">-- Select Existing Story --</option>
                    {stories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                )}

                <p className="text-gray-400 text-xs mb-2">
                  Or create a new story below:
                </p>

                <input
                  type="text"
                  name="new_story_title"
                  value={form.new_story_title}
                  onChange={handleChange}
                  placeholder="Story Title"
                  className="w-full bg-black/60 text-white border border-white/20 rounded-lg p-3 mb-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                />

                <textarea
                  name="new_story_passage"
                  value={form.new_story_passage}
                  onChange={handleChange}
                  placeholder="Story Passage"
                  className="w-full bg-black/60 text-white border border-white/20 rounded-lg p-3 h-28 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition resize-none"
                />
              </div>
            )}

            {/* Question Text */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Question Text</label>
              <textarea
                name="question_text"
                value={form.question_text}
                onChange={handleChange}
                required
                className="w-full bg-black/60 text-white border border-white/20 rounded-lg p-3 h-24 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition resize-none"
              />
            </div>

            {/* MCQ Options */}
            {form.question_type === "mcq" && (
              <div className="space-y-4">
                <label className="block text-sm text-gray-300">Options</label>
                {form.options.map((opt, index) => (
                  <input
                    key={index}
                    type="text"
                    value={opt}
                    onChange={(e) =>
                      handleOptionChange(index, e.target.value)
                    }
                    placeholder={`Option ${index + 1}`}
                    className="w-full bg-black/60 text-white border border-white/20 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                    required
                  />
                ))}

                <div>
                  <label className="block text-sm text-gray-300 mt-4 mb-2">Correct Answer</label>
                  <select
                    name="correct_answer"
                    value={form.correct_answer}
                    onChange={handleChange}
                    required
                    className="w-full bg-black/60 text-white border border-white/20 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                  >
                    <option value="">Select Correct Option</option>
                    {form.options.map((opt, i) => (
                      <option key={i} value={opt}>
                        {opt || `Option ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Highlight Option */}
            {form.question_type === "highlight" && (
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Incorrect Word (must exist in question text)
                </label>
                <input
                  type="text"
                  name="incorrect_answer"
                  value={form.incorrect_answer}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/60 text-white border border-white/20 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                />
              </div>
            )}

            {/* Short Answer */}
            {form.question_type === "short_answer" && (
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Accepted Keywords or Phrases
                </label>

                <textarea
                  name="correct_answer"
                  value={form.correct_answer}
                  onChange={handleChange}
                  required
                  placeholder={`Example:
                    nature
                    protect
                    environment`}
                  className="w-full bg-black/60 text-white border border-white/20 rounded-lg p-3 h-32 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition resize-none"
                />

                <p className="text-xs text-gray-400 mt-2">
                  Enter keywords or phrases.
                  Each line counts as a valid answer.
                  <br /><br />
                  Example:
                  <br />
                  nature
                  <br />
                  protect nature
                  <br />
                  importance of nature
                </p>
              </div>
            )}

            {/* Explanation */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Explanation (Optional)
              </label>
              <textarea
                name="explanation"
                value={form.explanation}
                onChange={handleChange}
                className="w-full bg-black/60 text-white border border-white/20 rounded-lg p-3 h-24 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-600 py-3 rounded-lg font-semibold transition shadow-lg shadow-cyan-500/20"
            >
              Create Question
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
