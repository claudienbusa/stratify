
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Plan = "free" | "pro" | "agency";

const PLAN_KEY = "stratify_plan";
const GENERATIONS_KEY = "stratify_generations";

const planDetails = {
  free: {
    name: "Free",
    price: "$0",
    limit: 5,
    features: ["5 générations par mois", "Mode Simple", "Historique de 7 jours"],
  },
  pro: {
    name: "Pro",
    price: "$19 / mois",
    limit: 100,
    features: ["100 générations par mois", "Mode Simple et Campagne", "Historique illimité"],
  },
  agency: {
    name: "Agency",
    price: "$49 / mois",
    limit: Infinity,
    features: ["Générations illimitées", "Export PDF et Notion prévu", "Planification prévue"],
  },
};

export default function SettingsPage() {
  const [plan, setPlan] = useState<Plan>("free");
  const [generations, setGenerations] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedPlan = localStorage.getItem(PLAN_KEY);
    const savedGenerations = Number(
      localStorage.getItem(GENERATIONS_KEY) || "0"
    );

    if (
      savedPlan === "free" ||
      savedPlan === "pro" ||
      savedPlan === "agency"
    ) {
      setPlan(savedPlan);
    }

    setGenerations(
      Number.isFinite(savedGenerations) && savedGenerations >= 0
        ? savedGenerations
        : 0
    );

    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Chargement des paramètres...
      </main>
    );
  }

  const currentPlan = planDetails[plan];
  const remaining =
    currentPlan.limit === Infinity
      ? Infinity
      : Math.max(0, currentPlan.limit - generations);

  const usagePercent =
    currentPlan.limit === Infinity
      ? 0
      : Math.min(100, (generations / currentPlan.limit) * 100);

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <Link href="/dashboard" className="text-violet-400 text-sm">
              ← Retour au dashboard
            </Link>
            <h1 className="text-3xl font-bold mt-4">Paramètres</h1>
            <p className="text-slate-400 mt-2">
              Gère ton forfait et ton utilisation de Stratify.
            </p>
          </div>
          <span className="text-violet-400 font-bold text-xl">STRATIFY</span>
        </div>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Ton forfait actuel</h2>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-3xl font-bold">{currentPlan.name}</p>
              <p className="text-slate-400 mt-1">{currentPlan.price}</p>
            </div>
            <span className="bg-violet-900/50 text-violet-300 px-4 py-2 rounded-full text-sm">
              Forfait sélectionné
            </span>
          </div>

          <ul className="mt-6 space-y-3">
            {currentPlan.features.map((feature) => (
              <li key={feature} className="text-slate-300">
                <span className="text-violet-400 mr-2">✓</span>
                {feature}
              </li>
            ))}
          </ul>

          <Link
            href="/pricing"
            className="inline-block mt-6 bg-violet-600 hover:bg-violet-500 px-5 py-3 rounded-xl font-medium"
          >
            Changer de forfait
          </Link>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-2">Utilisation</h2>

          <div className="flex items-center justify-between gap-4 mb-3">
            <span className="text-slate-400">Générations utilisées</span>
            <span className="font-semibold tabular-nums">
              {generations} /{" "}
              {currentPlan.limit === Infinity
                ? "Illimité"
                : currentPlan.limit}
            </span>
          </div>

          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full transition-all"
              style={{ width: `${usagePercent}%` }}
            />
          </div>

          <p className="text-slate-400 text-sm mt-4">
            {remaining === Infinity
              ? "Tu disposes de générations illimitées selon le forfait sélectionné."
              : `${remaining} génération(s) restante(s) selon la limite affichée.`}
          </p>
        </section>

        <p className="text-slate-500 text-xs mt-6">
          Les informations affichées sont actuellement enregistrées dans ce
          navigateur. Les paiements et les limites réelles côté serveur ne sont
          pas encore activés.
        </p>
      </div>
    </main>
  );
}
