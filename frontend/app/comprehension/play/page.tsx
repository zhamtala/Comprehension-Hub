"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain } from "lucide-react";
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

  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const [showConfetti, setShowConfetti] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: 400, height: 800 });

  const [stories, setStories] = useState<
    { id: number; title: string; preview?: string }[]
  >([]);

  const [selectedStoryId, setSelectedStoryId] = useState<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  /* Screen size for confetti */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateSize = () =>
        setScreenSize({ width: window.innerWidth, height: window.innerHeight });

      updateSize();
      window.addEventListener("resize", updateSize);

      return () => window.removeEventListener("resize", updateSize);
    }
  }, []);

  /* Fetch stories */
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stories`);
        const data = await res.json();
        setStories(data);
      } catch (err) {
        console.error("Failed to load stories", err);
      }
    };

    fetchStories();
  }, []);

  /* Generate story */
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

  useEffect(() => {
    stopSpeaking();
  }, [difficulty]);

  useEffect(() => {

    const handleUnload = () => {
      stopSpeaking();
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      stopSpeaking();
      window.removeEventListener("beforeunload", handleUnload);
    };

  }, []);
  /* Voice Controls */

  const playAudio = () => {
    stopSpeaking();
    speakText(story);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const pauseAudio = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const resumeAudio = () => {
    window.speechSynthesis.resume();
    setIsPaused(false);
  };

  const replayAudio = () => {
    stopSpeaking();
    speakText(story);
  };

  /* Check answers */

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

    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const isDifficultyUnlocked = (level: Difficulty) => {
    if (level === "easy") return true;
    if (level === "average") return completedDifficulties.includes("easy");
    if (level === "hard") return completedDifficulties.includes("average");
    return false;
  };

  return (
    <motion.div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-black via-slate-900 to-black text-white px-4 pb-20">

      {showConfetti && (
        <Confetti width={screenSize.width} height={screenSize.height} />
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl">

          {stories.map((storyItem) => (

            <div
              key={storyItem.id}
              className="p-6 rounded-3xl bg-white/10 border border-cyan-400/20 text-center"
            >

              <div className="text-3xl mb-2">📖</div>

              <h3 className="font-bold text-cyan-200">
                {storyItem.title}
              </h3>

              <p className="text-sm mt-2 text-gray-300">
                {storyItem.preview || "Read and answer comprehension questions."}
              </p>

              <button
                onClick={() => {
                  setSelectedStoryId(storyItem.id);
                  setStep("difficulty");
                }}
                className="mt-4 bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-2 rounded-full"
              >
                Start Story →
              </button>

            </div>

          ))}

        </div>

      )}

      {/* DIFFICULTY */}

      {step === "difficulty" && (

        <div className="flex flex-col items-center gap-4">

          {(["easy", "average", "hard"] as Difficulty[]).map((level) => (

            <button
              key={level}
              disabled={!isDifficultyUnlocked(level)}
              onClick={() => {
                setDifficulty(level);
                setStep("activity");
              }}
              className={`px-6 py-2 rounded-full ${
                isDifficultyUnlocked(level)
                  ? "bg-gradient-to-r from-cyan-500 to-fuchsia-500"
                  : "bg-gray-700"
              }`}
            >
              {level}
            </button>

          ))}

        </div>

      )}

      {/* ACTIVITY */}

      {step === "activity" && story && (

        <div className="max-w-3xl w-full">

          <div className="bg-white/10 p-6 rounded-2xl text-center mb-8">

            <h2 className="text-2xl font-bold text-cyan-300 mb-4">
              {title}
            </h2>

            {difficulty === "easy" && (
              <p className="text-gray-100">{story}</p>
            )}

            {difficulty === "average" && (
              <>
                <p className="text-gray-100 mb-4">{story}</p>
              </>
            )}

            {(difficulty === "average" || difficulty === "hard") && (

              <div className="flex flex-wrap justify-center gap-3 mt-4">

                <button onClick={playAudio} className="bg-green-500 px-4 py-2 rounded-full">
                  ▶ Play
                </button>

                <button onClick={pauseAudio} className="bg-yellow-500 px-4 py-2 rounded-full">
                  ⏸ Pause
                </button>

                <button onClick={resumeAudio} className="bg-blue-500 px-4 py-2 rounded-full">
                  ▶ Resume
                </button>

                <button onClick={replayAudio} className="bg-purple-500 px-4 py-2 rounded-full">
                  🔁 Replay
                </button>

              </div>

            )}

          </div>

          {/* QUESTIONS */}

          {questions.map((q, i) => (

            <div key={i} className="mb-6 bg-white/10 p-5 rounded-2xl">

              <p className="mb-3 font-semibold">
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
            className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-8 py-3 rounded-full block mx-auto"
          >
            Check Answers
          </button>

        </div>

      )}

      {/* RESULT POPUP */}

      <AnimatePresence>

        {showResult && (

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 flex items-center justify-center bg-black/70 z-50"
          >

            <div className="bg-slate-900 p-8 rounded-3xl text-center max-w-md w-full">

              <h2 className="text-2xl font-bold text-cyan-300 mb-3">
                Your Score
              </h2>

              <p className="text-lg mb-6">
                {score} / {questions.length} correct
              </p>

              {difficulty === "easy" && (
                <button
                  onClick={() => {
                    setDifficulty("average");
                    setShowResult(false);
                  }}
                  className="bg-green-500 px-6 py-2 rounded-full"
                >
                  Next Difficulty →
                </button>
              )}

              {difficulty === "average" && (
                <button
                  onClick={() => {
                    setDifficulty("hard");
                    setShowResult(false);
                  }}
                  className="bg-purple-500 px-6 py-2 rounded-full"
                >
                  Final Challenge →
                </button>
              )}

              {difficulty === "hard" && (

                <div className="flex flex-col gap-4">

                  <button
                    onClick={() => {
                      setShowResult(false);
                      generateStory();
                    }}
                    className="bg-cyan-500 px-6 py-2 rounded-full"
                  >
                    Try Again
                  </button>

                  <button
                    onClick={() => {
                      stopSpeaking();
                      setStep("stories");
                      setShowResult(false);
                    }}
                    className="bg-gray-700 px-6 py-2 rounded-full"
                  >
                    Back to Story Selection
                  </button>

                </div>

              )}

            </div>

          </motion.div>

        )}

      </AnimatePresence>
	
	      <footer className="mt-auto pt-10 text-xs text-cyan-300/80">
        	CompreHub — Read, Listen, Understand ⚡
      	</footer>

    </motion.div>
  );
}