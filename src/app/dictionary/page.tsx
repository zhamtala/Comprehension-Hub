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
      className="min-h-screen bg-black text-white flex flex-col items-center p-4 md:p-8 relative overflow-x-hidden"
    >
      {/* FIXED BACK BUTTON */}
      <a
  href="/dashboards/StudentDashboard"
  className="
    fixed top-4 left-4 z-50
    w-12 h-12
    flex items-center justify-center
    rounded-full
    bg-white/10 border border-white/15 backdrop-blur-xl
    shadow-[0_0_16px_rgba(0,255,255,0.45)]
    hover:bg-white/20 hover:scale-105
    transition-all active:scale-95
  "
>
  <span className="text-cyan-300 text-3xl leading-none">←</span>
</a>




      {/* PAGE HEADER */}
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl sm:text-4xl font-extrabold mb-6 md:mb-10 bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent text-center mt-12 sm:mt-16"
      >
        Word Dictionary
      </motion.h1>

      {/* SEARCH BAR */}
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md flex flex-col sm:flex-row items-center gap-2 bg-white/10 border border-cyan-400/30 rounded-full overflow-hidden shadow-lg mb-6 md:mb-10 backdrop-blur-md p-2"
      >
        <input
          type="text"
          placeholder="Search any word..."
          value={word}
          onChange={(e) => setWord(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchDefinition(word)}
          className="flex-1 bg-transparent outline-none px-4 py-2 text-base sm:text-lg text-white placeholder-cyan-200/50 rounded-full w-full"
        />
        <button
          onClick={() => fetchDefinition(word)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-full hover:opacity-90 transition w-full sm:w-auto flex justify-center"
        >
          <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </button>
      </motion.div>

      {/* LOADING */}
      {loading && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-cyan-300 mt-4 text-center"
        >
          Searching for "{word}"...
        </motion.p>
      )}

      {/* ERROR */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-400 mt-4 text-center"
        >
          {error}
        </motion.p>
      )}

      {/* WORD DEFINITION */}
      {data && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="z-10 mt-4 md:mt-6 p-6 md:p-8 bg-white/10 backdrop-blur-md border border-cyan-400/30 rounded-2xl shadow-xl w-full max-w-3xl"
        >
          {/* WORD HEADER & AUDIO */}
          <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold capitalize text-cyan-300 flex items-center gap-2">
                <BookOpenText className="w-6 h-6 md:w-7 md:h-7" /> {data.word}
              </h2>
              <p className="text-fuchsia-300 italic">{data.phonetic}</p>
            </div>
            {data.phonetics?.[0]?.audio && (
              <button
                onClick={() => playAudio(data.phonetics[0].audio)}
                className="mt-3 md:mt-0 bg-cyan-500/20 hover:bg-cyan-500/40 p-3 rounded-full transition"
              >
                <Volume2 className="w-6 h-6 text-cyan-300" />
              </button>
            )}
          </div>

          {/* MEANINGS */}
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

      {/* FOOTER */}
      <footer className="mt-auto pb-6 text-xs md:text-sm text-cyan-200/80 font-mono tracking-wide text-center">
        CompreHub — Empower your vocabulary with Technology ⚡
      </footer>
    </motion.div>
  );
}
