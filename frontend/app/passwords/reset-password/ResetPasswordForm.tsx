'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Reset failed');
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch {
      setError('Server error. Try again.');
    }
  };

  if (!token) {
    return (
      <p className="text-center text-red-400 mt-20">
        Invalid or missing reset token.
      </p>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md rounded-2xl p-8 backdrop-blur-2xl ring-1 ring-cyan-400/20"
    >
      <h1 className="text-2xl font-bold text-cyan-300 mb-4">
        Set New Access Key
      </h1>

      {success ? (
        <p className="text-cyan-200 text-sm">
          Password updated. Redirecting to login…
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-cyan-200 mb-1 block">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-cyan-400" />
              <input
                type={show ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-black/50 rounded-lg outline-none focus:ring-2 focus:ring-fuchsia-300"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 py-2 font-semibold"
          >
            Update Password
          </button>
        </form>
      )}
    </motion.div>
  );
}