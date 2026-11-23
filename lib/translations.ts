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
      setError(t.minChars);
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
        if (!res.ok) throw new Error(data.error || t.error);
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
        if (!res.ok) throw new Error(data.error || t.error);
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
      setError(e instanceof Error ? e.message : t.error);
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

  
  
