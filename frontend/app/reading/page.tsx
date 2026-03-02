"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
}

interface Story {
  id: number;
  title: string;
  content: string;
}

export default function ReadingPage() {
  const router = useRouter();

  const [stories, setStories] = useState<Story[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [step, setStep] = useState<
    "selectStory" | "selectDifficulty" | "reading" | "quiz"
  >("selectStory");

  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [difficulty, setDifficulty] = useState<
    "easy" | "average" | "hard" | null
  >(null);

  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [current, setCurrent] = useState(0);

  const currentQuestion = questions[current];

  // ✅ Fetch Stories on Load
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/stories");
        const data = await res.json();

        console.log("STORIES RESPONSE:", data);
        setStories(data);
      } catch (err) {
        console.error("Failed to fetch stories", err);
      }
    };

    fetchStories();
  }, []);

  // ✅ Fetch Questions when difficulty selected
  useEffect(() => {
    if (!selectedStory || !difficulty) return;

    const fetchQuestions = async () => {
      try {
        const res = await fetch(
        `http://localhost:5000/api/questions?activity=reading&storyId=${selectedStory.id}&difficulty=${difficulty}`
      );
        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        console.error("Failed to fetch questions", err);
      }
    };

    fetchQuestions();
  }, [selectedStory, difficulty]);

  const handleAnswer = (option: string) => {
    if (selected) return;
    setSelected(option);
    if (option === currentQuestion.answer) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  };

  return (
    <div className="relative min-h-screen flex justify-center items-center text-gray-900 overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 p-6 pt-24 sm:pt-28">

      {/* Back Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push("/dashboards/StudentDashboard")}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-3 py-2 text-white font-medium hover:bg-white/30 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </motion.button>

      <AnimatePresence mode="wait">

        {/* STEP 1 — STORY SELECTION */}
        {step === "selectStory" && (
          <motion.div
            key="selectStory"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-2xl text-center w-full max-w-xl border border-white/20"
          >
            <h1 className="text-4xl font-bold text-white mb-6">
              📚 Choose a Story
            </h1>

            {stories.length === 0 ? (
              <p className="text-white">Loading stories...</p>
            ) : (
              <div className="space-y-4">
                {stories.map((story) => (
                  <button
                    key={story.id}
                    onClick={() => {
                      setSelectedStory(story);
                      setStep("selectDifficulty");
                    }}
                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-indigo-500 text-white rounded-xl font-semibold hover:opacity-90"
                  >
                    {story.title}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 2 — DIFFICULTY */}
        {step === "selectDifficulty" && selectedStory && (
          <motion.div
            key="difficulty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl text-center w-full max-w-xl border border-white/20 text-white"
          >
            <h1 className="text-2xl font-bold mb-6">
              Choose difficulty for {selectedStory.title}
            </h1>

            {(["easy", "average", "hard"] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  setDifficulty(lvl);
                  setStep("reading");
                }}
                className="w-full py-3 mb-3 bg-yellow-400 text-indigo-900 rounded-xl font-semibold"
              >
                {lvl.toUpperCase()}
              </button>
            ))}
          </motion.div>
        )}

        {/* STEP 3 — READING */}
        {step === "reading" && selectedStory && (
          <motion.div
            key="reading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl w-full max-w-3xl text-white border border-white/20"
          >
            <h1 className="text-3xl font-bold text-yellow-300 mb-4">
              {selectedStory.title}
            </h1>

            <p className="text-lg whitespace-pre-line mb-6">
              {selectedStory.content}
            </p>

            <button
              onClick={() => setStep("quiz")}
              className="w-full bg-yellow-400 text-indigo-900 py-3 rounded-xl font-bold"
            >
              Start Quiz →
            </button>
          </motion.div>
        )}

        {/* STEP 4 — QUIZ */}
        {step === "quiz" && currentQuestion && !finished && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl w-full max-w-3xl text-white border border-white/20"
          >
            <h2 className="text-2xl font-bold mb-6">
              {currentQuestion.question}
            </h2>

            <div className="grid gap-4">
              {currentQuestion.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  disabled={!!selected}
                  className="py-3 rounded-xl bg-white/20 hover:bg-white/30"
                >
                  {opt}
                </button>
              ))}
            </div>

            {selected && (
              <button
                onClick={handleNext}
                className="mt-6 w-full py-3 bg-yellow-400 text-indigo-900 rounded-xl"
              >
                Next →
              </button>
            )}
          </motion.div>
        )}

        {/* STEP 5 — RESULT */}
        {finished && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl text-center text-white"
          >
            <h1 className="text-4xl font-bold mb-4">
              🎉 You scored {score} / {questions.length}
            </h1>

            <button
              onClick={() => window.location.reload()}
              className="bg-yellow-400 text-indigo-900 px-8 py-3 rounded-full"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
