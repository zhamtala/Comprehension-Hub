"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black text-white px-4 sm:px-0"
    >
      {/* Holographic Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.05),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Floating Orbs */}
      <motion.div
        className="absolute -top-32 -left-32 h-48 w-48 sm:h-72 sm:w-72 rounded-full bg-fuchsia-500/20 blur-3xl"
        animate={{ x: [0, 60, 0], y: [0, 30, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 h-64 w-64 sm:h-96 sm:w-96 rounded-full bg-cyan-400/20 blur-3xl"
        animate={{ x: [0, -40, 0], y: [0, -60, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
      />

      {/* Scanning Light Line */}
      <motion.div
        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent"
        animate={{ y: ["0%", "100%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="z-10 text-center px-4 sm:px-6 max-w-3xl flex flex-col items-center"
      >
        <motion.h1
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight drop-shadow-[0_0_20px_rgba(0,255,255,0.3)] leading-tight"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          Welcome to{" "}
          <span className="bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent">
            CompreHub
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-4 sm:mt-6 text-base sm:text-lg text-cyan-100 max-w-xl mx-auto leading-relaxed font-light"
        >
          Boost your comprehension through{" "}
          <span className="text-fuchsia-300 font-semibold">Technology</span> — explore{" "}
          <span className="text-cyan-300 font-semibold">Grammar</span>,{" "}
          <span className="text-purple-300 font-semibold">Reading</span>, and{" "}
          <span className="text-blue-300 font-semibold">Listening</span>{" "}
          enhanced by intelligent insights and adaptive progress tracking.
        </motion.p>

        {/* Get Started Button */}
        <motion.button
          onClick={() => router.push("/login")}
          whileHover={{
            scale: 1.08,
            boxShadow: "0 0 30px rgba(0,255,255,0.5)",
            textShadow: "0 0 10px rgba(255,255,255,0.8)",
          }}
          whileTap={{ scale: 0.95 }}
          className="mt-8 sm:mt-10 flex items-center gap-2 mx-auto rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-8 sm:px-10 py-2.5 sm:py-3 font-semibold text-white text-sm sm:text-base shadow-[0_0_20px_rgba(0,255,255,0.2)] hover:opacity-90 transition-all"
        >
          Initialize Access <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.button>
      </motion.div>

      {/* Footer */}
      <footer className="absolute bottom-4 sm:bottom-6 text-xs sm:text-sm text-cyan-200/80 font-mono tracking-wide px-4 text-center">
        © {new Date().getFullYear()} CompreHub Neural Interface v2.0 — Powered by Technology
      </footer>

      {/* Floating data particles (optimized for mobile) */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-cyan-300 rounded-full opacity-60"
          animate={{
            x: [Math.random() * 200 - 100, Math.random() * 200 - 100],
            y: [Math.random() * 200 - 100, Math.random() * 200 - 100],
            opacity: [0, 1, 0.3],
          }}
          transition={{
            duration: Math.random() * 4 + 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.div>
  );
}
