import React, { useEffect, useMemo, useState } from "react";
import Uploader from "./Uploader.jsx";
import AdminPanel from "./AdminPanel.jsx";
import { useAdminToken } from "./useAdminToken.js";

const API_BASE = import.meta.env.VITE_API_BASE || "https://the-gargantuan-backend.onrender.com";

function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/posts`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPosts(data);
    } catch (e) {
      console.error(e);
      setError("Could not load posts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);
  return { posts, loading, error, reload: load };
}

export default function App() {
  const { posts, loading, error, reload } = usePosts();
  const { token, setToken, requireToken, setRequireToken } = useAdminToken();

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const normalized = useMemo(() => {
    return (posts || []).map((p, i) => ({
      id: p.id ?? i,
      title: p.title ?? p.filename ?? "Untitled",
      date: p.date ? new Date(p.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "",
      url: p.absoluteUrl || (p.url ? `${API_BASE}${p.url}` : null),
      type: p.type || (p.url?.endsWith(".mp4") ? "video" : "audio")
    }));
  }, [posts]);

  const hero = normalized[0];
  const rest = normalized.slice(1);

  return (
    <div className="min-h-screen bg-[#f6f6f6] text-[#121212]">
      {/* Masthead */}
      <header className="sticky top-0 z-50 bg-[#052962] text-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="py-3 sm:py-4 border-b-4 border-[#c70000]">
            <h1 className="text-5xl sm:text-6xl font-serif italic font-extrabold tracking-tight">The Gargantuan</h1>
            <p className="text-xs sm:text-sm mt-1 text-white/80">{today} · Edited by The Gargantuan</p>
          </div>
          <nav className="flex gap-5 py-2 sm:py-3 text-xs sm:text-sm uppercase tracking-wide font-semibold">
            {["News","Culture","Sound","Ideas","Dispatches"].map((item)=>(
              <a key={item} href="#" className="hover:underline decoration-2 underline-offset-4 decoration-[#c70000]">{item}</a>
            ))}
          </nav>
        </div>
      </header>

      {/* Admin controls + Publisher */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <AdminPanel
          token={token}
          setToken={setToken}
          requireToken={requireToken}
          setRequireToken={setRequireToken}
        />

        <Uploader onDone={() => setTimeout(reload, 1200)} token={token} requireToken={requireToken} />

        {/* Hero + List */}
        {loading && <div className="bg-white border border-[#dcdcdc] rounded p-4">Loading…</div>}
        {error && <div className="bg-white border border-[#dcdcdc] rounded p-4 text-red-600">{error}</div>}

        {hero && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <article className="bg-white rounded-lg border border-[#dcdcdc] overflow-hidden">
                <div className="relative">
                  {hero.type === "video" && hero.url ? (
                    <video className="w-full aspect-video" src={hero.url} controls playsInline />
                  ) : (
                    <div className="w-full aspect-video bg-[#052962]" />
                  )}
                </div>
                <div className="p-5 sm:p-6">
                  <h2 className="text-2xl sm:text-3xl font-serif font-semibold mb-2">{hero.title}</h2>
                  {hero.date && <p className="text-xs text-[#666]">{hero.date}</p>}
                </div>
              </article>
            </div>

            <aside className="space-y-4">
              <h3 className="font-headline text-xl">Recent</h3>
              <div className="border-t border-[#dcdcdc]" />
              {rest.length === 0 && <p className="text-sm text-[#666]">No recent items.</p>}
              {rest.slice(0,4).map((p) => (
                <a key={p.id} href={p.url || '#'} className="block hover:underline">
                  <div className="font-serif">{p.title}</div>
                  {p.date && <div className="text-xs text-[#666]">{p.date}</div>}
                </a>
              ))}
            </aside>
          </section>
        )}

        {/* Grid */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {rest.slice(4).map((p) => (
            <article key={p.id} className="bg-white rounded-lg border border-[#dcdcdc] overflow-hidden hover:shadow transition">
              {p.type === "video" && p.url ? (
                <video className="w-full aspect-video" src={p.url} controls playsInline />
              ) : (
                <div className="w-full aspect-video bg-[#052962]" />
              )}
              <div className="p-4">
                <h5 className="font-headline text-xl mb-1">{p.title}</h5>
                {p.date && <p className="text-xs text-[#666]">{p.date}</p>}
              </div>
            </article>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-10 bg-[#052962] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <p className="font-serif text-lg">© {new Date().getFullYear()} The Gargantuan</p>
          <p className="text-sm text-white/80">Contact: hellogargantuan69@gmail.com</p>
        </div>
      </footer>
    </div>
  );
}
