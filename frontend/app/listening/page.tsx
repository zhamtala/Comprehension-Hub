"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Brain, Sparkles } from "lucide-react";
import Confetti from "react-confetti";

interface ListeningQuestion {
  _id: string;
  storyTitle: string;
  storyText: string;
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: "easy" | "medium" | "hard";
}

export default function ListeningPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [story, setStory] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [title, setTitle] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const resultBoxRef = useRef<HTMLDivElement>(null);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | null>(null);

  // ✅ Fetch listening questions from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/questions?activityType=listening")
      .then((res) => res.json())
      .then((data) => {
        // Group by storyTitle
        const grouped = Object.values(
          data.reduce((acc: any, item: ListeningQuestion) => {
            if (!acc[item.storyTitle]) {
              acc[item.storyTitle] = {
                title: item.storyTitle,
                story: item.storyText,
                questions: [],
              };
            }

            acc[item.storyTitle].questions.push({
              q: item.question,
              a: item.options,
              correct: item.correctAnswer,
              difficulty: item.difficulty,
            });

            return acc;
          }, {})
        );

        setStories(grouped);
      })
      .catch((err) => console.error("Failed to fetch listening:", err));
  }, []);

  // ✅ Generate random story from DB
  const generateStory = () => {
    if (stories.length === 0) return;

    const random = stories[Math.floor(Math.random() * stories.length)];

    setStory(random.story);
    setQuestions(random.questions);
    setTitle(random.title);
    setUserAnswers({});
    setShowResult(false);
    setDifficulty(null);
  };

  const playAudio = async () => {
    if (!story) return;
    try {
      setIsPlaying(true);
      const response = await fetch(`/api/tts?text=${encodeURIComponent(story)}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => setIsPlaying(false);
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

    submitListening(correctCount);
  };

  const submitListening = async (finalScore: number) => {
    if (!difficulty) return;

    const activityData = {
      activityType: "listening",
      difficulty,
      score: finalScore,
      total: questions.length,
    };

    try {
      const token = localStorage.getItem("token");

      await fetch("http://localhost:5000/api/activities/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(activityData),
      });

      console.log("Listening saved");
    } catch (err) {
      console.error("Listening save failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-black via-slate-900 to-black text-white px-4 pb-20">
      
      {/* Keep your UI EXACTLY the same below this line */}

      {/* Back Button */}
      <a
        href="/dashboards/StudentDashboard"
        className="fixed top-3 left-3 z-40 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-cyan-200 text-sm"
      >
        ← Back
      </a>

      {/* HEADER */}
      <div className="text-center mb-6 mt-10">
        <h1 className="text-3xl font-bold">🎧 Listening Challenge</h1>
        <p className="text-cyan-200/70">Listen carefully and answer</p>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={generateStory}
          className="px-6 py-2 rounded-full bg-cyan-500"
        >
          Generate Story
        </button>

        {story && (
          <button
            onClick={playAudio}
            disabled={isPlaying}
            className="px-6 py-2 rounded-full bg-emerald-500"
          >
            {isPlaying ? "Playing..." : "Listen"}
          </button>
        )}
      </div>

      {/* Difficulty */}
      {story && !difficulty && (
        <div className="flex gap-4 mb-6">
          {["easy", "medium", "hard"].map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(level as any)}
              className="px-5 py-2 rounded-full bg-fuchsia-500 capitalize"
            >
              {level}
            </button>
          ))}
        </div>
      )}

      {/* Questions */}
      {difficulty && questions.length > 0 && !showResult && (
        <div className="space-y-6 max-w-3xl w-full">
          {questions.map((q, i) => (
            <div key={i} className="p-4 bg-white/10 rounded-xl">
              <p className="mb-3 font-semibold">
                {i + 1}. {q.q}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {q.a.map((opt: string) => (
                  <button
                    key={opt}
                    onClick={() =>
                      setUserAnswers({ ...userAnswers, [i]: opt })
                    }
                    className={`px-3 py-2 rounded-lg ${
                      userAnswers[i] === opt
                        ? "bg-cyan-500"
                        : "bg-white/10"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={checkAnswers}
            className="px-6 py-2 bg-fuchsia-500 rounded-full"
          >
            Check Answers
          </button>
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {showResult && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div
              ref={resultBoxRef}
              className="bg-white text-black p-8 rounded-2xl text-center"
            >
              {showConfetti && <Confetti recycle={false} />}

              <h2 className="text-2xl font-bold mb-3">
                🎉 Challenge Complete!
              </h2>
              <p className="mb-4">
                You scored {score} out of {questions.length}
              </p>

              <button
                onClick={generateStory}
                className="px-6 py-2 bg-cyan-500 text-white rounded-full"
              >
                Try Another Story
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
