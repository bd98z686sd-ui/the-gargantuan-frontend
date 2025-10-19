const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function fetchPosts() {
  try {
    const r = await fetch(`${API_BASE}/api/posts`);
    if (!r.ok) return [];
    return await r.json();
  } catch (e) {
    return [];
  }
}

export async function adminFetch(path, opts = {}) {
  const r = await fetch(`${API_BASE}${path}`, opts);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}