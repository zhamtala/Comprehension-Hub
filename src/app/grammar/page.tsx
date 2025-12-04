"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain } from "lucide-react";
import { useRouter } from "next/navigation";

// --- Type Definitions ---
interface QuizItem {
  id: number;
  sentence: string;
  incorrectWord: string;
  correctWord: string;
  options: string[];
  explanation: string;
}

interface FeedbackState {
  status: string;
  color: string;
}

// --- Quiz Data ---
const quizData: QuizItem[] = [
  {
    id: 1,
    sentence:
      "The principal concern of the company are improving customer satisfaction.",
    incorrectWord: "are",
    correctWord: "is",
    options: ["is", "were", "be", "have been"],
    explanation:
      "The subject of the sentence is 'concern' (singular), so the verb must be 'is' (singular).",
  },
  {
    id: 2,
    sentence:
      "She insisted on buying that expensive scarf, irregardless of the price.",
    incorrectWord: "irregardless",
    correctWord: "regardless",
    options: ["irregardless", "regardless", "irregards", "without regard"],
    explanation: "'Irregardless' is non-standard. The correct term is 'regardless'.",
  },
  {
    id: 3,
    sentence: "Who's report did you find on the table this morning?",
    incorrectWord: "Who's",
    correctWord: "Whose",
    options: ["Who's", "Whose", "Whom's", "Who is"],
    explanation:
      "'Whose' is the possessive pronoun. 'Who's' means 'who is' or 'who has'.",
  },
];

// --- Highlight Function ---
const highlightError = (
  sentence: string,
  incorrectWord: string,
  userAnswer: string | null,
  answeredCorrectly: boolean
): React.JSX.Element => {
  const parts = sentence.split(incorrectWord);

  const colorClass = !userAnswer
    ? "underline decoration-cyan-400 font-semibold"
    : answeredCorrectly
    ? "text-green-400 underline decoration-green-400 font-semibold"
    : "text-red-400 underline decoration-red-400 font-semibold";

  return (
    <motion.p
      key={sentence}
      className="text-base sm:text-lg md:text-xl font-light leading-relaxed mb-4 text-white"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {parts[0]}
      <span className={colorClass}>{incorrectWord}</span>
      {parts.slice(1).join(incorrectWord)}
    </motion.p>
  );
};

// --- Main Component ---
export default function GrammarQuiz() {
  const router = useRouter();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentQuestion = quizData[currentQuestionIndex];
  const answeredCorrectly = userAnswer === currentQuestion?.correctWord;

  const handleAnswer = (selected: string) => {
    if (userAnswer) return;
    setUserAnswer(selected);

    if (selected === currentQuestion.correctWord) {
      setScore((s) => s + 1);
      setFeedback({ status: "✅ Correct!", color: "from-green-400 to-emerald-600" });
    } else {
      setFeedback({ status: "❌ Incorrect", color: "from-red-400 to-pink-600" });
    }
  };

  const handleNext = () => {
    setUserAnswer(null);
    setFeedback(null);
    if (currentQuestionIndex + 1 < quizData.length)
      setCurrentQuestionIndex((i) => i + 1);
    else setIsQuizFinished(true);
  };

  // --- Quiz Finished View (UPDATED WITH NEW BUTTONS) ---
  const FinishedView = () => (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-indigo-950 to-purple-950 text-white overflow-hidden relative p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="relative bg-white/10 backdrop-blur-lg border border-white/20 p-6 sm:p-10 rounded-2xl shadow-[0_0_50px_rgba(99,102,241,0.5)] text-center w-full max-w-md"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 120 }}
      >
        <motion.h1
          className="text-3xl sm:text-4xl font-extrabold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          🎉 Quiz Complete!
        </motion.h1>

        <p className="text-base sm:text-lg text-cyan-100 mb-6">
          Your Final Score: {score} / {quizData.length}
        </p>

        {/* NEW CLEAN BUTTON GROUP */}
        <motion.div
          className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-3 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Try Again */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setCurrentQuestionIndex(0);
              setScore(0);
              setUserAnswer(null);
              setFeedback(null);
              setIsQuizFinished(false);
            }}
            className="w-full sm:w-40 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 
            text-white font-semibold shadow-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] transition-all"
          >
            🔁 Try Again
          </motion.button>

          {/* Back to Selection */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/select')}
            className="w-full sm:w-40 py-3 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 
            text-white font-semibold shadow-lg hover:shadow-[0_0_20px_rgba(192,38,211,0.6)] transition-all"
          >
            ⬅ Back to Selection
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );

  // --- Mobile Quiz View ---
  const MobileView = () => (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-black flex justify-center items-center overflow-x-hidden relative text-white p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full"
          animate={{
            x: [Math.random() * 300 - 150, Math.random() * 300 - 150],
            y: [Math.random() * 600 - 300, Math.random() * 600 - 300],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: Math.random() * 6 + 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        key={currentQuestion.id}
        className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-lg overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="flex flex-col items-start mb-4 border-b border-white/20 pb-3">
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            <Brain className="w-6 h-6 text-cyan-300" /> Grammar Console
          </h1>
          <div className="text-base font-semibold text-cyan-400 mt-2">
            {currentQuestionIndex + 1} / {quizData.length}
          </div>
        </div>

        {/* Question */}
        <div className="mb-4">
          <p className="text-base font-semibold text-cyan-100 mb-2">
            Identify the incorrect word and choose the correction:
          </p>
          <motion.div
            className="bg-white/5 p-3 rounded-xl border border-cyan-500/30 shadow-inner"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 120 }}
          >
            {highlightError(
              currentQuestion.sentence,
              currentQuestion.incorrectWord,
              userAnswer,
              answeredCorrectly
            )}
          </motion.div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-2 mb-4">
          {currentQuestion.options.map((option) => (
            <motion.button
              key={option}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 15px rgba(0,255,255,0.5)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAnswer(option)}
              disabled={!!userAnswer}
              className={`py-2 px-3 text-sm font-medium rounded-xl border-2 transition-all ${
                !userAnswer
                  ? "hover:bg-cyan-500/20 border-cyan-500/30 text-white"
                  : option === currentQuestion.correctWord
                  ? "bg-green-500/30 border-green-400 text-white"
                  : option === userAnswer
                  ? "bg-red-500/30 border-red-400 text-white"
                  : "bg-white/10 border-white/10 text-gray-400 cursor-not-allowed"
              }`}
            >
              {option}
            </motion.button>
          ))}
        </div>

        {/* Next Button */}
        <motion.button
          whileHover={{
            scale: userAnswer ? 1.05 : 1,
            boxShadow: "0 0 25px rgba(0,255,255,0.4)",
          }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          disabled={!userAnswer}
          className={`w-full py-2 font-semibold rounded-xl shadow-lg transition duration-300 ${
            userAnswer
              ? "bg-gradient-to-r from-cyan-500 to-indigo-600 hover:shadow-[0_0_30px_rgba(99,102,241,0.6)]"
              : "bg-gray-600 cursor-not-allowed"
          }`}
        >
          {currentQuestionIndex < quizData.length - 1
            ? "Next Question"
            : "Finish Quiz"}
        </motion.button>
      </motion.div>
    </motion.div>
  );

  // --- Desktop View ---
  const DesktopView = () => (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-black flex justify-center items-center overflow-hidden relative text-white p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        key={currentQuestion.id}
        className="relative w-full max-w-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-[0_0_40px_rgba(99,102,241,0.3)] overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-white/20 pb-4">
          <h1 className="text-3xl font-extrabold flex items-center gap-2">
            <Brain className="w-7 h-7 text-cyan-300" /> Grammar Console
          </h1>
          <div className="text-lg font-semibold text-cyan-400">
            {currentQuestionIndex + 1} / {quizData.length}
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <p className="text-lg font-semibold text-cyan-100 mb-3">
            Identify the incorrect word and choose the correction:
          </p>
          <div className="bg-white/5 p-5 rounded-xl border border-cyan-500/30 shadow-inner">
            {highlightError(
              currentQuestion.sentence,
              currentQuestion.incorrectWord,
              userAnswer,
              answeredCorrectly
            )}
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {currentQuestion.options.map((option) => (
            <motion.button
              key={option}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAnswer(option)}
              disabled={!!userAnswer}
              className={`py-3 px-4 text-lg font-medium rounded-xl border-2 transition-all ${
                !userAnswer
                  ? "hover:bg-cyan-500/20 border-cyan-500/30 text-white"
                  : option === currentQuestion.correctWord
                  ? "bg-green-500/30 border-green-400 text-white"
                  : option === userAnswer
                  ? "bg-red-500/30 border-red-400 text-white"
                  : "bg-white/10 border-white/10 text-gray-400 cursor-not-allowed"
              }`}
            >
              {option}
            </motion.button>
          ))}
        </div>

        {/* Next Button */}
        <motion.button
          whileHover={{ scale: userAnswer ? 1.05 : 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          disabled={!userAnswer}
          className={`w-full py-3 font-semibold rounded-xl shadow-lg transition duration-300 ${
            userAnswer
              ? "bg-gradient-to-r from-cyan-500 to-indigo-600 hover:shadow-[0_0_30px_rgba(99,102,241,0.6)]"
              : "bg-gray-600 cursor-not-allowed"
          }`}
        >
          {currentQuestionIndex < quizData.length - 1
            ? "Next Question"
            : "Finish Quiz"}
        </motion.button>
      </motion.div>
    </motion.div>
  );

  // Render the appropriate view
  if (isQuizFinished) return <FinishedView />;
  return isMobile ? <MobileView /> : <DesktopView />;
}

