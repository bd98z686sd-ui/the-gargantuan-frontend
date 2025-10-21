import React, { useEffect, useMemo, useState } from 'react';
import { marked } from 'marked';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://the-gargantuan-backend.onrender.com';

// Fetch published posts from the backend.  Returns the array of posts along with
// loading and error states.
function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  async function load() {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE}/api/posts`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setPosts(json);
    } catch (e) {
      setError('Could not load posts.');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);
  return { posts, loading, error, reload: load };
}

export default function Home() {
  const { posts, loading, error } = usePosts();
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  // Normalize posts for display: convert date to string and preserve body.
  const normalized = useMemo(() => (posts || []).map((p, i) => ({
    id: p.id ?? i,
    title: p.title || 'Untitled',
    date: p.date ? new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
    type: p.type,
    playUrl: p.playUrl,
    audioUrl: p.audioUrl,
    videoUrl: p.videoUrl,
    imageUrl: p.imageUrl,
    body: p.body || '',
  })), [posts]);
  const hero = normalized[0];
  const rest = normalized.slice(1);

  return (
    <div className="min-h-screen bg-[#f6f6f6] text-[#121212]">
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {loading && <div className="bg-white border border-[#dcdcdc] rounded p-4">Loading…</div>}
        {error && <div className="bg-white border border-[#dcdcdc] rounded p-4 text-red-600">{error}</div>}

      {hero && (
        <section className="space-y-8">
          {/* Hero post */}
          <article className="bg-white rounded-lg border border-[#dcdcdc] overflow-hidden">
            <div className="relative">
              {hero.type === 'video' && hero.videoUrl && (
                <video className="w-full aspect-video" src={hero.videoUrl} controls playsInline />
              )}
              {hero.type === 'audio' && hero.audioUrl && (
                <audio className="w-full" src={hero.audioUrl} controls />
              )}
              {hero.type === 'image' && hero.imageUrl && (
                <img className="w-full aspect-video object-cover" src={hero.imageUrl} alt={hero.title} />
              )}
              {hero.type === 'text' && (
                <div className="w-full aspect-video bg-[#052962]" />
              )}
            </div>
            <div className="p-5 sm:p-6 space-y-3">
              <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-2">{hero.title}</h2>
              {hero.date && <p className="text-sm text-[#666]">{hero.date}</p>}
              {hero.body && (
                <div className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: marked.parse(hero.body) }} />
              )}
            </div>
          </article>
          {/* Remaining posts: display in a responsive grid with embedded media */}
          {rest.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {rest.map((p) => (
                <article key={p.id} className="bg-white rounded-lg border border-[#dcdcdc] overflow-hidden hover:shadow transition">
                  {p.type === 'video' && p.videoUrl && (
                    <video className="w-full aspect-video" src={p.videoUrl} controls playsInline />
                  )}
                  {p.type === 'audio' && p.audioUrl && (
                    <audio className="w-full" src={p.audioUrl} controls />
                  )}
                  {p.type === 'image' && p.imageUrl && (
                    <img className="w-full aspect-video object-cover" src={p.imageUrl} alt={p.title} />
                  )}
                  {p.type === 'text' && (
                    <div className="w-full aspect-video bg-[#052962]" />
                  )}
                  <div className="p-4 space-y-2">
                    <h5 className="font-headline text-xl mb-1">{p.title}</h5>
                    {p.date && <p className="text-xs text-[#666]">{p.date}</p>}
                    {p.body && (
                      <div className="text-xs whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: marked.parse(p.body) }} />
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
      </main>

      <footer className="mt-10 bg-[#052962] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <p className="font-serif text-lg">© {new Date().getFullYear()} The Gargantuan</p>
          <p className="text-sm text-white/80">Contact: hellogargantuan69@gmail.com</p>
        </div>
      </footer>
    </div>
  );
}
