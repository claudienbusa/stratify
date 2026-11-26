
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { translations } from "@/lib/translations";
import type { Lang } from "@/lib/translations";

const LANG_KEY = "stratify_lang";
const PLAN_KEY = "stratify_plan";

type PricingContent = {
  title: string;
  subtitle: string;
  free: string;
  forever: string;
  popular: string;
  month: string;
  start: string;
  goPro: string;
  chooseAgency: string;
  featuresFree: string[];
  featuresPro: string[];
  featuresAgency: string[];
};

const content: Record<string, PricingContent> = {
  fr: {
    title: "Choisis ton plan",
    subtitle: "Commence gratuitement. Passe à Pro quand tu veux.",
    free: "Gratuit",
    forever: "pour toujours",
    popular: "Populaire",
    month: "/ mois",
    start: "Commencer",
    goPro: "Passer en Pro",
    chooseAgency: "Choisir Agency",
    featuresFree: ["5 générations / mois", "Mode Simple", "Historique 7 jours", "1 Brand Voice"],
    featuresPro: ["100 générations / mois", "Mode Simple + Campagne", "Historique illimité", "Brand Voices illimitées", "Export TXT", "Support prioritaire"],
    featuresAgency: ["Générations illimitées", "Tout du plan Pro", "Export PDF + Notion", "Planification des posts", "Mode Variants", "Accès anticipé aux nouveautés"],
  },
  en: {
    title: "Choose your plan",
    subtitle: "Start free. Upgrade when you need more.",
    free: "Free",
    forever: "forever",
    popular: "Popular",
    month: "/ month",
    start: "Start free",
    goPro: "Go Pro",
    chooseAgency: "Choose Agency",
    featuresFree: ["5 generations / month", "Simple mode", "7-day history", "1 Brand Voice"],
    featuresPro: ["100 generations / month", "Simple + Campaign mode", "Unlimited history", "Unlimited Brand Voices", "TXT export", "Priority support"],
    featuresAgency: ["Unlimited generations", "Everything in Pro", "PDF + Notion export", "Post scheduling", "Variants mode", "Early access to new features"],
  },
  es: {
    title: "Elige tu plan",
    subtitle: "Empieza gratis. Mejora cuando lo necesites.",
    free: "Gratis",
    forever: "para siempre",
    popular: "Popular",
    month: "/ mes",
    start: "Empezar",
    goPro: "Pasar a Pro",
    chooseAgency: "Elegir Agency",
    featuresFree: ["5 generaciones / mes", "Modo Simple", "Historial 7 días", "1 Brand Voice"],
    featuresPro: ["100 generaciones / mes", "Modo Simple + Campaña", "Historial ilimitado", "Brand Voices ilimitadas", "Exportar TXT", "Soporte prioritario"],
    featuresAgency: ["Generaciones ilimitadas", "Todo del plan Pro", "Exportar PDF + Notion", "Planificación de posts", "Modo Variants", "Acceso anticipado"],
  },
  pt: {
    title: "Escolha seu plano",
    subtitle: "Comece grátis. Faça upgrade quando precisar.",
    free: "Grátis",
    forever: "para sempre",
    popular: "Popular",
    month: "/ mês",
    start: "Começar",
    goPro: "Ir para Pro",
    chooseAgency: "Escolher Agency",
    featuresFree: ["5 gerações / mês", "Modo Simples", "Histórico 7 dias", "1 Brand Voice"],
    featuresPro: ["100 gerações / mês", "Modo Simples + Campanha", "Histórico ilimitado", "Brand Voices ilimitadas", "Exportar TXT", "Suporte prioritário"],
    featuresAgency: ["Gerações ilimitadas", "Tudo do plano Pro", "Exportar PDF + Notion", "Agendamento de posts", "Modo Variants", "Acesso antecipado"],
  },
  de: {
    title: "Wähle deinen Plan",
    subtitle: "Starte kostenlos. Upgrade wenn du mehr brauchst.",
    free: "Kostenlos",
    forever: "für immer",
    popular: "Beliebt",
    month: "/ Monat",
    start: "Starten",
    goPro: "Zu Pro wechseln",
    chooseAgency: "Agency wählen",
    featuresFree: ["5 Generierungen / Monat", "Einfacher Modus", "7-Tage Verlauf", "1 Brand Voice"],
    featuresPro: ["100 Generierungen / Monat", "Einfach + Kampagne", "Unbegrenzter Verlauf", "Unbegrenzte Brand Voices", "TXT Export", "Prioritäts-Support"],
    featuresAgency: ["Unbegrenzte Generierungen", "Alles aus Pro", "PDF + Notion Export", "Post-Planung", "Variants-Modus", "Früher Zugang"],
  },
  zh: {
    title: "选择你的计划",
    subtitle: "免费开始。需要时升级。",
    free: "免费",
    forever: "永久",
    popular: "热门",
    month: "/ 月",
    start: "开始",
    goPro: "升级到 Pro",
    chooseAgency: "选择 Agency",
    featuresFree: ["每月5次生成", "简单模式", "7天历史", "1个品牌声音"],
    featuresPro: ["每月100次生成", "简单+活动模式", "无限历史", "无限品牌声音", "TXT导出", "优先支持"],
    featuresAgency: ["无限生成", "Pro全部功能", "PDF + Notion导出", "帖子计划", "变体模式", "抢先体验"],
  },
  ja: {
    title: "プランを選択",
    subtitle: "無料で開始。必要になったらアップグレード。",
    free: "無料",
    forever: "永久",
    popular: "人気",
    month: "/ 月",
    start: "始める",
    goPro: "Proにアップグレード",
    chooseAgency: "Agencyを選択",
    featuresFree: ["月5回生成", "シンプルモード", "7日間履歴", "1ブランドボイス"],
    featuresPro: ["月100回生成", "シンプル+キャンペーン", "無制限履歴", "無制限ブランドボイス", "TXTエクスポート", "優先サポート"],
    featuresAgency: ["無制限生成", "Proの全機能", "PDF + Notionエクスポート", "投稿スケジュール", "バリアントモード", "早期アクセス"],
  },
  ar: {
    title: "اختر خطتك",
    subtitle: "ابدأ مجانًا. قم بالترقية عندما تحتاج المزيد.",
    free: "مجاني",
    forever: "للأبد",
    popular: "الأكثر شعبية",
    month: "/ شهر",
    start: "ابدأ",
    goPro: "الانتقال إلى Pro",
    chooseAgency: "اختر Agency",
    featuresFree: ["5 توليد / شهر", "الوضع البسيط", "سجل 7 أيام", "صوت علامة واحد"],
    featuresPro: ["100 توليد / شهر", "بسيط + حملة", "سجل غير محدود", "أصوات علامة غير محدودة", "تصدير TXT", "دعم أولوية"],
    featuresAgency: ["توليد غير محدود", "كل ما في Pro", "تصدير PDF + Notion", "جدولة المنشورات", "وضع المتغيرات", "وصول مبكر"],
  },
  hi: {
    title: "अपना प्लान चुनें",
    subtitle: "मुफ्त शुरू करें। जरूरत पड़ने पर अपग्रेड करें।",
    free: "मुफ्त",
    forever: "हमेशा के लिए",
    popular: "लोकप्रिय",
    month: "/ महीना",
    start: "शुरू करें",
    goPro: "Pro पर जाएं",
    chooseAgency: "Agency चुनें",
    featuresFree: ["5 जनरेशन / महीना", "सिंपल मोड", "7 दिन का इतिहास", "1 ब्रांड वॉयस"],
    featuresPro: ["100 जनरेशन / महीना", "सिंपल + कैंपेन", "असीमित इतिहास", "असीमित ब्रांड वॉयस", "TXT एक्सपोर्ट", "प्राथमिकता सपोर्ट"],
    featuresAgency: ["असीमित जनरेशन", "Pro की सभी सुविधाएं", "PDF + Notion एक्सपोर्ट", "पोस्ट शेड्यूलिंग", "वेरिएंट मोड", "अर्ली एक्सेस"],
  },
  id: {
    title: "Pilih paketmu",
    subtitle: "Mulai gratis. Upgrade saat kamu butuh lebih.",
    free: "Gratis",
    forever: "selamanya",
    popular: "Populer",
    month: "/ bulan",
    start: "Mulai",
    goPro: "Naik ke Pro",
    chooseAgency: "Pilih Agency",
    featuresFree: ["5 generasi / bulan", "Mode Sederhana", "Riwayat 7 hari", "1 Brand Voice"],
    featuresPro: ["100 generasi / bulan", "Mode Sederhana + Kampanye", "Riwayat tak terbatas", "Brand Voice tak terbatas", "Ekspor TXT", "Dukungan prioritas"],
    featuresAgency: ["Generasi tak terbatas", "Semua fitur Pro", "Ekspor PDF + Notion", "Penjadwalan post", "Mode Variants", "Akses awal"],
  },
};

export default function PricingPage() {
  const [lang, setLang] = useState<Lang>("fr");

  const t = translations[lang] || translations.fr;
  const c = content[lang] || content.fr;

  useEffect(() => {
    const saved = localStorage.getItem(LANG_KEY) as Lang | null;
    if (saved && translations[saved]) {
      setLang(saved);
    }
  }, []);

  const changeLang = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem(LANG_KEY, newLang);
  };

  const plans = [
    {
      id: "free",
      name: c.free,
      price: "0",
      period: c.forever,
      features: c.featuresFree,
      cta: c.start,
      highlighted: false,
    },
    {
      id: "pro",
      name: "Pro",
      price: "19",
      period: c.month,
      features: c.featuresPro,
      cta: c.goPro,
      highlighted: true,
    },
    {
      id: "agency",
      name: "Agency",
      price: "49",
      period: c.month,
      features: c.featuresAgency,
      cta: c.chooseAgency,
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-violet-400">
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

            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-medium"
            >
              {String(t.studio)}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{c.title}</h1>
          <p className="text-slate-400">{c.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border p-6 flex flex-col ${
                plan.highlighted
                  ? "border-violet-500 bg-violet-950/30 relative"
                  : "border-slate-800 bg-slate-900/50"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-xs px-3 py-1 rounded-full">
                  {c.popular}
                </span>
              )}

              <h2 className="text-xl font-semibold">{plan.name}</h2>

              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-slate-400 text-sm"> {plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="text-sm text-slate-300 flex items-start gap-2"
                  >
                    <span className="text-violet-400">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/dashboard"
                onClick={() => {
                  localStorage.setItem(PLAN_KEY, plan.id);
                }}
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
