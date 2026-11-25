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

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-xl text-violet-400">Stratify</span>
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

      <main>
        <section className="max-w-4xl mx-auto px-6 py-24 text-center">
          <p className="text-violet-400 text-sm font-medium tracking-wide mb-4">
            AI Content Strategy
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold leading-tight">
            {lang === "fr" && <>1 contenu. <span className="text-violet-400">7 jours</span> de posts stratégiques.</>}
            {lang === "en" && <>1 content. <span className="text-violet-400">7 days</span> of strategic posts.</>}
            {lang === "es" && <>1 contenido. <span className="text-violet-400">7 días</span> de posts estratégicos.</>}
            {lang === "pt" && <>1 conteúdo. <span className="text-violet-400">7 dias</span> de posts estratégicos.</>}
            {lang === "zh" && <>1个内容。<span className="text-violet-400">7天</span>战略帖子。</>}
            {lang === "hi" && <>1 सामग्री। <span className="text-violet-400">7 दिन</span> की रणनीतिक पोस्ट।</>}
            {lang === "ar" && <>محتوى واحد. <span className="text-violet-400">7 أيام</span> من المنشورات الاستراتيجية.</>}
            {lang === "de" && <>1 Inhalt. <span className="text-violet-400">7 Tage</span> strategische Posts.</>}
            {lang === "ja" && <>1つのコンテンツ。<span className="text-violet-400">7日間</span>の戦略的投稿。</>}
            {lang === "id" && <>1 konten. <span className="text-violet-400">7 hari</span> posting strategis.</>}
          </h1>
          <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto">
            {String(t.subtitle)}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 font-medium"
            >
              {String(t.generate)}
            </Link>
            <a
              href="#features"
              className="px-8 py-3.5 rounded-xl border border-slate-700 hover:bg-slate-900 font-medium"
            >
              {lang === "fr" ? "Voir comment ça marche" : 
               lang === "en" ? "See how it works" :
               lang === "es" ? "Ver cómo funciona" :
               lang === "pt" ? "Ver como funciona" :
               lang === "zh" ? "查看工作原理" :
               lang === "hi" ? "देखें कैसे काम करता है" :
               lang === "ar" ? "انظر كيف يعمل" :
               lang === "de" ? "So funktioniert's" :
               lang === "ja" ? "仕組みを見る" :
               "Lihat cara kerjanya"}
            </a>
          </div>
        </section>

        <section id="features" className="max-w-5xl mx-auto px-6 pb-24">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <h3 className="font-semibold text-lg mb-2">{String(t.simple)}</h3>
              <p className="text-slate-400 text-sm">
                {lang === "fr" ? "Un contenu source, des posts prêts à publier pour chaque plateforme." :
                 lang === "en" ? "One source content, ready-to-publish posts for each platform." :
                 lang === "es" ? "Un contenido fuente, posts listos para publicar en cada plataforma." :
                 lang === "pt" ? "Um conteúdo fonte, posts prontos para publicar em cada plataforma." :
                 lang === "zh" ? "一个源内容，为每个平台准备好可发布的帖子。" :
                 lang === "hi" ? "एक स्रोत सामग्री, प्रत्येक प्लेटफ़ॉर्म के लिए प्रकाशन के लिए तैयार पोस्ट।" :
                 lang === "ar" ? "محتوى مصدر واحد، منشورات جاهزة للنشر لكل منصة." :
                 lang === "de" ? "Ein Quellinhalt, veröffentlichungsbereite Posts für jede Plattform." :
                 lang === "ja" ? "1つのソースコンテンツ、各プラットフォーム向けの公開準備済み投稿。" :
                 "Satu konten sumber, posting siap terbit untuk setiap platform."}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <h3 className="font-semibold text-lg mb-2">{String(t.campaign)}</h3>
              <p className="text-slate-400 text-sm">
                {lang === "fr" ? "Teaser, valeur, preuve, conversation, CTA — une vraie stratégie." :
                 lang === "en" ? "Teaser, value, proof, conversation, CTA — a real strategy." :
                 lang === "es" ? "Teaser, valor, prueba, conversación, CTA — una verdadera estrategia." :
                 lang === "pt" ? "Teaser, valor, prova, conversa, CTA — uma estratégia real." :
                 lang === "zh" ? "预告、价值、证明、对话、行动号召——真正的策略。" :
                 lang === "hi" ? "टीज़र, मूल्य, सबूत, बातचीत, CTA — एक वास्तविक रणनीति।" :
                 lang === "ar" ? "إعلان تشويقي، قيمة، دليل، محادثة، دعوة للعمل — استراتيجية حقيقية." :
                 lang === "de" ? "Teaser, Wert, Beweis, Gespräch, CTA — eine echte Strategie." :
                 lang === "ja" ? "ティーザー、価値、証明、会話、CTA — 本物の戦略。" :
                 "Teaser, nilai, bukti, percakapan, CTA — strategi yang nyata."}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <h3 className="font-semibold text-lg mb-2">{String(t.brandVoice)}</h3>
              <p className="text-slate-400 text-sm">
                {lang === "fr" ? "Garde le même ton sur tous les réseaux. Professionnel, direct ou pédagogique." :
                 lang === "en" ? "Keep the same tone across all networks. Professional, direct or educational." :
                 lang === "es" ? "Mantén el mismo tono en todas las redes. Profesional, directo o educativo." :
                 lang === "pt" ? "Mantenha o mesmo tom em todas as redes. Profissional, direto ou educacional." :
                 lang === "zh" ? "在所有网络上保持相同的语气。专业、直接或教育性。" :
                 lang === "hi" ? "सभी नेटवर्क पर एक ही टोन रखें। पेशेवर, सीधा या शैक्षिक।" :
                 lang === "ar" ? "حافظ على نفس النبرة عبر جميع الشبكات. احترافي أو مباشر أو تعليمي." :
                 lang === "de" ? "Behalte denselben Ton auf allen Netzwerken. Professionell, direkt oder lehrreich." :
                 lang === "ja" ? "すべてのネットワークで同じトーンを保つ。プロフェッショナル、直接的、または教育的。" :
                 "Pertahankan nada yang sama di semua jaringan. Profesional, langsung atau edukatif."}
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
