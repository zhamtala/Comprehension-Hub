"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // Always success (prevents email enumeration)
      setSent(true);
    } catch {
      setError("Server error. Try again later.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl p-8 backdrop-blur-2xl ring-1 ring-cyan-400/20"
      >
        <h1 className="text-2xl font-bold text-cyan-300 mb-4">
          Reset Access Key
        </h1>

        {sent ? (
          <p className="text-cyan-200 text-sm">
            If an account exists for this email, a reset link has been sent.
            You can close this window now.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-cyan-200 mb-1 block">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-cyan-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 py-2 bg-black/50 rounded-lg outline-none focus:ring-2 focus:ring-cyan-300"
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 py-2 font-semibold"
            >
              Send Reset Link
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
