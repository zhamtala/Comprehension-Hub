"use client";

import { motion } from "framer-motion";
import { Award } from "lucide-react";
import { useEffect, useState } from "react";
import SkillBreakdownChart from "@/app/components/SkillBreakdownChart";

/* ================= TYPES ================= */

type SkillKey = "grammar" | "comprehension" | "reading" | "listening";

type BreakdownItem = {
  difficulty: string;
  percentage: number;
};

type BreakdownData = Partial<Record<SkillKey, BreakdownItem[]>>;

/* ================= COMPONENT ================= */

export default function AchievementsPage() {
  const [breakdown, setBreakdown] = useState<BreakdownData>({});
  const [progress, setProgress] = useState<Record<SkillKey, number>>({
    grammar: 0,
    comprehension: 0,
    reading: 0,
    listening: 0,
  });

  /* ================= FETCH SKILL BREAKDOWN ================= */

  useEffect(() => {
    const loadBreakdown = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/progress/breakdown", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data: BreakdownData = await res.json();
        setBreakdown(data);

        /* === Compute overall progress per skill === */
        const computedProgress: Record<SkillKey, number> = {
          grammar: 0,
          comprehension: 0,
          reading: 0,
          listening: 0,
        };

        (Object.keys(data) as SkillKey[]).forEach((skill) => {
          const items = data[skill] ?? [];
          if (items.length > 0) {
            const avg =
              items.reduce((sum, i) => sum + i.percentage, 0) / items.length;
            computedProgress[skill] = Math.round(avg);
          }
        });

        setProgress(computedProgress);
      } catch (err) {
        console.error("Failed to load achievements", err);
      }
    };

    loadBreakdown();
  }, []);

  /* ================= ACHIEVEMENTS CONFIG ================= */

  const achievements: {
    key: SkillKey;
    name: string;
    progress: number;
    color: string;
  }[] = [
    {
      key: "grammar",
      name: "Grammar Mastery",
      progress: progress.grammar,
      color: "from-cyan-400 to-blue-500",
    },
    {
      key: "comprehension",
      name: "Comprehension Skills",
      progress: progress.comprehension,
      color: "from-fuchsia-400 to-pink-500",
    },
    {
      key: "reading",
      name: "Reading Skills",
      progress: progress.reading,
      color: "from-emerald-400 to-teal-500",
    },
    {
      key: "listening",
      name: "Listening Skills",
      progress: progress.listening,
      color: "from-yellow-400 to-orange-500",
    },
  ];

  /* ================= UI ================= */

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen flex flex-col items-center justify-between bg-black text-white p-8"
    >
      <div className="flex flex-col items-center w-full max-w-5xl">
        {/* HEADER */}
        <div className="z-10 w-full max-w-5xl mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent">
              <Award className="inline w-8 h-8 mr-2 text-yellow-400" />
              Achievements
            </h1>
            <p className="text-cyan-200/70 font-light">
              Track your learning progress and milestones 🌟
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/20 transition-all font-medium"
          >
            ← Back
          </motion.button>
        </div>

        {/* PROGRESS SECTIONS */}
        <div className="z-10 w-full max-w-4xl space-y-10">
          {achievements.map((achieve, i) => (
            <motion.div
              key={achieve.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-white/10 border border-cyan-400/20 shadow-lg backdrop-blur-md"
            >
              {/* TITLE + % */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <h2 className="text-xl font-semibold text-cyan-300">
                  {achieve.name}
                </h2>
                <p className="text-white/80 mt-2 md:mt-0">
                  {achieve.progress}% Complete
                </p>
              </div>

              {/* PROGRESS BAR */}
              <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden mb-6">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${achieve.progress}%` }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className={`h-4 rounded-full bg-gradient-to-r ${achieve.color}`}
                />
              </div>

              {/* SKILL BREAKDOWN CHART */}
              {breakdown[achieve.key] && breakdown[achieve.key]!.length > 0 && (
                <div>
                  <p className="text-sm text-cyan-200 mb-2">
                    Skill Breakdown (by difficulty)
                  </p>
                  <SkillBreakdownChart data={breakdown[achieve.key]!} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-16 mb-4 text-sm text-cyan-200/80 font-mono tracking-wide text-center w-full">
        CompreHub — Track your progress and celebrate your wins ⚡
      </footer>
    </motion.div>
  );
}
