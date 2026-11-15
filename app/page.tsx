import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-violet-400">Stratify</span>
          <Link
            href="/dashboard"
            className="text-sm px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500"
          >
            Ouvrir l app
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-20 text-center">
        <p className="text-violet-400 text-sm font-medium mb-4">
          AI Content Strategy
        </p>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto">
          1 contenu.{" "}
          <span className="text-violet-400">7 jours</span> de posts
          strategiques.
        </h1>
        <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto">
          Transforme un script, un article ou un podcast en posts optimises
          pour LinkedIn, Twitter, Instagram et TikTok — ou en campagne complete
          sur 7 jours.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-medium"
          >
            Essayer gratuitement
          </Link>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-6 text-left">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="font-semibold mb-2">Mode Simple</h3>
            <p className="text-sm text-slate-400">
              Un contenu source, des posts prets pour chaque plateforme.
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="font-semibold mb-2">Campagne 7 jours</h3>
            <p className="text-sm text-slate-400">
              Teaser, valeur, preuve, conversation, CTA — une vraie strategie.
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="font-semibold mb-2">Objectifs clairs</h3>
            <p className="text-sm text-slate-400">
              Engagement, autorite ou conversion : le ton s adapte.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        Stratify — 1 idea, multi-platform strategy
      </footer>
    </div>
  );
}
