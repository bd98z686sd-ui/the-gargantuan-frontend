import React, { useEffect, useMemo, useState } from 'react';

// Trash component for v1.6.0.  Retrieves posts from `/api/trash` which now
// include an `id` property.  Supports bulk restore and hard delete.  The
// filename is no longer exposed on the client; operations are keyed by id.
const API_BASE = import.meta.env.VITE_API_BASE || 'https://the-gargantuan-backend.onrender.com';

export default function Trash({ token, toast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({});

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/trash`, { headers: { 'x-admin-token': token }, cache: 'no-store' });
      const data = await res.json();
      setItems(data);
      setSelected({});
    } catch (e) {
      toast?.show('Failed to load trash', 'error');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  function toggleAll(e) {
    const checked = e.target.checked;
    const next = {};
    if (checked) items.forEach((p) => { next[p.id] = true; });
    setSelected(next);
  }
  function toggleOne(id, checked) { setSelected((s) => ({ ...s, [id]: checked })); }
  const selectedIds = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);

  async function restoreOne(id) {
    const res = await fetch(`${API_BASE}/api/posts/${encodeURIComponent(id)}/restore`, {
      method: 'POST', headers: { 'x-admin-token': token },
    });
    if (res.status === 401) { toast?.show('Unauthorized (restore).', 'error'); return; }
    if (!res.ok) { toast?.show('Restore failed', 'error'); return; }
    toast?.show('Restored', 'ok'); load();
  }

  async function hardDeleteOne(id) {
    if (!confirm('Permanently delete this item?')) return;
    const res = await fetch(`${API_BASE}/api/trash/${encodeURIComponent(id)}`, {
      method: 'DELETE', headers: { 'x-admin-token': token },
    });
    if (res.status === 401) { toast?.show('Unauthorized (hard delete).', 'error'); return; }
    if (!res.ok) { toast?.show('Hard delete failed', 'error'); return; }
    toast?.show('Deleted permanently', 'ok'); load();
  }

  async function bulkRestore() {
    if (selectedIds.length === 0) return;
    const res = await fetch(`${API_BASE}/api/trash/bulk-restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ ids: selectedIds }),
    });
    if (res.status === 401) { toast?.show('Unauthorized (bulk restore).', 'error'); return; }
    if (!res.ok) { toast?.show('Bulk restore failed', 'error'); return; }
    toast?.show('Selected restored', 'ok'); load();
  }

  const rows = useMemo(() => items.map((p, i) => ({
    key: i, id: p.id, title: p.title, date: p.date, type: p.type, url: p.playUrl || p.audioUrl || p.videoUrl || ''
  })), [items]);

  return (
    <div className="bg-white border border-[#dcdcdc] rounded-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-headline text-xl">Trash</h3>
        <div className="flex items-center gap-2">
          <button onClick={load} className="text-sm underline text-[#052962]">Refresh</button>
          <button onClick={bulkRestore} className="px-3 py-1 bg-[#052962] text-white rounded text-sm disabled:opacity-50" disabled={selectedIds.length === 0}>
            Restore selected ({selectedIds.length})
          </button>
        </div>
      </div>
      {loading && <p>Loading…</p>}
      {!loading && rows.length === 0 && <p className="text-sm text-[#666]">Trash is empty.</p>}
      {!loading && rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[#555]">
              <tr>
                <th className="py-2 pr-4"><input type="checkbox" onChange={toggleAll} /></th>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <Row key={r.key} row={r} onRestore={restoreOne} onHardDelete={hardDeleteOne} onToggle={toggleOne} checked={!!selected[r.id]} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Row({ row, onRestore, onHardDelete, onToggle, checked }) {
  return (
    <tr className="border-t border-[#eee]">
      <td className="py-2 pr-4"><input type="checkbox" checked={checked} onChange={(e) => onToggle(row.id, e.target.checked)} /></td>
      <td className="py-2 pr-4">{row.title}</td>
      <td className="py-2 pr-4">{row.date ? new Date(row.date).toLocaleString() : ''}</td>
      <td className="py-2 pr-4 uppercase">{row.type}</td>
      <td className="py-2">
        <div className="flex gap-2">
          <button onClick={() => onRestore(row.id)} className="px-3 py-1 bg-[#052962] text-white rounded">Restore</button>
          {row.url && <a href={row.url} target="_blank" className="px-3 py-1 border border-[#dcdcdc] rounded">Open</a>}
          <button onClick={() => onHardDelete(row.id)} className="px-3 py-1 bg-[#c70000] text-white rounded">Delete permanently</button>
        </div>
      </td>
    </tr>
  );
}
