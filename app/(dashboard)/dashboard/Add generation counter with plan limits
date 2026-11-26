"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { translations, Lang } from "@/lib/translations";

const PLATFORMS = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "twitter", label: "Twitter / X" },
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
];

const HISTORY_KEY = "stratify_history";
const LANG_KEY = "stratify_lang";
const GEN_KEY = "stratify_generations";
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
  const [lang, setLang] = useState<Lang>("fr");
  const t = translations[lang] || translations.fr;

  const [mode, setMode] = useState<"simple" | "campaign">("simple");
  const [text, setText] = useState("");
  const [selected, setSelected] = useState<string[]>(["linkedin", "twitter"]);
  const [brandVoice, setBrandVoice] = useState("");
  const [objective, setObjective] = useState("engagement");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, unknown> | null>(null);
  const [campaign, setCampaign] = useState<{
    campaignTitle?: string;
    strategy?: string;
    days?: Day[];
  } | null>(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState("");
  const [dark, setDark] = useState(true);
  const [generations, setGenerations] = useState(0);

  const plan = "FREE";
  const planLimits: Record<string, number> = { FREE: 5, PRO: 100, AGENCY: 9999 };
  const limit = planLimits[plan] || 5;

  useEffect(() => {
    setHistory(loadHistory());
    const savedLang = localStorage.getItem(LANG_KEY) as Lang | null;
    if (savedLang && translations[savedLang]) setLang(savedLang);
    const savedGen = localStorage.getItem(GEN_KEY);
    if (savedGen) setGenerations(Number(savedGen));
  }, []);

  const changeLang = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem(LANG_KEY, newLang);
  };

  const incrementGenerations = () => {
    const next = generations + 1;
    setGenerations(next);
    localStorage.setItem(GEN_KEY, String(next));
  };

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const copy = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const generate = async () => {
    if (generations >= limit) {
      setError(lang === "fr" ? "Limite atteinte. Passe à Pro." : "Limit reached. Upgrade to Pro.");
      return;
    }
    setLoading(true);
    setError("");
    setResults(null);
    setCampaign(null);

    try {
      const endpoint = mode === "simple" ? "/api/generate" : "/api/campaign";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          platforms: selected,
          brandVoice,
          objective,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");

      if (mode === "simple") {
        setResults(data.results);
      } else {
        setCampaign(data);
      }

      const item: HistoryItem = {
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        mode,
        preview: text.slice(0, 80),
        brandVoice,
        objective,
        results: mode === "simple" ? data.results : undefined,
        campaign: mode === "campaign" ? data : undefined,
      };
      const next = [item, ...history];
      setHistory(next);
      saveHistory(next);
      incrementGenerations();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${dark ? "bg-slate-950 text-white" : "bg-white text-slate-900"}`}>
      <header className={`border-b ${dark ? "border-slate-800" : "border-slate-200"}`}>
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-violet-400">Stratify</Link>
          <div className="flex items-center gap-3 text-xs">
            <span className={generations >= limit ? "text-red-400" : "text-slate-400"}>
              {generations}/{limit} gen.
            </span>
            <select
              value={lang}
              onChange={(e) => changeLang(e.target.value as Lang)}
              className="bg-transparent border border-slate-700 rounded px-2 py-1"
            >
              <option value="fr">FR</option>
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="pt">PT</option>
              <option value="zh">ZH</option>
              <option value="hi">HI</option>
              <option value="ar">AR</option>
              <option value="de">DE</option>
              <option value="ja">JA</option>
              <option value="id">ID</option>
            </select>
            <button
              type="button"
              onClick={() => setDark(!dark)}
              className="px-2 py-1 rounded border border-slate-700"
            >
              {dark ? String(t.light) : String(t.dark)}
            </button>
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="px-2 py-1 rounded border border-slate-700"
            >
              {String(t.history)}
            </button>
            <Link href="/settings" className="px-2 py-1 rounded border border-slate-700">
              Settings
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{String(t.studio)}</h1>
          <p className="text-sm text-slate-400 mt-1">{String(t.subtitle)}</p>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMode("simple")}
            className={`px-4 py-2 rounded-lg text-sm ${mode === "simple" ? "bg-violet-600" : "border border-slate-700"}`}
          >
            {String(t.simple)}
          </button>
          <button
            type="button"
            onClick={() => setMode("campaign")}
            className={`px-4 py-2 rounded-lg text-sm ${mode === "campaign" ? "bg-violet-600" : "border border-slate-700"}`}
          >
            {String(t.campaign)}
          </button>
        </div>

        <div className="mb-4">
          <label className="text-sm text-slate-400 block mb-2">{String(t.brandVoice)}</label>
          <input
            type="text"
            value={brandVoice}
            onChange={(e) => setBrandVoice(e.target.value)}
            placeholder={String(t.voicePlaceholder)}
            className={`w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-violet-500 ${dark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-300"}`}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {(Array.isArray(t.voices) ? t.voices : []).map((voice) => (
              <button
                key={voice}
                type="button"
                onClick={() => setBrandVoice(voice)}
                className="text-xs px-3 py-1.5 rounded-full border border-slate-700 hover:border-violet-500"
              >
                {voice}
              </button>
            ))}
          </div>
        </div>

        {mode === "campaign" && (
          <div className="mb-4">
            <label className="text-sm text-slate-400 block mb-2">{String(t.campaignGoal)}</label>
            <div className="flex gap-2">
              {["engagement", "authority", "conversion"].map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setObjective(o)}
                  className={`px-3 py-1.5 rounded-lg text-xs ${objective === o ? "bg-violet-600" : "border border-slate-700"}`}
                >
                  {String(t[o] || o)}
                </button>
              ))}
            </div>
          </div>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={String(t.placeholder)}
          rows={8}
          className={`w-full rounded-xl px-4 py-3 text-sm border focus:outline-none focus:ring-2 focus:ring-violet-500 ${dark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-300"}`}
        />
        <div className="text-xs text-slate-500 mt-1">
          {text.length} {String(t.charactersLabel)}
          {text.length < 50 && text.length > 0 && ` · ${String(t.minChars)}`}
        </div>

        <div className="flex flex-wrap gap-2 my-4">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs ${selected.includes(p.id) ? "bg-violet-600" : "border border-slate-700"}`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={generate}
          disabled={loading || text.length < 50 || selected.length === 0}
          className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 font-medium"
        >
          {loading
            ? String(t.generating)
            : mode === "simple"
            ? String(t.generate)
            : String(t.generateCampaign)}
        </button>

        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

        {/* Results */}
        {results && (
          <div className="mt-8 space-y-4">
            <h2 className="font-semibold">{String(t.results)}</h2>
            {Object.entries(results).map(([platform, data]) => (
              <div key={platform} className="rounded-xl border border-slate-700 p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium capitalize">{platform}</span>
                  <button
                    type="button"
                    onClick={() => copy(platform, formatResult(data))}
                    className="text-xs px-3 py-1 rounded border border-slate-600"
                  >
                    {copied === platform ? String(t.copied) : String(t.copy)}
                  </button>
                </div>
                <pre className="text-sm whitespace-pre-wrap">{formatResult(data)}</pre>
              </div>
            ))}
          </div>
        )}

        {/* Campaign */}
        {campaign && (
          <div className="mt-8 space-y-4">
            <h2 className="font-semibold">{campaign.campaignTitle || String(t.campaign)}</h2>
            {campaign.strategy && <p className="text-sm text-slate-400">{campaign.strategy}</p>}
            {(campaign.days || []).map((day) => (
              <div key={day.day} className="rounded-xl border border-slate-700 p-4">
                <div className="flex justify-between mb-2">
                  <div>
                    <div className="font-medium">
                      {String(t.day)} {day.day} — {day.theme}
                    </div>
                    <div className="text-xs text-slate-500">
                      {day.platform} {day.bestTime && `· ${day.bestTime}`}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copy("day-" + day.day, day.post)}
                    className="text-xs px-3 py-1 rounded border border-slate-600"
                  >
                    {copied === "day-" + day.day ? String(t.copied) : String(t.copy)}
                  </button>
                </div>
                <pre className="text-sm whitespace-pre-wrap">{day.post}</pre>
              </div>
            ))}
          </div>
        )}

        {/* History panel */}
        {showHistory && (
          <div className="mt-8 rounded-xl border border-slate-700 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">{String(t.history)}</h2>
              <button
                type="button"
                onClick={() => {
                  setHistory([]);
                  localStorage.removeItem(HISTORY_KEY);
                }}
                className="text-xs text-red-400"
              >
                {String(t.clearAll)}
              </button>
            </div>
            {history.length === 0 && <p className="text-sm text-slate-500">{String(t.noHistory)}</p>}
            {history.map((item) => (
              <div key={item.id} className="border-b border-slate-800 py-3 last:border-0">
                <div className="text-xs text-slate-500">{item.date}</div>
                <div className="text-sm mt-1">{item.preview}...</div>
                {item.brandVoice && (
                  <div className="text-xs text-violet-400 mt-1">
                    {String(t.voice)}: {item.brandVoice}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
