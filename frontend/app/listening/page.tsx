"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Brain, Sparkles } from "lucide-react";
import Confetti from "react-confetti";

export default function ListeningPage() {
  const [currentStoryIndex, setCurrentStoryIndex] = useState<number | null>(null);
  const [story, setStory] = useState("");
  const [questions, setQuestions] = useState<{ q: string; a: string[]; correct: string }[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [title, setTitle] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const resultBoxRef = useRef<HTMLDivElement>(null);

  const storyList = [
    {
      title: "The Glowing Seashell",
      story: `Once upon a time, a curious child named Aria found a glowing seashell by the shore. 
      When she held it to her ear, she could hear voices from the ocean telling her secrets of the deep sea.`,
      questions: [
        {
          q: "What did Aria find on the shore?",
          a: ["A glowing seashell", "A golden key", "A bottle", "A pearl"],
          correct: "A glowing seashell",
        },
        {
          q: "What did Aria hear when she held the shell?",
          a: ["Ocean waves", "Voices from the ocean", "Bird songs", "A whispering wind"],
          correct: "Voices from the ocean",
        },
      ],
    },
    {
      title: "The Fox and the Lantern",
      story: `In a quiet forest, a young fox named Lumo discovered a lantern that never ran out of light. 
      Every night, he used it to guide lost travelers back to their homes.`,
      questions: [
        {
          q: "What did Lumo find in the forest?",
          a: ["A glowing flower", "A lantern", "A magic stone", "A map"],
          correct: "A lantern",
        },
        {
          q: "What did Lumo do with the lantern?",
          a: ["Decorated his den", "Guided travelers home", "Played with it", "Traded it for food"],
          correct: "Guided travelers home",
        },
      ],
    },
    {
      title: "Nira Learns to Fly",
      story: `High above the mountains, a little bird named Nira learned how to fly during a thunderstorm. 
      She discovered that courage grows when the wind blows hardest.`,
      questions: [
        { q: "What was Nira?", a: ["A rabbit", "A bird", "A squirrel", "A butterfly"], correct: "A bird" },
        {
          q: "When did Nira learn to fly?",
          a: ["During sunrise", "During a thunderstorm", "At night", "In the rain"],
          correct: "During a thunderstorm",
        },
      ],
    },
  ];

  const generateStory = () => {
    const index = Math.floor(Math.random() * storyList.length);
    setCurrentStoryIndex(index);
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
      className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-black via-slate-900 to-black text-white px-4 pb-20 relative overflow-x-hidden"
    >
      {/* FIXED SAFE TOP-LEFT BACK BUTTON */}
      <a
        href="/dashboards/StudentDashboard"
        className="fixed top-3 left-3 z-40 flex items-center gap-1 px-3 py-1.5 
          bg-white/10 backdrop-blur-md border border-cyan-300/20 
          rounded-full text-cyan-200 text-sm font-medium 
          shadow-[0_0_10px_rgba(0,255,255,0.25)] 
          hover:bg-white/20 transition-all"
        style={{
          marginTop: "env(safe-area-inset-top)",
          transform: "translateZ(0)",
        }}
      >
        ← Back
      </a>

      {/* HEADER */}
      <motion.div className="z-10 text-center mb-6 max-w-full flex flex-col items-center gap-2 px-2 mt-10">
        <h1
          className="font-extrabold bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent flex items-center justify-center gap-2 text-center"
          style={{ fontSize: "clamp(1.5rem, 5vw, 2.5rem)" }}
        >
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" /> Listening Challenge
        </h1>
        <p className="text-cyan-200/70 text-center text-sm sm:text-base">
          Listen carefully and answer the questions 🎧
        </p>
      </motion.div>

      {/* BUTTONS */}
      <div className="z-10 flex flex-wrap gap-4 mb-6 justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={generateStory}
          className="px-3 md:px-6 py-2 md:py-3 rounded-full font-semibold bg-gradient-to-r from-cyan-500 to-fuchsia-500 shadow-lg text-white hover:opacity-90 transition-all text-sm md:text-base"
        >
          Generate Story
        </motion.button>

        {story && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={playAudio}
            disabled={isPlaying}
            className={`px-3 md:px-6 py-2 md:py-3 rounded-full font-semibold shadow-lg text-white transition-all text-sm md:text-base ${
              isPlaying
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90"
            }`}
          >
            <Volume2 className="inline w-4 md:w-5 h-4 md:h-5 mr-2" />
            {isPlaying ? "Playing..." : "Listen to Story"}
          </motion.button>
        )}
      </div>

      {/* STORY TITLE */}
      {title && story && (
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="z-10 mb-6 px-5 py-3 max-w-md mx-auto rounded-2xl bg-white/10 backdrop-blur-md border border-cyan-400/20 shadow-[0_0_15px_rgba(0,255,255,0.3)] text-center"
        >
          <h2 className="text-sm md:text-lg font-bold bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent drop-shadow-md">
            🎧 {title}
          </h2>
        </motion.div>
      )}

      {/* QUESTIONS */}
      {questions.length > 0 && !showResult && (
        <div className="z-10 w-full max-w-full md:max-w-4xl space-y-6 px-2">
          <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 text-transparent bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 bg-clip-text">
            <Brain className="text-cyan-300" /> Comprehension Questions
          </h2>

          {questions.map((q, i) => (
            <motion.div
              key={i}
              className="p-4 md:p-5 rounded-2xl bg-white/10 border border-cyan-400/20 shadow-lg backdrop-blur-md"
              whileHover={{ scale: 1.02 }}
            >
              <p className="font-semibold text-cyan-100 mb-3 md:mb-4 text-sm md:text-base">
                {i + 1}. {q.q}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {q.a.map((opt) => (
                  <motion.button
                    key={opt}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => setUserAnswers({ ...userAnswers, [i]: opt })}
                    className={`px-3 py-2 rounded-xl text-sm md:text-base font-medium transition-all ${
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
            className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg hover:opacity-90 transition-all mx-auto block text-sm md:text-base"
          >
            Check Answers
          </motion.button>
        </div>
      )}

      {/* RESULT MODAL */}
      <AnimatePresence>
        {showResult && (
          <motion.div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-20 px-4">
            <motion.div
              ref={resultBoxRef}
              className="relative bg-white rounded-3xl p-8 md:p-10 text-center shadow-2xl border border-gray-200 max-w-sm md:max-w-lg w-full"
            >
              {showConfetti && resultBoxRef.current && (
                <Confetti
                  width={resultBoxRef.current.offsetWidth}
                  height={resultBoxRef.current.offsetHeight}
                  numberOfPieces={150}
                  recycle={false}
                  gravity={0.2}
                />
              )}

              <motion.h2 className="text-2xl md:text-3xl font-extrabold mb-3 bg-gradient-to-r from-cyan-500 to-fuchsia-500 bg-clip-text text-transparent">
                🎉 Challenge Complete!
              </motion.h2>

              <motion.p className="text-gray-700 mb-4 text-base md:text-lg">
                You scored{" "}
                <span className="font-semibold text-emerald-500">{score}</span>{" "}
                out of <span className="font-semibold">{questions.length}</span>
              </motion.p>

              <div className="flex flex-col md:flex-row gap-3 justify-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={generateStory}
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold w-full md:w-auto"
                >
                  Try Another Story
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-auto pb-6 text-xs md:text-sm text-cyan-300/80 font-mono tracking-wide pt-10">
        CompreHub — Listen, Understand ⚡
      </footer>
    </motion.div>
  );
}
