"use client";

import { motion } from "framer-motion";
import { Award } from "lucide-react";

export default function AchievementsPage() {
  const achievements = [
    {
      name: "Grammar Mastery",
      progress: 80,
      color: "from-cyan-400 to-blue-500",
    },
    {
      name: "Reading Comprehension",
      progress: 65,
      color: "from-fuchsia-400 to-pink-500",
    },
    {
      name: "Listening Skills",
      progress: 50,
      color: "from-emerald-400 to-teal-500",
    },
    {
      name: "Vocabulary Builder",
      progress: 70,
      color: "from-yellow-400 to-orange-500",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen flex flex-col items-center **justify-between** overflow-hidden bg-black text-white p-8"
    >
      
      {/* Container for Header and Progress Bars to stay grouped at the top */}
      <div className="flex flex-col items-center w-full max-w-5xl">

        {/* Header */}
        <div className="z-10 w-full max-w-5xl mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent">
              <Award className="inline w-8 h-8 mr-2 text-yellow-400" /> Achievements
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

        {/* Progress Bars */}
        <div className="z-10 w-full max-w-4xl space-y-8">
          {achievements.map((achieve, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-white/10 border border-cyan-400/20 shadow-lg backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between"
            >
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-semibold text-cyan-300">{achieve.name}</h2>
                <p className="text-white/80 mt-1">{achieve.progress}% Complete</p>
              </div>
              <div className="w-full md:w-2/3 h-4 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${achieve.progress}%` }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className={`h-4 rounded-full bg-gradient-to-r ${achieve.color}`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer - No absolute positioning, using Flexbox to place at bottom */}
      <footer className="mt-16 mb-4 text-sm text-cyan-200/80 font-mono tracking-wide text-center w-full">
        CompreHub — Track your progress and celebrate your wins ⚡
      </footer>
    </motion.div>
  );
}