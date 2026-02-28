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
            `http://localhost:5000/api/admin/questions/${id}`,
            {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            }
        );

        if (!res.ok) {
            const text = await res.text(); // safer debugging
            console.error("Raw backend response:", text);
            throw new Error("Failed to fetch question");
        }

        const data = await res.json();

        setForm({
            activity: data.activity || "grammar",
            difficulty: data.difficulty || "easy",
            question_type: data.question_type || "mcq",
            question_text: data.question_text || "",
            correct_answer: data.correct_answer || "",
            explanation: data.explanation || "",
            options:
            Array.isArray(data.options) && data.options.length === 4
                ? data.options.map((opt: string) => opt || "")
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
  // HANDLE INPUT CHANGE
  // =========================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value ?? "",
    }));
  };

  // =========================
  // HANDLE OPTION CHANGE
  // =========================
  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...form.options];
    updatedOptions[index] = value ?? "";

    setForm((prev) => ({
      ...prev,
      options: updatedOptions,
    }));
  };

  // =========================
  // HANDLE SUBMIT
  // =========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
        
      const res = await fetch(
        `http://localhost:5000/api/questions/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update question");
      }

      alert("Question updated successfully!");
      router.push("/admin/questions");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // =========================
  // UI STATES
  // =========================
  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  // =========================
  // UI
  // =========================
    return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex">

        {/* SIDEBAR */}
        <aside className="w-64 bg-black/60 border-r border-white/10 p-6 hidden md:flex flex-col">
        <h2 className="text-xl font-bold text-cyan-400 mb-8">
            Admin Panel
        </h2>

        <nav className="flex flex-col gap-4 text-sm">
            <button
            onClick={() => router.push("/admin/upload")}
            className="text-left hover:text-cyan-400 transition"
            >
            Upload Questions
            </button>

            <button
            onClick={() => router.push("/admin/questions")}
            className="text-left text-cyan-400"
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

        {/* HEADER */}
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-cyan-400">
            Edit Question
            </h1>
            <p className="text-gray-400 text-sm mt-2">
            Modify and update question details below.
            </p>
        </div>

        {/* FORM CARD */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl space-y-8">

            {/* BASIC SETTINGS */}
            <div className="grid md:grid-cols-3 gap-4">
            <select
                name="activity"
                value={form.activity}
                onChange={handleChange}
                className="bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
                <option value="grammar">Grammar</option>
                <option value="reading">Reading</option>
                <option value="listening">Listening</option>
                <option value="comprehension">Comprehension</option>
            </select>

            <select
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                className="bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
                <option value="easy">Easy</option>
                <option value="average">Average</option>
                <option value="hard">Hard</option>
                <option value="standard">Standard</option>
            </select>

            <select
                name="question_type"
                value={form.question_type}
                onChange={handleChange}
                className="bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
                <option value="mcq">Multiple Choice</option>
                <option value="short_answer">Short Answer</option>
            </select>
            </div>

            {/* QUESTION TEXT */}
            <div>
            <h2 className="text-lg font-semibold text-cyan-400 mb-3">
                Question
            </h2>
            <textarea
                name="question_text"
                value={form.question_text}
                onChange={handleChange}
                rows={4}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            </div>

            {/* ANSWER SECTION */}
            <div>
            <h2 className="text-lg font-semibold text-cyan-400 mb-3">
                Answer Section
            </h2>

            {form.question_type === "mcq" ? (
                <div className="grid gap-3">
                {form.options.map((option, index) => (
                    <input
                    key={index}
                    type="text"
                    value={option}
                    onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                    }
                    placeholder={`Option ${index + 1}`}
                    className="bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                ))}
                </div>
            ) : (
                <textarea
                name="correct_answer"
                value={form.correct_answer || ""}
                onChange={handleChange}
                rows={5}
                placeholder="Enter acceptable answers or phrases..."
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
            )}
            </div>

            {/* EXPLANATION */}
            <div>
            <h2 className="text-lg font-semibold text-cyan-400 mb-3">
                Explanation (Optional)
            </h2>
            <textarea
                name="explanation"
                value={form.explanation}
                onChange={handleChange}
                rows={4}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
            <button
                onClick={() => router.push("/admin/questions")}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition"
            >
                Cancel
            </button>

            <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition"
            >
                Save Changes
            </button>
            </div>

        </div>
        </main>
    </div>
    );
}