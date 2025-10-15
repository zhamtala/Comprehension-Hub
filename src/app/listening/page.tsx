"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Headphones, Volume2, Brain, RefreshCcw } from "lucide-react";

export default function ListeningComprehension() {
  const [story, setStory] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [questions, setQuestions] = useState<{ q: string; a: string[]; correct: string }[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [selectedTitle, setSelectedTitle] = useState("");

 const generateStory = () => {
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
        {
          q: "What was Nira?",
          a: ["A rabbit", "A bird", "A squirrel", "A butterfly"],
          correct: "A bird",
        },
        {
          q: "When did Nira learn to fly?",
          a: ["During sunrise", "During a thunderstorm", "At night", "In the rain"],
          correct: "During a thunderstorm",
        },
      ],
    },
  ];

  // 🎲 Pick a random story
  const randomStory = storyList[Math.floor(Math.random() * storyList.length)];

  setStory(randomStory.story);
  setQuestions(randomStory.questions);
  setSelectedTitle(randomStory.title);
};


 const playStory = async () => {
  if (!story) return;

  try {
    setIsPlaying(true);

    const response = await fetch(`/api/tts?text=${encodeURIComponent(story.slice(0, 200))}`);
    if (!response.ok) throw new Error("TTS API error");

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    audio.onended = () => setIsPlaying(false);
    audio.onerror = (err) => {
      console.error("Audio playback failed:", err);
      setIsPlaying(false);
    };

    await audio.play();
  } catch (err) {
    console.error("Error playing story:", err);
    setIsPlaying(false);
  }
};



  const checkAnswers = () => {
    let correctCount = 0;
    questions.forEach((q, i) => {
      if (userAnswers[i] === q.correct) correctCount++;
    });
    alert(`🎧 You got ${correctCount} out of ${questions.length} correct!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden bg-black text-white p-8"
    >
      {/* 🔷 Background holographic grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.07),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Floating neon lights */}
      <motion.div
        className="absolute -top-40 left-20 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, -20, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Header */}
      <div className="z-10 flex justify-between items-center w-full max-w-5xl mb-12">
        <div>
          <h1 className="text-4xl font-extrabold mb-2 drop-shadow-[0_0_20px_rgba(0,255,255,0.3)]">
            <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent">
              Listening Comprehension
            </span>{" "}
            🎧
          </h1>
          <p className="text-cyan-200/70 font-light">
            Listen carefully to the story — no text hints here!
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="z-10 flex gap-4 mb-10">
        <motion.button
          whileHover={{ scale: 1.1, boxShadow: "0 0 25px rgba(0,255,255,0.5)" }}
          onClick={generateStory}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white font-semibold rounded-full shadow-lg hover:opacity-90 transition-all"
        >
          <RefreshCcw className="w-5 h-5" /> Generate Story
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1, boxShadow: "0 0 25px rgba(16,185,129,0.5)" }}
          disabled={!story || isPlaying}
          onClick={playStory}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold shadow-lg transition-all ${
            isPlaying
              ? "bg-gray-500 text-white cursor-not-allowed"
              : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90"
          }`}
        >
          <Volume2 className="w-5 h-5" /> {isPlaying ? "Playing..." : "Play Story"}
        </motion.button>
      </div>

      {/* Story Title Section */}
        {selectedTitle && (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="z-10 bg-white/5 backdrop-blur-md border border-cyan-400/20 rounded-2xl p-6 text-center max-w-3xl mb-10"
     >
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent">
        🎧 {selectedTitle}
        </h2>
        <p className="text-gray-300 italic text-sm">
        (The story is being narrated — listen carefully before answering!)
        </p>
    </motion.div>
    )}
 

      {/* Questions Section */}
      {questions.length > 0 && (
        <div className="z-10 w-full max-w-4xl space-y-8">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
            <Brain className="text-cyan-300" /> Comprehension Questions
          </h2>

          {questions.map((q, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-cyan-400/20 shadow-lg"
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
            whileHover={{ scale: 1.1, boxShadow: "0 0 25px rgba(0,255,255,0.5)" }}
            onClick={checkAnswers}
            className="mt-8 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:opacity-90 transition-all"
          >
            Check Answers
          </motion.button>
        </div>
      )}

      {/* Footer */}
      <footer className="absolute bottom-6 text-sm text-cyan-200/80 font-mono tracking-wide">
        CompreHub — Hear, Think, and Comprehend ⚡
      </footer>
    </motion.div>
  );
}
