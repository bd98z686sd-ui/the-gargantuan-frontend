import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MDEditor from '@uiw/react-md-editor';

/**
 * Public feed component. This layout emphasises the most recent post but
 * avoids overwhelming the reader by keeping the hero at a moderate size.
 * A tagline beneath the masthead sets the tone for the publication and
 * red accent bars top and bottom echo the print‑style aesthetic shown in
 * the reference screenshot provided by the user.  A recents sidebar lists
 * all published posts by date while the remainder of the posts are shown
 * in a simple card grid.  Posts of type video, audio, image and text are
 * rendered using the appropriate media elements, and markdown bodies are
 * rendered via MDEditor.Markdown.
 */
export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch published posts on mount
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const base = import.meta.env.VITE_API_BASE || '';
        const resp = await axios.get(`${base}/api/posts`);
        if (!cancelled) {
          setPosts(resp.data);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError(err.message || 'Failed to load');
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Helper to format dates from the API.  Accepts a date string or
  // timestamp and returns a human friendly value like "21 Oct 2025".
  const formatDate = (d) => {
    try {
      const date = new Date(d);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return d;
    }
  };

  if (loading) return <div className="container">Loading…</div>;
  if (error) return <div className="container">Error: {error}</div>;

  // Guard for no posts
  if (posts.length === 0) {
    return (
      <div>
        <header style={{ backgroundColor: '#002f6c', color: '#fff', textAlign: 'center', paddingTop: '1rem' }}>
          <h1 style={{ margin: 0 }}>The Gargantuan</h1>
          <p style={{ margin: '0.25rem 0 0.5rem', fontSize: '0.9rem' }}>
            Daily audio, spectral video &amp; shorts — latest first
          </p>
          <div style={{ backgroundColor: '#d00000', height: '3px', width: '100%' }}></div>
        </header>
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
          <p>No posts yet.</p>
        </main>
        <footer style={{ backgroundColor: '#002f6c', color: '#fff', textAlign: 'center', marginTop: '2rem' }}>
          <div style={{ backgroundColor: '#d00000', height: '3px', width: '100%' }}></div>
          <div style={{ padding: '1rem' }}>
            <p style={{ margin: '0.5rem 0' }}>© {new Date().getFullYear()} The Gargantuan</p>
            <p style={{ margin: '0.5rem 0' }}>Contact: hellogargantuan69@gmail.com</p>
            <p style={{ margin: '0.5rem 0' }}>
              <a href="https://the-gargantuan.vercel.app" style={{ color: '#fff', textDecoration: 'underline' }}>
                the-gargantuan.vercel.app
              </a>
            </p>
          </div>
        </footer>
      </div>
    );
  }

  // Split the posts: the first one is the hero, the rest are additional posts
  const [heroPost, ...restPosts] = posts;

  return (
    <div>
      {/* Masthead with tagline and top red bar */}
      <header style={{ backgroundColor: '#002f6c', color: '#fff', textAlign: 'center', paddingTop: '1rem' }}>
        <h1 style={{ margin: 0 }}>The Gargantuan</h1>
        <p style={{ margin: '0.25rem 0 0.5rem', fontSize: '0.9rem' }}>
          Daily audio, spectral video &amp; shorts — latest first
        </p>
        <div style={{ backgroundColor: '#d00000', height: '3px', width: '100%' }}></div>
      </header>
      {/* Main layout: hero and recents */}
      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '1rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2rem',
        }}
      >
        {/* Hero section */}
        <section
          style={{
            flex: '2 1 60%',
            minWidth: '300px',
            backgroundColor: '#fff',
            padding: '1rem',
            border: '1px solid #ddd',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ marginBottom: '0.5rem', color: '#666', fontSize: '0.8rem' }}>
            {formatDate(heroPost.date)}{' '}
            <span style={{ backgroundColor: '#eee', borderRadius: '1rem', padding: '0.1rem 0.5rem', marginLeft: '0.5rem', fontSize: '0.7rem' }}>
              {heroPost.type === 'video'
                ? 'Video blog'
                : heroPost.type === 'audio'
                ? 'Audio blog'
                : heroPost.type === 'image'
                ? 'Image'
                : 'Post'}
            </span>
          </div>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.6rem', lineHeight: '1.2', fontFamily: 'Georgia, serif' }}>
            {heroPost.title}
          </h2>
          {/* Hero media */}
          {heroPost.type === 'video' && heroPost.playUrl && (
            <video
              controls
              src={heroPost.playUrl}
              style={{ width: '100%', maxHeight: '360px', backgroundColor: '#000' }}
            ></video>
          )}
          {heroPost.type === 'audio' && heroPost.playUrl && (
            <audio
              controls
              src={heroPost.playUrl}
              style={{ width: '100%' }}
            ></audio>
          )}
          {heroPost.type === 'image' && heroPost.imageUrl && (
            <img
              src={heroPost.imageUrl}
              alt={heroPost.title}
              style={{ width: '100%', maxHeight: '360px', objectFit: 'cover' }}
            />
          )}
          {/* Hero body */}
          <div data-color-mode="light" style={{ marginTop: '1rem', fontSize: '0.9rem', lineHeight: '1.4' }}>
            <MDEditor.Markdown source={heroPost.body || ''} />
          </div>
        </section>
        {/* Recents sidebar */}
        <aside
          style={{
            flex: '1 1 30%',
            minWidth: '200px',
            padding: '1rem',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            height: 'fit-content',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Recent</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {posts.map((post) => (
              <li key={post.id} style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>{formatDate(post.date)}</div>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', fontFamily: 'Georgia, serif' }}>
                  {post.title || '(Untitled)'}
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </main>
      {/* Additional posts grid */}
      {restPosts.length > 0 && (
        <section
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '1rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {restPosts.map((post) => (
            <article
              key={post.id}
              style={{
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                padding: '1rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ marginBottom: '0.5rem', color: '#666', fontSize: '0.8rem' }}>
                {formatDate(post.date)}{' '}
                <span style={{ backgroundColor: '#eee', borderRadius: '1rem', padding: '0.1rem 0.5rem', marginLeft: '0.5rem', fontSize: '0.7rem' }}>
                  {post.type === 'video'
                    ? 'Video blog'
                    : post.type === 'audio'
                    ? 'Audio blog'
                    : post.type === 'image'
                    ? 'Image'
                    : 'Post'}
                </span>
              </div>
              <h4 style={{ margin: '0 0 0.75rem', fontSize: '1.2rem', lineHeight: '1.2', fontFamily: 'Georgia, serif' }}>
                {post.title || '(Untitled)'}
              </h4>
              {post.type === 'video' && post.playUrl && (
                <video
                  controls
                  src={post.playUrl}
                  style={{ width: '100%', maxHeight: '200px', backgroundColor: '#000', marginBottom: '0.5rem' }}
                ></video>
              )}
              {post.type === 'audio' && post.playUrl && (
                <audio
                  controls
                  src={post.playUrl}
                  style={{ width: '100%', marginBottom: '0.5rem' }}
                ></audio>
              )}
              {post.type === 'image' && post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', marginBottom: '0.5rem' }}
                />
              )}
              {/* Only render body for posts with no media to avoid overly long cards */}
              {(!post.playUrl && !post.imageUrl) && (
                <div data-color-mode="light" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                  <MDEditor.Markdown source={(post.body || '').slice(0, 200) + (post.body && post.body.length > 200 ? '…' : '')} />
                </div>
              )}
            </article>
          ))}
        </section>
      )}
      {/* Footer with bottom red bar */}
      <footer style={{ backgroundColor: '#002f6c', color: '#fff', textAlign: 'center', marginTop: '2rem' }}>
        <div style={{ backgroundColor: '#d00000', height: '3px', width: '100%' }}></div>
        <div style={{ padding: '1rem' }}>
          <p style={{ margin: '0.5rem 0' }}>© {new Date().getFullYear()} The Gargantuan</p>
          <p style={{ margin: '0.5rem 0' }}>Contact: hellogargantuan69@gmail.com</p>
          <p style={{ margin: '0.5rem 0' }}>
            <a href="https://the-gargantuan.vercel.app" style={{ color: '#fff', textDecoration: 'underline' }}>
              the-gargantuan.vercel.app
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}