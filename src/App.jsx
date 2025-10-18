import React, { useEffect, useMemo, useState } from "react";

const SAMPLE_MODE = false;

const sample = [
  { id: 1, title: "The Gargantuan Reports: Humanity, Interrupted", subtitle: "Today’s audio dispatch on culture, collapse, and curiosity.", date: "Saturday 19 October 2025", image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c" },
  { id: 2, title: "A New Wave of Sound Journalism", subtitle: "Exploring the frontier between narrative and noise.", date: "18 October 2025" },
  { id: 3, title: "What Happens When AI Reads the News?", subtitle: "The future of human voice in machine stories.", date: "17 October 2025" },
  { id: 4, title: "Automation, Art & the Human Ear", subtitle: "Notes from the edge of listening.", date: "16 October 2025" },
];

const API_BASE = import.meta.env.VITE_API_BASE || "https://the-gargantuan-backend.onrender.com";

function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (SAMPLE_MODE) {
      setPosts(sample);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE}/api/posts`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setPosts(data);
      } catch (e) {
        console.error("Fetch posts failed", e);
        setError("Could not load posts; showing sample.");
        setPosts(sample);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  return { posts, loading, error };
}

export default function App() {
  const { posts, loading, error } = usePosts();

  const today = new Date().toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const normalized = useMemo(() => {
    return (posts || []).map((p, idx) => ({
      id: p.id ?? idx,
      title: p.title ?? p.filename ?? "Untitled",
      subtitle: p.subtitle ?? "",
      date: p.date ? new Date(p.date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "",
      image: p.image || null,
      type: p.type || (p.url?.endsWith(".mp4") ? "video" : "audio"),
      mediaUrl: p.absoluteUrl ? p.absoluteUrl : (p.url ? `${API_BASE}${p.url}` : null),
    }));
  }, [posts]);

  const hero = normalized[0];
  const sidebar = normalized.slice(1, 4);
  const grid = normalized.slice(4, 10);

  return (
    <div className="min-h-screen bg-guardianWhite text-guardianText">
      {/* Masthead */}
      <header className="sticky top-0 z-50 bg-guardianBlue text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="py-4 border-b-4 border-guardianRed">
            <h1 className="text-4xl sm:text-5xl font-serif italic font-extrabold tracking-tight">The Gargantuan</h1>
            <p className="text-sm mt-1 text-white/80">{today} · Edited by The Gargantuan</p>
          </div>

          {/* Nav */}
          <nav className="flex gap-5 py-3 text-sm uppercase tracking-wide">
            {["News", "Culture", "Sound", "Ideas", "Dispatches"].map((item) => (
              <a key={item} href="#" className="hover:underline decoration-2 underline-offset-4 decoration-guardianRed">
                {item}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Hero + Sidebar */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hero */}
          <div className="lg:col-span-2">
            <div className="relative bg-black rounded overflow-hidden">
              {hero ? (
                <>
                  {/* Media */}
                  {hero.type === "video" && hero.mediaUrl ? (
                    <video className="w-full aspect-video" src={hero.mediaUrl} controls muted playsInline />
                  ) : hero.image ? (
                    <img className="w-full aspect-video object-cover" src={hero.image} alt={hero.title} />
                  ) : (
                    <div className="w-full aspect-video bg-guardianBlue" />
                  )}
                  {/* Overlay title */}
                  <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                    <h2 className="text-white font-serif text-3xl sm:text-4xl leading-tight mb-2">{hero.title}</h2>
                    {hero.subtitle ? <p className="text-guardianRed italic">{hero.subtitle}</p> : null}
                  </div>
                </>
              ) : (
                <div className="w-full aspect-video bg-guardianBlue" />
              )}
            </div>
          </div>

          {/* Sidebar Recent */}
          <aside className="space-y-6">
            <h3 className="font-headline text-xl">Recent</h3>
            <div className="border-t border-guardianGrey" />
            {sidebar.length === 0 && <p className="text-sm text-gray-600">No recent items yet.</p>}
            {sidebar.map((p) => (
              <a key={p.id} href={p.mediaUrl || '#'} className="block group">
                <h4 className="font-serif text-lg leading-snug group-hover:underline">{p.title}</h4>
                {p.date && <p className="text-xs text-gray-500 mt-1">{p.date}</p>}
              </a>
            ))}
          </aside>
        </section>

        {/* Grid */}
        <section className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {grid.map((p) => (
            <article key={p.id} className="bg-white rounded-lg border border-guardianGrey overflow-hidden hover:shadow transition">
              {p.type === "video" && p.mediaUrl ? (
                <video className="w-full aspect-video" src={p.mediaUrl} controls playsInline />
              ) : p.image ? (
                <img className="w-full aspect-video object-cover" src={p.image} alt={p.title} />
              ) : (
                <div className="w-full aspect-video bg-guardianBlue" />
              )}
              <div className="p-4">
                <h5 className="=">"font-headline text-xl mb-1">{p.title}</h5>
                {p.date && <p className="text-xs text-gray-500">{p.date}</p>}
              </div>
            </article>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-guardianBlue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <p className="font-serif text-lg">© {new Date().getFullYear()} The Gargantuan</p>
          <p className="text-sm text-white/80">Contact: hellogargantuan69@gmail.com</p>
        </div>
      </footer>

      {error && (
        <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded shadow">
          {error}
        </div>
      )}
    </div>
  );
}
