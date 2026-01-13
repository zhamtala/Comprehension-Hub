"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
} from "lucide-react";

/* ---------------- PASSWORD HELPERS ---------------- */
function passwordRules(password: string) {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
}

function getPasswordStrength(password: string) {
  const rules = passwordRules(password);
  const score = Object.values(rules).filter(Boolean).length;

  if (score <= 2) return { label: "Weak", value: 25, color: "bg-red-500" };
  if (score === 3) return { label: "Fair", value: 50, color: "bg-yellow-400" };
  if (score === 4) return { label: "Good", value: 75, color: "bg-cyan-400" };
  return { label: "Strong", value: 100, color: "bg-green-400" };
}

/* ---------------- PAGE ---------------- */
export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const rules = passwordRules(password);
  const strength = getPasswordStrength(password);
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  const allRulesPassed = Object.values(rules).every(Boolean);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!allRulesPassed) {
      setError("Password does not meet all requirements.");
      setLoading(false);
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      router.push("/login");
    } catch {
      setError("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-black text-white p-4 relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.04)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <motion.form
        onSubmit={handleRegister}
        initial={{ y: 30 }}
        animate={{ y: 0 }}
        className="relative z-10 w-full max-w-md p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-cyan-400/20 shadow-xl space-y-5"
      >
        <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent">
          Create Account
        </h2>

        {/* Name */}
        <Input icon={<User />} value={name} setValue={setName} placeholder="Full name" />

        {/* Email */}
        <Input icon={<Mail />} value={email} setValue={setEmail} placeholder="Email address" type="email" />

        {/* Password */}
        <PasswordInput
          label="Password"
          value={password}
          setValue={setPassword}
          show={showPassword}
          setShow={setShowPassword}
        />

        {/* Strength meter */}
        {password && (
          <div className="space-y-1">
            <div className="w-full h-2 rounded bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${strength.value}%` }}
                transition={{ duration: 0.4 }}
                className={`h-full ${strength.color}`}
              />
            </div>
            <p className="text-xs font-mono text-cyan-300">
              Strength: <span className="text-white">{strength.label}</span>
            </p>
          </div>
        )}

        {/* Password Rules */}
        {password && (
          <div className="space-y-1 text-xs">
            {[
              { id: "length", label: "At least 8 characters", valid: rules.length },
              { id: "upper", label: "One uppercase letter", valid: rules.uppercase },
              { id: "lower", label: "One lowercase letter", valid: rules.lowercase },
              { id: "number", label: "One number", valid: rules.number },
              { id: "symbol", label: "One special character", valid: rules.symbol },
            ].map((rule) => (

              <motion.div
                key={rule.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                {rule.valid ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-400" />
                )}
                <span className={rule.valid ? "text-green-300" : "text-red-300"}>
                  {rule.label}
                </span>
              </motion.div>

            ))}
          </div>
        )}

        {/* Confirm Password */}
        <PasswordInput
          label="Confirm Password"
          value={confirmPassword}
          setValue={setConfirmPassword}
          show={showConfirm}
          setShow={setShowConfirm}
          match={confirmPassword.length > 0 ? passwordsMatch : undefined}
        />

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-sm text-center"
          >
            {error}
          </motion.p>
        )}

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 py-2 rounded-lg font-semibold shadow-lg hover:opacity-90 transition"
        >
          {loading ? "Creating account..." : "Register"}
        </motion.button>

        <p className="text-center text-sm text-cyan-300">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-fuchsia-400 hover:underline"
          >
            Login
          </button>
        </p>
      </motion.form>
    </motion.div>
  );
}

/* ---------------- REUSABLE INPUTS ---------------- */

function Input({ icon, value, setValue, placeholder, type = "text" }: any) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-3 h-4 w-4 text-cyan-400">{icon}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full rounded-lg bg-black/50 pl-10 pr-3 py-2 text-cyan-100 placeholder-cyan-500 focus:ring-2 focus:ring-fuchsia-300 outline-none"
      />
    </div>
  );
}

function PasswordInput({
  label,
  value,
  setValue,
  show,
  setShow,
  match,
}: any) {
  return (
    <div className="relative">
      <Lock className="absolute left-3 top-3 h-4 w-4 text-cyan-400" />
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={label}
        required
        className="w-full rounded-lg bg-black/50 pl-10 pr-10 py-2 text-cyan-100 placeholder-cyan-500 focus:ring-2 focus:ring-fuchsia-300 outline-none"
      />

      {/* Eye Toggle */}
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-2.5 text-cyan-400"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>

      {/* Match indicator */}
      {match !== undefined && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute right-10 top-2.5"
        >
          {match ? (
            <CheckCircle className="h-5 w-5 text-green-400" />
          ) : (
            <XCircle className="h-5 w-5 text-red-400" />
          )}
        </motion.div>
      )}
    </div>
  );
}
