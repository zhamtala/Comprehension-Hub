"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Brain, Sparkles, LogOut } from "lucide-react";
import Confetti from "react-confetti";
import { useRouter } from "next/navigation";

type Difficulty = "easy" | "medium" | "hard";

export default function ComprehensionPage() {
  const router = useRouter();

  const [currentStoryIndex, setCurrentStoryIndex] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [completedDifficulties, setCompletedDifficulties] = useState<Difficulty[]>([]);
  const [story, setStory] = useState("");
  const [questions, setQuestions] = useState<{ q: string; a: string[]; correct: string }[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [title, setTitle] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: 400, height: 800 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateSize = () => setScreenSize({ width: window.innerWidth, height: window.innerHeight });
      updateSize();
      window.addEventListener("resize", updateSize);
      return () => window.removeEventListener("resize", updateSize);
    }
  }, []);

  const storyList = [
    {
      title: "The Lost Book",
      story: `In a quiet village, a boy named Leo discovered an old book in his school library. It was filled with stories that changed every time he read them.`,
      questions: [
        { q: "Where did Leo find the book?", a: ["In his house", "In the library", "In a park", "At the beach"], correct: "In the library" },
        { q: "What was special about the book?", a: ["It glowed", "It changed stories", "It could talk", "It was blank"], correct: "It changed stories" },
      ],
    },
    {
      title: "The Talking River",
      story: `Mira loved walking by the river every morning. One day, she heard the water whisper her name and tell her about distant lands.`,
      questions: [
        { q: "Where did Mira like to walk?", a: ["In the forest", "By the river", "On the mountain", "In the city"], correct: "By the river" },
        { q: "What did the river do?", a: ["It glowed", "It whispered her name", "It sang songs", "It was silent"], correct: "It whispered her name" },
      ],
    },
  ];

  const generateStory = () => {
    let index = currentStoryIndex;
    if (index === null) {
      index = Math.floor(Math.random() * storyList.length);
      setCurrentStoryIndex(index);
    }
    const randomStory = storyList[index];
    setStory(randomStory.story);
    setQuestions(randomStory.questions);
    setTitle(randomStory.title);
    setUserAnswers({});
    setShowResult(false);
  };

  const playAudio = async () => {
    if (!story) return;
    try {
      setIsPlaying(true);
      const response = await fetch(`/api/tts?text=${encodeURIComponent(story)}`);
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

  const checkAnswers = () => {
    let correctCount = 0;
    questions.forEach((q, i) => {
      if (userAnswers[i] === q.correct) correctCount++;
    });
    setScore(correctCount);
    setShowResult(true);
    if (correctCount > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
    setCompletedDifficulties([...completedDifficulties, difficulty]);
  };

  const moveToNextDifficulty = () => {
    if (difficulty === "easy") setDifficulty("medium");
    else if (difficulty === "medium") setDifficulty("hard");
    setCurrentStoryIndex(null);
    generateStory();
  };

  const isDifficultyUnlocked = (level: Difficulty) => {
    if (level === "easy") return true;
    if (level === "medium") return completedDifficulties.includes("easy");
    if (level === "hard") return completedDifficulties.includes("medium");
    return false;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-black via-slate-900 to-black text-white px-4 pt-[env(safe-area-inset-top)] pb-20 relative overflow-hidden"
    >
      {/* CONFETTI */}
      {showConfetti && typeof window !== "undefined" && (
        <motion.div className="fixed inset-0 z-[9999] pointer-events-none">
          <Confetti width={screenSize.width} height={screenSize.height} numberOfPieces={350} recycle={false} />
        </motion.div>
      )}

      {/* Header */}
      <motion.div className="z-10 text-center mb-10 max-w-full flex flex-col items-center gap-2 px-2">
        <h1
          className="font-extrabold bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent flex items-center justify-center gap-2 text-center flex-wrap"
          style={{ fontSize: "clamp(1.8rem, 6vw, 3rem)" }}
        >
          <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" /> Comprehension Challenge
        </h1>
        <p className="text-cyan-200/70 text-center" style={{ fontSize: "clamp(0.875rem, 3vw, 1rem)" }}>
          Sharpen your reading and listening skills 🎧📖
        </p>
      </motion.div>

      {/* Difficulty Selector */}
      <div className="z-10 flex justify-center mb-6 w-full max-w-xs sm:max-w-sm md:max-w-lg mx-auto gap-3 flex-wrap">
        {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
          <motion.button
            key={level}
            whileHover={{ scale: isDifficultyUnlocked(level) ? 1.05 : 1 }}
            whileTap={{ scale: isDifficultyUnlocked(level) ? 0.95 : 1 }}
            onClick={() => {
              if (isDifficultyUnlocked(level)) {
                setDifficulty(level);
                generateStory();
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

      {/* Story Display */}
      {story && (
        <motion.div className="z-10 bg-white/10 border border-cyan-400/20 rounded-3xl p-4 sm:p-6 md:p-8 text-center max-w-full md:max-w-3xl mx-auto mb-8 backdrop-blur-md shadow-2xl w-full">
          <h2 className="text-cyan-300 font-bold mb-3" style={{ fontSize: "clamp(1.2rem, 5vw, 2rem)" }}>
            {title}
          </h2>

          {difficulty === "easy" && (
            <p className="text-gray-100 leading-relaxed" style={{ fontSize: "clamp(0.9rem, 3.5vw, 1.25rem)" }}>
              {story}
            </p>
          )}

          {difficulty === "medium" && (
            <>
              <p className="text-gray-100 leading-relaxed mb-3" style={{ fontSize: "clamp(0.9rem, 3.5vw, 1.25rem)" }}>
                {story}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={playAudio}
                disabled={isPlaying}
                className={`flex items-center justify-center gap-2 mx-auto mt-2 px-5 md:px-6 py-2 rounded-full font-medium transition-all text-sm md:text-base ${
                  isPlaying ? "bg-gray-600 cursor-not-allowed" : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90"
                }`}
              >
                <Volume2 className="w-5 h-5" /> {isPlaying ? "Playing..." : "Listen to Story"}
              </motion.button>
            </>
          )}

          {difficulty === "hard" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={playAudio}
              disabled={isPlaying}
              className={`flex items-center justify-center gap-2 mx-auto mt-2 px-5 md:px-6 py-2 rounded-full font-medium transition-all text-sm md:text-base ${
                isPlaying ? "bg-gray-600 cursor-not-allowed" : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90"
              }`}
            >
              <Volume2 className="w-5 h-5" /> {isPlaying ? "Playing..." : "Listen to Story"}
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Questions */}
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
              <p className="font-semibold text-cyan-100 mb-2 md:mb-3" style={{ fontSize: "clamp(0.9rem, 3vw, 1.15rem)" }}>
                {i + 1}. {q.q}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                {q.a.map((opt) => (
                  <motion.button
                    key={opt}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => setUserAnswers({ ...userAnswers, [i]: opt })}
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

      {/* Result Modal */}
      <AnimatePresence>
        {showResult && (
          <motion.div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-20 px-4">
            <motion.div className="relative bg-white rounded-3xl p-8 md:p-10 text-center shadow-2xl border border-gray-200 max-w-sm md:max-w-lg w-full">
              <motion.h2 className="text-2xl md:text-3xl font-extrabold mb-3 bg-gradient-to-r from-cyan-500 to-fuchsia-500 bg-clip-text text-transparent">
                🎉 Challenge Complete!
              </motion.h2>

              <motion.p className="text-gray-700 mb-4 text-base md:text-lg">
                You scored <span className="font-semibold text-emerald-500">{score}</span> out of <span className="font-semibold">{questions.length}</span>
              </motion.p>

              <motion.p className="text-gray-600 italic mb-6 text-sm md:text-base">
                {score === questions.length
                  ? "Perfect score! You truly mastered it 🧠✨"
                  : score > questions.length / 2
                  ? "Awesome effort — you're improving fast 🚀"
                  : "Don’t stop now! Each try makes you stronger 💪"}
              </motion.p>

              {/* Buttons */}
              <div className="flex flex-col md:flex-row gap-3 justify-center">
                {difficulty !== "hard" && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={moveToNextDifficulty}
                    className="px-6 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold w-full md:w-auto"
                  >
                    Move to Next Difficulty
                  </motion.button>
                )}
                {difficulty === "hard" && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push("/select")}
                    className="px-6 py-2 rounded-full bg-red-500/80 text-white font-semibold w-full md:w-auto"
                  >
                    Back to Selection
                  </motion.button>
                )}
              </div>
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
