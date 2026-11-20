import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-xl text-violet-400">Stratify</span>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-medium"
          >
            Ouvrir l&apos;app
          </Link>
        </div>
      </header>

      <main>
        <section className="max-w-4xl mx-auto px-6 py-24 text-center">
          <p className="text-violet-400 text-sm font-medium tracking-wide mb-4">
            AI Content Strategy
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold leading-tight">
            1 contenu.{" "}
            <span className="text-violet-400">7 jours</span> de posts stratégiques.
          </h1>
          <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto">
            Transforme un script, un article ou un podcast en posts optimisés pour
            LinkedIn, Twitter, Instagram et TikTok — ou en campagne complète sur 7 jours.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 font-medium"
            >
              Essayer gratuitement
            </Link>
            <a
              href="#features"
              className="px-8 py-3.5 rounded-xl border border-slate-700 hover:bg-slate-900 font-medium"
            >
              Voir comment ça marche
            </a>
          </div>
        </section>

        <section id="features" className="max-w-5xl mx-auto px-6 pb-24">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <h3 className="font-semibold text-lg mb-2">Mode Simple</h3>
              <p className="text-slate-400 text-sm">
                Un contenu source, des posts prêts à publier pour chaque plateforme.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <h3 className="font-semibold text-lg mb-2">Campagne 7 jours</h3>
              <p className="text-slate-400 text-sm">
                Teaser, valeur, preuve, conversation, CTA — une vraie stratégie.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <h3 className="font-semibold text-lg mb-2">Brand Voice</h3>
              <p className="text-slate-400 text-sm">
                Garde le même ton sur tous les réseaux. Professionnel, direct ou pédagogique.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
