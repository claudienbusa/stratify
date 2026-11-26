"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { translations, Lang } from "@/lib/translations";

const LANG_KEY = "stratify_lang";

export default function SettingsPage() {
  const [lang, setLang] = useState<Lang>("fr");
  const t = translations[lang] || translations.fr;
  const [plan, setPlan] = useState("FREE");
  const [generations, setGenerations] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(LANG_KEY) as Lang | null;
    if (saved && translations[saved]) setLang(saved);

    // Simulation des données utilisateur (à remplacer plus tard par Clerk + Prisma)
    setPlan("FREE");
    setGenerations(3);
  }, []);

  const changeLang = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem(LANG_KEY, newLang);
  };

  const planLimits: Record<string, number> = {
    FREE: 5,
    PRO: 100,
    AGENCY: 9999,
  };

  const limit = planLimits[plan] || 5;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-violet-400">Stratify</Link>
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
            <Link href="/dashboard" className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-900">
              {String(t.studio)}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-8">
          {lang === "fr" ? "Paramètres" : "Settings"}
        </h1>

        {/* Plan actuel */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 mb-6">
          <h2 className="font-semibold mb-4">
            {lang === "fr" ? "Ton plan" : "Your plan"}
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-violet-400">{plan}</div>
              <div className="text-sm text-slate-400 mt-1">
                {generations} / {limit} {lang === "fr" ? "générations ce mois" : "generations this month"}
              </div>
            </div>
            <Link
              href="/pricing"
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-medium"
            >
              {lang === "fr" ? "Changer de plan" : "Change plan"}
            </Link>
          </div>
          <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full"
              style={{ width: `${Math.min((generations / limit) * 100, 100)}%` }}
            />
          </div>
        </section>

        {/* Langue */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 mb-6">
          <h2 className="font-semibold mb-4">
            {lang === "fr" ? "Langue" : "Language"}
          </h2>
          <select
            value={lang}
            onChange={(e) => changeLang(e.target.value as Lang)}
            className="w-full rounded-xl px-4 py-2.5 text-sm bg-slate-900 border border-slate-700"
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
        </section>

        {/* Déconnexion (placeholder) */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="font-semibold mb-4">
            {lang === "fr" ? "Compte" : "Account"}
          </h2>
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-red-900 text-red-400 hover:bg-red-950/40 text-sm"
          >
            {lang === "fr" ? "Se déconnecter" : "Sign out"}
          </button>
        </section>
      </main>
    </div>
  );
}
