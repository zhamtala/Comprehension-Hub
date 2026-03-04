"use client";

import React, { useState, useEffect } from "react";
import { Brain } from "lucide-react";
import { useRouter } from "next/navigation";

/* =========================
   TYPES
========================= */

type MCQQuestion = {
  id: number;
  questionType: "mcq";
  sentence: string;
  options: string[];
  correctWord: string;
  explanation: string;
};

type HighlightQuestion = {
  id: number;
  questionType: "highlight";
  sentence: string;
  incorrectWord: string;
  explanation: string;
};

type QuizItem = MCQQuestion | HighlightQuestion;

interface FeedbackState {
  status: string;
  color: string;
}

/* =========================
   COMPONENT
========================= */

export default function GrammarQuiz() {
  const router = useRouter();

  const [quizData, setQuizData] = useState<QuizItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH QUESTIONS
  ========================= */

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch(
          "${process.env.NEXT_PUBLIC_API_URL}/api/questions?activity=grammar&difficulty=standard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
          setQuizData([]);
          setLoading(false);
          return;
        }

        /* =========================
           MAP + FILTER BAD DATA
        ========================= */

        const mappedData: QuizItem[] = data
        .filter((q: any) => q.sentence && q.questionType)
        .map((q: any) => {
          if (q.questionType === "mcq") {
            return {
              id: q.id,
              questionType: "mcq",
              sentence: q.sentence,
              options: Array.isArray(q.options) ? q.options : [],
              correctWord: q.correctWord,
              explanation: q.explanation || "",
            };
          } else {
            return {
              id: q.id,
              questionType: "highlight",
              sentence: q.sentence,
              incorrectWord: q.incorrectWord,
              explanation: q.explanation || "",
            };
          }
        });

      setQuizData(mappedData);
      setLoading(false);
      } catch (err) {
        console.error("Failed to load questions", err);
        setLoading(false);
      }
    };

    loadQuestions();
  }, [router]);

  const currentQuestion = quizData[currentIndex];

  /* =========================
     ANSWER HANDLING
  ========================= */

  const handleAnswer = (answer: string) => {
    if (!currentQuestion || userAnswer) return;

    setUserAnswer(answer);

    if (
      currentQuestion.questionType === "mcq" &&
      answer === currentQuestion.correctWord
    ) {
      setScore((s) => s + 1);
      setFeedback({ status: "✅ Correct!", color: "text-green-400" });
    } else {
      setFeedback({ status: "❌ Incorrect", color: "text-red-400" });
    }
  };

  const handleNext = async () => {
    setUserAnswer(null);
    setFeedback(null);

    if (currentIndex + 1 < quizData.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      setIsFinished(true);
      await submitProgress();
    }
  };

  /* =========================
     SUBMIT PROGRESS
  ========================= */

  const submitProgress = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await fetch("${process.env.NEXT_PUBLIC_API_URL}/api/activities/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          activityType: "grammar",
          difficulty: "standard",
          score,
          total: quizData.length,
        }),
      });
    } catch (err) {
      console.error("Failed to submit progress", err);
    }
  };

  /* =========================
     SAFE HIGHLIGHT RENDER
  ========================= */

  const renderHighlight = (
    sentence: string,
    incorrectWord: string
  ): React.ReactElement => {
    const words = sentence.split(" ");

    return (
      <p className="text-base sm:text-lg md:text-xl font-light leading-relaxed mb-4 text-white">
        {words.map((word, idx) => {
          const isTarget = word === incorrectWord;

          let className = "";
          if (isTarget && !userAnswer)
            className = "underline decoration-cyan-400 font-semibold";
          if (isTarget && userAnswer)
            className =
              "text-red-400 underline decoration-red-400 font-semibold";

          return (
            <span key={idx} className={className}>
              {word}{" "}
            </span>
          );
        })}
      </p>
    );
  };

  /* =========================
     STATES
  ========================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-cyan-300">
        Loading questions…
      </div>
    );
  }

  if (!loading && quizData.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-cyan-300">
        No questions found.
        <button
          className="mt-4 px-6 py-3 rounded-full bg-purple-500 text-white"
          onClick={() => router.push("/select")}
        >
          Back to Selection
        </button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-3xl font-bold mb-4">🎉 Quiz Complete!</h1>
        <p className="mb-6">
          Score: {score} / {quizData.length}
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setCurrentIndex(0);
              setScore(0);
              setIsFinished(false);
            }}
            className="px-6 py-3 rounded-full bg-cyan-500"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push("/select")}
            className="px-6 py-3 rounded-full bg-purple-500"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  /* =========================
     QUIZ VIEW
  ========================= */

  const isHighlight =
    currentQuestion?.questionType === "highlight" &&
    "incorrectWord" in currentQuestion;

  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-center p-4">
      <div className="w-full max-w-3xl bg-white/10 backdrop-blur-xl p-6 rounded-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Brain className="w-6 h-6 text-cyan-300" />
            Grammar Quiz
          </h2>
          <span className="text-cyan-400">
            {currentIndex + 1} / {quizData.length}
          </span>
        </div>

        {/* Question */}
        <div className="mb-4">
          {isHighlight &&
            renderHighlight(
              currentQuestion.sentence,
              currentQuestion.incorrectWord
            )}

          {currentQuestion.questionType === "mcq" && (
            <p className="text-lg mb-4">{currentQuestion.sentence}</p>
          )}
        </div>

        {/* Options */}
        {currentQuestion.questionType === "mcq" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {currentQuestion.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                disabled={!!userAnswer}
                className={`py-2 px-3 rounded-xl border-2 transition-all ${
                  !userAnswer
                    ? "border-cyan-500 hover:bg-cyan-500/20"
                    : opt === currentQuestion.correctWord
                    ? "border-green-400 bg-green-500/30"
                    : opt === userAnswer
                    ? "border-red-400 bg-red-500/30"
                    : "border-white/10 text-gray-400"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={!userAnswer && currentQuestion.questionType === "mcq"}
          className={`w-full py-3 rounded-xl font-semibold ${
            userAnswer || currentQuestion.questionType === "highlight"
              ? "bg-gradient-to-r from-cyan-500 to-indigo-600"
              : "bg-gray-600"
          }`}
        >
          {currentIndex < quizData.length - 1
            ? "Next Question"
            : "Finish Quiz"}
        </button>

        {/* Feedback */}
        {feedback && (
          <p className={`mt-3 text-center ${feedback.color}`}>
            {feedback.status}
          </p>
        )}
      </div>
    </div>
  );
}