"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { translations, Lang } from "@/lib/translations";

const LANG_KEY = "stratify_lang";

export default function Home() {
  const [lang, setLang] = useState<Lang>("fr");
  const t = translations[lang] || translations.fr;

  useEffect(() => {
    const saved = localStorage.getItem(LANG_KEY) as Lang | null;
    if (saved && translations[saved]) setLang(saved);
  }, []);

  const changeLang = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem(LANG_KEY, newLang);
  };

  const texts = {
    fr: {
      badge: "AI Content Strategy",
      title: "1 contenu. 7 jours de posts stratégiques.",
      subtitle: "Transforme un article, un script ou une idée en posts prêts à publier pour LinkedIn, X, Instagram et TikTok.",
      cta: "Essayer gratuitement",
      secondary: "Voir les plans",
      featuresTitle: "Pourquoi Stratify ?",
      f1Title: "Mode Simple",
      f1Desc: "Un contenu source → des posts optimisés pour chaque plateforme en quelques secondes.",
      f2Title: "Campagne 7 jours",
      f2Desc: "Une vraie stratégie : teaser, valeur, preuve sociale, conversation et CTA.",
      f3Title: "Brand Voice",
      f3Desc: "Garde le même ton partout. Professionnel, direct, pédagogique ou humoristique.",
      platforms: "Compatible avec",
    },
    en: {
      badge: "AI Content Strategy",
      title: "1 content. 7 days of strategic posts.",
      subtitle: "Turn an article, script or idea into ready-to-publish posts for LinkedIn, X, Instagram and TikTok.",
      cta: "Try for free",
      secondary: "View plans",
      featuresTitle: "Why Stratify?",
      f1Title: "Simple Mode",
      f1Desc: "One source content → optimized posts for each platform in seconds.",
      f2Title: "7-day Campaign",
      f2Desc: "A real strategy: teaser, value, social proof, conversation and CTA.",
      f3Title: "Brand Voice",
      f3Desc: "Keep the same tone everywhere. Professional, direct, educational or humorous.",
      platforms: "Compatible with",
    },
  };

  const tx = texts[lang as "fr" | "en"] || texts.fr;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800/80 backdrop-blur sticky top-0 z-50 bg-slate-950/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-violet-400 tracking-tight">
            Stratify
          </Link>
          <div className="flex items-center gap-3">
            <select
              value={lang}
              onChange={(e) => changeLang(e.target.value as Lang)}
              className="text-xs bg-transparent border border-slate-700 rounded-lg px-2.5 py-1.5"
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
              href="/pricing"
              className="hidden sm:inline text-sm text-slate-400 hover:text-white transition"
            >
              {t.pricing}
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-medium transition"
            >
              {String(t.studio)}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/40 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center relative">
          <p className="inline-flex items-center gap-2 text-violet-400 text-sm font-medium tracking-wide mb-6 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10">
            {tx.badge}
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight">
            {tx.title.split(".").map((part, i) =>
              i === 0 ? (
                <span key={i}>{part}.</span>
              ) : (
                <span key={i} className="text-violet-400">
                  {part}
                </span>
              )
            )}
          </h1>
          <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {tx.subtitle}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 font-medium transition shadow-lg shadow-violet-900/30"
            >
              {tx.cta}
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-3.5 rounded-xl border border-slate-700 hover:bg-slate-900 font-medium transition"
            >
              {tx.secondary}
            </Link>
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="max-w-4xl mx-auto px-6 pb-16 text-center">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">{tx.platforms}</p>
        <div className="flex flex-wrap justify-center gap-6 text-slate-400 text-sm font-medium">
          <span>LinkedIn</span>
          <span>Twitter / X</span>
          <span>Instagram</span>
          <span>TikTok</span>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold text-center mb-10">{tx.featuresTitle}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: tx.f1Title, desc: tx.f1Desc },
            { title: tx.f2Title, desc: tx.f2Desc },
            { title: tx.f3Title, desc: tx.f3Desc },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 hover:border-violet-500/40 transition"
            >
              <h3 className="font-semibold text-lg mb-2 text-violet-300">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <span>© 2026 Stratify</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-white transition">{t.pricing}</Link>
            <Link href="/dashboard" className="hover:text-white transition">{t.studio}</Link>
            <Link href="/settings" className="hover:text-white transition">{t.settings}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
