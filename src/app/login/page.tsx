"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);

  // Mock user data
  const mockUser = {
    email: "test@example.com",
    password: "123456",
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (email === mockUser.email && password === mockUser.password) {
      setError("");
      setShowWelcome(true);

      // Redirect after animation
      setTimeout(() => {
        router.push("/select");
      }, 3500);
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white">
      {/* Neon grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,255,0.1),transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Animated holographic lines */}
      <motion.div
        className="absolute inset-0 opacity-40"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          backgroundImage:
            "linear-gradient(45deg, rgba(0,255,255,0.2), rgba(255,0,255,0.1), rgba(0,255,255,0.2))",
          backgroundSize: "400% 400%",
        }}
      />

      {/* AI Boot-up Animation */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            key="welcome"
            className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Scanning Lines */}
            <motion.div
              className="absolute top-0 h-1 w-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-cyan-400 blur-sm"
              animate={{ y: ["0%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />

            {/* AI Text */}
            <motion.h1
              className="text-4xl md:text-6xl font-bold tracking-[0.15em] text-cyan-300"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              ACCESS GRANTED
            </motion.h1>

            <motion.p
              className="mt-4 text-lg text-fuchsia-200 font-mono"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 0.7, 1],
              }}
              transition={{
                delay: 0.5,
                duration: 2,
                repeat: Infinity,
              }}
            >
              Initializing CompreHub Intelligence...
            </motion.p>

            {/* AI Circuit Pulse */}
            <motion.div
              className="absolute w-40 h-40 border-2 border-cyan-400/50 rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Form */}
      {!showWelcome && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 w-full max-w-md rounded-2xl bg-white/10 p-8 shadow-[0_0_30px_rgba(0,255,255,0.2)] backdrop-blur-xl border border-cyan-400/30"
        >
          <h1 className="mb-6 text-center text-3xl font-bold bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent">
            CompreHub Access
          </h1>
          <p className="mb-8 text-center text-sm text-cyan-200 font-mono">
            Please authenticate your access credentials.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-cyan-100 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-cyan-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-lg bg-black/40 pl-10 pr-3 py-2 text-cyan-100 placeholder-cyan-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300 outline-none transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-cyan-100 mb-1">
                Access Key
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-cyan-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-lg bg-black/40 pl-10 pr-3 py-2 text-cyan-100 placeholder-cyan-500 focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-300 outline-none transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 rounded-md px-3 py-2 text-center border border-red-400/30">
                {error}
              </p>
            )}

            {/* Buttons */}
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px #00ffff80" }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 py-2 text-white font-semibold shadow-lg transition-all"
            >
              Authenticate
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/")}
              className="w-full rounded-lg bg-transparent py-2 text-cyan-200 font-medium hover:text-white border border-cyan-400/30 mt-2"
            >
              Cancel
            </motion.button>

            <div className="flex items-center justify-between text-xs text-cyan-300 mt-3 font-mono">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-cyan-400" /> Remember
                access
              </label>
              <button
                type="button"
                className="hover:underline hover:text-fuchsia-300 transition"
              >
                Forgot key?
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
}
