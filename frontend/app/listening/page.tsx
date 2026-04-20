"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2 } from "lucide-react";
import Confetti from "react-confetti";
import { speakText, stopSpeaking } from "@/lib/speech";


interface ListeningQuestion {
  id: number;
  question: string;
  options: string[];
  answer: string;
  storyTitle: string;
  storyText: string;
  difficulty: "easy" | "average" | "hard";
}

interface StoryGroup {
  title: string;
  story: string;
  questions: {
    q: string;
    a: string[];
    correct: string;
  }[];
}

export default function ListeningPage() {
  const [stories, setStories] = useState<StoryGroup[]>([]);
  const [selectedStory, setSelectedStory] = useState<StoryGroup | null>(null);
  const [questions, setQuestions] = useState<StoryGroup["questions"]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [difficulty, setDifficulty] = useState<"easy" | "average" | "hard" | null>(null);

  const resultBoxRef = useRef<HTMLDivElement>(null);

  // ✅ Fetch listening questions based on selected difficulty
  const fetchListeningQuestions = async (selectedDifficulty: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/questions?activity=listening&difficulty=${selectedDifficulty}`
      );

      const data: ListeningQuestion[] = await res.json();

      if (!Array.isArray(data)) {
        console.error("Unexpected listening response:", data);
        return;
      }

      // Group by storyTitle
      const grouped: StoryGroup[] = Object.values(
        data.reduce((acc: any, item: ListeningQuestion) => {
          if (!acc[item.storyTitle]) {
            acc[item.storyTitle] = {
              title: item.storyTitle,
              story: item.storyText || "",
              questions: [],
            };
          }

          acc[item.storyTitle].questions.push({
            q: item.question,
            a: item.options,
            correct: item.answer,
          });

          return acc;
        }, {})
      );

      setStories(grouped);

      if (grouped.length > 0) {
        setSelectedStory(grouped[0]);
        setQuestions(grouped[0].questions);
        setUserAnswers({});
        setShowResult(false);
      }
    } catch (err) {
      console.error("Failed to fetch listening:", err);
    }
  };

  const selectDifficulty = (level: "easy" | "average" | "hard") => {
    setDifficulty(level);
    fetchListeningQuestions(level);
  };

  /* AUDIO CONTROLS */

  const playAudio = async () => {
    if (!selectedStory?.story) return;

    setIsPlaying(true);
    await speakText(selectedStory.story);
    setIsPlaying(false);
  };

  const stopAudio = () => {
    stopSpeaking();
    setIsPlaying(false);
  };

  const replayAudio = async () => {
    stopSpeaking();
    setIsPlaying(true);
    await speakText(selectedStory?.story || "");
    setIsPlaying(false);
  };

  const checkAnswers = () => {
    if (!questions) return;

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
    if (!difficulty || !questions) return;

    const activityData = {
      activityType: "listening",
      difficulty,
      score: finalScore,
      total: questions.length,
    };

    try {
      const token = localStorage.getItem("token");

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activities/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(activityData),
      });

      console.log("Listening activity saved");
    } catch (err) {
      console.error("Listening save failed:", err);
    }
  };

  // ✅ Generate a random story from the fetched stories
  const generateRandomStory = () => {
    if (!stories || stories.length === 0) return;
    const random = stories[Math.floor(Math.random() * stories.length)];
    setSelectedStory(random);
    setQuestions(random.questions);
    setUserAnswers({});
    setShowResult(false);
  };

    useEffect(() => {
    const stopSpeech = () => {
      stopSpeaking();
    };

    window.addEventListener("beforeunload", stopSpeech);
    window.addEventListener("popstate", stopSpeech);

    return () => {
      stopSpeech();
      window.removeEventListener("beforeunload", stopSpeech);
      window.removeEventListener("popstate", stopSpeech);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-black via-slate-900 to-black text-white px-4 pb-20">
      
      {/* Back Button */}
      <a
        href="/dashboards/StudentDashboard"
        onClick={() => stopSpeaking()}
        className="fixed top-3 left-3 z-40 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-cyan-200 text-sm"
      >
        ← Back
      </a>

      {/* Header */}
      <div className="text-center mb-6 mt-10">
        <h1 className="text-3xl font-bold">🎧 Listening Challenge</h1>
        <p className="text-cyan-200/70">Listen carefully and answer</p>
      </div>

      {/* Difficulty Selection */}
      {!difficulty && (
        <div className="flex gap-4 mb-6">
          {["easy", "average", "hard"].map((level) => (
            <button
              key={level}
              onClick={() => selectDifficulty(level as any)}
              className="px-5 py-2 rounded-full bg-fuchsia-500 capitalize"
            >
              {level}
            </button>
          ))}
        </div>
      )}

      {/* Generate Random Story */}
      {difficulty && stories.length > 0 && !selectedStory && (
        <button
          onClick={generateRandomStory}
          className="px-6 py-2 rounded-full bg-cyan-500 mb-6"
        >
          Generate Story
        </button>
      )}

      {/* STORY SECTION */}
      {selectedStory && (
        <>
          {/* Title FIRST */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-cyan-300">
              {selectedStory.title}
            </h2>
          </div>

          <div className="flex gap-3 mt-4">

          {/* PLAY */}
          <button
            onClick={playAudio}
            className="px-4 py-2 bg-green-600 rounded-lg text-white"
          >
            ▶
          </button>
          {/* STOP */}
          <button
            onClick={stopAudio} 
            className="px-4 py-2 bg-red-600 rounded-lg text-white"
          >
            ⏹
          </button>

          {/* REPLAY */}
          <button
            onClick={replayAudio}
            className="px-4 py-2 bg-purple-600 rounded-lg text-white"
          >
            🔁
          </button>

        </div>
        </>
      )}

      {/* Questions */}
      {selectedStory && questions.length > 0 && !showResult && (
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
                onClick={generateRandomStory}
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