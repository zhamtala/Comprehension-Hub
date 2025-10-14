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
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black text-white"
    >
      {/* Background holographic grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.05),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Floating orbs */}
      <motion.div
        className="absolute -top-40 left-20 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl"
        animate={{ x: [0, -40, 0], y: [0, -20, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="z-10 text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-[0_0_20px_rgba(0,255,255,0.3)]"
      >
        Select Your{" "}
        <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent">
          Learning Path
        </span>
      </motion.h1>

      {/* View Profile Button */}
      <motion.a
        whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(0,255,255,0.6)" }}
        href="/dashboards/StudentDashboard"
        className="z-10 mb-10 flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white font-semibold rounded-full shadow-lg hover:opacity-90 transition-all"
      >
        <User className="w-5 h-5" />
        View My Profile
      </motion.a>

      {/* Category cards */}
      <div className="z-10 grid grid-cols-1 md:grid-cols-2 gap-6 px-6 max-w-5xl">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.2, duration: 0.8 }}
            whileHover={{
              scale: 1.08,
              boxShadow: "0 0 30px rgba(0,255,255,0.4)",
            }}
            onClick={() => router.push(cat.route)}
            className={`cursor-pointer group relative rounded-2xl p-6 bg-gradient-to-br ${cat.color} shadow-lg transition-all backdrop-blur-lg overflow-hidden`}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition" />

            <div className="flex flex-col items-center gap-4 text-center">
              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 1 }}>
                {cat.icon}
              </motion.div>
              <h2 className="text-2xl font-bold tracking-wide">{cat.name}</h2>
              <p className="text-sm text-white/80">{cat.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-sm text-cyan-200/80 font-mono tracking-wide">
        CompreHub — Choose your neural learning channel
      </footer>
    </motion.div>
  );
}
