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
              {dark ? "Clair" : "Sombre"}
            </button>
            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-900"
            >
              {t.history}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {showHistory && (
          <div className={`mb-8 rounded-xl border p-4 ${dark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-slate-50"}`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">{t.history}</h2>
              <button type="button" onClick={clearHistory} className="text-xs text-slate-500 hover:text-red-400">
                Tout effacer
              </button>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className={`w-full mb-3 rounded-lg px-3 py-1.5 text-sm border ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-300"}`}
            />
            {filteredHistory.length === 0 ? (
              <p className="text-sm text-slate-500">Aucune generation pour le moment.</p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-auto">
                {filteredHistory.map((item) => (
                  <li key={item.id}>
                    <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${dark ? "border-slate-800" : "border-slate-200"}`}>
                      <button type="button" onClick={() => openHistoryItem(item)} className="flex-1 text-left">
                        <div className="flex justify-between gap-2 text-xs text-slate-500 mb-1">
                          <span>
                            {item.mode === "campaign" ? "Campagne" : "Simple"}
                            {item.objective ? ` · ${item.objective}` : ""}
                          </span>
                          <span>{item.date}</span>
                        </div>
                        <div className="truncate">{item.preview}</div>
                        {item.brandVoice && (
                          <div className="text-xs text-violet-400 mt-1 truncate">Voice: {item.brandVoice}</div>
                        )}
                      </button>
                      <button type="button" onClick={() => toggleFavorite(item.id)} className="text-lg shrink-0">
                        {item.favorite ? "★" : "☆"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <h1 className="text-2xl font-bold mb-1">{t.studio}</h1>
        <p className="text-slate-400 text-sm mb-6">{t.subtitle}</p>

        <div className={`flex gap-2 mb-6 p-1 rounded-xl border w-fit ${dark ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-200"}`}>
          <button
            type="button"
            onClick={() => setMode("simple")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${mode === "simple" ? "bg-violet-600 text-white" : "text-slate-400"}`}
          >
            {t.simple}
          </button>
          <button
            type="button"
            onClick={() => setMode("campaign")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${mode === "campaign" ? "bg-violet-600 text-white" : "text-slate-400"}`}
          >
            {t.campaign}
          </button>
        </div>

        <div className="mb-4">
          <label className="text-sm text-slate-400 block mb-2">{t.brandVoice}</label>
          <input
            type="text"
            value={brandVoice}
            onChange={(e) => setBrandVoice(e.target.value)}
            placeholder={t.voicePlaceholder}
            className={`w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-violet-500 ${dark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-300"}`}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {(t.voices || []).map((voice) => (
              <button
                key={voice}
                type="button"
                onClick={() => setBrandVoice(voice)}
                className="text-xs px-3 py-1.5 rounded-full border border-slate-700 hover:border-violet-500 hover:text-violet-300"
              >
                {voice}
              </button>
            ))}
          </div>
        </div>

        <textarea
          className={`w-full min-h-[180px] rounded-xl p-4 text-sm border focus:outline-none focus:ring-2 focus:ring-violet-500 ${dark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-300"}`}
          placeholder={t.placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="text-xs text-slate-500 mt-2 mb-4">{text.length} {t.charactersLabel}</div>

        {mode === "simple" && (
          <div className="flex flex-wrap gap-2 mb-4">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => toggle(p.id)}
                className={`px-3 py-1.5 rounded-full text-sm border transition ${selected.includes(p.id) ? "bg-violet-600 border-violet-500 text-white" : "border-slate-600 text-slate-400"}`}
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
              className={`w-full rounded-xl px-3 py-2.5 text-sm border ${dark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-300"}`}
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
          className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 font-medium disabled:opacity-50 transition flex items-center justify-center gap-2"
        >
          {loading && <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {loading ? "Generation en cours..." : mode === "campaign" ? t.generateCampaign : t.generate}
        </button>

        {error && (
          <p className="text-red-400 mt-4 text-sm bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">{error}</p>
        )}

        {(results || campaign) && (
          <div className="mt-6 flex justify-end gap-2 flex-wrap">
            <button type="button" onClick={generate} disabled={loading} className="text-sm px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-800 disabled:opacity-50">
              Nouvelle version
            </button>
            <button type="button" onClick={copyAll} className="text-sm px-4 py-2 rounded-lg border border-violet-600 text-violet-300 hover:bg-violet-950">
              {copied === "all" ? "Tout copié !" : "Copier tout"}
            </button>
            <button type="button" onClick={downloadTxt} className="text-sm px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-800">
              {t.download}
            </button>
          </div>
        )}

        {results && mode === "simple" && (
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold">Resultats</h2>
            {Object.entries(results).map(([platform, data]) => {
              const { text: content, score } = formatResult(data);
              const tooLong =
                (platform === "twitter" && content.length > 280) ||
                (platform === "linkedin" && content.length > 3000) ||
                (platform === "instagram" && content.length > 2200);
              return (
                <div key={platform} className={`rounded-xl border p-5 ${dark ? "border-slate-700 bg-slate-900/80" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="capitalize font-medium text-violet-300">{platform}</span>
                      {score !== undefined && <span className="text-xs text-slate-500">Score {score}/10</span>}
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                      <button
                        type="button"
                        onClick={() => improveHook(platform, content)}
                        disabled={improvingHook === platform}
                        className="text-xs px-3 py-1.5 rounded-lg border border-slate-600 hover:bg-slate-800 disabled:opacity-50"
                      >
                        {improvingHook === platform ? "..." : t.hook}
                      </button>
                      <button
                        type="button"
                        onClick={() => rewrite(platform, content)}
                        disabled={rewriting === platform}
                        className="text-xs px-3 py-1.5 rounded-lg border border-slate-600 hover:bg-slate-800 disabled:opacity-50"
                      >
                        {rewriting === platform ? "..." : t.rewrite}
                      </button>
                      <button
                        type="button"
                        onClick={() => fetchHashtags(platform, content)}
                        disabled={loadingHashtags === platform}
                        className="text-xs px-3 py-1.5 rounded-lg border border-slate-600 hover:bg-slate-800 disabled:opacity-50"
                      >
                        {loadingHashtags === platform ? "..." : t.hashtags}
                      </button>
                      <button
                        type="button"
                        onClick={() => copy(platform, content)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-slate-600 hover:bg-slate-800"
                      >
                        {copied === platform ? "Copie !" : t.copy}
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 mb-3">
                    {t.bestTime} : {platform === "linkedin" && "Mardi 9h"}
                    {platform === "twitter" && "Mercredi 12h"}
                    {platform === "instagram" && "Vendredi 18h"}
                    {platform === "tiktok" && "Samedi 19h"}
                  </div>
                  <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{content}</pre>
                  <div className={`text-xs mt-2 ${tooLong ? "text-red-400" : "text-slate-500"}`}>
                    {content.length} {t.characters}
                    {tooLong && ` · ${t.tooLong}`}
                  </div>
                  {hashtags[platform] && hashtags[platform].length > 0 && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-2">
                        {hashtags[platform].map((tag) => (
                          <span key={tag} className="text-xs px-2 py-1 rounded-full bg-violet-900/40 text-violet-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => copy(platform + "-tags", hashtags[platform].join(" "))}
                        className="text-xs mt-2 text-violet-400 hover:underline"
                      >
                        {copied === platform + "-tags" ? "Copié !" : "Copier les hashtags"}
                      </button>
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
              <div key={day.day} className={`rounded-xl border p-5 ${dark ? "border-slate-700 bg-slate-900/80" : "border-slate-200 bg-slate-50"}`}>
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
                    {copied === "day-" + day.day ? "Copie !" : t.copy}
                  </button>
                </div>
                <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{day.post}</pre>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
