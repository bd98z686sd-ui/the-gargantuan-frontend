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

  // Build a full archive grouped by date (year-month-day).  Each group has
  // a display string (e.g. "21 October 2025") and all posts for that day.  We
  // sort the groups descending by date.  We compute this from the original
  // `posts` array so that we have access to the ISO timestamps.
  const archive = useMemo(() => {
    const byDate = {};
    (posts || []).forEach((p) => {
      if (!p || !p.date) return;
      const dt = new Date(p.date);
      if (Number.isNaN(dt)) return;
      const key = dt.toISOString().split('T')[0]; // YYYY-MM-DD
      const display = dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      if (!byDate[key]) byDate[key] = { display, posts: [] };
      byDate[key].posts.push(p);
    });
    // Convert object to array and sort descending by date
    return Object.values(byDate).sort((a, b) => {
      // Compare by date string (descending)
      // Extract date from one of the posts in each group (they all share the same date)
      const da = new Date(a.posts[0].date);
      const db = new Date(b.posts[0].date);
      return db - da;
    });
  }, [posts]);

  // Helper to extract the first image URL from a Markdown string.  Returns
  // undefined if no image is present.  This allows us to display images
  // embedded in the body as the hero or card image when no dedicated
  // imageUrl was supplied.
  function extractFirstImage(md) {
    if (!md) return undefined;
    const match = md.match(/!\[[^\]]*\]\(([^)]+)\)/);
    return match ? match[1] : undefined;
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6] text-[#121212]">
      <header className="sticky top-0 z-50 bg-[#052962] text-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="py-3 sm:py-4 border-b-4 border-[#c70000]">
            <h1 className="text-5xl sm:text-6xl font-serif italic font-extrabold tracking-tight">The Gargantuan</h1>
            <p className="text-xs sm:text-sm mt-1 text-white/80 ml-0">{today} · Edited by The Gargantuan</p>
            {/* Tagline explaining the content order */}
            <p className="text-xs sm:text-sm mt-1 italic text-white/70 ml-0">Daily audio, spectral video & shorts — latest first</p>
          </div>
          <nav className="flex gap-5 py-2 sm:py-3 text-xs sm:text-sm uppercase tracking-wide font-semibold">
            {[
              'News',
              'Culture',
              'Sound',
              'Ideas',
              'Dispatches',
            ].map((item) => (
              <a key={item} href="#" className="hover:underline decoration-2 underline-offset-4 decoration-[#c70000]">
                {item}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {loading && <div className="bg-white border border-[#dcdcdc] rounded p-4">Loading…</div>}
        {error && <div className="bg-white border border-[#dcdcdc] rounded p-4 text-red-600">{error}</div>}

      {hero && (
        <section className="grid md:grid-cols-2 gap-8">
          {/* Hero card occupies the left column */}
          <article className="bg-white rounded-lg border border-[#dcdcdc] overflow-hidden">
            <div className="relative">
              {/* Render hero media.  For image posts or posts with an embedded image in the body, show the image. */}
              {hero.type === 'video' && hero.videoUrl && (
                <video className="w-full aspect-video" src={hero.videoUrl} controls playsInline />
              )}
              {hero.type === 'audio' && hero.audioUrl && (
                <audio className="w-full" src={hero.audioUrl} controls />
              )}
              {/* If imageUrl is provided or the body contains an image, show the image. */}
              {((hero.type === 'image' && hero.imageUrl) || extractFirstImage(hero.body)) && (
                <img
                  className="w-full aspect-video object-cover"
                  src={hero.imageUrl || extractFirstImage(hero.body)}
                  alt={hero.title}
                />
              )}
              {/* For text-only posts, omit the placeholder so the card is text-driven. */}
            </div>
            <div className="p-5 sm:p-6 space-y-3">
              <h2 className="text-2xl sm:text-3xl font-serif font-semibold mb-2">{hero.title}</h2>
              {hero.date && <p className="text-xs text-[#666]">{hero.date}</p>}
              {hero.body && (
                <div className="post-body" dangerouslySetInnerHTML={{ __html: marked.parse(hero.body) }} />
              )}
            </div>
          </article>
          {/* Recents/Archive column occupies the right column */}
          <aside className="max-h-full overflow-y-auto space-y-4" style={{ maxHeight: 'calc(100vh - 15rem)' }}>
            <h3 className="font-headline text-xl">Recent</h3>
            <div className="border-t border-[#dcdcdc]" />
            {archive.length === 0 && <p className="text-sm text-[#666]">No posts.</p>}
            {archive.map((group) => (
              <div key={group.display} className="mb-3">
                <h4 className="text-xs sm:text-sm font-semibold text-[#555] mb-1">{group.display}</h4>
                {group.posts.map((p) => (
                  <a key={p.id} href="#" className="block hover:underline">
                    <span className="font-serif">{p.title}</span>
                  </a>
                ))}
              </div>
            ))}
          </aside>
        </section>
      )}

      <section className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {rest.map((p) => (
          <article key={p.id} className="bg-white rounded-lg border border-[#dcdcdc] overflow-hidden hover:shadow transition">
            {/* Render card media.  Prioritise video, audio, explicit imageUrl, then embedded image in body. */}
            {p.type === 'video' && p.videoUrl && (
              <video className="w-full aspect-video" src={p.videoUrl} controls playsInline />
            )}
            {p.type === 'audio' && p.audioUrl && (
              <audio className="w-full" src={p.audioUrl} controls />
            )}
            {((p.type === 'image' && p.imageUrl) || extractFirstImage(p.body)) && (
              <img
                className="w-full aspect-video object-cover"
                src={p.imageUrl || extractFirstImage(p.body)}
                alt={p.title}
              />
            )}
            <div className="p-4 space-y-2">
              <h5 className="font-serif text-xl font-semibold mb-1">{p.title}</h5>
              {p.date && <p className="text-xs text-[#666]">{p.date}</p>}
              {p.body && (
                <div className="post-body text-sm" dangerouslySetInnerHTML={{ __html: marked.parse(p.body) }} />
              )}
            </div>
          </article>
        ))}
      </section>
      </main>

      <footer className="bg-[#052962] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <p className="font-serif text-lg">© {new Date().getFullYear()} The Gargantuan</p>
          <p className="text-sm text-white/80">Contact: hellogargantuan69@gmail.com</p>
        </div>
      </footer>
    </div>
  );
}
