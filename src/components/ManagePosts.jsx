import React, { useEffect, useMemo, useState } from 'react';

// ManagePosts has been updated for v1.6.0 to handle both published posts and
// drafts, and to support editing the body and draft status.  Posts are
// identified by their id rather than filename because filenames no longer
// uniquely determine a post when metadata is involved.  We still support
// bulk delete and restore operations via the backend.

const API_BASE = import.meta.env.VITE_API_BASE || 'https://the-gargantuan-backend.onrender.com';

export default function ManagePosts({ token, toast }) {
  const [posts, setPosts] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({});
  const [editing, setEditing] = useState(null); // id of post being edited
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editDraft, setEditDraft] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [postsRes, draftsRes] = await Promise.all([
        fetch(`${API_BASE}/api/posts`, { cache: 'no-store' }),
        fetch(`${API_BASE}/api/drafts`, { cache: 'no-store' }),
      ]);
      const postsData = await postsRes.json();
      const draftsData = await draftsRes.json();
      setPosts(postsData);
      setDrafts(draftsData);
      setSelected({});
    } catch (e) {
      toast?.show('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  function toggleAll(e, which) {
    const checked = e.target.checked;
    const next = { ...selected };
    const list = which === 'draft' ? drafts : posts;
    if (checked) list.forEach((p) => { next[p.id] = true; });
    else list.forEach((p) => { next[p.id] = false; });
    setSelected(next);
  }
  function toggleOne(id, checked) {
    setSelected((s) => ({ ...s, [id]: checked }));
  }
  const selectedIds = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);

  // Save changes to a post.  Accepts any combination of title, body and draft.
  async function save(id) {
    const res = await fetch(`${API_BASE}/api/posts/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ title: editTitle, body: editBody, draft: editDraft }),
    });
    if (res.status === 401) {
      toast?.show('Unauthorized (edit). Check token.', 'error');
      return;
    }
    if (!res.ok) {
      toast?.show('Save failed', 'error');
      return;
    }
    toast?.show('Saved', 'ok');
    setEditing(null);
    load();
  }

  // Delete one post (soft delete).
  async function delOne(id) {
    const res = await fetch(`${API_BASE}/api/posts/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': token },
    });
    if (res.status === 401) {
      toast?.show('Unauthorized (delete).', 'error');
      return;
    }
    if (!res.ok) {
      toast?.show('Delete failed', 'error');
      return;
    }
    toast?.show('Moved to Trash', 'ok');
    load();
  }

  // Bulk delete selected posts.
  async function bulkDelete() {
    if (selectedIds.length === 0) return;
    const res = await fetch(`${API_BASE}/api/posts/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ ids: selectedIds }),
    });
    if (res.status === 401) {
      toast?.show('Unauthorized (bulk delete).', 'error');
      return;
    }
    if (!res.ok) {
      toast?.show('Bulk delete failed', 'error');
      return;
    }
    toast?.show('Selected moved to Trash', 'ok');
    load();
  }

  // Start editing a post by populating local state.
  function startEdit(p) {
    setEditing(p.id);
    setEditTitle(p.title || '');
    setEditBody(p.body || '');
    setEditDraft(p.draft || false);
  }

  // Cancel editing.
  function cancelEdit() {
    setEditing(null);
  }

  // Compose rows for both published posts and drafts.
  const rows = useMemo(() => {
    const all = [...(posts || []), ...(drafts || [])];
    return all.map((p, i) => {
      // Build a small text snippet for preview if no image is provided.
      let snippet = '';
      if (p.body) {
        // Strip markdown syntax and truncate.
        const plain = p.body.replace(/\!\[[^\]]*\]\([^)]*\)/g, '') // remove images
          .replace(/\[[^\]]*\]\([^)]*\)/g, '') // remove links
          .replace(/[`_*#>-]/g, '') // remove md syntax
          .trim();
        snippet = plain.substring(0, 60) + (plain.length > 60 ? '…' : '');
      }
      return {
        key: i,
        id: p.id,
        title: p.title,
        date: p.date,
        type: p.type,
        draft: p.draft,
        url: p.playUrl || p.audioUrl || p.videoUrl || '',
        imageUrl: p.imageUrl || '',
        snippet,
      };
    });
  }, [posts, drafts]);

  return (
    <div className="bg-white border border-[#dcdcdc] rounded-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3">
      <h3 className="font-headline text-xl">Manage posts</h3>
        <div className="flex items-center gap-2">
          <button onClick={load} className="text-sm underline text-[#052962]">Refresh</button>
          <button onClick={bulkDelete} className="px-3 py-1 bg-[#c70000] text-white rounded text-sm disabled:opacity-50" disabled={selectedIds.length === 0}>
            Delete selected ({selectedIds.length})
          </button>
        </div>
      </div>
      {loading && <p>Loading…</p>}
      {!loading && rows.length === 0 && <p className="text-sm text-[#666]">No posts yet.</p>}
      {!loading && rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[#555]">
              <tr>
                <th className="py-2 pr-4"><input type="checkbox" onChange={(e) => toggleAll(e, 'all')} /></th>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Draft</th>
                <th className="py-2 pr-4">Preview</th>
                <th className="py-2 pr-4">Toggle</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <Row
                  key={r.key}
                  row={r}
                  checked={!!selected[r.id]}
                  onToggle={toggleOne}
                  onDelete={delOne}
                  onEdit={startEdit}
                  toast={toast}
                  token={token}
                  reload={load}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-start pt-10 z-50">
          <div className="bg-white rounded-lg border border-[#dcdcdc] max-w-lg w-full p-4 sm:p-6">
            <h4 className="text-lg font-semibold mb-3">Edit post</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Title</label>
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full border border-[#dcdcdc] rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Body</label>
                <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={6} className="w-full border border-[#dcdcdc] rounded px-3 py-2 text-sm" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={editDraft} onChange={(e) => setEditDraft(e.target.checked)} />
                <span className="text-sm">Draft</span>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={cancelEdit} className="px-3 py-1 border border-[#dcdcdc] rounded">Cancel</button>
                <button onClick={() => save(editing)} className="px-3 py-1 bg-[#052962] text-white rounded">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ row, checked, onToggle, onDelete, onEdit, toast, token, reload }) {
  // Toggle draft status.  Calls PATCH /api/posts/:id with the inverted draft flag.
  async function handleToggle() {
    try {
      const res = await fetch(`${API_BASE}/api/posts/${encodeURIComponent(row.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ draft: !row.draft }),
      });
      if (res.status === 401) {
        toast?.show('Unauthorized (toggle).', 'error');
        return;
      }
      if (!res.ok) {
        toast?.show('Toggle failed', 'error');
        return;
      }
      toast?.show(row.draft ? 'Published' : 'Unpublished', 'ok');
      reload?.();
    } catch (err) {
      toast?.show(err.message || 'Toggle failed', 'error');
    }
  }
  return (
    <tr className="border-t border-[#eee]">
      <td className="py-2 pr-4"><input type="checkbox" checked={checked} onChange={(e) => onToggle(row.id, e.target.checked)} /></td>
      <td className="py-2 pr-4 max-w-xs truncate" title={row.title}>{row.title}</td>
      <td className="py-2 pr-4">{row.date ? new Date(row.date).toLocaleString() : ''}</td>
      <td className="py-2 pr-4 uppercase">{row.type}</td>
      <td className="py-2 pr-4">{row.draft ? 'Yes' : 'No'}</td>
      <td className="py-2 pr-4">
        {row.imageUrl ? (
          <img src={row.imageUrl} alt={row.title} className="w-14 h-10 object-cover rounded" />
        ) : (
          <span className="text-xs text-[#666]">{row.snippet || ''}</span>
        )}
      </td>
      <td className="py-2 pr-4">
        <button onClick={handleToggle} className={`px-3 py-1 rounded text-white text-xs ${row.draft ? 'bg-[#052962]' : 'bg-[#c70000]'}`}>{row.draft ? 'Publish' : 'Unpublish'}</button>
      </td>
      <td className="py-2">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => onEdit(row)} className="px-3 py-1 bg-[#052962] text-white rounded text-xs">Edit</button>
          {row.url && <a href={row.url} target="_blank" className="px-3 py-1 border border-[#dcdcdc] rounded text-xs">Open</a>}
          <button onClick={() => onDelete(row.id)} className="px-3 py-1 bg-[#c70000] text-white rounded text-xs">Delete</button>
        </div>
      </td>
    </tr>
  );
}
