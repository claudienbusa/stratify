"use client";

import { useState } from "react";

const PLATFORMS = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "twitter", label: "Twitter / X" },
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
];

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

type Day = {
  day: number;
  theme: string;
  platform: string;
  post: string;
  goal?: string;
  bestTime?: string;
};

export default function DashboardPage() {
  const [mode, setMode] = useState<"simple" | "campaign">("simple");
  const [text, setText] = useState("");
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

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
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
          body: JSON.stringify({ text, objective }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur");
        setCampaign(data.campaign);
      } else {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, platforms: selected }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur");
        setResults(data.results);
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

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Stratify</h1>
      <p className="text-slate-400 mb-6 text-sm">
        1 contenu → posts ou campagne 7 jours
      </p>

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setMode("simple")}
          className={
            "px-4 py-2 rounded-lg text-sm font-medium " +
            (mode === "simple" ? "bg-violet-600" : "bg-slate-800 border border-slate-700")
          }
        >
          Mode Simple
        </button>
        <button
          type="button"
          onClick={() => setMode("campaign")}
          className={
            "px-4 py-2 rounded-lg text-sm font-medium " +
            (mode === "campaign" ? "bg-violet-600" : "bg-slate-800 border border-slate-700")
          }
        >
          Campagne 7 jours
        </button>
      </div>

      <textarea
        className="w-full min-h-[160px] rounded-xl bg-slate-900 border border-slate-700 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        placeholder="Colle ton contenu (min. 50 caracteres)..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {mode === "simple" && (
        <div className="flex flex-wrap gap-2 my-4">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p.id)}
              className={
                "px-3 py-1.5 rounded-full text-sm border " +
                (selected.includes(p.id)
                  ? "bg-violet-600 border-violet-500"
                  : "border-slate-600 text-slate-300")
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {mode === "campaign" && (
        <div className="my-4">
          <label className="text-sm text-slate-400 block mb-2">Objectif</label>
          <select
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
          >
            <option value="engagement">Engagement</option>
            <option value="authority">Autorite</option>
            <option value="conversion">Conversion</option>
          </select>
        </div>
      )}

      <button
        onClick={generate}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-medium disabled:opacity-50"
      >
        {loading
          ? "Generation..."
          : mode === "campaign"
            ? "Generer la campagne 7 jours"
            : "Generer les posts"}
      </button>

      {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}

      {results && mode === "simple" && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold">Resultats</h2>
          {Object.entries(results).map(([platform, data]) => {
            const content = formatResult(data);
            return (
              <div key={platform} className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                <div className="flex justify-between mb-3">
                  <span className="capitalize text-violet-300 font-medium">{platform}</span>
                  <button
                    type="button"
                    onClick={() => copy(platform, content)}
                    className="text-xs px-3 py-1 rounded-lg border border-slate-600"
                  >
                    {copied === platform ? "Copie !" : "Copier"}
                  </button>
                </div>
                <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{content}</pre>
              </div>
            );
          })}
        </div>
      )}

      {campaign && mode === "campaign" && (
        <div className="mt-8 space-y-4">
          <div>
            <h2 className="text-xl font-bold">{campaign.campaignTitle || "Campagne"}</h2>
            {campaign.strategy && (
              <p className="text-slate-400 text-sm mt-1">{campaign.strategy}</p>
            )}
          </div>
          {(campaign.days || []).map((day) => (
            <div key={day.day} className="rounded-xl border border-slate-700 bg-slate-900 p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium">
                    Jour {day.day} — {day.theme}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {day.platform}
                    {day.bestTime ? " · " + day.bestTime : ""}
                    {day.goal ? " · " + day.goal : ""}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copy("day-" + day.day, day.post)}
                  className="text-xs px-3 py-1 rounded-lg border border-slate-600"
                >
                  {copied === "day-" + day.day ? "Copie !" : "Copier"}
                </button>
              </div>
              <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{day.post}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
