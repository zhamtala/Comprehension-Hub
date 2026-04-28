"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain } from "lucide-react";
import { Play, Square, RotateCcw } from "lucide-react";
import dynamic from "next/dynamic";

const Confetti = dynamic(() => import("react-confetti"), {
  ssr: false,
});
import { speakText, stopSpeaking } from "@/lib/speech";

type Difficulty = "easy" | "average" | "hard";
type Step = "stories" | "difficulty" | "activity";

export default function ComprehensionPage() {

  const router = useRouter();
  const [step, setStep] = useState<Step>("stories");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [completedDifficulties, setCompletedDifficulties] = useState<Difficulty[]>([]);

  const [story, setStory] = useState("");
  const [title, setTitle] = useState("");

  const QUESTIONS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);
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
      setCurrentPage(1);
      setShowConfetti(false);

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
    if (typeof window === "undefined") return;

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
  };

  const stopAudio = () => {
    stopSpeaking();
    setIsPlaying(false);
  };

  const replayAudio = () => {
    stopSpeaking();
    speakText(story);
    setIsPlaying(true);
  };

  const areAllQuestionsAnswered = () => {
    return questions.every((_, index) => {
      const answer = userAnswers[index];
      return answer && answer.trim() !== "";
    });
  };

  /* Check answers */

  const checkAnswers = () => {
    if (!areAllQuestionsAnswered()) {
      alert("Please answer all questions before submitting.");
      return;
    }

    let correctCount = 0;

    questions.forEach((q, index) => {
      const studentAnswer = (userAnswers[index] || "").trim().toLowerCase();

      if (!q.correct) return;

      if (q.type === "mcq") {
        if (studentAnswer === q.correct.trim().toLowerCase()) {
          correctCount++;
        }
      }

      if (q.type === "short_answer" || q.type === "long_answer") {
        const keywords = (q.correct || "")
          .toLowerCase()
          .split("\n")
          .map(k => k.trim())
          .filter(k => k.length > 0);

        if (keywords.length === 0) return;

        const matchedKeywords = keywords.filter(keyword =>
          studentAnswer.includes(keyword)
        );

        const scoreRatio = matchedKeywords.length / keywords.length;

        if (scoreRatio >= 0.5) {
          correctCount++;
        }
      }
    });

    const passed = correctCount >= questions.length / 2;

    setScore(correctCount);
    setShowResult(true);

    // ✅ ONLY unlock if PASSED
    if (passed && !completedDifficulties.includes(difficulty)) {
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

  const indexOfLastQuestion = currentPage * QUESTIONS_PER_PAGE;
  const indexOfFirstQuestion = indexOfLastQuestion - QUESTIONS_PER_PAGE;

  const currentQuestions = questions.slice(
    indexOfFirstQuestion,
    indexOfLastQuestion
  );

  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const hasPassed = score >= questions.length / 2;

  return (
    <motion.div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-black via-slate-900 to-black text-white px-4 pb-32 pt-20">

      {showResult && showConfetti && (
        <Confetti width={screenSize.width} height={screenSize.height} />
      )}

      {/* Back Button */}
      {step === "stories" && (

        <button
          onClick={() => {
            stopSpeaking();
            router.push("/select");
          }}
          className="absolute top-4 left-4 z-10 
          flex items-center gap-2
          bg-white/10 backdrop-blur-md
          border border-cyan-400/30
          text-cyan-200
          px-4 py-2 rounded-full
          text-sm font-semibold
          shadow-md
          hover:bg-white/20 transition"
        >
          ← Back
        </button>

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
              className={`
                w-full sm:w-auto
                px-6 py-3 sm:px-6 sm:py-2
                text-base sm:text-sm
                rounded-full
                font-semibold
                shadow-md
                transition
                ${
                  isDifficultyUnlocked(level)
                    ? "bg-gradient-to-r from-cyan-500 to-fuchsia-500"
                    : "bg-gray-700"
                }
              `}
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

            {/* PLAY */}
            <button
              onClick={playAudio}
              className="flex items-center gap-2 bg-green-500 px-4 py-2 rounded-full text-white shadow-md active:scale-95 transition"
            >
              <Play size={18} />
              <span className="hidden sm:inline">Play</span>
            </button>

            {/* STOP */}
            <button
              onClick={stopAudio}
              className="flex items-center gap-2 bg-red-500 px-4 py-2 rounded-full text-white shadow-md active:scale-95 transition"
            >
              <Square size={18} />
              <span className="hidden sm:inline">Stop</span>
            </button>

            {/* REPLAY */}
            <button
              onClick={replayAudio}
              className="flex items-center gap-2 bg-purple-500 px-4 py-2 rounded-full text-white shadow-md active:scale-95 transition"
            >
              <RotateCcw size={18} />
              <span className="hidden sm:inline">Replay</span>
            </button>
          </div>

            )}

          </div>

          {/* QUESTIONS */}

          {currentQuestions.map((q, i) => {

            const questionIndex = indexOfFirstQuestion + i;

            return (

              <div key={questionIndex} className="mb-6 bg-white/10 p-5 rounded-2xl">

                <p className="mb-3 font-semibold">
                  {questionIndex + 1}. {q.q}
                </p>

                {q.type === "mcq" && (

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    {q.a.map((opt) => (

                      <button
                        key={opt}
                        onClick={() =>
                          setUserAnswers({ ...userAnswers, [questionIndex]: opt })
                        }
                        className={`px-4 py-2 rounded-xl ${
                          userAnswers[questionIndex] === opt
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
                    value={userAnswers[questionIndex] || ""}
                    onChange={(e) =>
                      setUserAnswers({
                        ...userAnswers,
                        [questionIndex]: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl bg-white/10"
                  />

                )}

                {q.type === "long_answer" && (
                  <textarea
                    placeholder="Write your answer here..."
                    value={userAnswers[questionIndex] || ""}
                    onChange={(e) =>
                      setUserAnswers({ ...userAnswers, [questionIndex]: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-cyan-400/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    rows={5}
                  />
                )}

              </div>

            );

          })}

          <div className="flex justify-center items-center gap-4 mt-6">

            {currentPage > 1 && (
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-4 py-2 rounded-full bg-white/10 border border-cyan-400/30"
              >
                ← Previous
              </button>
            )}

            <span className="text-cyan-300 text-sm">
              Page {currentPage} / {totalPages}
            </span>

            {currentPage < totalPages && (
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-4 py-2 rounded-full bg-white/10 border border-cyan-400/30"
              >
                Next →
              </button>
            )}

          </div>

         {currentPage === totalPages && (
          <div className="mt-10 mb-6 flex justify-center">
            <button
              onClick={checkAnswers}
              disabled={!areAllQuestionsAnswered()}
              className={`w-full max-w-md px-8 py-4 rounded-full font-semibold shadow-lg transition
                ${
                  areAllQuestionsAnswered()
                    ? "bg-gradient-to-r from-cyan-500 to-fuchsia-500 shadow-cyan-500/30"
                    : "bg-gray-600 cursor-not-allowed"
                }`}
            >
              Check Answers
            </button>
          </div>
        )}
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

            <div className="flex flex-col items-center gap-4 mb-6">

              {/* ✅ STATUS BADGE (clean + prominent) */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={`px-6 py-2 rounded-full text-sm font-semibold tracking-wide border
                  ${
                    hasPassed
                      ? "bg-green-500/10 text-green-400 border-green-400/30 shadow-green-500/20 shadow-md"
                      : "bg-red-500/10 text-red-400 border-red-400/30 shadow-red-500/20 shadow-md"
                  }
                `}
              >
                {hasPassed ? "PASSED ✅" : "FAILED ❌"}
              </motion.div>

              {/* ✅ SCORE (clear + readable) */}
              <div className="text-center">
                <p className="text-3xl font-bold text-white">
                  {score} / {questions.length}
                </p>

                <p className="text-sm text-cyan-200/70 mt-1">
                  {Math.round((score / questions.length) * 100)}% Score
                </p>
                <p className="text-xs text-cyan-200/60 mt-1">
                  {hasPassed ? "Great job! You're ready for the next level." : "Keep practicing and try again."}
                </p>
              </div>

              {/* EASY */}
              {difficulty === "easy" && hasPassed && (
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

              {/* AVERAGE */}
              {difficulty === "average" && hasPassed && (
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

              {/* FAIL BUTTON */}
              {!hasPassed && (
                <button
                  onClick={() => {
                    setShowResult(false);
                    generateStory();
                  }}
                  className="bg-yellow-500 px-6 py-2 rounded-full mt-3"
                >
                  Retry Level
                </button>
              )}

              {/* HARD MODE (always allowed but still respects pass/fail for retry) */}
              {difficulty === "hard" && (
                <div className="flex flex-col gap-4 mt-4">
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
                      setShowConfetti(false);
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