const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function fetchPosts() {
  try {
    const r = await fetch(`${API_BASE}/api/posts`);
    if (!r.ok) return [];
    return await r.json();
  } catch (e) { return []; }
}

export async function authFetch(path, opts = {}) {
  const token = localStorage.getItem('ADMIN_TOKEN') || '';
  const headers = { ...(opts.headers || {}), 'x-admin-token': token };
  const r = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}