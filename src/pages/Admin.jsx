import React, { useEffect, useRef, useState } from 'react'

const API = import.meta.env.VITE_API_BASE || ''

export default function Admin(){
  const [token, setToken] = useState(localStorage.getItem('garg_token') || '')
  const [filename, setFilename] = useState('')
  const [title, setTitle] = useState('')
  const [tagline, setTagline] = useState('')
  const [uploadPct, setUploadPct] = useState(0)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef(null)

  useEffect(()=>{ localStorage.setItem('garg_token', token) }, [token])

  const onDrop = e => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f) doUpload(f)
  }

  async function doUpload(file){
    setBusy(true); setUploadPct(2)
    try{
      const form = new FormData()
      form.append('audio', file)
      const res = await fetch(API+'/api/upload', {
        method:'POST',
        headers: { 'x-admin-token': token },
        body: form,
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'upload failed')
      setFilename(json.key || json.filename)
      setUploadPct(100)
    }catch(e){ alert(e.message) }
    setBusy(false)
  }

  async function generateSpectral(){
    if (!filename) return alert('Upload first')
    setBusy(true)
    try{
      const res = await fetch(API+'/api/generate-video', {
        method:'POST',
        headers: {
          'Content-Type':'application/json',
          'x-admin-token': token
        },
        body: JSON.stringify({ filename, title })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error||'failed')
      alert('Spectral job queued: '+json.id)
    }catch(e){ alert(e.message) }
    setBusy(false)
  }

  async function generateShorts(){
    if (!filename) return alert('Upload first')
    setBusy(true)
    try{
      const res = await fetch(API+'/api/shorts/request', {
        method:'POST',
        headers: {
          'Content-Type':'application/json',
          'x-admin-token': token
        },
        body: JSON.stringify({ filename, title })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error||'failed')
      alert('Shorts job queued: '+json.id)
    }catch(e){ alert(e.message) }
    setBusy(false)
  }

  return (
    <div className="container admin-wrap">
      <h2 style={{margin:'8px 0 16px', fontFamily:'Merriweather, Georgia, serif'}}>Admin</h2>
      <div className="grid">
        <div>
          <label>Admin Token</label>
          <input className="input" type="password" value={token} onChange={e=>setToken(e.target.value)} placeholder="x-admin-token" />
        </div>
        <div>
          <label>Title</label>
          <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Optional title…" />
        </div>
      </div>

      <div style={{marginTop:16}}>
        <label>Tagline (shown on homepage list)</label>
        <input className="input" value={tagline} onChange={e=>setTagline(e.target.value)} placeholder="Optional tagline…" />
      </div>

      <div style={{marginTop:16, padding:16, border:'2px dashed #c7d2fe', borderRadius:8}}
           onDragOver={e=>e.preventDefault()} onDrop={onDrop}>
        <b>Drag & drop</b> your MP3 here, or <button className="btn" type="button" onClick={()=>inputRef.current?.click()}>Choose File</button>
        <input type="file" accept="audio/*" hidden ref={inputRef} onChange={e=> e.target.files?.[0] && doUpload(e.target.files[0])} />
        <div className="progress" style={{marginTop:12}}><span style={{width: uploadPct+'%'}} /></div>
        {filename && <div style={{marginTop:10}}><span className="badge">uploaded</span> {filename}</div>}
      </div>

      <div className="controls" style={{marginTop:16}}>
        <button className="btn" onClick={generateSpectral} disabled={busy}>Create Spectral Video</button>
        <button className="btn" onClick={generateShorts} disabled={busy}>Create Short</button>
      </div>

      <hr className="sep" />

      <p className="notice" style={{marginTop:10}}>Latest public posts appear on the homepage automatically (videos & audios from R2). The admin link is not shown on the homepage; access this page directly via <code>#/admin</code>.</p>
    </div>
  )
}
