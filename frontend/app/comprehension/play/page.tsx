"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Sparkles } from "lucide-react";
import Confetti from "react-confetti";
import { speakText, stopSpeaking } from "@/lib/speech";

type Difficulty = "easy" | "average" | "hard";
type Step = "stories" | "difficulty" | "activity";

export default function ComprehensionPage() {

  const [step, setStep] = useState<Step>("stories");

  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [completedDifficulties, setCompletedDifficulties] = useState<Difficulty[]>([]);

  const [story, setStory] = useState("");
  const [title, setTitle] = useState("");

  const [questions, setQuestions] = useState<
    { q: string; a: string[]; correct: string; type: string }[]
  >([]);

  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});

  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const [showConfetti, setShowConfetti] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: 400, height: 800 });

  const [stories, setStories] = useState<
    { id: number; title: string; preview?: string }[]
  >([]);

  const [selectedStoryId, setSelectedStoryId] = useState<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateSize = () =>
        setScreenSize({ width: window.innerWidth, height: window.innerHeight });

      updateSize();
      window.addEventListener("resize", updateSize);

      return () => window.removeEventListener("resize", updateSize);
    }
  }, []);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/stories`
        );

        const data = await res.json();
        setStories(data);
      } catch (err) {
        console.error("Failed to load stories", err);
      }
    };

    fetchStories();
  }, []);

  const generateStory = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/comprehension?storyId=${selectedStoryId}&difficulty=${difficulty}`
      );

      const data = await res.json();

      if (!data.story) return;

      setStory(data.story);
      setTitle(data.title || "Comprehension Story");
      setQuestions(data.questions);
      setUserAnswers({});
      setShowResult(false);

    } catch (error) {
      console.error("Failed to fetch comprehension content", error);
    }
  };

  useEffect(() => {
    if (step === "activity" && selectedStoryId) {
      generateStory();
    }
  }, [difficulty, step]);

  const playAudio = () => {
    stopSpeaking();
    speakText(story);
    setIsPlaying(true);
  };

  const checkAnswers = () => {

    let correctCount = 0;

    questions.forEach((q, i) => {

      const studentAnswer = userAnswers[i]?.trim().toLowerCase() || "";

      if (!q.correct) return;

      if (q.type === "mcq") {
        if (studentAnswer === q.correct.trim().toLowerCase()) {
          correctCount++;
        }
      }

      if (q.type === "short_answer") {

        const acceptableAnswers = q.correct
          .toLowerCase()
          .split("\n")
          .map((a) => a.trim());

        const matched = acceptableAnswers.some((ans) =>
          studentAnswer.includes(ans)
        );

        if (matched) correctCount++;
      }

    });

    setScore(correctCount);
    setShowResult(true);

    if (!completedDifficulties.includes(difficulty)) {
      setCompletedDifficulties([...completedDifficulties, difficulty]);
    }

    if (correctCount > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    }

  };

  const isDifficultyUnlocked = (level: Difficulty) => {
    if (level === "easy") return true;
    if (level === "average") return completedDifficulties.includes("easy");
    if (level === "hard") return completedDifficulties.includes("average");
    return false;
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center bg-gradient-to-b from-black via-slate-900 to-black text-white px-4 pb-20"
    >

      {showConfetti && (
        <Confetti
          width={screenSize.width}
          height={screenSize.height}
          numberOfPieces={350}
          recycle={false}
        />
      )}

      {/* HERO */}
      <div className="text-center mt-10 mb-10">

        <h1 className="text-4xl font-extrabold flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent">
          <Sparkles /> Comprehension Challenge
        </h1>

        <p className="text-cyan-200/70 mt-2">
          Sharpen your reading and listening skills
        </p>

      </div>

      {/* STORY SELECTION */}
      {step === "stories" && (

        <div className="w-full max-w-6xl">

          <h2 className="text-xl font-bold text-cyan-300 text-center mb-8">
            📚 Choose a Story
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

            {stories.map((storyItem) => (

              <motion.div
                key={storyItem.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="p-6 rounded-3xl bg-white/10 border border-cyan-400/20 backdrop-blur-md shadow-xl flex flex-col justify-between"
              >

                <div>

                  <div className="text-3xl text-center mb-3">
                    📖
                  </div>

                  <h3 className="font-bold text-lg text-center text-cyan-200">
                    {storyItem.title}
                  </h3>

                  <p className="text-sm text-center mt-3 text-gray-300">
                    {storyItem.preview ||
                      "Read the story and answer questions to test your understanding."}
                  </p>

                </div>

                <button
                  onClick={() => {
                    setSelectedStoryId(storyItem.id);
                    stopSpeaking();
                    setStep("difficulty");
                  }}
                  className="mt-6 bg-gradient-to-r from-cyan-500 to-fuchsia-500 py-2 px-4 rounded-full text-sm font-semibold"
                >
                  Start Story →
                </button>

              </motion.div>

            ))}

          </div>

        </div>

      )}

      {/* DIFFICULTY SELECTION */}
      {step === "difficulty" && (

        <div className="flex flex-col items-center">

          <h2 className="text-xl font-bold text-cyan-300 mb-4">
            Choose Difficulty
          </h2>

          <div className="flex gap-3 flex-wrap justify-center">

            {(["easy", "average", "hard"] as Difficulty[]).map((level) => (

              <button
                key={level}
                onClick={() => {
                  if (isDifficultyUnlocked(level)) {
                    setDifficulty(level);
                    setStep("activity");
                  }
                }}
                className={`px-5 py-2 rounded-full font-semibold uppercase
                ${
                  isDifficultyUnlocked(level)
                    ? "bg-gradient-to-r from-cyan-500 to-fuchsia-500"
                    : "bg-gray-700/20 text-gray-500"
                }`}
              >
                {level}
              </button>

            ))}

          </div>

          <button
            onClick={() => setStep("stories")}
            className="mt-6 text-sm text-cyan-300 underline"
          >
            ← Back to Stories
          </button>

        </div>

      )}

      {/* ACTIVITY */}
      {step === "activity" && story && (

        <div className="w-full max-w-3xl">

          <div className="bg-white/10 border border-cyan-400/20 rounded-3xl p-6 text-center mb-8">

            <h2 className="text-2xl font-bold text-cyan-300 mb-3">
              {title}
            </h2>

            {difficulty === "easy" && (
              <p className="text-gray-100 leading-relaxed">{story}</p>
            )}

            {(difficulty === "average" || difficulty === "hard") && (
              <>
                {difficulty === "average" && (
                  <p className="text-gray-100 mb-3">{story}</p>
                )}

                <button
                  onClick={playAudio}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                >
                  ▶ Play Audio
                </button>
              </>
            )}

          </div>

          <div className="space-y-5">

            <h2 className="text-xl font-bold flex items-center gap-2 text-cyan-300">
              <Brain /> Comprehension Questions
            </h2>

            {questions.map((q, i) => (

              <div
                key={i}
                className="p-5 rounded-2xl bg-white/10 border border-cyan-400/20"
              >

                <p className="font-semibold mb-3">
                  {i + 1}. {q.q}
                </p>

                {q.type === "mcq" && (

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    {q.a.map((opt) => (

                      <button
                        key={opt}
                        onClick={() =>
                          setUserAnswers({ ...userAnswers, [i]: opt })
                        }
                        className={`px-4 py-2 rounded-xl ${
                          userAnswers[i] === opt
                            ? "bg-gradient-to-r from-cyan-500 to-fuchsia-500"
                            : "bg-white/10"
                        }`}
                      >
                        {opt}
                      </button>

                    ))}

                  </div>

                )}

                {q.type === "short_answer" && (

                  <input
                    type="text"
                    placeholder="Type your answer..."
                    value={userAnswers[i] || ""}
                    onChange={(e) =>
                      setUserAnswers({
                        ...userAnswers,
                        [i]: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl bg-white/10"
                  />

                )}

              </div>

            ))}

            <button
              onClick={checkAnswers}
              className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-8 py-3 rounded-full font-semibold mx-auto block"
            >
              Check Answers
            </button>
            
            {showResult && (
              <div className="mt-8 text-center bg-white/10 p-6 rounded-2xl border border-cyan-400/20">

                <h3 className="text-xl font-bold text-cyan-300 mb-2">
                  Your Score
                </h3>

                <p className="text-lg mb-4">
                  {score} / {questions.length} correct
                </p>

                {/* EASY → AVERAGE */}
                {difficulty === "easy" && (
                  <button
                    onClick={() => {
                      setDifficulty("average");
                      setShowResult(false);
                    }}
                    className="px-6 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  >
                    Next Difficulty →
                  </button>
                )}

                {/* AVERAGE → HARD */}
                {difficulty === "average" && (
                  <button
                    onClick={() => {
                      setDifficulty("hard");
                      setShowResult(false);
                    }}
                    className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    Final Challenge →
                  </button>
                )}

                {/* HARD FINISHED */}
                {difficulty === "hard" && (

                  <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">

                    <button
                      onClick={() => {
                        setShowResult(false);
                        generateStory();
                      }}
                      className="px-6 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500"
                    >
                      Try Again
                    </button>

                    <button
                      onClick={() => {
                        setStep("stories");
                        setShowResult(false);
                        stopSpeaking();
                      }}
                      className="px-6 py-2 rounded-full bg-gray-700"
                    >
                      Back to Stories
                    </button>

                  </div>

                )}

              </div>
              )}

          </div>

        </div>

      )}

      <footer className="mt-auto pt-10 text-xs text-cyan-300/80">
        CompreHub — Read, Listen, Understand ⚡
      </footer>

    </motion.div>
  );
}