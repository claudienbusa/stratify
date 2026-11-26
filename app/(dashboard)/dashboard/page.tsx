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
const MAX_HISTORY = 20;
const LANG_KEY = "stratify_lang";

type HistoryItem = {
  id: string;
  date: string;
  mode: "simple" | "campaign";
  preview: string;
  brandVoice?: string;
  objective?: string;
  favorite?: boolean;
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

function formatResult(data: unknown): { text: string; score?: number } {
  if (typeof data === "string") return { text: data };
  if (!data || typeof data !== "object") return { text: JSON.stringify(data, null, 2) };
  const o = data as Record<string, unknown>;
  const score = typeof o.score === "number" ? o.score : undefined;
  if (typeof o.post === "string") return { text: o.post, score };
  if (typeof o.caption === "string") return { text: o.caption, score };
  if (typeof o.script === "string") return { text: o.script, score };
  if (Array.isArray(o.thread)) return { text: (o.thread as string[]).join("\n\n"), score };
  return { text: JSON.stringify(data, null, 2), score };
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
  const [dark, setDark] = useState(true);
  const [search, setSearch] = useState("");
  const [rewriting, setRewriting] = useState<string | null>(null);
  const [hashtags, setHashtags] = useState<Record<string, string[]>>({});
  const [loadingHashtags, setLoadingHashtags] = useState<string | null>(null);
  const [improvingHook, setImprovingHook] = useState<string | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
    const saved = localStorage.getItem(LANG_KEY) as Lang | null;
    if (saved && translations[saved]) setLang(saved);
  }, []);

  const changeLang = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem(LANG_KEY, newLang);
  };

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
    setHashtags({});
    if (text.length < 50) {
      setError(String(t.minChars));
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
        if (!res.ok) throw new Error(data.error || String(t.error));
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
        if (!res.ok) throw new Error(data.error || String(t.error));
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
      setError(e instanceof Error ? e.message : String(t.error));
    } finally {
      setLoading(false);
    }
  };

  const rewrite = async (platform: string, content: string) => {
    setRewriting(platform);
    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content, tone: "plus percutant et engageant" }),
      });
      const data = await res.json();
      if (data.rewritten && results) {
        setResults({
          ...results,
          [platform]: { ...(results[platform] as object), post: data.rewritten, caption: data.rewritten, script: data.rewritten },
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRewriting(null);
    }
  };

  const improveHook = async (platform: string, content: string) => {
    setImprovingHook(platform);
    try {
      const res = await fetch("/api/hook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content }),
      });
      const data = await res.json();
      if (data.improved && results) {
        setResults({
          ...results,
          [platform]: { ...(results[platform] as object), post: data.improved, caption: data.improved, script: data.improved },
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setImprovingHook(null);
    }
  };

  const fetchHashtags = async (platform: string, content: string) => {
    setLoadingHashtags(platform);
    try {
      const res = await fetch("/api/hashtags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content, platform }),
      });
      const data = await res.json();
      if (data.hashtags) {
        setHashtags((prev) => ({ ...prev, [platform]: data.hashtags }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHashtags(null);
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
        .map(([platform, data]) => {
          const { text } = formatResult(data);
          return `=== ${platform.toUpperCase()} ===\n${text}`;
        })
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

  const downloadTxt = () => {
    let content = "";
    if (results) {
      content = Object.entries(results)
        .map(([platform, data]) => {
          const { text } = formatResult(data);
          return `=== ${platform.toUpperCase()} ===\n${text}`;
        })
        .join("\n\n");
    } else if (campaign) {
      content = `${campaign.campaignTitle || "Campagne"}\n${campaign.strategy || ""}\n\n`;
      content += (campaign.days || [])
        .map((d) => `=== JOUR ${d.day} — ${d.theme} (${d.platform}) ===\n${d.post}`)
        .join("\n\n");
    }
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stratify-export.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    let content = "";
    if (results) {
      content = Object.entries(results)
        .map(([platform, data]) => {
          const { text } = formatResult(data);
          return `=== ${platform.toUpperCase()} ===\n${text}`;
        })
        .join("\n\n");
    } else if (campaign) {
      content = `${campaign.campaignTitle || "Campagne"}\n${campaign.strategy || ""}\n\n`;
      content += (campaign.days || [])
        .map((d) => `=== JOUR ${d.day} — ${d.theme} (${d.platform}) ===\n${d.post}`)
        .join("\n\n");
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Stratify Export</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; line-height: 1.6; color: #111; }
            h1 { color: #7c3aed; }
            pre { white-space: pre-wrap; background: #f8fafc; padding: 16px; border-radius: 8px; font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>Stratify Export</h1>
          <pre>${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const openHistoryItem = (item: HistoryItem) => {
    setMode(item.mode);
    setResults(item.results || null);
    setCampaign(item.campaign || null);
    setBrandVoice(item.brandVoice || "");
    if (item.objective) setObjective(item.objective);
    setText(item.preview.replace(/\.\.\.$/, ""));
    setShowHistory(false);
  };

  const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  };

  const toggleFavorite = (id: string) => {
    const updated = history.map((h) =>
      h.id === id ? { ...h, favorite: !h.favorite } : h
    );
    saveHistory(updated);
    setHistory(updated);
  };

  const filteredHistory = history.filter(
    (item) =>
      item.preview.toLowerCase().includes(search.toLowerCase()) ||
      (item.brandVoice || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${dark ? "bg-slate-950 text-white" : "bg-white text-slate-900"}`}>
      <header className={`border-b ${dark ? "border-slate-800" : "border-slate-200"}`}>
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
            <span className="text-xs text-slate-500">{history.length} gen.</span>
            <button
              type="button"
              onClick={() => setDark((d) => !d)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-900"
            >
              {dark ? String(t.light) : String(t.dark)}
            </button>
            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-900"
            >
              {String(t.history)}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {showHistory && (
          <div className={`mb-8 rounded-xl border p-4 ${dark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-slate-50"}`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">{String(t.history)}</h2>
              <button type="button" onClick={clearHistory} className="text-xs text-slate-500 hover:text-red-400">
                {String(t.clearAll)}
              </button>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={String(t.search)}
              className={`w-full mb-3 rounded-lg px-3 py-1.5 text-sm border ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-300"}`}
            />
            {filteredHistory.length === 0 ? (
              <p className="text-sm text-slate-500">{String(t.noHistory)}</p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {filteredHistory.map((item) => (
                  <li key={item.id} className={`flex items-start gap-2 p-3 rounded-lg border ${dark ? "border-slate-700 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-100"}`}>
                    <button type="button" onClick={() => openHistoryItem(item)} className="flex-1 text-left">
                      <div className="flex gap-2 text-xs text-slate-500 mb-1">
                        <span>{item.mode === "campaign" ? String(t.campaign) : String(t.simple)}</span>
                        {item.objective ? <span>· {item.objective}</span> : null}
                        <span>· {item.date}</span>
                      </div>
                      <p className="text-sm truncate">{item.preview}</p>
                      {item.brandVoice && (
                        <p className="text-xs text-violet-400 mt-1">{String(t.voice)}: {item.brandVoice}</p>
                      )}
                    </button>
                    <button type="button" onClick={() => toggleFavorite(item.id)} className="text-lg shrink-0">
                      {item.favorite ? "★" : "☆"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setMode("simple")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === "simple" ? "bg-violet-600" : "border border-slate-700"}`}
          >
            {String(t.simple)}
          </button>
          <button
            type="button"
            onClick={() => setMode("campaign")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === "campaign" ? "bg-violet-600" : "border border-slate-700"}`}
          >
            {String(t.campaign)}
          </button>
        </div>

        <div className="mb-4">
          <label className="text-sm text-slate-400 block mb-2">{String(t.sourceContent)}</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder={String(t.placeholder)}
            className={`w-full rounded-xl px-4 py-3 text-sm border ${dark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-300"}`}
          />
          <p className="text-xs text-slate-500 mt-1">{text.length} / 50 min</p>
        </div>

        <div className="mb-4">
          <label className="text-sm text-slate-400 block mb-2">{String(t.voice)}</label>
          <input
            type="text"
            value={brandVoice}
            onChange={(e) => setBrandVoice(e.target.value)}
            placeholder={String(t.voicePlaceholder)}
            className={`w-full rounded-xl px-4 py-2.5 text-sm border ${dark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-300"}`}
          />
        </div>

        {mode === "simple" && (
          <div className="mb-4">
            <label className="text-sm text-slate-400 block mb-2">{String(t.platforms)}</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggle(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm ${selected.includes(p.id) ? "bg-violet-600" : "border border-slate-700"}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === "campaign" && (
          <div className="mb-4">
            <label className="text-sm text-slate-400 block mb-2">{String(t.campaignGoal)}</label>
            <select
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className={`w-full rounded-xl px-3 py-2.5 text-sm border ${dark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-300"}`}
            >
              <option value="engagement">{String(t.engagement)}</option>
              <option value="authority">{String(t.authority)}</option>
              <option value="leads">{String(t.leads)}</option>
              <option value="sales">{String(t.sales)}</option>
            </select>
          </div>
        )}

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-medium disabled:opacity-50"
        >
          {loading ? String(t.generating) : String(t.generate)}
        </button>

        {(results || campaign) && (
          <div className="mt-6 flex justify-end gap-2 flex-wrap">
            <button
              type="button"
              onClick={generate}
              disabled={loading}
              className="text-sm px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-800 disabled:opacity-50"
            >
              {String(t.newVersion)}
            </button>
            <button
              type="button"
              onClick={copyAll}
              className="text-sm px-4 py-2 rounded-lg border border-violet-600 text-violet-300 hover:bg-violet-950"
            >
              {copied === "all" ? String(t.allCopied) : String(t.copyAll)}
            </button>
            <button
              type="button"
              onClick={downloadTxt}
              className="text-sm px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-800"
            >
              {String(t.download)}
            </button>
            <button
              type="button"
              onClick={downloadPdf}
              className="text-sm px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-800"
            >
              Export PDF
            </button>
          </div>
        )}

        {results && mode === "simple" && (
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold">{String(t.results)}</h2>
            {Object.entries(results).map(([platform, data]) => {
              const { text: content, score } = formatResult(data);
              return (
                <div key={platform} className={`rounded-xl border p-5 ${dark ? "border-slate-700 bg-slate-900/50" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium capitalize">{platform}</h3>
                    {score !== undefined && (
                      <span className="text-xs px-2 py-1 rounded bg-violet-900/50 text-violet-300">Score: {score}/10</span>
                    )}
                  </div>
                  <pre className="text-sm whitespace-pre-wrap mb-4">{content}</pre>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => copy(platform, content)} className="text-xs px-3 py-1.5 rounded-lg border border-slate-600">
                      {copied === platform ? String(t.copied) : String(t.copy)}
                    </button>
                    <button type="button" onClick={() => rewrite(platform, content)} disabled={rewriting === platform} className="text-xs px-3 py-1.5 rounded-lg border border-slate-600">
                      {rewriting === platform ? "..." : String(t.rewrite)}
                    </button>
                    <button type="button" onClick={() => improveHook(platform, content)} disabled={improvingHook === platform} className="text-xs px-3 py-1.5 rounded-lg border border-slate-600">
                      {improvingHook === platform ? "..." : "Hook"}
                    </button>
                    <button type="button" onClick={() => fetchHashtags(platform, content)} disabled={loadingHashtags === platform} className="text-xs px-3 py-1.5 rounded-lg border border-slate-600">
                      {loadingHashtags === platform ? "..." : "#"}
                    </button>
                  </div>
                  {hashtags[platform] && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {hashtags[platform].map((tag) => (
                        <span key={tag} className="text-xs px-2 py-1 rounded bg-slate-800 text-violet-300">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {campaign && mode === "campaign" && (
          <div className="mt-6 space-y-4">
            <div className={`rounded-xl border p-5 ${dark ? "border-violet-900/50 bg-violet-950/30" : "border-violet-200 bg-violet-50"}`}>
              <h2 className="text-xl font-bold">{campaign.campaignTitle || "Campagne 7 jours"}</h2>
              {campaign.strategy && <p className="text-slate-400 text-sm mt-2">{campaign.strategy}</p>}
            </div>
            {(campaign.days || []).map((day) => (
              <div key={day.day} className={`rounded-xl border p-5 ${dark ? "border-slate-700 bg-slate-900/50" : "border-slate-200 bg-slate-50"}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Jour {day.day} — {day.theme}</h3>
                  <span className="text-xs text-slate-500 capitalize">{day.platform}</span>
                </div>
                <pre className="text-sm whitespace-pre-wrap">{day.post}</pre>
                <button type="button" onClick={() => copy(`day-${day.day}`, day.post)} className="mt-3 text-xs px-3 py-1.5 rounded-lg border border-slate-600">
                  {copied === `day-${day.day}` ? String(t.copied) : String(t.copy)}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
