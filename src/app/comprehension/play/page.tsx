"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Volume2, BookOpen, Brain, RefreshCcw } from "lucide-react";

export default function ComprehensionPage() {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "">("");
  const [story, setStory] = useState("");
  const [questions, setQuestions] = useState<{ q: string; a: string[]; correct: string }[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [title, setTitle] = useState("");

  const storyList = [
    {
      title: "The Lost Book",
      story: `In a quiet village, a boy named Leo discovered an old book in his school library. 
      It was filled with stories that changed every time he read them.`,
      questions: [
        {
          q: "Where did Leo find the book?",
          a: ["In his house", "In the library", "In a park", "At the beach"],
          correct: "In the library",
        },
        {
          q: "What was special about the book?",
          a: ["It glowed", "It changed stories", "It could talk", "It was blank"],
          correct: "It changed stories",
        },
      ],
    },
    {
      title: "The Talking River",
      story: `Mira loved walking by the river every morning. 
      One day, she heard the water whisper her name and tell her about distant lands.`,
      questions: [
        {
          q: "Where did Mira like to walk?",
          a: ["In the forest", "By the river", "On the mountain", "In the city"],
          correct: "By the river",
        },
        {
          q: "What did the river do?",
          a: ["It glowed", "It whispered her name", "It sang songs", "It was silent"],
          correct: "It whispered her name",
        },
      ],
    },
  ];

  const generateStory = () => {
    const randomStory = storyList[Math.floor(Math.random() * storyList.length)];
    setStory(randomStory.story);
    setQuestions(randomStory.questions);
    setTitle(randomStory.title);
    setUserAnswers({});
  };

  const playAudio = () => {
    if (!story) return;
    const utterance = new SpeechSynthesisUtterance(story);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    speechSynthesis.speak(utterance);
  };

  const checkAnswers = () => {
    let correctCount = 0;
    questions.forEach((q, i) => {
      if (userAnswers[i] === q.correct) correctCount++;
    });
    alert(`✅ You got ${correctCount} out of ${questions.length} correct!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-start bg-black text-white p-8 relative overflow-hidden"
    >
      {/* Background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.05),transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="z-10 text-center mb-10"
      >
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent mb-2">
          Comprehension Challenge
        </h1>
        <p className="text-cyan-200/70 font-light">Test your reading and listening skills 🎧📖</p>
      </motion.div>

      {/* Difficulty Selector */}
      <div className="z-10 flex gap-4 mb-10">
        {["easy", "medium", "hard"].map((level) => (
          <motion.button
            key={level}
            whileHover={{ scale: 1.1 }}
            onClick={() => {
              setDifficulty(level as any);
              generateStory();
            }}
            className={`px-6 py-3 rounded-full font-semibold shadow-lg capitalize ${
              difficulty === level
                ? "bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white"
                : "bg-white/10 hover:bg-white/20 text-gray-300"
            }`}
          >
            {level}
          </motion.button>
        ))}
      </div>

      {/* Story Area */}
      {story && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="z-10 bg-white/10 border border-cyan-400/20 rounded-2xl p-6 text-center max-w-3xl mb-8 backdrop-blur-md"
        >
          <h2 className="text-2xl font-bold text-cyan-300 mb-4">{title}</h2>

          {difficulty === "easy" && (
            <p className="text-gray-100 leading-relaxed mb-4">{story}</p>
          )}

          {difficulty === "medium" && (
            <>
              <p className="text-gray-100 leading-relaxed mb-4">{story}</p>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={playAudio}
                disabled={isPlaying}
                className={`flex items-center justify-center gap-2 mx-auto px-5 py-2 rounded-full font-medium ${
                  isPlaying
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90"
                }`}
              >
                <Volume2 className="w-5 h-5" /> {isPlaying ? "Playing..." : "Listen to Story"}
              </motion.button>
            </>
          )}

          {difficulty === "hard" && (
            <>
              <p className="italic text-gray-400 text-sm">(Story text hidden — rely on listening!)</p>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={playAudio}
                disabled={isPlaying}
                className={`flex items-center justify-center gap-2 mx-auto mt-4 px-5 py-2 rounded-full font-medium ${
                  isPlaying
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90"
                }`}
              >
                <HeadphonesIcon /> {isPlaying ? "Playing..." : "Play Story"}
              </motion.button>
            </>
          )}
        </motion.div>
      )}

      {/* Questions */}
      {questions.length > 0 && (
        <div className="z-10 w-full max-w-4xl space-y-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
            <Brain className="text-cyan-300" /> Comprehension Questions
          </h2>

          {questions.map((q, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-2xl bg-white/10 border border-cyan-400/20 shadow-lg backdrop-blur-md"
            >
              <p className="font-semibold text-cyan-100 mb-4">
                {i + 1}. {q.q}
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {q.a.map((opt) => (
                  <motion.button
                    key={opt}
                    whileHover={{ scale: 1.05 }}
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
            whileHover={{ scale: 1.1 }}
            onClick={checkAnswers}
            className="mt-8 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:opacity-90 transition-all"
          >
            Check Answers
          </motion.button>
        </div>
      )}

      <footer className="absolute bottom-6 text-sm text-cyan-300/80 font-mono tracking-wide">
        CompreHub — Read, Listen, Understand ⚡
      </footer>
    </motion.div>
  );
}

function HeadphonesIcon() {
  return <Volume2 className="w-5 h-5" />;
}
