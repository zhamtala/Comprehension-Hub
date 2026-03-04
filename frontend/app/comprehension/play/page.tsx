"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Brain, Sparkles } from "lucide-react";
import Confetti from "react-confetti";
import { useRouter } from "next/navigation";

type Difficulty = "easy" | "average" | "hard";

export default function ComprehensionPage() {
  const router = useRouter();

  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [completedDifficulties, setCompletedDifficulties] = useState<Difficulty[]>([]);
  const [story, setStory] = useState("");
  const [questions, setQuestions] = useState<{ q: string; a: string[]; correct: string; type: string }[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [title, setTitle] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: 400, height: 800 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateSize = () =>
        setScreenSize({ width: window.innerWidth, height: window.innerHeight });
      updateSize();
      window.addEventListener("resize", updateSize);
      return () => window.removeEventListener("resize", updateSize);
    }
  }, []);

  // 🔥 Fetch story + questions from backend
  const generateStory = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/comprehension?difficulty=${difficulty}`
      );

      const data = await res.json();

      if (!data.story) {
        setStory("");
        setQuestions([]);
        return;
      }

      setStory(data.story);
      setTitle(data.title || "Comprehension Story");
      setQuestions(data.questions);
      setUserAnswers({});
      setShowResult(false);
    } catch (error) {
      console.error("Failed to fetch comprehension content", error);
    }
  };

  // 🔥 Auto load when difficulty changes
  useEffect(() => {
    generateStory();
  }, [difficulty]);

  const playAudio = async () => {
    if (!story) return;
    try {
      setIsPlaying(true);
      const response = await fetch(
        `/api/tts?text=${encodeURIComponent(story)}`
      );
      if (!response.ok) throw new Error("Failed to fetch audio");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      document.body.appendChild(audio);
      await audio.play();
    } catch {
      setIsPlaying(false);
    }
  };

  const checkAnswers = async () => {
    let correctCount = 0;
   questions.forEach((q, i) => {
    const studentAnswer = userAnswers[i]?.trim().toLowerCase() || "";

    if (!q.correct) return; // skip if no correct answer stored

    if (q.type === "mcq") {
      if (studentAnswer === q.correct.trim().toLowerCase()) {
        correctCount++;
      }
    }

    if (q.type === "short_answer") {

    const studentAnswer =
      (userAnswers[i] || "").toLowerCase();

    const acceptableAnswers =
      (q.correct || "")
        .toLowerCase()
        .split("\n")
        .map(a => a.trim())
        .filter(a => a.length > 0);

    const matched = acceptableAnswers.some(keyword =>
      studentAnswer.includes(keyword)
    );

    if (matched) correctCount++;
}
  });

    console.log("Final Score:", correctCount);
    setScore(correctCount);
    setShowResult(true);

    try {
      const token = localStorage.getItem("token");

      await fetch("${process.env.NEXT_PUBLIC_API_URL}/api/activities/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          activityType: "comprehension",
          difficulty,
          score: correctCount,
          total: questions.length,
        }),
      });
    } catch (err) {
      console.error("Failed to save comprehension progress", err);
    }

    if (correctCount > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }

    if (!completedDifficulties.includes(difficulty)) {
      setCompletedDifficulties([...completedDifficulties, difficulty]);
    }
  };

  const moveToNextDifficulty = () => {
    if (difficulty === "easy") setDifficulty("average");
    else if (difficulty === "average") setDifficulty("hard");
  };

  const isDifficultyUnlocked = (level: Difficulty) => {
    if (level === "easy") return true;
    if (level === "average") return completedDifficulties.includes("easy");
    if (level === "hard") return completedDifficulties.includes("average");
    return false;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-black via-slate-900 to-black text-white px-4 pt-[env(safe-area-inset-top)] pb-20 relative overflow-hidden"
    >
      {showConfetti && typeof window !== "undefined" && (
        <motion.div className="fixed inset-0 z-[9999] pointer-events-none">
          <Confetti
            width={screenSize.width}
            height={screenSize.height}
            numberOfPieces={350}
            recycle={false}
          />
        </motion.div>
      )}

      <motion.div className="z-10 text-center mb-10 max-w-full flex flex-col items-center gap-2 px-2">
        <h1
          className="font-extrabold bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent flex items-center justify-center gap-2 text-center flex-wrap"
          style={{ fontSize: "clamp(1.8rem, 6vw, 3rem)" }}
        >
          <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" /> Comprehension Challenge
        </h1>
        <p
          className="text-cyan-200/70 text-center"
          style={{ fontSize: "clamp(0.875rem, 3vw, 1rem)" }}
        >
          Sharpen your reading and listening skills 🎧📖
        </p>
      </motion.div>

      <div className="z-10 flex justify-center mb-6 w-full max-w-xs sm:max-w-sm md:max-w-lg mx-auto gap-3 flex-wrap">
        {(["easy", "average", "hard"] as Difficulty[]).map((level) => (
          <motion.button
            key={level}
            whileHover={{ scale: isDifficultyUnlocked(level) ? 1.05 : 1 }}
            whileTap={{ scale: isDifficultyUnlocked(level) ? 0.95 : 1 }}
            onClick={() => {
              if (isDifficultyUnlocked(level)) {
                setDifficulty(level);
              }
            }}
            className={`flex-1 px-4 py-2 rounded-full text-sm md:text-base font-semibold uppercase tracking-wide text-center ${
              difficulty === level
                ? "bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-lg"
                : isDifficultyUnlocked(level)
                ? "bg-white/10 text-gray-300 border border-cyan-400/20 hover:bg-white/20"
                : "bg-gray-700/20 text-gray-500 border border-gray-600 cursor-not-allowed"
            }`}
          >
            {level}
          </motion.button>
        ))}
      </div>

      {story && (
        <motion.div className="z-10 bg-white/10 border border-cyan-400/20 rounded-3xl p-4 sm:p-6 md:p-8 text-center max-w-full md:max-w-3xl mx-auto mb-8 backdrop-blur-md shadow-2xl w-full">
          <h2
            className="text-cyan-300 font-bold mb-3"
            style={{ fontSize: "clamp(1.2rem, 5vw, 2rem)" }}
          >
            {title}
          </h2>

          {difficulty === "easy" && (
            <p
              className="text-gray-100 leading-relaxed"
              style={{ fontSize: "clamp(0.9rem, 3.5vw, 1.25rem)" }}
            >
              {story}
            </p>
          )}

          {(difficulty === "average" || difficulty === "hard") && (
            <>
              {difficulty === "average" && (
                <p
                  className="text-gray-100 leading-relaxed mb-3"
                  style={{ fontSize: "clamp(0.9rem, 3.5vw, 1.25rem)" }}
                >
                  {story}
                </p>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={playAudio}
                disabled={isPlaying}
                className={`flex items-center justify-center gap-2 mx-auto mt-2 px-5 md:px-6 py-2 rounded-full font-medium transition-all text-sm md:text-base ${
                  isPlaying
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90"
                }`}
              >
                <Volume2 className="w-5 h-5" />{" "}
                {isPlaying ? "Playing..." : "Listen to Story"}
              </motion.button>
            </>
          )}
        </motion.div>
      )}

      {questions.length > 0 && !showResult && (
        <div className="z-10 w-full max-w-full md:max-w-4xl space-y-4 md:space-y-6 px-2">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-transparent bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 bg-clip-text">
            <Brain className="text-cyan-300" /> Comprehension Questions
          </h2>

          {questions.map((q, i) => (
            <motion.div
              key={i}
              className="p-3 md:p-5 rounded-2xl bg-white/10 border border-cyan-400/20 shadow-lg backdrop-blur-md"
            >
              <p
                className="font-semibold text-cyan-100 mb-2 md:mb-3"
                style={{ fontSize: "clamp(0.9rem, 3vw, 1.15rem)" }}
              >
                {i + 1}. {q.q}
              </p>

              {q.type === "mcq" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                {q.a.map((opt) => (
                  <motion.button
                    key={opt}
                    whileHover={{ scale: 1.03 }}
                    onClick={() =>
                      setUserAnswers({ ...userAnswers, [i]: opt })
                    }
                    className={`px-2 md:px-4 py-2 rounded-xl text-sm md:text-base font-medium transition-all ${
                      userAnswers[i] === opt
                        ? "bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-md"
                        : "bg-white/10 hover:bg-white/20 text-gray-200"
                    }`}
                  >
                    {opt}
                  </motion.button>
                ))}
              </div>
            )}

            {q.type === "short_answer" && (
              <input
                type="text"
                placeholder="Type your answer..."
                value={userAnswers[i] || ""}
                onChange={(e) =>
                  setUserAnswers({ ...userAnswers, [i]: e.target.value })
                }
                className="w-full px-4 py-2 rounded-xl bg-white/10 border border-cyan-400/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            )}
            </motion.div>
          ))}

          <motion.button
            whileHover={{ scale: 1.08 }}
            onClick={checkAnswers}
            className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white px-6 md:px-8 py-2 md:py-3 rounded-full font-semibold shadow-lg hover:opacity-90 transition-all mx-auto block"
          >
            Check Answers
          </motion.button>
        </div>
      )}
        <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-[999]"
          >
            <motion.div
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.7 }}
              className="bg-white text-black rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-4">
                🎉 Your Score
              </h2>

              <p className="text-lg mb-4">
                {score} / {questions.length}
              </p>

              <p className="mb-6 font-semibold">
                {Math.round((score / questions.length) * 100)}%
              </p>

              {difficulty !== "hard" && (
                <button
                  onClick={() => {
                    setShowResult(false);
                    moveToNextDifficulty();
                  }}
                  className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white px-6 py-2 rounded-full font-semibold w-full mb-3"
                >
                  Next Difficulty
                </button>
              )}

              <button
                onClick={() => {
                  setShowResult(false);
                  generateStory();
                }}
                className="border border-gray-400 px-6 py-2 rounded-full w-full"
              >
                Try Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <footer className="mt-auto pb-[env(safe-area-inset-bottom)] text-xs md:text-sm text-cyan-300/80 font-mono tracking-wide pt-10">
        CompreHub — Read, Listen, Understand ⚡
      </footer>
    </motion.div>
  );
}
