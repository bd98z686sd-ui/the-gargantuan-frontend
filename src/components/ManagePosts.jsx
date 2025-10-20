import React, { useEffect, useMemo, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
const API_BASE = import.meta.env.VITE_API_BASE || 'https://the-gargantuan-backend.onrender.com';


  function setBodyFor(id, val){ setBodies(prev=>({ ...prev, [id]: val })) }
  async function handleBodySave(item){
    try{
      const id = item.filename
      const base = id.replace(/\.[^/.]+$/, '')
      const res = await fetch(`${API_BASE}/api/posts/${encodeURIComponent(id)}`,{
        method:'PATCH',
        headers:{ 'Content-Type':'application/json', 'x-admin-token': token },
        body: JSON.stringify({ body: bodies[base]||'' })
      })
      if(!res.ok) throw new Error('Save failed')
      toast?.show('Saved body','ok')
    }catch(e){ toast?.show('Failed to save body','error') }
  }

export default function ManagePosts({ token, toast }){
  const [items, setItems] = useState([]);
  const [bodies, setBodies] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({});

  async function load(){
    setLoading(true);
    try{
      const res = await fetch(`${API_BASE}/api/posts`, { cache:'no-store' });
      const data = await res.json();
      setItems(data);
      const b = {}; data.forEach(it=>{ b[it.filename.replace(/\.[^/.]+$/, '')] = it.body || ''; }); setBodies(b);
      setSelected({});
    }catch(e){ toast?.show('Failed to load posts','error'); }
    finally{ setLoading(false); }
  }
  useEffect(()=>{ load(); },[]);

  function toggleAll(e){
    const checked = e.target.checked;
    const next = {};
    if (checked) items.forEach(p => { next[p.filename.replace(/\.[^/.]+$/, '')] = true; });
    setSelected(next);
  }
  function toggleOne(id, checked){
    setSelected(s => ({...s, [id]: checked}));
  }
  const selectedIds = useMemo(()=> Object.keys(selected).filter(k => selected[k]), [selected]);

  async function saveTitle(filename, newTitle){
    const id = filename.replace(/\.[^/.]+$/, '');
    const res = await fetch(`${API_BASE}/api/posts/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type':'application/json', 'x-admin-token': token },
      body: JSON.stringify({ title: newTitle })
    });
    if (res.status===401){ toast?.show('Unauthorized (edit). Check token.','error'); return; }
    if (!res.ok){ toast?.show('Save failed','error'); return; }
    toast?.show('Saved','ok'); load();
  }

  async function delOne(filename){
    const id = filename.replace(/\.[^/.]+$/, '');
    const res = await fetch(`${API_BASE}/api/posts/${encodeURIComponent(id)}`, {
      method:'DELETE',
      headers:{ 'x-admin-token': token }
    });
    if (res.status===401){ toast?.show('Unauthorized (delete).','error'); return; }
    if (!res.ok){ toast?.show('Delete failed','error'); return; }
    toast?.show('Moved to Trash','ok'); load();
  }

  async function bulkDelete(){
    if (selectedIds.length===0) return;
    const res = await fetch(`${API_BASE}/api/posts/bulk-delete`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'x-admin-token': token },
      body: JSON.stringify({ ids: selectedIds })
    });
    if (res.status===401){ toast?.show('Unauthorized (bulk delete).','error'); return; }
    if (!res.ok){ toast?.show('Bulk delete failed','error'); return; }
    toast?.show('Selected moved to Trash','ok'); load();
  }

  const rows = useMemo(()=> items.map((p,i)=>({
    key: i, filename: p.filename, title: p.title, date: p.date, type: p.type, url: p.absoluteUrl || p.url,
    id: p.filename.replace(/\.[^/.]+$/, '')
  })), [items]);

  return (
    <div className="bg-white border border-[#dcdcdc] rounded-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-headline text-xl">Manage posts</h3>
        <div className="flex items-center gap-2">
          <button onClick={load} className="text-sm underline text-[#052962]">Refresh</button>
          <button onClick={bulkDelete} className="px-3 py-1 bg-[#c70000] text-white rounded text-sm disabled:opacity-50" disabled={selectedIds.length===0}>
            Delete selected ({selectedIds.length})
          </button>
        </div>
      </div>
      {loading && <p>Loading…</p>}
      {!loading && rows.length===0 && <p className="text-sm text-[#666]">No posts yet.</p>}

      {!loading && rows.length>0 && (
        <div className="my-6 p-4 border rounded-xl">
          <h3 className="font-semibold mb-2">Post body (Markdown)</h3>
          <p className="text-xs text-[#666] mb-2">Inline formatting and images supported.</p>
          {(()=>{
            const current = rows[0]?.item
            if(!current) return null
            const base = current.filename.replace(/\.[^/.]+$/, '')
            return (
              <div data-color-mode="light">
                <MDEditor value={bodies[base]||''} onChange={(v)=>setBodyFor(base, v||'')} />
                <div className="mt-2 flex gap-2">
                  <ImageUpload token={token} onInserted={(url)=>{
                    const cur = bodies[base]||''
                    setBodyFor(base, (cur + `\n\n![](${url})\n`))
                    toast?.show('Image inserted','ok')
                  }} />
                  <button className="px-3 py-1 rounded bg-[#052962] text-white" onClick={()=>handleBodySave(current)}>Save body</button>
                </div>
              </div>
            )
          })()}
        </div>
      )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[#555]">
              <tr>
                <th className="py-2 pr-4"><input type="checkbox" onChange={toggleAll} /></th>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Filename</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r)=> <Row key={r.key} row={r} onSave={saveTitle} onDelete={delOne} onToggle={toggleOne} checked={!!selected[r.id]} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Row({ row, onSave, onDelete, onToggle, checked }){
  const [val, setVal] = React.useState(row.title || '');
  return (
    <tr className="border-t border-[#eee]">
      <td className="py-2 pr-4"><input type="checkbox" checked={checked} onChange={e=>onToggle(row.id, e.target.checked)} /></td>
      <td className="py-2 pr-4">
        <input value={val} onChange={e=>setVal(e.target.value)} className="border border-[#dcdcdc] rounded px-2 py-1 w-full" />
      </td>
      <td className="py-2 pr-4 break-all">{row.filename}</td>
      <td className="py-2 pr-4">{row.date ? new Date(row.date).toLocaleString() : ''}</td>
      <td className="py-2 pr-4 uppercase">{row.type}</td>
      <td className="py-2">
        <div className="flex gap-2">
          <button onClick={()=>onSave(row.filename, val)} className="px-3 py-1 bg-[#052962] text-white rounded">Save</button>
          <a href={row.url} target="_blank" className="px-3 py-1 border border-[#dcdcdc] rounded">Open</a>
          <button onClick={()=>onDelete(row.filename)} className="px-3 py-1 bg-[#c70000] text-white rounded">Delete</button>
        </div>
      </td>
    </tr>
  );
}
