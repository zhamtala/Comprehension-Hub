"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface QuestionForm {
  activity: string;
  difficulty: string;
  question_type: string;
  question_text: string;
  correct_answer: string;
  explanation: string;
  options: string[];
}

export default function EditQuestionPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState<QuestionForm>({
    activity: "grammar",
    difficulty: "easy",
    question_type: "mcq",
    question_text: "",
    correct_answer: "",
    explanation: "",
    options: ["", "", "", ""],
  });

  // =========================
  // FETCH QUESTION
  // =========================
  useEffect(() => {
    if (!id) return;

    const fetchQuestion = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/questions/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        setForm({
          activity: data.activity || "grammar",
          difficulty: data.difficulty || "easy",
          question_type: data.question_type || "mcq",
          question_text: data.question_text || "",
          correct_answer: data.correct_answer || "",
          explanation: data.explanation || "",
          options:
            Array.isArray(data.options) && data.options.length
              ? data.options
              : ["", "", "", ""],
        });

        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [id]);

  // =========================
  // HANDLE CHANGE
  // =========================
  const handleChange = (e: any) => {
    const { name, value } = e.target;

    // 🔥 AUTO SET ESSAY FOR HARD
    if (name === "difficulty" && value === "hard") {
      setForm((prev) => ({
        ...prev,
        difficulty: value,
        question_type: "essay",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // OPTION CHANGE
  // =========================
  const handleOptionChange = (index: number, value: string) => {
    const updated = [...form.options];
    updated[index] = value;

    setForm((prev) => ({
      ...prev,
      options: updated,
    }));
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/questions/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) throw new Error("Update failed");

      alert("✅ Question updated!");
      router.push("/admin/questions");
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex">

      {/* SIDEBAR */}
      <aside className="w-64 bg-black/60 border-r border-white/10 p-6 hidden md:flex flex-col">
        <h2 className="text-xl font-bold text-cyan-400 mb-8">
          Admin Panel
        </h2>

        <nav className="flex flex-col gap-4 text-sm">
          <button onClick={() => router.push("/admin/upload")} className="hover:text-cyan-400">
            Upload Questions
          </button>
          <button onClick={() => router.push("/admin/questions")} className="text-cyan-400">
            Manage Questions
          </button>
          <button onClick={() => router.push("/admin")} className="mt-8 text-gray-400">
            Back
          </button>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-cyan-400 mb-6">
          Edit Question
        </h1>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-8">

          {/* SETTINGS */}
          <div className="grid md:grid-cols-3 gap-4">

            <select name="activity" value={form.activity} onChange={handleChange} className="input">
              <option value="grammar">Grammar</option>
              <option value="reading">Reading</option>
              <option value="listening">Listening</option>
              <option value="comprehension">Comprehension</option>
            </select>

            <select name="difficulty" value={form.difficulty} onChange={handleChange} className="input">
              <option value="easy">Easy</option>
              <option value="average">Average</option>
              <option value="hard">Hard (Essay)</option>
            </select>

            <select
              name="question_type"
              value={form.question_type}
              onChange={handleChange}
              disabled={form.difficulty === "hard"} // 🔥 lock for hard
              className="input"
            >
              <option value="mcq">MCQ</option>
              <option value="short_answer">Short Answer</option>
              <option value="essay">Essay</option>
            </select>
          </div>

          {/* QUESTION */}
          <textarea
            name="question_text"
            value={form.question_text}
            onChange={handleChange}
            rows={4}
            placeholder="Enter question..."
            className="input w-full"
          />

          {/* ANSWER UI */}
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

          {form.question_type === "short_answer" && (
            <textarea
              name="correct_answer"
              value={form.correct_answer}
              onChange={handleChange}
              rows={3}
              placeholder="Correct answer..."
              className="input w-full"
            />
          )}

          {form.question_type === "essay" && (
            <textarea
              name="correct_answer"
              value={form.correct_answer}
              onChange={handleChange}
              rows={6}
              placeholder="Guide answer / rubric..."
              className="input w-full"
            />
          )}

          {/* EXPLANATION */}
          <textarea
            name="explanation"
            value={form.explanation}
            onChange={handleChange}
            rows={3}
            placeholder="Explanation (optional)"
            className="input w-full"
          />

          {/* ACTIONS */}
          <div className="flex justify-end gap-4">
            <button onClick={() => router.push("/admin/questions")} className="btn-secondary">
              Cancel
            </button>

            <button onClick={handleSubmit} className="btn-primary">
              Save Changes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}