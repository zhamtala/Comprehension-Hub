"use client";

import { motion } from "framer-motion";

type BreakdownItem = {
  difficulty: string;
  percentage: number;
};

interface Props {
  data: BreakdownItem[];
}

/* ================= UTILS ================= */

const difficultyColors: Record<string, string> = {
  easy: "from-emerald-400 to-teal-500",
  medium: "from-cyan-400 to-blue-500",
  hard: "from-fuchsia-400 to-purple-500",
};

/* ================= COMPONENT ================= */

export default function SkillBreakdownChart({ data }: Props) {
  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const gradient =
          difficultyColors[item.difficulty.toLowerCase()] ||
          "from-gray-400 to-gray-500";

        return (
          <motion.div
            key={item.difficulty}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            className="p-4 rounded-xl bg-white/10 border border-cyan-400/20 backdrop-blur-md shadow-md"
          >
            {/* LABEL */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold tracking-wide text-cyan-200 uppercase">
                {item.difficulty}
              </span>
              <span className="text-sm font-mono text-white/80">
                {item.percentage}%
              </span>
            </div>

            {/* BAR */}
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className={`h-3 rounded-full bg-gradient-to-r ${gradient}`}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
