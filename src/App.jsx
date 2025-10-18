export default function App() {
  return (
    <div className="min-h-screen bg-mustard text-[rgba(0,0,0,0.85)]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* optional gradient overlay for contrast */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,rgba(0,0,0,0.35),rgba(0,0,0,0.0))]" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-16">
          <h1 className="font-display leading-[0.85] tracking-tight text-white text-[clamp(3rem,8vw,8rem)] italic drop-shadow-sm">
            The Gargantuan
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-6">
            <div className="font-ui text-white/90 text-xl tracking-widest uppercase">
              Daily Audio • Headlines
            </div>
            <div className="font-ui text-white/60 text-sm tracking-[0.2em] uppercase">
              Music & Narration
            </div>
          </div>

          <p className="mt-8 max-w-2xl font-ui text-white/90 text-lg">
            A cool, editorial-style daily audio journal featuring original music and narrated headlines.
          </p>

          <div className="mt-10 flex gap-4">
            <a
              href="#latest"
              className="font-ui text-base px-6 py-3 rounded-full bg-white/90 hover:bg-white transition shadow-sm"
            >
              Listen to Latest
            </a>
            <a
              href="#archive"
              className="font-ui text-base px-6 py-3 rounded-full border border-white/80 text-white hover:bg-white/10 transition"
            >
              View Archive
            </a>
          </div>
        </div>
      </section>

      {/* Placeholder sections */}
      <section id="latest" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="font-ui uppercase tracking-widest text-sm text-black/60">Latest Post</h2>
        <div className="mt-4 h-40 rounded-xl bg-white/40"></div>
      </section>
    </div>
  );
}
