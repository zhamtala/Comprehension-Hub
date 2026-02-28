"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminUploadPage() {
  const router = useRouter();

  const [jsonInput, setJsonInput] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  /* =========================
     HANDLE VALIDATION
  ========================= */
  const handleValidate = async () => {
    setMessage("");
    setIsLoading(true);
    setIsValid(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const parsed = JSON.parse(jsonInput);

      const res = await fetch(
        "http://localhost:5000/api/admin/validate-questions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(parsed),
        }
      );

      const data = await res.json();

      if (data.valid) {
        setIsValid(true);
        setMessage("Validation successful. Ready to upload.");
      } else {
        setIsValid(false);
        setMessage("Validation errors:\n\n" + data.errors.join("\n"));
      }
    } catch (err) {
      setIsValid(false);
      setMessage("Invalid JSON format.");
    }

    setIsLoading(false);
  };

  /* =========================
     HANDLE UPLOAD
  ========================= */
  const handleUpload = async () => {
    setMessage("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const parsed = JSON.parse(jsonInput);

      const res = await fetch(
        "http://localhost:5000/api/admin/upload-questions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(parsed),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("Questions uploaded successfully.");
        setIsValid(null);
        setJsonInput("");
      } else {
        setMessage("Upload failed: " + data.error);
      }
    } catch (err) {
      setMessage("Upload failed.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-black/60 border-r border-white/10 p-6 hidden md:flex flex-col">
        <h2 className="text-xl font-bold text-cyan-400 mb-8">
          Admin Panel
        </h2>

        <nav className="flex flex-col gap-4 text-sm">
          <button
            onClick={() => router.push("/admin/upload")}
            className="text-left hover:text-cyan-400 transition"
          >
            Upload Questions
          </button>

          <button
            onClick={() => router.push("/admin/questions")}
            className="text-left hover:text-cyan-400 transition"
          >
            Manage Questions
          </button>

          <button
            onClick={() => router.push("/admin")}
            className="text-left hover:text-cyan-400 transition mt-8 text-gray-400"
          >
            Back to Dashboard
          </button>
        </nav>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 p-8 flex justify-center">
        <div className="w-full max-w-4xl">

          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-cyan-400">
              Question Upload
            </h1>
            <p className="text-gray-400 mt-2 text-sm">
              Paste a JSON array of questions below, validate, then upload.
            </p>
          </div>

          {/* CARD */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">

            {/* TEXTAREA */}
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste your JSON question array here..."
              className="w-full h-80 p-4 rounded-xl bg-black border border-white/20 text-sm font-mono mb-6 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />

            {/* BUTTONS */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={handleValidate}
                disabled={isLoading}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isLoading ? "Validating..." : "Validate"}
              </button>

              <button
                onClick={handleUpload}
                disabled={isLoading || !isValid}
                className={`px-6 py-3 rounded-xl transition ${
                  isValid
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-700 cursor-not-allowed"
                }`}
              >
                {isLoading ? "Uploading..." : "Upload"}
              </button>
            </div>

            {/* MESSAGE */}
            {message && (
              <div
                className={`p-4 rounded-xl text-sm whitespace-pre-wrap ${
                  isValid === false
                    ? "bg-red-900/30 text-red-300 border border-red-500/30"
                    : isValid === true
                    ? "bg-green-900/30 text-green-300 border border-green-500/30"
                    : "bg-white/10"
                }`}
              >
                {message}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
