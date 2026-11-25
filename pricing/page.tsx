"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { translations, Lang } from "@/lib/translations";

const LANG_KEY = "stratify_lang";

export default function PricingPage() {
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

  const plans = [
    {
      name: lang === "fr" ? "Gratuit" : lang === "en" ? "Free" : "Gratis",
      price: "0",
      period: lang === "fr" ? "pour toujours" : "forever",
      features: lang === "fr" 
        ? ["5 générations / mois", "Mode Simple", "Historique 7 jours", "1 Brand Voice"]
        : ["5 generations / month", "Simple mode", "7-day history", "1 Brand Voice"],
      cta: lang === "fr" ? "Commencer" : "Start free",
      href: "/dashboard",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "19",
      period: lang === "fr" ? "/ mois" : "/ month",
      features: lang === "fr"
        ? ["100 générations / mois", "Mode Simple + Campagne", "Historique illimité", "Brand Voices illimitées", "Export TXT", "Support prioritaire"]
        : ["100 generations / month", "Simple + Campaign mode", "Unlimited history", "Unlimited Brand Voices", "TXT export", "Priority support"],
      cta: lang === "fr" ? "Passer en Pro" : "Go Pro",
      href: "/dashboard",
      highlighted: true,
    },
    {
      name: "Agency",
      price: "49",
      period: lang === "fr" ? "/ mois" : "/ month",
      features: lang === "fr"
        ? ["Générations illimitées", "Tout du plan Pro", "Export PDF + Notion", "Planification des posts", "Mode Variants", "Accès anticipé aux nouveautés"]
        : ["Unlimited generations", "Everything in Pro", "PDF + Notion export", "Post scheduling", "Variants mode", "Early access to new features"],
      cta: lang === "fr" ? "Choisir Agency" : "Choose Agency",
      href: "/dashboard",
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-violet-400">Stratify</Link>
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
            <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-medium">
              {String(t.studio)}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            {lang === "fr" ? "Choisis ton plan" : "Choose your plan"}
          </h1>
          <p className="text-slate-400">
            {lang === "fr" ? "Commence gratuitement. Passe à Pro quand tu veux." : "Start free. Upgrade when you need more."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-6 flex flex-col ${
                plan.highlighted
                  ? "border-violet-500 bg-violet-950/30 relative"
                  : "border-slate-800 bg-slate-900/50"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-xs px-3 py-1 rounded-full">
                  {lang === "fr" ? "Populaire" : "Popular"}
                </span>
              )}
              <h2 className="text-xl font-semibold">{plan.name}</h2>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-slate-400 text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-violet-400">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block text-center py-3 rounded-xl font-medium ${
                  plan.highlighted
                    ? "bg-violet-600 hover:bg-violet-500"
                    : "border border-slate-700 hover:bg-slate-800"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
