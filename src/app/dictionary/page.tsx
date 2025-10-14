"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Volume2, BookOpenText } from "lucide-react";

export default function DictionaryPage() {
  const [word, setWord] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDefinition = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${query}`);
      if (!res.ok) throw new Error("Word not found.");
      const json = await res.json();
      setData(json[0]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (url?: string) => {
    if (url) new Audio(url).play();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-black text-white flex flex-col items-center p-8 relative overflow-hidden"
    >
      {/* 🌈 Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.07),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent"
      >
        Word Dictionary
      </motion.h1>

      {/* 🔍 Search Bar */}
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl flex items-center bg-white/10 border border-cyan-400/30 rounded-full overflow-hidden shadow-lg mb-10 backdrop-blur-md"
      >
        <input
          type="text"
          placeholder="Search any word..."
          value={word}
          onChange={(e) => setWord(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchDefinition(word)}
          className="flex-1 bg-transparent outline-none px-5 py-3 text-lg text-white placeholder-cyan-200/50"
        />
        <button
          onClick={() => fetchDefinition(word)}
          className="p-3 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-full m-1 hover:opacity-90 transition"
        >
          <Search className="w-6 h-6 text-white" />
        </button>
      </motion.div>

      {/* 💫 Loading */}
      {loading && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-cyan-300 mt-6"
        >
          Searching for "{word}"...
        </motion.p>
      )}

      {/* ⚠️ Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-400 mt-6"
        >
          {error}
        </motion.p>
      )}

      {/* 📚 Word Definition */}
      {data && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="z-10 mt-6 p-8 bg-white/10 backdrop-blur-md border border-cyan-400/30 rounded-2xl shadow-xl w-full max-w-3xl"
        >
          {/* Header with Audio */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold capitalize text-cyan-300 flex items-center gap-2">
                <BookOpenText className="w-7 h-7" /> {data.word}
              </h2>
              <p className="text-fuchsia-300 italic">{data.phonetic}</p>
            </div>
            {data.phonetics?.[0]?.audio && (
              <button
                onClick={() => playAudio(data.phonetics[0].audio)}
                className="bg-cyan-500/20 hover:bg-cyan-500/40 p-3 rounded-full transition"
              >
                <Volume2 className="w-6 h-6 text-cyan-300" />
              </button>
            )}
          </div>

          {/* Meanings */}
          {data.meanings?.map((m: any, i: number) => (
            <div key={i} className="mb-6">
              <h3 className="text-lg text-yellow-300 font-semibold mb-2">
                {m.partOfSpeech}
              </h3>
              <ul className="list-disc list-inside space-y-2 text-white/90">
                {m.definitions?.slice(0, 3).map((d: any, j: number) => (
                  <li key={j}>
                    {d.definition}
                    {d.example && (
                      <p className="text-sm text-cyan-300 italic mt-1">
                        “{d.example}”
                      </p>
                    )}
                  </li>
                ))}
              </ul>
              {m.synonyms?.length > 0 && (
                <p className="mt-2 text-sm text-fuchsia-300">
                  <strong>Synonyms:</strong> {m.synonyms.slice(0, 5).join(", ")}
                </p>
              )}
            </div>
          ))}
        </motion.div>
      )}

      {/* Footer */}
      <footer className="absolute bottom-6 text-sm text-cyan-200/80 font-mono tracking-wide">
        CompreHub — Empower your vocabulary with Technology ⚡
      </footer>
    </motion.div>
  );
}
