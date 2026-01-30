"use client";

import { useState } from "react";
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
  questions: {
    easy: Question[];
    medium: Question[];
    hard: Question[];
  };
}

// Your existing stories array
const stories: Story[] = [
  {
    id: 1,
    title: "The Thirsty Crow",
    content: `
            A thirsty crow once found a pitcher with very little water. 
            He dropped pebbles into the pitcher one by one until the water rose high enough for him to drink. 
            His clever thinking saved his life.
            `,
    questions: {
      easy: [
        { id: 1, question: "What did the crow want?", options: ["Food", "Water", "Shelter", "Pebbles"], answer: "Water" },
      ],
      medium: [
        { id: 1, question: "How did the crow get the water to rise?", options: ["He tilted the pitcher","He called for help","He dropped pebbles inside","He broke the pot"], answer: "He dropped pebbles inside" },
      ],
      hard: [
        { id: 1, question: "What lesson can be learned from the story?", options: ["Patience and cleverness solve problems","Always ask others for help","Never waste water","Hard work always pays off"], answer: "Patience and cleverness solve problems" },
      ],
    },
  },
  // ... other stories
];

export default function ReadingPage() {
  const router = useRouter();

  const [step, setStep] = useState<"selectStory" | "selectDifficulty" | "reading" | "quiz">("selectStory");
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [current, setCurrent] = useState(0);

  const questions = selectedStory && difficulty ? selectedStory.questions[difficulty] : [];
  const currentQuestion = questions[current];

  const handleAnswer = (option: string) => {
    if (selected) return;
    setSelected(option);
    if (option === currentQuestion.answer) setScore((s) => s + 1);
  };

  const handleNext = async () => {
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  };

  return (
    <div className="relative min-h-screen flex justify-center items-center text-gray-900 overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 p-6 pt-24 sm:pt-28">
      
      {/* ✅ Fixed Back to Dashboard Button (responsive size) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push("/dashboards/StudentDashboard")}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-3 py-2 sm:px-4 sm:py-2.5 text-white text-sm sm:text-base font-medium hover:bg-white/30 transition"
      >
        <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">Dashboard</span>
        <span className="sm:hidden">Back</span>
      </motion.button>

      {/* Floating Icons */}
      <motion.div
        className="absolute top-10 left-10 text-white/40"
        animate={{ y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 6 }}
      >
        <BookOpen className="w-10 h-10" />
      </motion.div>

      <motion.div
        className="absolute bottom-10 right-10 text-white/30"
        animate={{ y: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 7 }}
      >
        <Sparkles className="w-14 h-14" />
      </motion.div>

      {/* ✅ Preserve all your existing steps */}
      <AnimatePresence mode="wait">
        {/* Step 1: Story Selection */}
        {step === "selectStory" && (
          <motion.div
            key="selectStory"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-2xl text-center w-full max-w-xl border border-white/20"
          >
            <h1 className="text-4xl font-extrabold text-white mb-6 drop-shadow-md">
              📚 Choose a Story
            </h1>
            <div className="space-y-4">
              {stories.map((story) => (
                <motion.button
                  key={story.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedStory(story);
                    setStep("selectDifficulty");
                  }}
                  className="w-full py-4 bg-gradient-to-r from-pink-500 to-indigo-500 text-white rounded-xl font-semibold shadow-lg hover:from-indigo-600 hover:to-pink-600 transition-all"
                >
                  {story.title}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Difficulty Selection */}
        {step === "selectDifficulty" && selectedStory && (
          <motion.div
            key="selectDifficulty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-2xl text-center w-full max-w-xl border border-white/20"
          >
            <h1 className="text-2xl font-bold text-white mb-6">
              Choose a difficulty for <span className="text-yellow-300">{selectedStory.title}</span>
            </h1>
            <div className="flex flex-col gap-4">
              {(["easy", "medium", "hard"] as const).map((lvl) => (
                <motion.button
                  key={lvl}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    setDifficulty(lvl);
                    setStep("reading");
                  }}
                  className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
                    lvl === "easy" ? "bg-green-500 hover:bg-green-600" :
                    lvl === "medium" ? "bg-yellow-500 hover:bg-yellow-600" :
                    "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 3: Reading Section */}
        {step === "reading" && selectedStory && difficulty && (
          <motion.div
            key="reading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-2xl w-full max-w-3xl text-white border border-white/20"
          >
            <h1 className="text-3xl font-extrabold text-yellow-300 mb-4">{selectedStory.title}</h1>
            <p className="text-lg leading-relaxed whitespace-pre-line mb-6 text-gray-100">{selectedStory.content}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setStep("quiz")}
              className="w-full bg-yellow-400 text-indigo-900 py-3 rounded-xl font-bold hover:bg-yellow-300 transition"
            >
              Ready! Start Quiz →
            </motion.button>
          </motion.div>
        )}

        {/* Step 4: Quiz */}
        {step === "quiz" && selectedStory && difficulty && !finished && currentQuestion && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-2xl w-full max-w-3xl text-white border border-white/20"
          >
            <h2 className="text-2xl font-bold mb-6 text-yellow-300">{currentQuestion.question}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQuestion.options.map((opt) => (
                <motion.button
                  key={opt}
                  whileHover={{ scale: selected ? 1 : 1.03 }}
                  onClick={() => handleAnswer(opt)}
                  disabled={!!selected}
                  className={`py-3 px-4 rounded-xl font-semibold text-lg transition-all border-2 ${
                    selected === opt
                      ? opt === currentQuestion.answer
                        ? "bg-green-500 text-white border-green-400"
                        : "bg-red-500 text-white border-red-400"
                      : "bg-white/20 text-white border-white/30 hover:bg-white/30"
                  }`}
                >
                  {opt}
                </motion.button>
              ))}
            </div>

            {selected && (
              <p className="mt-6 text-lg font-medium">
                {selected === currentQuestion.answer
                  ? "✅ Correct!"
                  : `❌ The correct answer is "${currentQuestion.answer}".`}
              </p>
            )}

            <motion.button
              whileHover={{ scale: selected ? 1.05 : 1 }}
              onClick={handleNext}
              disabled={!selected}
              className={`mt-8 w-full py-3 rounded-xl font-bold transition-all ${
                selected ? "bg-yellow-400 text-indigo-900 hover:bg-yellow-300" : "bg-white/20 text-white/70 cursor-not-allowed"
              }`}
            >
              {current + 1 < questions.length ? "Next Question →" : "Finish Quiz"}
            </motion.button>
          </motion.div>
        )}

        {/* Step 5: Results */}
        {finished && (
          <motion.div
            key="result"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-2xl text-center text-white border border-white/20"
          >
            <h1 className="text-4xl font-extrabold mb-4 text-yellow-300">🎉 Well Done!</h1>
            <p className="text-xl mb-6">
              You scored <span className="text-yellow-300 font-bold">{score}</span> out of <span className="font-bold">{questions.length}</span>
            </p>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => {
                setStep("selectStory");
                setSelectedStory(null);
                setDifficulty(null);
                setSelected(null);
                setCurrent(0);
                setFinished(false);
                setScore(0);
              }}
              className="bg-yellow-400 text-indigo-900 px-8 py-3 rounded-full font-semibold hover:bg-yellow-300 transition"
            >
              Back to Stories
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
