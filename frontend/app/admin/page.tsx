"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FilePlus, ListChecks, BarChart3, ArrowLeft } from "lucide-react";

export default function AdminLandingPage() {
  const router = useRouter();

  const cards = [
    {
      title: "Create Question",
      desc: "Add new questions for all activities.",
      icon: <FilePlus size={28} />,
      path: "/admin/create",
    },
    {
      title: "Manage Questions",
      desc: "Edit or delete existing questions.",
      icon: <ListChecks size={28} />,
      path: "/admin/questions",
    },
    {
      title: "Analytics",
      desc: "View student performance insights.",
      icon: <BarChart3 size={28} />,
      path: "/admin/analytics",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-8">

      {/* Back Button */}
      <button
        onClick={() => router.push("/")}
        className="flex items-center gap-2 text-sm text-gray-300 hover:text-white mb-8"
      >
        <ArrowLeft size={16} />
        Back to Home
      </button>

      <motion.h1
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-bold mb-10"
      >
        Admin Control Center
      </motion.h1>

      <div className="grid md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push(card.path)}
            className="cursor-pointer bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-lg hover:bg-white/20 transition"
          >
            <div className="mb-4 text-blue-400">{card.icon}</div>
            <h2 className="text-xl font-semibold mb-2">
              {card.title}
            </h2>
            <p className="text-sm text-gray-300">
              {card.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
