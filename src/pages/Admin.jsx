import React, { useState } from 'react'
const API = import.meta.env.VITE_API_BASE || ''

export default function Admin(){
  const [token, setToken] = useState(localStorage.getItem('adminToken')||'')
  const [file, setFile] = useState(null)
  const [lastKey, setLastKey] = useState('')
  const [log, setLog] = useState('')

  function saveToken(v){ setToken(v); localStorage.setItem('adminToken', v) }

  async function doUpload(){
    if(!file) return
    const fd = new FormData(); fd.append('audio', file)
    const res = await fetch(API+'/api/upload', { method:'POST', headers:{ 'x-admin-token': token }, body: fd })
    if(!res.ok){ setLog('Upload failed'); return }
    const j = await res.json()
    setLastKey(j.key||j.filename||''); setLog('Uploaded: '+(j.key||j.filename||''))
  }

  async function createVideo(){
    if(!lastKey){ setLog('No uploaded key'); return }
    const res = await fetch(API+'/api/generate-video', { method:'POST', headers:{ 'Content-Type':'application/json', 'x-admin-token': token }, body: JSON.stringify({ filename:lastKey }) })
    const j = await res.json(); setLog('Video: '+JSON.stringify(j))
  }

  async function createShort(){
    if(!lastKey){ setLog('No uploaded key'); return }
    const res = await fetch(API+'/api/shorts/request', { method:'POST', headers:{ 'Content-Type':'application/json', 'x-admin-token': token }, body: JSON.stringify({ filename:lastKey }) })
    const j = await res.json(); setLog('Short: '+JSON.stringify(j))
  }

  return (
    <div className="container">
      <h2 className="sectionH">Admin</h2>
      <div className="meta">Token</div>
      <input value={token} onChange={e=>saveToken(e.target.value)} placeholder="paste token" style={{padding:8,width:'100%',maxWidth:420}}/>
      <div className="meta" style={{marginTop:12}}>Upload audio</div>
      <input type="file" accept="audio/*,video/*" onChange={e=> setFile(e.target.files?.[0]||null)} />
      <div className="controls">
        <a className="btn" onClick={doUpload}>Upload</a>
        <a className="btn" onClick={createVideo}>Create Spectral Video</a>
        <a className="btn" onClick={createShort}>Create Short</a>
      </div>
      {lastKey && <div className="meta" style={{marginTop:8}}>Last key: {lastKey}</div>}
      {log && <div className="meta" style={{marginTop:8}}>{log}</div>}
    </div>
  )
}
