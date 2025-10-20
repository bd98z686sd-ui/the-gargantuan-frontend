import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MDEditor from '@uiw/react-md-editor';

/**
 * Component rendering the public feed.  Fetches published posts from the
 * backend and displays them in descending order.  Depending on the post
 * type the appropriate media player is used: video, audio or image.  The
 * Markdown body is rendered using MDEditor.Markdown.
 */
export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          setError(err.message);
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div className="container">Loading…</div>;
  if (error) return <div className="container">Error: {error}</div>;
  return (
    <div className="container">
      {posts.length === 0 && <p>No posts yet.</p>}
      {posts.map((post) => (
        <div key={post.id} style={{ marginBottom: '2rem' }}>
          <h2>{post.title}</h2>
          {post.type === 'video' && post.playUrl && (
            <video
              controls
              width="100%"
              src={post.playUrl}
              style={{ maxHeight: '480px', background: '#000' }}
            ></video>
          )}
          {post.type === 'audio' && post.playUrl && (
            <audio controls src={post.playUrl} style={{ width: '100%' }}></audio>
          )}
          {post.type === 'image' && post.imageUrl && (
            <img
              src={post.imageUrl}
              alt={post.title}
              style={{ width: '100%', maxHeight: '480px', objectFit: 'cover' }}
            />
          )}
          <div data-color-mode="light" style={{ marginTop: '1rem' }}>
            <MDEditor.Markdown source={post.body || ''} />
          </div>
        </div>
      ))}
    </div>
  );
}