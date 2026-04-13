"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Story {
  id: number;
  title: string;
}

interface QuestionForm {
  activity: string;
  difficulty: string;
  question_type: string;
  question_text: string;
  correct_answer: string;
  explanation: string;
  options: string[];
  story_id?: number | null;
}

export default function EditQuestionPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stories, setStories] = useState<Story[]>([]);

  const [form, setForm] = useState<QuestionForm>({
    activity: "grammar",
    difficulty: "easy",
    question_type: "mcq",
    question_text: "",
    correct_answer: "",
    explanation: "",
    options: ["", "", "", ""],
    story_id: null,
  });

  /* ================= FETCH QUESTION ================= */
  useEffect(() => {
    if (!id) return;

    const fetchQuestion = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/questions/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();

        setForm({
          activity: data.question.activity,
          difficulty: data.question.difficulty,
          question_type: data.question.question_type,
          question_text: data.question.question_text,
          correct_answer: data.question.correct_answer || "",
          explanation: data.question.explanation || "",
          options:
            Array.isArray(data.options) && data.options.length
              ? data.options
              : ["", "", "", ""],
          story_id: data.question.story_id || null,
        });

        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [id]);

  /* ================= FETCH STORIES ================= */
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/stories`
        );
        const data = await res.json();
        setStories(data);
      } catch (err) {
        console.error("Failed to fetch stories", err);
      }
    };

    fetchStories();
  }, []);

  /* ================= HANDLERS ================= */
  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (name === "difficulty" && value === "hard") {
      setForm((prev) => ({
        ...prev,
        difficulty: value,
        question_type: "long_answer",
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...form.options];
    updated[index] = value;
    setForm((prev) => ({ ...prev, options: updated }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token"); 

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/questions/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, 
          },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Update failed");
      }

      alert("✅ Question updated!");
      router.push("/admin/questions");
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <p className="p-6 text-white">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex">

      {/* SIDEBAR */}
      <aside className="w-64 bg-black/60 border-r border-white/10 p-6 hidden md:flex flex-col">
        <h2 className="text-xl font-bold text-cyan-400 mb-8">Admin Panel</h2>

        <nav className="flex flex-col gap-4 text-sm">
          <button onClick={() => router.push("/admin/questions")} className="text-cyan-400">
            Manage Questions
          </button>
          <button onClick={() => router.push("/admin")} className="text-gray-400 mt-8">
            Back to Dashboard
          </button>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8 max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cyan-400">
            Edit Question
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Modify your question content, answers, and story assignment.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-8 backdrop-blur-xl shadow-xl"
        >

          {/* SETTINGS */}
          <div>
            <h2 className="text-lg font-semibold text-cyan-300 mb-4">
              Settings
            </h2>

            <div className="grid md:grid-cols-4 gap-4">

              <select name="activity" value={form.activity} onChange={handleChange} className="input">
                <option value="grammar">Grammar</option>
                <option value="reading">Reading</option>
                <option value="listening">Listening</option>
                <option value="comprehension">Comprehension</option>
              </select>

              <select name="difficulty" value={form.difficulty} onChange={handleChange} className="input">
                <option value="easy">Easy</option>
                <option value="average">Average</option>
                <option value="hard">Hard</option>
              </select>

              <select
                name="question_type"
                value={form.question_type}
                onChange={handleChange}
                disabled={form.difficulty === "hard"}
                className="input"
              >
                <option value="mcq">MCQ</option>
                <option value="short_answer">Short Answer</option>
                <option value="long_answer">Long Answer</option>
              </select>

              {/* 🔥 STORY SELECT */}
              <select
                name="story_id"
                value={form.story_id || ""}
                onChange={handleChange}
                className="input"
              >
                <option value="">No Story</option>
                {stories.map((story) => (
                  <option key={story.id} value={story.id}>
                    {story.title}
                  </option>
                ))}
              </select>

            </div>
          </div>

          {/* QUESTION */}
          <div>
            <h2 className="text-lg font-semibold text-cyan-300 mb-2">
              Question
            </h2>

            <textarea
              name="question_text"
              value={form.question_text}
              onChange={handleChange}
              rows={4}
              placeholder="Enter your question..."
              className="input w-full"
            />
          </div>

          {/* ANSWERS */}
          <div>
            <h2 className="text-lg font-semibold text-cyan-300 mb-4">
              Answers
            </h2>

            {form.question_type === "mcq" && (
              <div className="grid gap-3">
                {form.options.map((opt, i) => (
                  <input
                    key={i}
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className="input"
                  />
                ))}
              </div>
            )}

            {(form.question_type === "short_answer" ||
              form.question_type === "long_answer") && (
              <textarea
                name="correct_answer"
                value={form.correct_answer}
                onChange={handleChange}
                rows={5}
                placeholder="Enter keywords (one per line)..."
                className="input w-full"
              />
            )}
          </div>

          {/* EXPLANATION */}
          <div>
            <h2 className="text-lg font-semibold text-cyan-300 mb-2">
              Explanation (Optional)
            </h2>

            <textarea
              name="explanation"
              value={form.explanation}
              onChange={handleChange}
              rows={3}
              className="input w-full"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-between items-center pt-4 border-t border-white/10">

            <button
              type="button"
              onClick={() => router.push("/admin/questions")}
              className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 font-semibold shadow-lg hover:scale-105 transition"
            >
              Save Changes
            </button>

          </div>
        </form>
      </main>

      {/* GLOBAL INPUT STYLE */}
      <style jsx>{`
        .input {
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 12px;
          border-radius: 10px;
          color: white;
          width: 100%;
        }

        .input:focus {
          outline: none;
          border-color: #22d3ee;
          box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.4);
        }
      `}</style>
    </div>
  );
}