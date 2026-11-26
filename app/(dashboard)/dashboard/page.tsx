"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { translations, Lang } from "@/lib/translations";

const HISTORY_KEY = "stratify_history";
const LANG_KEY = "stratify_lang";

type HistoryItem = {
  id: string;
  date: string;
  mode: "simple" | "campaign";
  preview: string;
  brandVoice?: string;
  objective?: string;
  favorite?: boolean;
};

export default function HistoryPage() {
  const [lang, setLang] = useState<Lang>("fr");
  const t = translations[lang] || translations.fr;
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "favorite">("all");

  useEffect(() => {
    const saved = localStorage.getItem(LANG_KEY) as Lang | null;
    if (saved && translations[saved]) setLang(saved);

    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      setHistory(raw ? JSON.parse(raw) : []);
    } catch {
      setHistory([]);
    }
  }, []);

  const changeLang = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem(LANG_KEY, newLang);
  };

  const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  };

  const toggleFavorite = (id: string) => {
    const updated = history.map((h) =>
      h.id === id ? { ...h, favorite: !h.favorite } : h
    );
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  const filtered = history.filter((item) => {
    const matchSearch =
      item.preview.toLowerCase().includes(search.toLowerCase()) ||
      (item.brandVoice || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || item.favorite;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-violet-400">
            Stratify
          </Link>
          <div className="flex items-center gap-3">
            <select
              value={lang}
              onChange={(e) => changeLang(e.target.value as Lang)}
              className="text-xs bg-transparent border border-slate-700 rounded px-2 py-1"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="pt">Português</option>
              <option value="zh">中文</option>
              <option value="hi">हिन्दी</option>
              <option value="ar">العربية</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
              <option value="id">Bahasa</option>
            </select>
            <Link
              href="/dashboard"
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-900"
            >
              {String(t.studio)}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{String(t.history)}</h1>
          <button
            type="button"
            onClick={clearHistory}
            className="text-xs text-red-400 hover:underline"
          >
            {String(t.clearAll)}
          </button>
        </div>

        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={String(t.search)}
            className="flex-1 rounded-lg px-3 py-2 text-sm bg-slate-900 border border-slate-700"
          />
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-2 rounded-lg text-xs ${filter === "all" ? "bg-violet-600" : "border border-slate-700"}`}
          >
            {lang === "fr" ? "Tout" : "All"}
          </button>
          <button
            type="button"
            onClick={() => setFilter("favorite")}
            className={`px-3 py-2 rounded-lg text-xs ${filter === "favorite" ? "bg-violet-600" : "border border-slate-700"}`}
          >
            ★
          </button>
        </div>

        {filtered.length === 0 ? (
          <p className="text-slate-500 text-sm">{String(t.noHistory)}</p>
        ) : (
          <ul className="space-y-3">
            {filtered.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-2 text-xs text-slate-500 mb-1">
                      <span>
                        {item.mode === "campaign" ? String(t.campaign) : String(t.simple)}
                      </span>
                      <span>·</span>
                      <span>{item.date}</span>
                    </div>
                    <p className="text-sm truncate">{item.preview}</p>
                    {item.brandVoice && (
                      <p className="text-xs text-violet-400 mt-1">
                        {String(t.voice)}: {item.brandVoice}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(item.id)}
                    className="text-lg shrink-0"
                  >
                    {item.favorite ? "★" : "☆"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
