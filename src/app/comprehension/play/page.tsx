"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Brain, ArrowLeft, Sparkles } from "lucide-react";
import Confetti from "react-confetti";
import { useRouter } from "next/navigation";

export default function ComprehensionPage() {
  const router = useRouter();

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
    const randomStory = storyList[Math.floor(Math.random() * storyList.length)];
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

    // Fetch audio from your existing ElevenLabs mock endpoint
    const response = await fetch(`/api/tts?text=${encodeURIComponent(story)}`);
    if (!response.ok) throw new Error("Failed to fetch audio");

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const audio = new Audio(url);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = (err) => {
      console.error("Audio playback failed:", err);
      setIsPlaying(false);
    };

    // 🔊 Ensure Google Meet can capture it by attaching to tab
    document.body.appendChild(audio);
    await audio.play();
  } catch (err) {
    console.error("Error during TTS playback:", err);
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
      {/* Celebration Confetti Burst */}
{showConfetti && typeof window !== "undefined" && (
  <motion.div
    className="fixed inset-0 z-[9999] pointer-events-none"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: "spring", stiffness: 150, damping: 15 }}
  >
    <Confetti
      width={window.innerWidth}
      height={window.innerHeight}
      numberOfPieces={400}
      recycle={false}
      gravity={0.3}
      tweenDuration={5000}
      colors={
        difficulty === "easy"
          ? ["#67e8f9", "#22d3ee", "#06b6d4", "#a5f3fc"]
          : difficulty === "medium"
          ? ["#34d399", "#10b981", "#6ee7b7", "#059669"]
          : ["#c084fc", "#a78bfa", "#8b5cf6", "#7c3aed"]
      }
      initialVelocityY={20}
      confettiSource={{
        x: window.innerWidth / 2 - 50,
        y: window.innerHeight / 2 - 50,
        w: 100,
        h: 100,
      }}
    />
  </motion.div>
)}


      {/* Background accent glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.07),transparent_70%)]" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center mb-10"
      >
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
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0,255,255,0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setDifficulty(level as any);
              generateStory();
            }}
            className={`px-8 py-3 rounded-full font-semibold uppercase tracking-wide transition-all duration-200 ${
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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="z-10 bg-white/10 border border-cyan-400/20 rounded-3xl p-8 text-center max-w-3xl mb-10 backdrop-blur-md shadow-2xl"
        >
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
                  isPlaying
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90"
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
                isPlaying
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90"
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
            <motion.div
              key={i}
              whileHover={{ scale: 1.01 }}
              className="p-6 rounded-2xl bg-white/10 border border-cyan-400/20 shadow-lg backdrop-blur-md"
            >
              <p className="font-semibold text-cyan-100 mb-4 text-lg">
                {i + 1}. {q.q}
              </p>
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

          <div className="flex flex-col items-center gap-4 mt-10">
            <motion.button
              whileHover={{ scale: 1.08 }}
              onClick={checkAnswers}
              className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:opacity-90 transition-all"
            >
              Check Answers
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/select")}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/20 transition-all font-medium"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Selection
            </motion.button>
          </div>
        </div>
      )}

     {/* 🌟 Animated Result Modal */}
<AnimatePresence>
  {showResult && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-20"
    >
      <motion.div
        className="relative bg-white rounded-3xl p-10 text-center shadow-2xl border border-gray-200 max-w-lg w-full"
        initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
        animate={{
          scale: 1,
          opacity: 1,
          rotate: 0,
        }}
        transition={{
          duration: 0.7,
          ease: "easeOut",
          type: "spring",
        }}
      >
        <motion.h2
          className="text-3xl font-extrabold mb-3 bg-gradient-to-r from-cyan-500 to-fuchsia-500 bg-clip-text text-transparent"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          🎉 Challenge Complete!
        </motion.h2>

        <motion.p
          className="text-gray-700 mb-4 text-lg"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          You scored{" "}
          <span className="font-semibold text-emerald-500">{score}</span> out of{" "}
          <span className="font-semibold">{questions.length}</span>
        </motion.p>

        <motion.p
          className="text-gray-600 italic mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {score === questions.length
            ? "Perfect score! You truly mastered it 🧠✨"
            : score > questions.length / 2
            ? "Awesome effort — you’re improving fast 🚀"
            : "Don’t stop now! Each try makes you stronger 💪"}
        </motion.p>

        <motion.div
          className="flex justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button
            whileHover={{
              scale: 1.1,
              boxShadow: "0 0 20px rgba(34,211,238,0.6)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowResult(false);
              setStory("");
              setQuestions([]);
              setDifficulty("");
            }}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold"
          >
            Try Another Story
          </motion.button>

          <motion.button
            whileHover={{
              scale: 1.1,
              boxShadow: "0 0 20px rgba(236,72,153,0.6)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/select")}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-semibold"
          >
            Back to Selection
          </motion.button>
        </motion.div>

        {/* ✨ Animated Sparkle Overlay */}
        <motion.div
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-transparent via-white/20 to-transparent pointer-events-none"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
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
 