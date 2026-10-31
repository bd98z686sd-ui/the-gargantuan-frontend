import React, { useEffect, useMemo, useState } from 'react';
import { marked } from 'marked';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://the-gargantuan-backend.onrender.com';

const NAV_ITEMS = [
  { label: 'All',    filter: null },
  { label: 'Video',  filter: 'video' },
  { label: 'Audio',  filter: 'audio' },
  { label: 'Images', filter: 'image' },
  { label: 'Text',   filter: 'text' },
];

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
      setPosts(await res.json());
    } catch {
      setError('Could not load posts.');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);
  return { posts, loading, error };
}

// Extract the first image URL from a Markdown string.
function extractFirstImage(md) {
  if (!md) return undefined;
  const match = md.match(/!\[[^\]]*\]\(([^)]+)\)/);
  return match ? match[1] : undefined;
}

// Format an ISO date string into e.g. "21 October 2025".
function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return ''; }
}

// A small red category pill — mirrors The Guardian's section labels.
function TypeBadge({ type }) {
  const labels = { video: 'Video', audio: 'Audio', image: 'Image', text: 'Text' };
  return (
    <span className="text-[#c70000] text-xs font-semibold uppercase tracking-wide">
      {labels[type] || 'Post'}
    </span>
  );
}

// Hero card — large, left-column feature post.
function HeroCard({ post }) {
  const image = post.imageUrl || extractFirstImage(post.body);
  return (
    <article className="bg-white border border-[#dcdcdc] overflow-hidden">
      {post.type === 'video' && post.videoUrl && (
        <video className="w-full aspect-video bg-black" src={post.videoUrl} controls playsInline />
      )}
      {post.type === 'audio' && post.audioUrl && (
        <div className="bg-[#052962] px-4 pt-4">
          <audio className="w-full" src={post.audioUrl} controls />
        </div>
      )}
      {image && post.type !== 'video' && (
        <img className="w-full aspect-video object-cover" src={image} alt={post.title} />
      )}
      <div className="p-5 sm:p-6 border-t-2 border-[#c70000]">
        <TypeBadge type={post.type} />
        <h2 className="mt-1 text-3xl sm:text-4xl font-serif font-bold leading-tight">
          {post.title}
        </h2>
        {post.date && (
          <p className="mt-2 text-xs text-[#767676]">{formatDate(post.date)}</p>
        )}
        {post.body && (
          <div
            className="mt-3 post-body text-[#333] text-sm leading-relaxed line-clamp-5"
            dangerouslySetInnerHTML={{ __html: marked.parse(post.body) }}
          />
        )}
      </div>
    </article>
  );
}

// Compact list item for the recents sidebar.
function SidebarItem({ post }) {
  return (
    <div className="py-3 border-b border-[#dcdcdc] last:border-0">
      <TypeBadge type={post.type} />
      <p className="mt-0.5 font-serif font-bold text-sm leading-snug">{post.title}</p>
      {post.date && (
        <p className="mt-0.5 text-xs text-[#767676]">{formatDate(post.date)}</p>
      )}
    </div>
  );
}

// Standard card for the grid below the hero.
function PostCard({ post }) {
  const image = post.imageUrl || extractFirstImage(post.body);
  return (
    <article className="bg-white border border-[#dcdcdc] overflow-hidden flex flex-col">
      {post.type === 'video' && post.videoUrl && (
        <video className="w-full aspect-video bg-black" src={post.videoUrl} controls playsInline />
      )}
      {post.type === 'audio' && post.audioUrl && (
        <div className="bg-[#052962] px-3 pt-3">
          <audio className="w-full" src={post.audioUrl} controls />
        </div>
      )}
      {image && post.type !== 'video' && (
        <img className="w-full aspect-video object-cover" src={image} alt={post.title} />
      )}
      <div className="p-4 flex flex-col flex-1 border-t-2 border-[#c70000]">
        <TypeBadge type={post.type} />
        <h3 className="mt-1 font-serif font-bold text-lg leading-snug">{post.title}</h3>
        {post.date && (
          <p className="mt-1 text-xs text-[#767676]">{formatDate(post.date)}</p>
        )}
        {post.body && (
          <div
            className="mt-2 post-body text-xs text-[#333] leading-relaxed line-clamp-3"
            dangerouslySetInnerHTML={{ __html: marked.parse(post.body) }}
          />
        )}
      </div>
    </article>
  );
}

export default function Home() {
  const { posts, loading, error } = usePosts();
  const [activeFilter, setActiveFilter] = useState(null);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  // Apply active nav filter.
  const filtered = useMemo(() => {
    if (!activeFilter) return posts;
    return posts.filter(p => p.type === activeFilter);
  }, [posts, activeFilter]);

  const hero = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="min-h-screen bg-[#f6f6f6] text-[#121212]">

      {/* ── Masthead ── */}
      <header className="bg-[#052962] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* Top bar: date left, title right — mirrors The Guardian layout */}
          <div className="flex items-end justify-between py-3 sm:py-5 border-b border-white/20">
            <div>
              <p className="text-xs text-white/60 uppercase tracking-widest font-sans">
                {today}
              </p>
              <p className="text-xs text-white/50 mt-0.5 font-sans">
                Edited by The Gargantuan
              </p>
            </div>

            {/* The Guardian-style stacked masthead: small "The" above huge title */}
            <div className="text-right leading-none">
              <span className="block text-sm sm:text-base font-serif italic text-white/80">
                The
              </span>
              <span className="block text-5xl sm:text-7xl md:text-8xl font-serif font-black italic tracking-tight">
                Gargantuan
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex gap-0 overflow-x-auto">
            {NAV_ITEMS.map(({ label, filter }) => (
              <button
                key={label}
                onClick={() => setActiveFilter(filter)}
                className={`
                  px-4 py-3 text-sm font-semibold font-sans whitespace-nowrap
                  border-b-4 transition-colors
                  ${activeFilter === filter
                    ? 'border-[#c70000] text-white'
                    : 'border-transparent text-white/70 hover:text-white hover:border-white/30'}
                `}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ── Red rule ── */}
      <div className="h-[3px] bg-[#c70000]" />

      {/* ── Main content ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {loading && (
          <div className="bg-white border border-[#dcdcdc] p-6 text-sm text-[#555]">
            Loading…
          </div>
        )}
        {error && (
          <div className="bg-white border border-[#dcdcdc] p-6 text-sm text-[#c70000]">
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="bg-white border border-[#dcdcdc] p-6 text-sm text-[#555]">
            No posts yet.
          </div>
        )}

        {hero && (
          <>
            {/* Hero + sidebar row */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-2">
                <HeroCard post={hero} />
              </div>
              <aside className="flex flex-col">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-[#555] mb-2 font-sans">
                  Recent
                </h2>
                <div className="bg-white border border-[#dcdcdc] flex-1 px-4 divide-y divide-[#dcdcdc]">
                  {filtered.map(p => (
                    <SidebarItem key={p.id} post={p} />
                  ))}
                </div>
              </aside>
            </div>

            {/* Card grid */}
            {rest.length > 0 && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-[#555] font-sans">
                    More
                  </h2>
                  <div className="flex-1 h-px bg-[#dcdcdc]" />
                </div>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {rest.map(p => <PostCard key={p.id} post={p} />)}
                </div>
              </>
            )}
          </>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="mt-12 bg-[#052962] text-white">
        <div className="h-[3px] bg-[#c70000]" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <p className="font-serif italic font-black text-2xl">The Gargantuan</p>
            <p className="text-xs text-white/60 mt-1">© {new Date().getFullYear()} The Gargantuan</p>
          </div>
          <div className="text-xs text-white/60">
            <p>Contact: hellogargantuan69@gmail.com</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
