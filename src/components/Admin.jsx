import { useEffect, useState } from 'react'
import { adminFetch } from '../api'

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem('ADMIN_TOKEN') || '')
  const [posts, setPosts] = useState([])
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('')

  async function load() {
    const r = await fetch('/api/posts', { headers: {} })
    const data = await r.json().catch(() => [])
    setPosts(data)
  }

  useEffect(() => { load() }, [])

  function saveToken() {
    localStorage.setItem('ADMIN_TOKEN', token)
    setMessage('Admin token saved')
    setTimeout(()=>setMessage(''), 1500)
  }

  async function upload(kind) {
    if (!file) return
    const form = new FormData()
    form.append(kind, file)
    const r = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'x-admin-token': token },
      body: form
    })
    if (!r.ok) { setMessage('Upload failed'); return }
    await load()
    setMessage('Uploaded')
  }

  async function remove(id) {
    const r = await fetch(`/api/posts/${id}`, { method: 'DELETE', headers: { 'x-admin-token': token } })
    if (r.ok) load()
  }

  async function restore(id) {
    const r = await fetch(`/api/posts/${id}/restore`, { method: 'POST', headers: { 'x-admin-token': token } })
    if (r.ok) load()
  }

  async function genVideo(id) {
    const post = posts.find(p => p.id === id)
    if (!post?.filename) return
    await fetch('/api/generate-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ filename: post.filename, title: post.title || 'The Gargantuan' })
    })
    setMessage('Video requested')
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h2 className="font-display text-3xl mb-4">Admin</h2>
      <div className="flex gap-2 mb-6">
        <input className="border px-3 py-2 w-80" placeholder="Admin token" value={token} onChange={e=>setToken(e.target.value)} />
        <button className="bg-guardian-blue text-white px-3 py-2" onClick={saveToken}>Save</button>
        {message && <span className="text-sm text-green-700">{message}</span>}
      </div>

      <div className="border p-4 mb-8 bg-white">
        <h3 className="font-semibold mb-2">Upload</h3>
        <input type="file" onChange={e=>setFile(e.target.files?.[0] || null)} />
        <div className="mt-3 flex gap-2">
          <button className="bg-gray-900 text-white px-3 py-2" onClick={()=>upload('audio')}>Upload Audio</button>
          <button className="bg-gray-700 text-white px-3 py-2" onClick={()=>upload('image')}>Upload Image</button>
        </div>
      </div>

      <h3 className="font-semibold mb-2">Posts</h3>
      <table className="w-full text-sm bg-white">
        <thead><tr className="text-left"><th className="p-2">Title</th><th>Type</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {posts.map(p => (
            <tr key={p.id} className="border-t">
              <td className="p-2">{p.title || p.filename}</td>
              <td className="p-2">{p.videoUrl ? 'video' : (p.audioUrl ? 'audio' : (p.imageUrl ? 'image' : 'text'))}</td>
              <td className="p-2">{new Date(p.date).toLocaleString()}</td>
              <td className="p-2">{p.deleted ? 'deleted' : 'active'}</td>
              <td className="p-2 flex gap-2">
                {!p.deleted && <button className="underline" onClick={()=>genVideo(p.id)}>Create Video</button>}
                {!p.deleted && <button className="underline" onClick={()=>remove(p.id)}>Delete</button>}
                {p.deleted && <button className="underline" onClick={()=>restore(p.id)}>Restore</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}