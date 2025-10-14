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
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black text-white"
    >
      {/* Holographic Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.05),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Floating Orbs */}
      <motion.div
        className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl"
        animate={{ x: [0, 60, 0], y: [0, 30, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl"
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
        className="z-10 text-center px-6"
      >
        <motion.h1
          className="text-5xl md:text-7xl font-extrabold tracking-tight drop-shadow-[0_0_20px_rgba(0,255,255,0.3)]"
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
          className="mt-6 text-lg text-cyan-100 max-w-2xl mx-auto leading-relaxed font-light"
        >
          Boost your comprehension through{" "}
          <span className="text-fuchsia-300 font-semibold">Technology</span> —
          explore{" "}
          <span className="text-cyan-300 font-semibold">Grammar</span>,{" "}
          <span className="text-purple-300 font-semibold">Reading</span>, and{" "}
          <span className="text-blue-300 font-semibold">Listening</span>{" "}
          enhanced by intelligent insights and adaptive progress tracking.
        </motion.p>

        {/* Glowing "Get Started" Button */}
        <motion.button
          onClick={() => router.push("/login")}
          whileHover={{
            scale: 1.08,
            boxShadow: "0 0 30px rgba(0,255,255,0.5)",
            textShadow: "0 0 10px rgba(255,255,255,0.8)",
          }}
          whileTap={{ scale: 0.95 }}
          className="mt-10 flex items-center gap-2 mx-auto rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-10 py-3 font-semibold text-white shadow-[0_0_20px_rgba(0,255,255,0.2)] hover:opacity-90 transition-all"
        >
          Initialize Access <ArrowRight className="w-5 h-5" />
        </motion.button>
      </motion.div>

      {/* Futuristic footer */}
      <footer className="absolute bottom-6 text-sm text-cyan-200/80 font-mono tracking-wide">
        © {new Date().getFullYear()} CompreHub Neural Interface v2.0 — Powered by Adaptive Intelligence
      </footer>

      {/* Floating data particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-cyan-300 rounded-full"
          animate={{
            x: [Math.random() * 800 - 400, Math.random() * 800 - 400],
            y: [Math.random() * 800 - 400, Math.random() * 800 - 400],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 6 + 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.div>
  );
}
