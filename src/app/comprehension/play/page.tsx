"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Brain, ArrowLeft, Sparkles } from "lucide-react";
import Confetti from "react-confetti";
import { useRouter } from "next/navigation";

export default function ComprehensionPage() {
  const router = useRouter();

  const [currentStoryIndex, setCurrentStoryIndex] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "">("");
  const [story, setStory] = useState("");
  const [questions, setQuestions] = useState<{ q: string; a: string[]; correct: string }[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [title, setTitle] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const storyList = [
    {
      title: "The Lost Book",
      story: `In a quiet village, a boy named Leo discovered an old book in his school library. 
      It was filled with stories that changed every time he read them.`,
      questions: [
        { q: "Where did Leo find the book?", a: ["In his house", "In the library", "In a park", "At the beach"], correct: "In the library" },
        { q: "What was special about the book?", a: ["It glowed", "It changed stories", "It could talk", "It was blank"], correct: "It changed stories" },
      ],
    },
    {
      title: "The Talking River",
      story: `Mira loved walking by the river every morning. 
      One day, she heard the water whisper her name and tell her about distant lands.`,
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
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-black via-slate-900 to-black text-white p-8 relative overflow-hidden"
    >
      {/* 🎉 Confetti */}
      {showConfetti && typeof window !== "undefined" && (
        <motion.div
          className="fixed inset-0 z-[9999] pointer-events-none"
        >
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            numberOfPieces={400}
            recycle={false}
          />
        </motion.div>
      )}

      {/* 🌟 TOP-LEFT BACK BUTTON */}
      <motion.button
        onClick={() => router.push("/select")}
        whileHover={{ scale: 1.05 }}
        className="absolute top-6 left-6 flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/20 z-20"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Selection
      </motion.button>

      {/* Header */}
      <motion.div className="z-10 text-center mb-10">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent flex justify-center items-center gap-2">
          <Sparkles className="w-7 h-7 text-cyan-400" /> Comprehension Challenge
        </h1>
        <p className="text-cyan-200/70 mt-2 font-light tracking-wide">
          Sharpen your reading and listening skills 🎧📖
        </p>
      </motion.div>

      {/* Difficulty Selector */}
      <div className="z-10 flex flex-wrap justify-center gap-5 mb-10">
        {["easy", "medium", "hard"].map((level) => (
          <motion.button
            key={level}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setDifficulty(level as any);
              generateStory();
            }}
            className={`px-8 py-3 rounded-full font-semibold uppercase tracking-wide ${
              difficulty === level
                ? "bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-lg"
                : "bg-white/10 text-gray-300 border border-cyan-400/20 hover:bg-white/20"
            }`}
          >
            {level}
          </motion.button>
        ))}
      </div>

      {/* Story Display */}
      {story && (
        <motion.div className="z-10 bg-white/10 border border-cyan-400/20 rounded-3xl p-8 text-center max-w-3xl mb-10 backdrop-blur-md shadow-2xl">
          <h2 className="text-3xl font-bold text-cyan-300 mb-6">{title}</h2>

          {difficulty === "easy" && <p className="text-gray-100 leading-relaxed mb-4 text-lg">{story}</p>}

          {difficulty === "medium" && (
            <>
              <p className="text-gray-100 leading-relaxed mb-4 text-lg">{story}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={playAudio}
                disabled={isPlaying}
                className={`flex items-center justify-center gap-2 mx-auto mt-2 px-6 py-3 rounded-full font-medium transition-all ${
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
              className={`flex items-center justify-center gap-2 mx-auto mt-2 px-6 py-3 rounded-full font-medium transition-all ${
                isPlaying ? "bg-gray-600 cursor-not-allowed" : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90"
              }`}
            >
              <Volume2 className="w-5 h-5" /> {isPlaying ? "Playing..." : "Listen to Story"}
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Question Section */}
      {questions.length > 0 && !showResult && (
        <div className="z-10 w-full max-w-4xl space-y-8">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-transparent bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 bg-clip-text">
            <Brain className="text-cyan-300" /> Comprehension Questions
          </h2>

          {questions.map((q, i) => (
            <motion.div key={i} className="p-6 rounded-2xl bg-white/10 border border-cyan-400/20 shadow-lg backdrop-blur-md">
              <p className="font-semibold text-cyan-100 mb-4 text-lg">{i + 1}. {q.q}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {q.a.map((opt) => (
                  <motion.button
                    key={opt}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => setUserAnswers({ ...userAnswers, [i]: opt })}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
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
            className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:opacity-90 transition-all"
          >
            Check Answers
          </motion.button>
        </div>
      )}

      {/* Result Modal */}
      <AnimatePresence>
        {showResult && (
          <motion.div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-20">
            <motion.div className="relative bg-white rounded-3xl p-10 text-center shadow-2xl border border-gray-200 max-w-lg w-full">
              <motion.h2 className="text-3xl font-extrabold mb-3 bg-gradient-to-r from-cyan-500 to-fuchsia-500 bg-clip-text text-transparent">
                🎉 Challenge Complete!
              </motion.h2>

              <motion.p className="text-gray-700 mb-4 text-lg">
                You scored <span className="font-semibold text-emerald-500">{score}</span> out of <span className="font-semibold">{questions.length}</span>
              </motion.p>

              <motion.p className="text-gray-600 italic mb-6">
                {score === questions.length ? "Perfect score! You truly mastered it 🧠✨" :
                 score > questions.length / 2 ? "Awesome effort — you’re improving fast 🚀" :
                 "Don’t stop now! Each try makes you stronger 💪"}
              </motion.p>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // Reset story index so a new story is picked
                  setCurrentStoryIndex(null);
                  setShowResult(false);
                  setStory("");
                  setQuestions([]);
                  setDifficulty("");
                }}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold"
              >
                  Try Another Story
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="absolute bottom-6 text-sm text-cyan-300/80 font-mono tracking-wide">
        CompreHub — Read, Listen, Understand ⚡
      </footer>
    </motion.div>
  );
}
