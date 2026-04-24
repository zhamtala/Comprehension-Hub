"use client";

export default function DownloadPage() {
  const apkUrl =
    "https://drive.google.com/uc?export=download&id=1inamwc7Ry9wnLOePLXA7B3jWGYeiHb8W";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-6 text-center">
      
      {/* LOGO */}
      <img
        src="/icon.png"
        alt="CompreHub Logo"
        className="w-24 h-24 mb-6"
      />

      {/* TITLE */}
      <h1 className="text-3xl font-bold mb-2 text-cyan-300">
        Download CompreHub
      </h1>

      <p className="text-sm text-gray-300 mb-6">
        Install the app and start your learning journey 🚀
      </p>

      {/* BUTTON */}
      <a
        href={apkUrl}
        className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-6 py-3 rounded-xl font-semibold shadow-lg"
      >
        Download APK
      </a>

      {/* INSTRUCTIONS */}
      <div className="mt-8 text-sm text-gray-400 max-w-xs">
        <p>📲 After downloading:</p>
        <p>1. Open the APK file</p>
        <p>2. Allow “Install unknown apps”</p>
        <p>3. Install CompreHub</p>
      </div>
    </div>
  );
}