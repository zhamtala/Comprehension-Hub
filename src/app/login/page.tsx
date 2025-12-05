"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock user data
  const mockUser = {
    email: "test@example.com",
    password: "123456",
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // small visual delay to show loading state
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (email === mockUser.email && password === mockUser.password) {
        setShowWelcome(true);

        // Redirect after animation (keeps previous behaviour)
        setTimeout(() => {
          router.push("/select");
        }, 2500);
      } else {
        setError("Invalid email or password");
      }
    }, 600);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white px-4">
      {/* Background subtle grids */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,255,0.05),transparent_75%)] pointer-events-none" />
      <div
        className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"
        aria-hidden
      />

      {/* Animated Side Runes - Left */}
      <motion.div
        aria-hidden
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 flex-col gap-3 items-center"
      >
        <motion.div
          animate={{ y: [0, -10, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="text-cyan-300/80 text-xl md:text-2xl"
        >
          ✦
        </motion.div>
        <motion.div
          animate={{ y: [0, 10, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          className="text-fuchsia-300/80 text-xl md:text-2xl"
        >
          ☉
        </motion.div>
        <motion.div
          animate={{ y: [0, -6, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          className="text-cyan-200/70 text-xl md:text-2xl"
        >
          ✧
        </motion.div>
      </motion.div>

      {/* Animated Side Runes - Right */}
      <motion.div
        aria-hidden
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 flex-col gap-3 items-center"
      >
        <motion.div
          animate={{ y: [0, 8, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3.1, repeat: Infinity, ease: "easeInOut" }}
          className="text-fuchsia-300/80 text-xl md:text-2xl"
        >
          ✧
        </motion.div>
        <motion.div
          animate={{ y: [0, -12, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          className="text-cyan-300/80 text-xl md:text-2xl"
        >
          ☉
        </motion.div>
        <motion.div
          animate={{ y: [0, 6, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.9, repeat: Infinity, ease: "easeInOut" }}
          className="text-cyan-200/70 text-xl md:text-2xl"
        >
          ✦
        </motion.div>
      </motion.div>

        {/* ACCESS GRANTED overlay */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            key="welcome"
            className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/70 backdrop-blur-md px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* HEADER */}
            <motion.h1
              className="text-2xl sm:text-4xl md:text-6xl font-extrabold tracking-widest text-cyan-300 mb-3 text-center leading-tight"
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1.03, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              ACCESS GRANTED
            </motion.h1>

            {/* SUBTEXT */}
            <motion.p
              className="mt-1 text-xs sm:text-sm md:text-base text-fuchsia-200 font-mono text-center max-w-[18rem] sm:max-w-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.9] }}
              transition={{ delay: 0.2, duration: 2 }}
            >
              Initializing CompreHub Intelligence...
            </motion.p>

            {/* PULSING RING */}
            <motion.div
              className="relative mt-6 w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full border-2 border-cyan-400/30 flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />

          </motion.div>
        )}
      </AnimatePresence>



      {/* Login Card */}
      {!showWelcome && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 w-full max-w-md sm:max-w-lg rounded-2xl backdrop-blur-2xl p-6 sm:p-8 shadow-xl ring-1 ring-cyan-400/20"
        >
          {/* Neon pulse border */}
          <motion.div
            aria-hidden
            className="absolute -inset-1 rounded-2xl pointer-events-none"
            animate={{ boxShadow: ["0 0 30px rgba(34,211,238,0.06)", "0 0 60px rgba(236,72,153,0.06)", "0 0 30px rgba(34,211,238,0.06)"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Floating small header */}
          <div className="flex flex-col items-center mb-4">
            <div className="text-xs sm:text-sm text-cyan-200 font-mono tracking-widest mb-1">ACCESS TERMINAL</div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent">
              CompreHub Access
            </h1>
            <p className="text-xs sm:text-sm text-cyan-200 mt-2 text-center max-w-[26rem]">
              Authenticate to enter the learning hub.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-cyan-100 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-cyan-400/90" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Email address"
                  required
                  className="w-full rounded-lg bg-black/50 pl-10 pr-3 py-2 text-cyan-100 placeholder-cyan-500 focus:ring-2 focus:ring-cyan-300 focus:border-transparent outline-none transition text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-cyan-100 mb-1">Access Key</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-cyan-400/90" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-label="Access key"
                  required
                  className="w-full rounded-lg bg-black/50 pl-10 pr-10 py-2 text-cyan-100 placeholder-cyan-500 focus:ring-2 focus:ring-fuchsia-300 focus:border-transparent outline-none transition text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-cyan-200/80 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 rounded-md px-3 py-2 text-center border border-red-400/20">
                {error}
              </p>
            )}

            {/* Buttons group */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 py-2 text-white font-semibold shadow-md text-sm sm:text-base"
                aria-disabled={loading}
              >
                {loading ? "Authenticating..." : "Authenticate"}
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/")}
                className="flex-1 rounded-lg bg-transparent py-2 text-cyan-200 font-medium border border-cyan-400/20 hover:bg-white/5 text-sm sm:text-base"
              >
                Cancel
              </motion.button>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm text-cyan-300 mt-1 font-mono">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-cyan-400" />
                <span className="text-xs">Remember access</span>
              </label>
              <button type="button" className="hover:underline hover:text-fuchsia-300 transition text-xs">
                Forgot key?
              </button>
            </div>
          </form>

          {/* small footer inside card on mobile */}
          <div className="mt-6 text-center text-xs text-cyan-300/70 font-mono">
            CompreHub — Secure learning access
          </div>
        </motion.div>
      )}

      
    </div>
  );
}
