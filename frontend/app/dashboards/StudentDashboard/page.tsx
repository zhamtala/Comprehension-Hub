"use client";

import { motion } from "framer-motion";
import { BookOpen, Headphones, FileText, Library, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/* ================= TYPES ================= */
type BreakdownItem = {
  difficulty: string;
  percentage: number;
};

type BreakdownData = {
  grammar?: BreakdownItem[];
  comprehension?: BreakdownItem[];
};

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({
    grammar: 0,
    comprehension: 0,
  });

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    fetch("http://localhost:5000/api/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          router.push("/login");
          return;
        }
        setUser({ name: "Student" });
      })
      .catch(() => router.push("/login"));
  }, []);

  /* ================= FETCH ACHIEVEMENTS PROGRESS ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:5000/api/progress/breakdown", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data: BreakdownData) => {
        const calculateAverage = (items?: BreakdownItem[]) => {
          if (!items || items.length === 0) return 0;
          const total = items.reduce((sum, item) => sum + item.percentage, 0);
          return Math.round(total / items.length);
        };

        setProgress({
          grammar: calculateAverage(data.grammar),
          comprehension: calculateAverage(data.comprehension),
        });

        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load dashboard progress", err);
        setLoading(false);
      });
  }, []);

  /* ================= STATIC MODULES ================= */
  const modules = [
    { name: "Grammar", icon: <BookOpen className="w-6 h-6" />, color: "from-cyan-400 to-blue-500", path: "/grammar" },
     { name: "Comprehension", icon: <BookOpen className="w-6 h-6" />, color: "from-cyan-400 to-fuchsia-500", path: "/comprehension/play" },
    { name: "Reading", icon: <FileText className="w-6 h-6" />, color: "from-fuchsia-400 to-pink-500", path: "/reading" },
    { name: "Listening", icon: <Headphones className="w-6 h-6" />, color: "from-emerald-400 to-teal-500", path: "/listening" },
    { name: "Dictionary", icon: <Library className="w-6 h-6" />, color: "from-yellow-400 to-orange-500", path: "/dictionary" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-cyan-300 font-mono">
        Verifying access…
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden bg-black text-white p-4 sm:p-8"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.07),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Header + Buttons */}
      <div className="z-10 flex flex-col sm:flex-row justify-between items-center w-full max-w-6xl mb-6 gap-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center sm:text-left">
          Welcome back,{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent">
            {user?.name}
          </span>{" "}
          👋
        </h1>

        {/* Buttons Container */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/select")}
            className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold text-sm sm:text-base shadow-lg hover:opacity-90 w-full sm:w-auto text-center"
          >
            Back to Selection
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("userId");
              router.push("/login");
            }}
            className="flex items-center gap-2 bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-2 rounded-full font-semibold text-sm w-full sm:w-auto justify-center"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </motion.button>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="z-10 w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
        {Object.entries(progress).map(([key, value]) => (
          <motion.div
            key={key}
            whileHover={{ scale: 1.03 }}
            className="rounded-2xl bg-white/10 backdrop-blur-md border border-cyan-400/20 shadow-lg px-4 py-4"
          >
            <h2 className="text-sm sm:text-lg font-semibold capitalize text-cyan-300 mb-2">
              {key} Progress
            </h2>

            <div className="w-full bg-white/20 rounded-full h-2 sm:h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.8 }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500"
              />
            </div>

            <p className="mt-2 text-xs sm:text-base text-white/90 font-medium">
              {value}% Complete
            </p>
          </motion.div>
        ))}
      </div>

      {/* Learning Modules */}
      <div className="z-10 w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {modules.map((module, i) => (
          <motion.a
            key={module.name}
            href={module.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            whileHover={{ scale: 1.08 }}
            className={`p-6 bg-gradient-to-r ${module.color} rounded-2xl text-white flex flex-col items-center`}
          >
            <div className="bg-white/20 p-3 rounded-full mb-3">{module.icon}</div>
            <h3 className="text-lg font-semibold">{module.name}</h3>
          </motion.a>
        ))}
      </div>

      {/* Desktop View Achievements Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push("/dashboards/Achievements")}
        className="hidden sm:inline z-10 mb-12 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:opacity-90 transition"
      >
        View Achievements
      </motion.button>

      {/* Mobile View Achievements Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push("/dashboards/Achievements")}
        className="sm:hidden z-10 mb-12 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:opacity-90 transition"
      >
        View Achievements
      </motion.button>

      {/* Footer */}
      <footer className="text-center w-full text-sm sm:text-base text-cyan-200/80 font-mono tracking-wide mb-4 sm:mb-8">
        CompreHub — Learn smarter with neural-powered comprehension ⚡
      </footer>
    </motion.div>
  );
}
