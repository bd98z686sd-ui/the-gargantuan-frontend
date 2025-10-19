import { useEffect, useState } from 'react'
import { fetchPosts, authFetch } from '../api'

function uploadWithProgress(url, file, token, onProgress){
  return new Promise((resolve, reject)=>{
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url, true)
    xhr.setRequestHeader('x-admin-token', token || '')
    xhr.upload.onprogress = (e)=>{
      if (e.lengthComputable) onProgress(Math.round((e.loaded/e.total)*100))
    }
    xhr.onload = ()=>{
      if (xhr.status >= 200 && xhr.status < 300){
        try { resolve(JSON.parse(xhr.responseText)) } catch { resolve({ ok:true }) }
      } else reject(new Error(xhr.responseText || 'Upload failed'))
    }
    xhr.onerror = ()=> reject(new Error('Network error'))
    const form = new FormData()
    form.append('file', file)
    xhr.send(form)
  })
}


export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem('ADMIN_TOKEN') || '')
  const [posts, setPosts] = useState([])
  const [file, setFile] = useState(null)
  const [drag, setDrag] = useState(false)
  const [captionOn, setCaptionOn] = useState(false)
  const [selected, setSelected] = useState(new Set())
  const [editing, setEditing] = useState(null) // id
  const [form, setForm] = useState({ title:'', tagline:'', text:'', imageUrl:'' })
  const [msg, setMsg] = useState('')

  const API = import.meta.env.VITE_API_BASE || ''
  const [health, setHealth] = useState(null)

  async function checkHealth(){
    try{
      const r = await fetch(`${API}/api/health`)
      const j = await r.json().catch(()=>({}))
      setHealth(j)
      setMsg(j.ok ? `Connected (${j.storageMode}${j.bucket?':'+j.bucket:''})` : 'API not reachable')
    }catch(e){ setMsg('API not reachable') }
  }
  useEffect(()=>{ checkHealth() }, [])

  function saveToken(){
    localStorage.setItem('ADMIN_TOKEN', token || '')
    setMsg('Token saved'); setTimeout(checkHealth, 300)
  }
  function clearToken(){
    localStorage.removeItem('ADMIN_TOKEN'); setToken(''); setMsg('Token cleared')
  }

  const [progress, setProgress] = useState(0)
  const [busy, setBusy] = useState(false)

  async function load(){ setPosts(await fetchPosts()) }

  async function createShort(p){
    try{
      setBusy(true); setMsg('Generating short...'); setProgress(10)
      const token = localStorage.getItem('ADMIN_TOKEN') || ''
      const body = { postId: p.id, ratio: 'vertical', startSec: 0, durationSec: 20, burnSubtitles: captionOn }
      const r = await fetch(`${import.meta.env.VITE_API_BASE || ''}/api/shorts/create`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'x-admin-token': token },
        body: JSON.stringify(body)
      })
      if (!r.ok) throw new Error(await r.text())
      setProgress(90); setMsg('Finalizing...')
      await load(); setProgress(100); setMsg('Short ready!')
    }catch(e){ setMsg(String(e.message||e)) } finally { setBusy(false); setTimeout(()=>setProgress(0), 1200) }
  }

  useEffect(()=>{ load() }, [])

  function saveToken(){
    localStorage.setItem('ADMIN_TOKEN', token)
    setMsg('Token saved'); setTimeout(()=>setMsg(''),1200)
  }

  async function upload(kind){
    if (!file) return
    const formData = new FormData()
    formData.append(kind, file)
    const res = await fetch('/api/upload', { method:'POST', headers:{'x-admin-token': token}, body: formData })
    if (!res.ok) { setMsg('Upload failed'); return }
    await load()
    setMsg('Uploaded'); setFile(null)
  }

  function toggle(id){
    const copy = new Set(selected)
    copy.has(id) ? copy.delete(id) : copy.add(id)
    setSelected(copy)
  }
  function toggleAll(){
    if (selected.size === posts.length) setSelected(new Set())
    else setSelected(new Set(posts.map(p=>p.id)))
  }

  async function bulkDelete(){
    await authFetch('/api/posts/bulk-delete', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ids: Array.from(selected) }) })
    setSelected(new Set()); load()
  }
  async function bulkRestore(){
    await authFetch('/api/posts/bulk-restore', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ids: Array.from(selected) }) })
    setSelected(new Set()); load()
  }

  async function remove(id){ await authFetch(`/api/posts/${id}`, { method:'DELETE' }); load() }
  async function restore(id){ await authFetch(`/api/posts/${id}/restore`, { method:'POST' }); load() }

  function startEdit(p){
    setEditing(p.id)
    setForm({ title: p.title || '', tagline: p.tagline || '', text: p.text || '', imageUrl: p.imageUrl || '' })
  }
  async function saveEdit(id){
    await authFetch(`/api/posts/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    setEditing(null); load()
  }

  async function genVideo(id){
    const p = posts.find(x=>x.id===id); if(!p?.filename) { setMsg('No filename on post'); return }
    await authFetch('/api/generate-video', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ filename: p.filename, title: form.title || p.title || 'The Gargantuan', whisper: captionOn })
    })
    setMsg(captionOn? 'Video+captions requested' : 'Video requested')
  }

  return (
    <div
      className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <div><span className="font-semibold">API:</span> {API||'(not set)'}</div>
        <div><span className="font-semibold">Health:</span> {health? (health.ok? 'OK':'Down') : '…'}</div>
        <div className="flex items-center gap-2"><span className="font-semibold">Token:</span>
          <input className="border px-2 py-1" value={token} onChange={e=>setToken(e.target.value)} placeholder="paste admin token" />
          <button className="px-2 py-1 bg-guardian-blue text-white" onClick={saveToken}>Save</button>
          <button className="px-2 py-1 bg-gray-200" onClick={clearToken}>Clear</button>
        </div>
      </div> className="mx-auto max-w-5xl px-4 py-8">
      <h2 className="font-display text-3xl mb-4">Admin</h2>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <input className="border px-3 py-2 w-80" placeholder="Admin token" value={token} onChange={e=>setToken(e.target.value)} />
        <button className="bg-guardian-blue text-white px-3 py-2" onClick={saveToken}>Save</button>
        <label className="ml-4 inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={captionOn} onChange={e=>setCaptionOn(e.target.checked)} />
          Burn captions (Whisper)
        </label>
        {msg && <span className="text-sm text-green-700">{msg}</span>}
      </div>

      <div
        className={`border p-4 mb-8 bg-white ${drag? 'ring-2 ring-guardian-blue' : ''}`}
        onDragOver={e=>{e.preventDefault(); setDrag(true)}}
        onDragLeave={()=>setDrag(false)}
        onDrop={e=>{e.preventDefault(); setDrag(false); if(e.dataTransfer.files?.length) setFile(e.dataTransfer.files[0])}}
      >
        <h3 className="font-semibold mb-2">Upload</h3>
        <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} />
        {file && <div className="text-sm mt-2">Selected: {file.name}</div>}
        <div className="mt-3 flex gap-2">
          <button className="bg-gray-900 text-white px-3 py-2" onClick={()=>upload('audio')}>Upload Audio</button>
          <button className="bg-gray-700 text-white px-3 py-2" onClick={()=>upload('image')}>Upload Image</button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Drag & drop file onto this box</p>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <input type="checkbox" checked={selected.size===posts.length && posts.length>0} onChange={toggleAll} />
        <span className="text-sm">{selected.size} selected</span>
        <button className="text-sm underline" onClick={bulkDelete}>Bulk Delete</button>
        <button className="text-sm underline" onClick={bulkRestore}>Bulk Restore</button>
      </div>

      <table className="w-full text-sm bg-white">
        <thead><tr className="text-left">
          <th className="p-2">Sel</th><th className="p-2">Title</th><th>Type</th><th>Date</th><th>Status</th><th>Actions</th>
        </tr></thead>
        <tbody>
          {posts.map(p=>(
            <tr key={p.id} className="border-t align-top">
              <td className="p-2"><input type="checkbox" checked={selected.has(p.id)} onChange={()=>toggle(p.id)} /></td>
              <td className="p-2">
                {editing===p.id ? (
                  <div className="space-y-2">
                    <input className="border w-full px-2 py-1" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Title" />
                    <input className="border w-full px-2 py-1" value={form.tagline} onChange={e=>setForm({...form, tagline:e.target.value})} placeholder="Tagline" />
                    <textarea className="border w-full px-2 py-1" rows="4" value={form.text} onChange={e=>setForm({...form, text:e.target.value})} placeholder="Text content"></textarea>
                    <input className="border w-full px-2 py-1" value={form.imageUrl} onChange={e=>setForm({...form, imageUrl:e.target.value})} placeholder="Image URL (optional)" />
                  </div>
                ) : (
                  <div>
                    <div className="font-semibold">{p.title || p.filename}</div>
                    {p.tagline && <div className="text-gray-600">{p.tagline}</div>}
                    {p.text && <div className="text-gray-700 line-clamp-2">{p.text}</div>}
                  </div>
                )}
              </td>
              <td className="p-2">{p.videoUrl ? 'video' : (p.audioUrl ? 'audio' : (p.imageUrl ? 'image' : 'text'))}</td>
              <td className="p-2">{new Date(p.date).toLocaleString()}</td>
              <td className="p-2">{p.deleted ? 'deleted' : 'active'}</td>
              <td className="p-2 flex flex-col gap-1">
                {editing===p.id ? (
                  <div className="flex gap-2">
                    <button className="underline" onClick={()=>saveEdit(p.id)}>Save</button>
                    <button className="underline" onClick={()=>setEditing(null)}>Cancel</button>
                  </div>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {!p.deleted && <button className="underline" onClick={()=>startEdit(p)}>Edit</button>}
                    {!p.deleted && <button className="underline" onClick={()=>genVideo(p.id)}>{captionOn? 'Create Video+CC' : 'Create Video'}</button>}
                    {!p.deleted && <button className="underline" onClick={()=>remove(p.id)}>Delete</button>}
                    {!p.deleted && <button className="underline" onClick={()=>createShort(p)}>Create Short</button>}
                    {p.deleted && <button className="underline" onClick={()=>restore(p.id)}>Restore</button>}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}