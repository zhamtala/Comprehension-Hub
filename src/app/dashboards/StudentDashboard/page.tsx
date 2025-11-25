"use client";

import { motion } from "framer-motion";
import { BookOpen, Headphones, FileText, Library } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
  const router = useRouter();

  const user = {
    name: "Zham Tala",
    progress: {
      grammar: 80,
      reading: 65,
      listening: 50,
    },
  };

  const modules = [
    { name: "Grammar", icon: <BookOpen className="w-6 h-6" />, color: "from-cyan-400 to-blue-500", path: "/grammar" },
    { name: "Reading", icon: <FileText className="w-6 h-6" />, color: "from-fuchsia-400 to-pink-500", path: "/reading" },
    { name: "Listening", icon: <Headphones className="w-6 h-6" />, color: "from-emerald-400 to-teal-500", path: "/listening" },
    { name: "Dictionary", icon: <Library className="w-6 h-6" />, color: "from-yellow-400 to-orange-500", path: "/dictionary" },
    { name: "Comprehension", icon: <BookOpen className="w-6 h-6" />, color: "from-cyan-400 to-fuchsia-500", path: "/comprehension/play" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden bg-black text-white p-4 sm:p-8"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.07),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
      <motion.div className="absolute -top-40 left-20 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-blue-500/20 blur-3xl" animate={{ x: [0, 40, 0], y: [0, 30, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute bottom-0 right-0 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-fuchsia-500/20 blur-3xl" animate={{ x: [0, -50, 0], y: [0, -20, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} />

      {/* Header + Buttons */}
      <div className="z-10 flex flex-col sm:flex-row justify-between items-center w-full max-w-6xl mb-6 gap-4 sm:gap-0">
        <h1 className="text-3xl sm:text-4xl font-extrabold drop-shadow-[0_0_20px_rgba(0,255,255,0.3)] text-center sm:text-left w-full sm:w-auto">
          Welcome back, <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent">{user.name}</span> 👋
        </h1>

        {/* Mobile: Buttons centered */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/select")}
            className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold text-sm sm:text-base shadow-lg hover:opacity-90 transition w-full sm:w-auto text-center"
          >
            Back to Selection
          </motion.button>

          {/* Mobile: Next to back button, centered */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/dashboards/Achievements")}
            className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold text-sm sm:text-base shadow-lg hover:opacity-90 transition w-full sm:hidden text-center"
          >
            View Achievements
          </motion.button>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="z-10 w-full max-w-6xl grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {Object.entries(user.progress).map(([key, value]) => (
          <motion.div key={key} whileHover={{ scale: 1.05 }} className="p-3 sm:p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-cyan-400/20 shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold capitalize mb-1 text-cyan-300">{key} Progress</h2>
            <div className="w-full bg-white/20 h-2 sm:h-3 rounded-full mb-2">
              <div className="h-2 sm:h-3 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 transition-all duration-700" style={{ width: `${value}%` }}></div>
            </div>
            <p className="text-white font-medium text-sm sm:text-base">{value}% Complete</p>
          </motion.div>
        ))}
      </div>

      {/* Learning Modules */}
      <h2 className="z-10 text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent text-center w-full">
        Your Learning Modules
      </h2>
      <div className="z-10 w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {modules.map((module, i) => (
          <motion.a
            key={module.name}
            href={module.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            whileHover={{ scale: 1.08, boxShadow: "0 0 30px rgba(0,255,255,0.3)" }}
            className={`p-4 sm:p-6 bg-gradient-to-r ${module.color} text-white rounded-2xl shadow-lg flex flex-col items-center justify-center text-center transition-transform`}
          >
            <div className="bg-white/20 p-3 rounded-full mb-3">{module.icon}</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-1">{module.name}</h3>
            <p className="text-sm sm:text-base opacity-90">Explore interactive lessons and AI quizzes.</p>
          </motion.a>
        ))}
      </div>

      {/* Desktop: View Achievements Button at Bottom */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push("/dashboards/Achievements")}
        className="hidden sm:inline z-10 mb-12 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:opacity-90 transition"
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
