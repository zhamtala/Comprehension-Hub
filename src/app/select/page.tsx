"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Brain, BookOpen, User } from "lucide-react";

export default function SelectPage() {
  const router = useRouter();

  const categories = [
    {
      name: "Grammar",
      color: "from-cyan-400 to-blue-500",
      icon: <Brain className="w-8 h-8 text-cyan-200" />,
      route: "/grammar",
      desc: "Sharpen your grammar through adaptive lessons.",
    },
    {
      name: "Comprehension",
      color: "from-fuchsia-400 to-purple-500",
      icon: <BookOpen className="w-8 h-8 text-fuchsia-200" />,
      route: "/comprehension/play",
      desc: "Improve comprehension by reading or listening to stories.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative min-h-screen flex flex-col items-center bg-black text-white px-4 sm:px-6 md:px-8"
    >
      {/* Mobile-Only Holographic Grid */}
      <div className="absolute inset-0 md:hidden
        bg-[linear-gradient(rgba(0,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.06)_1px,transparent_1px)]
        bg-[size:55px_55px] animate-[mobileGrid_12s_linear_infinite]"
      />

      {/* Desktop Static Grid */}
      <div className="absolute inset-0 hidden md:block
        bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)]
        bg-[size:50px_50px]"
      />

      {/* Floating Orbs */}
      <motion.div
        className="absolute -top-40 left-[5%] md:left-20 h-64 md:h-80 w-64 md:w-80 rounded-full bg-blue-500/20 blur-3xl"
        animate={{ x: [0, 20, 0], y: [0, 15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-[5%] md:right-0 h-72 md:h-96 w-72 md:w-96 rounded-full bg-fuchsia-500/20 blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, -15, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="z-10 text-3xl sm:text-4xl md:text-5xl font-extrabold mt-20 mb-6 text-center px-2 break-words"
      >
        Select Your{" "}
        <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent">
          Learning Path
        </span>
      </motion.h1>

      {/* View Profile Button */}
      <motion.a
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.06 }}
        href="/dashboards/StudentDashboard"
        className="z-10 mb-10 flex items-center gap-2 px-5 sm:px-6 py-2 text-sm sm:text-base bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white font-semibold rounded-full shadow-lg hover:opacity-90 transition-all"
      >
        <User className="w-5 h-5" />
        View My Profile
      </motion.a>

            {/* Category Cards */}
      <div className="z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 w-full max-w-4xl pb-16 sm:pb-20">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.15 }}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.06 }}
            onClick={() => router.push(cat.route)}
            className={`cursor-pointer group relative rounded-2xl p-4 sm:p-6 bg-gradient-to-br ${cat.color} shadow-lg backdrop-blur-lg overflow-hidden min-h-[180px] sm:min-h-[220px]`}
          >
            <div className="absolute inset-0 opacity-0 group-active:opacity-20 bg-white/10 transition rounded-2xl" />
            <div className="flex flex-col items-center gap-3 text-center">
              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 1 }}>
                {cat.icon}
              </motion.div>
              <h2 className="text-xl sm:text-2xl font-bold break-words">{cat.name}</h2>
              <p className="text-sm sm:text-base text-white/80 break-words">{cat.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-sm sm:text-base text-center text-cyan-200/80 font-mono w-full">
        CompreHub — Choose your neural learning channel
      </footer>


      {/* Keyframes for mobile grid animation */}
      <style>{`
        @keyframes mobileGrid {
          0% { background-position: 0px 0px, 0px 0px; }
          100% { background-position: 60px 60px, 60px 60px; }
        }
      `}</style>
    </motion.div>
  );
}
