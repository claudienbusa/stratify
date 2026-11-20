"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const PLATFORMS = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "twitter", label: "Twitter / X" },
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
];

const HISTORY_KEY = "stratify_history";
const MAX_HISTORY = 20;

type HistoryItem = {
  id: string;
  date: string;
  mode: "simple" | "campaign";
  preview: string;
  brandVoice?: string;
  objective?: string;
  results?: Record<string, unknown>;
  campaign?: {
    campaignTitle?: string;
    strategy?: string;
    days?: Day[];
  };
};

type Day = {
  day: number;
  theme: string;
  platform: string;
  post: string;
  goal?: string;
  bestTime?: string;
};

function formatResult(data: unknown): string {
  if (typeof data === "string") return data;
  if (!data || typeof data !== "object") return JSON.stringify(data, null, 2);
  const o = data as Record<string, unknown>;
  if (typeof o.post === "string") return o.post;
  if (typeof o.caption === "string") return o.caption;
  if (typeof o.script === "string") return o.script;
  if (Array.isArray(o.thread)) return (o.thread as string[]).join("\n\n");
  return JSON.stringify(data, null, 2);
}

function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(items: HistoryItem[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)));
}

export default function DashboardPage() {
  const [mode, setMode] = useState<"simple" | "campaign">("simple");
  const [text, setText] = useState("");
  const [brandVoice, setBrandVoice] = useState("");
  const [selected, setSelected] = useState<string[]>(["linkedin", "twitter"]);
  const [objective, setObjective] = useState("engagement");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, unknown> | null>(null);
  const [campaign, setCampaign] = useState<{
    campaignTitle?: string;
    strategy?: string;
    days?: Day[];
  } | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const pushHistory = (item: HistoryItem) => {
    const next = [item, ...loadHistory()].slice(0, MAX_HISTORY);
    saveHistory(next);
    setHistory(next);
  };

  const generate = async () => {
    setError("");
    setResults(null);
    setCampaign(null);
    if (text.length < 50) {
      setError("Minimum 50 caracteres.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "campaign") {
        const res = await fetch("/api/campaign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, objective, brandVoice }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur");
        setCampaign(data.campaign);
        pushHistory({
          id: Date.now().toString(),
          date: new Date().toLocaleString(),
          mode: "campaign",
          preview: text.slice(0, 80) + (text.length > 80 ? "..." : ""),
          brandVoice,
          objective,
          campaign: data.campaign,
        });
      } else {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, platforms: selected, brandVoice }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur");
        setResults(data.results);
        pushHistory({
          id: Date.now().toString(),
          date: new Date().toLocaleString(),
          mode: "simple",
          preview: text.slice(0, 80) + (text.length > 80 ? "..." : ""),
          brandVoice,
          results: data.results,
        });
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const copy = async (key: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = async () => {
    let content = "";
    if (results) {
      content = Object.entries(results)
        .map(([platform, data]) => `=== ${platform.toUpperCase()} ===\n${formatResult(data)}`)
        .join("\n\n");
    } else if (campaign) {
      content = `${campaign.campaignTitle || "Campagne 7 jours"}\n${campaign.strategy || ""}\n\n`;
      content += (campaign.days || [])
        .map((d) => `=== JOUR ${d.day} — ${d.theme} (${d.platform}) ===\n${d.post}`)
        .join("\n\n");
    }
    if (content) {
      await navigator.clipboard.writeText(content);
      setCopied("all");
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const openHistoryItem = (item: HistoryItem) => {
    setMode(item.mode);
    setResults(item.results || null);
    setCampaign(item.campaign || null);
    setBrandVoice(item.brandVoice || "");
    if (item.objective) setObjective(item.objective);
    setShowHistory(false);
  };

  const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-violet-400">
            Stratify
          </Link>
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-900"
          >
            Historique ({history.length})
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {showHistory && (
          <div className="mb-8 rounded-xl border border-slate-700 bg-slate-900 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Historique local</h2>
              <button
                type="button"
                onClick={clearHistory}
                className="text-xs text-slate-500 hover:text-red-400"
              >
                Tout effacer
              </button>
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-slate-500">Aucune generation pour le moment.</p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-auto">
                {history.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => openHistoryItem(item)}
                      className="w-full text-left rounded-lg border border-slate-800 hover:border-violet-700 px-3 py-2 text-sm"
                    >
                      <div className="flex justify-between gap-2 text-xs text-slate-500 mb-1">
                        <span>
                          {item.mode === "campaign" ? "Campagne" : "Simple"}
                          {item.objective ? ` · ${item.objective}` : ""}
                        </span>
                        <span>{item.date}</span>
                      </div>
                      <div className="text-slate-300 truncate">{item.preview}</div>
                      {item.brandVoice && (
                        <div className="text-xs text-violet-400 mt-1 truncate">
                          Voice: {item.brandVoice}
                        </div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <h1 className="text-2xl font-bold mb-1">Studio</h1>
        <p className="text-slate-400 text-sm mb-6">
          1 contenu source → posts ou campagne 7 jours
        </p>

        <div className="flex gap-2 mb-6 p-1 rounded-xl bg-slate-900 border border-slate-800 w-fit">
          <button
            type="button"
            onClick={() => setMode("simple")}
            className={
              "px-4 py-2 rounded-lg text-sm font-medium transition " +
              (mode === "simple" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white")
            }
          >
            Mode Simple
          </button>
          <button
            type="button"
            onClick={() => setMode("campaign")}
            className={
              "px-4 py-2 rounded-lg text-sm font-medium transition " +
              (mode === "campaign" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white")
            }
          >
            Campagne 7 jours
          </button>
        </div>

        <div className="mb-4">
          <label className="text-sm text-slate-400 block mb-2">Brand Voice (optionnel)</label>
          <input
            type="text"
            value={brandVoice}
            onChange={(e) => setBrandVoice(e.target.value)}
            placeholder="Ex: professionnel et pédagogique, direct et percutant, humour léger..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-slate-600"
          />
        </div>

        <textarea
          className="w-full min-h-[180px] rounded-xl bg-slate-900 border border-slate-700 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-slate-600"
          placeholder="Colle ton script, article ou idee (min. 50 caracteres)..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="text-xs text-slate-500 mt-2 mb-4">{text.length} caracteres</div>

        {mode === "simple" && (
          <div className="flex flex-wrap gap-2 mb-4">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => toggle(p.id)}
                className={
                  "px-3 py-1.5 rounded-full text-sm border transition " +
                  (selected.includes(p.id)
                    ? "bg-violet-600 border-violet-500 text-white"
                    : "border-slate-600 text-slate-400 hover:border-slate-400")
                }
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {mode === "campaign" && (
          <div className="mb-4">
            <label className="text-sm text-slate-400 block mb-2">Objectif de la campagne</label>
            <select
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="engagement">Engagement — likes, commentaires, partages</option>
              <option value="authority">Autorite — expertise et credibilite</option>
              <option value="conversion">Conversion — clics, leads, ventes</option>
            </select>
          </div>
        )}

        <button
          onClick={generate}
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 font-medium disabled:opacity-50 transition"
        >
          {loading
            ? "Generation en cours..."
            : mode === "campaign"
              ? "Generer la campagne 7 jours"
              : "Generer les posts"}
        </button>

        {error && (
          <p className="text-red-400 mt-4 text-sm bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {(results || campaign) && (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={copyAll}
              className="text-sm px-4 py-2 rounded-lg border border-violet-600 text-violet-300 hover:bg-violet-950"
            >
              {copied === "all" ? "Tout copié !" : "Copier tout"}
            </button>
          </div>
        )}

        {results && mode === "simple" && (
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold">Resultats</h2>
            {Object.entries(results).map(([platform, data]) => {
              const content = formatResult(data);
              return (
                <div key={platform} className="rounded-xl border border-slate-700 bg-slate-900/80 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="capitalize font-medium text-violet-300">{platform}</span>
                    <button
                      type="button"
                      onClick={() => copy(platform, content)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-slate-600 hover:bg-slate-800"
                    >
                      {copied === platform ? "Copie !" : "Copier"}
                    </button>
                  </div>
                  <pre className="text-sm text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                    {content}
                  </pre>
                </div>
              );
            })}
          </div>
        )}

        {campaign && mode === "campaign" && (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-violet-900/50 bg-violet-950/30 p-5">
              <h2 className="text-xl font-bold">{campaign.campaignTitle || "Campagne 7 jours"}</h2>
              {campaign.strategy && (
                <p className="text-slate-400 text-sm mt-2">{campaign.strategy}</p>
              )}
            </div>
            {(campaign.days || []).map((day) => (
              <div key={day.day} className="rounded-xl border border-slate-700 bg-slate-900/80 p-5">
                <div className="flex justify-between items-start gap-3 mb-3">
                  <div>
                    <div className="font-medium">
                      Jour {day.day}
                      {day.theme ? ` — ${day.theme}` : ""}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {day.platform}
                      {day.bestTime ? ` · ${day.bestTime}` : ""}
                      {day.goal ? ` · ${day.goal}` : ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copy("day-" + day.day, day.post)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-slate-600 hover:bg-slate-800 shrink-0"
                  >
                    {copied === "day-" + day.day ? "Copie !" : "Copier"}
                  </button>
                </div>
                <pre className="text-sm text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                  {day.post}
                </pre>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
