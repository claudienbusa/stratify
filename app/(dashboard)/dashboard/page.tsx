"use client";

import { useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [text, setText] = useState("");

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <Link href="/" className="font-bold text-violet-400">
        Stratify
      </Link>
      <h1 className="text-2xl font-bold mt-8 mb-4">Studio</h1>
      <textarea
        className="w-full min-h-[180px] rounded-xl bg-slate-900 border border-slate-700 p-4"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Colle ton contenu..."
      />
      <button className="mt-4 px-6 py-3 bg-violet-600 rounded-xl">
        Generer
      </button>
    </div>
  );
}
