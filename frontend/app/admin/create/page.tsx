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
    correct_answer: "",
    incorrect_answer: "",
    explanation: "",
    options: ["", "", "", ""],
  });

  const [stories, setStories] = useState<Story[]>([]);

  // 🔥 NEW STATES
  const [useNewStory, setUseNewStory] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState<number | null>(null);
  const [newStory, setNewStory] = useState({
    title: "",
    passage: "",
  });

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

  /* ================= FETCH STORIES ================= */
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stories`)
      .then((res) => res.json())
      .then(setStories)
      .catch((err) => console.error(err));
  }, []);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const payload: any = {
      ...form,
      options: form.question_type === "mcq" ? form.options : [],
    };

    // 🔥 CLEAN STORY LOGIC
    if (showPassage) {
      if (useNewStory) {
        payload.story = newStory;
        payload.story_id = null;
      } else {
        payload.story_id = selectedStoryId;
        payload.story = null;
      }
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/questions`,
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
        alert("✅ Question created!");
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
          <button onClick={() => router.push("/admin/create")} className="text-cyan-400">
            Create Question
          </button>
          <button onClick={() => router.push("/admin/questions")} className="hover:text-cyan-400">
            Manage Questions
          </button>
          <button onClick={() => router.push("/admin/upload")} className="hover:text-cyan-400">
            Upload Questions
          </button>
          <button onClick={() => router.push("/admin")} className="mt-8 text-gray-400">
            Back
          </button>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-cyan-400 mb-6">
          Create Question
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6 max-w-3xl backdrop-blur-xl"
        >

          {/* Activity */}
          <select name="activity" value={form.activity} onChange={handleChange} className="input">
            <option value="grammar">Grammar</option>
            <option value="reading">Reading</option>
            <option value="listening">Listening</option>
            <option value="comprehension">Comprehension</option>
          </select>

          {/* Difficulty */}
          <select name="difficulty" value={form.difficulty} onChange={handleChange} className="input">
            <option value="easy">Easy</option>
            <option value="average">Average</option>
            <option value="hard">Hard</option>
          </select>

          {/* Question Type */}
          <select name="question_type" value={form.question_type} onChange={handleChange} className="input">
            <option value="mcq">MCQ</option>
            <option value="highlight">Highlight</option>
            <option value="short_answer">Short Answer</option>
            <option value="long_answer">Long Answer</option>
          </select>

          {/* ================= STORY UI ================= */}
          {showPassage && (
            <div className="space-y-4">

              <h2 className="text-cyan-300 font-semibold">Story</h2>

              {/* TOGGLE */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setUseNewStory(false)}
                  className={!useNewStory ? "btn-primary" : "btn-secondary"}
                >
                  Existing
                </button>

                <button
                  type="button"
                  onClick={() => setUseNewStory(true)}
                  className={useNewStory ? "btn-primary" : "btn-secondary"}
                >
                  New Story
                </button>
              </div>

              {/* EXISTING */}
              {!useNewStory && (
                <select
                  value={selectedStoryId || ""}
                  onChange={(e) => setSelectedStoryId(Number(e.target.value))}
                  className="input"
                >
                  <option value="">Select story</option>
                  {stories.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              )}

              {/* NEW */}
              {useNewStory && (
                <div className="space-y-3">
                  <input
                    placeholder="Story title"
                    value={newStory.title}
                    onChange={(e) =>
                      setNewStory({ ...newStory, title: e.target.value })
                    }
                    className="input"
                  />

                  <textarea
                    placeholder="Story passage"
                    value={newStory.passage}
                    onChange={(e) =>
                      setNewStory({ ...newStory, passage: e.target.value })
                    }
                    className="input"
                    rows={6}
                  />
                </div>
              )}

            </div>
          )}

          {/* QUESTION */}
          <textarea
            name="question_text"
            value={form.question_text}
            onChange={handleChange}
            placeholder="Enter question..."
            className="input"
          />

          {/* MCQ */}
          {form.question_type === "mcq" && (
            <>
              {form.options.map((opt, i) => (
                <input
                  key={i}
                  value={opt}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className="input"
                />
              ))}

              <select
                name="correct_answer"
                value={form.correct_answer}
                onChange={handleChange}
                className="input"
              >
                <option value="">Correct Answer</option>
                {form.options.map((opt, i) => (
                  <option key={i} value={opt}>
                    {opt || `Option ${i + 1}`}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* SHORT / LONG */}
          {(form.question_type === "short_answer" ||
            form.question_type === "long_answer") && (
            <textarea
              name="correct_answer"
              value={form.correct_answer}
              onChange={handleChange}
              placeholder="Enter keywords (one per line)..."
              className="input"
              rows={5}
            />
          )}

          {/* EXPLANATION */}
          <textarea
            name="explanation"
            value={form.explanation}
            onChange={handleChange}
            placeholder="Explanation..."
            className="input"
          />

          <button className="btn-primary w-full">
            Create Question
          </button>

        </form>
      </main>

      {/* STYLES */}
      <style jsx>{`
        .input {
          background: rgba(0,0,0,0.6);
          border: 1px solid rgba(255,255,255,0.2);
          padding: 12px;
          border-radius: 10px;
          color: white;
          width: 100%;
        }

        .input:focus {
          outline: none;
          border-color: #22d3ee;
          box-shadow: 0 0 0 2px rgba(34,211,238,0.4);
        }

        .btn-primary {
          background: linear-gradient(to right, #06b6d4, #a855f7);
          padding: 10px 16px;
          border-radius: 10px;
          font-weight: 600;
        }

        .btn-secondary {
          background: rgba(255,255,255,0.1);
          padding: 10px 16px;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}