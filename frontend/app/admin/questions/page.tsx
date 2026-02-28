"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Question {
  id: number;
  activity: string;
  difficulty: string;
  question_type: string;
  question_text: string;
}

export default function ManageQuestionsPage() {
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================
     FETCH QUESTIONS
  ========================= */
  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(
        "http://localhost:5000/api/admin/questions",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setQuestions(data);
      } else {
        setError(data.error || "Failed to fetch questions");
      }
    } catch (err) {
      setError("Server error");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  /* =========================
     DELETE QUESTION
  ========================= */
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(
        `http://localhost:5000/api/admin/questions/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      } else {
        alert("Delete failed");
      }
    } catch {
      alert("Server error");
    }
  };

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

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cyan-400">
            Manage Questions
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            View, manage, and delete questions in the system.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl overflow-x-auto">

          {loading ? (
            <p className="text-gray-400">Loading questions...</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-gray-300">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Activity</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Question</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {questions.map((q) => (
                  <tr
                    key={q.id}
                    className="border-b border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="py-3 px-4">{q.id}</td>
                    <td className="py-3 px-4 capitalize">{q.activity}</td>
                    <td className="py-3 px-4 capitalize">{q.difficulty}</td>
                    <td className="py-3 px-4 uppercase">{q.question_type}</td>
                    <td className="py-3 px-4 max-w-xs truncate">
                      {q.question_text}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => router.push(`/admin/edit/${q.id}`)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-xs transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              
            </table>
          )}

        </div>
      </main>
    </div>
  );
}
