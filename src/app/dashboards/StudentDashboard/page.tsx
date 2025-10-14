"use client";

import { motion } from "framer-motion";
import { BookOpen, Headphones, FileText, Award, User, Library } from "lucide-react";

export default function StudentDashboard() {
  const user = {
    name: "Zham Tala",
    progress: {
      grammar: 80,
      reading: 65,
      listening: 50,
    },
  };

  const modules = [
    {
      name: "Grammar",
      icon: <BookOpen className="w-6 h-6" />,
      color: "from-cyan-400 to-blue-500",
      path: "/grammar",
    },
    {
      name: "Reading",
      icon: <FileText className="w-6 h-6" />,
      color: "from-fuchsia-400 to-pink-500",
      path: "/reading",
    },
    {
      name: "Listening",
      icon: <Headphones className="w-6 h-6" />,
      color: "from-emerald-400 to-teal-500",
      path: "/listening",
    },
    {
      name: "Dictionary",
      icon: <Library className="w-6 h-6" />,
      color: "from-yellow-400 to-orange-500",
      path: "/dictionary",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden bg-black text-white p-8"
    >
      {/* 🔷 Background holographic grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.07),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Floating orbs */}
      <motion.div
        className="absolute -top-40 left-20 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, -20, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Header */}
      <div className="z-10 flex justify-between items-center w-full max-w-6xl mb-10">
        <div>
          <h1 className="text-4xl font-extrabold mb-2 drop-shadow-[0_0_20px_rgba(0,255,255,0.3)]">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent">
              {user.name}
            </span>{" "}
            👋
          </h1>
          <p className="text-cyan-200/70 font-light">
            Your personalized AI-powered learning dashboard
          </p>
        </div>

        <motion.div
          whileHover={{ scale: 1.1 }}
          className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 p-3 rounded-full shadow-lg"
        >
          <User className="w-8 h-8 text-white" />
        </motion.div>
      </div>

      {/* Progress Stats */}
      <div className="z-10 grid md:grid-cols-3 gap-6 w-full max-w-6xl mb-12">
        {Object.entries(user.progress).map(([key, value]) => (
          <motion.div
            key={key}
            whileHover={{ scale: 1.05 }}
            className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-cyan-400/20 shadow-lg"
          >
            <h2 className="text-xl font-semibold capitalize mb-3 text-cyan-300">
              {key} Progress
            </h2>
            <div className="w-full bg-white/20 h-3 rounded-full mb-2">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 transition-all duration-700"
                style={{ width: `${value}%` }}
              ></div>
            </div>
            <p className="text-white font-medium">{value}% Complete</p>
          </motion.div>
        ))}
      </div>

      {/* Learning Modules */}
      <h2 className="z-10 text-2xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent">
        Your Learning Modules
      </h2>

      <div className="z-10 grid sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl">
        {modules.map((module, i) => (
          <motion.a
            key={module.name}
            href={module.path}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.2 }}
            whileHover={{
              scale: 1.08,
              boxShadow: "0 0 30px rgba(0,255,255,0.3)",
            }}
            className={`p-6 bg-gradient-to-r ${module.color} text-white rounded-2xl shadow-lg flex flex-col items-center justify-center text-center transition-transform`}
          >
            <div className="bg-white/20 p-3 rounded-full mb-4">{module.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{module.name}</h3>
            <p className="text-sm opacity-90">
              Explore interactive lessons and AI quizzes.
            </p>
          </motion.a>
        ))}
      </div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="z-10 mt-16 p-8 bg-white/10 backdrop-blur-md border border-yellow-400/30 rounded-2xl shadow-lg w-full max-w-5xl flex flex-col md:flex-row items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-2 mb-2">
            <Award className="text-yellow-300" /> Achievements
          </h2>
          <p className="text-white/80">
            You’ve completed{" "}
            <span className="font-semibold text-cyan-400">12 lessons</span> and
            earned <span className="font-semibold text-yellow-400">3 badges</span> this week! 🌟
          </p>
        </div>

        <motion.a
          whileHover={{ scale: 1.1 }}
          href="/dashboard/achievements"
          className="mt-6 md:mt-0 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:opacity-90 transition"
        >
          View Details
        </motion.a>
      </motion.div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-sm text-cyan-200/80 font-mono tracking-wide">
        CompreHub — Learn smarter with neural-powered comprehension ⚡
      </footer>
    </motion.div>
  );
}
