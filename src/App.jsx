import React, { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || ''

// Hash router: '#/' home, '#/admin'
function useHashPath(){
  const get = () => (window.location.hash || '#/').replace(/^#/, '') || '/'
  const [path, setPath] = useState(get())
  useEffect(()=>{
    const onHash = () => setPath(get())
    window.addEventListener('hashchange', onHash)
    if(!window.location.hash) window.location.hash = '#/'
    return ()=>window.removeEventListener('hashchange', onHash)
  },[])
  const nav = (to) => { window.location.hash = to.startsWith('#') ? to : ('#'+to.replace(/^#/,'')) }
  return [path, nav]
}

function Masthead(){
  return (
    <div className="mast">
      <div className="brand">The Gargantuan</div>
      <div className="tagline">Daily audio, spectral video & shorts — latest first</div>
    </div>
  )
}

function Footer(){
  return (
    <div className="footer">
      <div className="container">
        <div>© 2025 The Gargantuan</div>
        <div>Contact: <a href="mailto:hellogargantuan69@gmail.com">hellogargantuan69@gmail.com</a></div>
      </div>
    </div>
  )
}

function Card({post, className}){
  const d = new Date(post.createdAt||Date.now())
  const date = d.toLocaleDateString(undefined,{year:'numeric', month:'short', day:'numeric'})
  return (
    <article className={`card ${className||''}`}>
      <div className="meta">{date} <span className="badge">{post.tagline || 'Audio blog'}</span></div>
      <h2>{post.title || post.filename}</h2>
      {post.videoUrl ? (
        <video controls preload="metadata" src={post.videoUrl}></video>
      ) : post.audioUrl ? (
        <audio controls preload="metadata" src={post.audioUrl}></audio>
      ) : null}
    </article>
  )
}

function layout(posts){
  if(posts.length===0) return []
  const arr = []
  posts.forEach((p, i)=>{
    if(i===0) arr.push({ post:p, span:'span-12' })
    else if(i===1) arr.push({ post:p, span:'span-6'})
    else if(i===2) arr.push({ post:p, span:'span-6 right'})
    else arr.push({ post:p, span:'span-4' })
  })
  return arr
}

function Home(){
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let cancelled = false
    async function run(){
      try{
        const r = await fetch(`${API_BASE}/api/posts`)
        const list = r.ok ? await r.json() : []
        if(!cancelled){
          setPosts(Array.isArray(list) && list.length ? list : demoPosts())
        }
      }catch{
        if(!cancelled) setPosts(demoPosts())
      }finally{
        if(!cancelled) setLoading(false)
      }
    }
    run()
    return ()=>{ cancelled = true }
  },[])

  const laid = useMemo(()=>layout(posts), [posts])

  return (
    <div className="container" style={{paddingBottom: '70px'}}>
      <div className="grid">
        {laid.map(({post, span}, idx)=>(
          <Card key={post.id||post.filename||idx} post={post} className={span} />
        ))}
      </div>
    </div>
  )
}

function demoPosts(){
  const base = 'https://files.catbox.moe/1t3t2y.mp4'
  const now = Date.now()
  return [
    { id:'d1', title:'A noisy morning; a quiet resolve', videoUrl:base, createdAt: now },
    { id:'d2', title:'On headlines, harmony, and hum', audioUrl:'', createdAt: now-1e6 },
    { id:'d3', title:'Mustard skies over a blue city', audioUrl:'', createdAt: now-2e6 },
    { id:'d4', title:'Reading the news to a beat', audioUrl:'', createdAt: now-3e6 },
    { id:'d5', title:'Micro-rants & macro-grooves', audioUrl:'', createdAt: now-4e6 },
    { id:'d6', title:'A brief intermission (looping)', audioUrl:'', createdAt: now-5e6 },
  ]
}

/* ---------------- ADMIN ---------------- */
function Admin({ nav }){
  const [token, setToken] = useState(localStorage.getItem('tg_admin_token')||'')
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [busy, setBusy] = useState(false)
  const [list, setList] = useState([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('active')

  useEffect(()=>{ refresh() }, [filter, query])

  function onDrop(e){
    e.preventDefault()
    if(e.dataTransfer.files && e.dataTransfer.files[0]){
      setFile(e.dataTransfer.files[0])
    }
  }

  function saveToken(){
    localStorage.setItem('tg_admin_token', token)
    alert('Token saved')
  }

  async function refresh(){
    let url = `${API_BASE}/api/posts`
    const qs = new URLSearchParams()
    if(filter==='deleted') qs.set('deleted','1')
    if(filter==='all') qs.set('includeDeleted','1')
    if(query) qs.set('q',query)
    if([...qs.keys()].length) url += `?${qs}`
    const r = await fetch(url)
    const data = r.ok ? await r.json() : []
    setList(data)
  }

  async function upload(){
    if(!file) return
    setBusy(true); setProgress(0)
    try{
      const fd = new FormData()
      fd.append('audio', file)
      const r = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: { 'x-admin-token': token },
        body: fd,
      })
      if(!r.ok) throw new Error(await r.text())
      await r.json()
      setFile(null)
      await refresh()
    }catch(e){ alert('Upload failed: '+e.message) }
    finally{ setBusy(false); setProgress(0) }
  }

  async function gen(kind, filename){
    const url = `${API_BASE}/api/generate-${kind}`
    const r = await fetch(url, {
      method:'POST',
      headers:{
        'x-admin-token': token,
        'Content-Type':'application/json'
      },
      body: JSON.stringify({ filename })
    })
    if(!r.ok){
      const t = await r.text()
      alert(kind+' failed: '+t)
    } else {
      await refresh()
    }
  }

  async function rename(id){
    const title = prompt('New title:')
    if(!title) return
    const r = await fetch(`${API_BASE}/api/posts/${encodeURIComponent(id)}`, {
      method:'PATCH',
      headers:{ 'x-admin-token': token, 'Content-Type':'application/json' },
      body: JSON.stringify({ title })
    })
    if(!r.ok){
      await fetch(`${API_BASE}/api/posts/${encodeURIComponent(id)}/title`, {
        method:'POST', headers:{ 'x-admin-token': token, 'Content-Type':'application/json' }, body: JSON.stringify({ title })
      })
    }
    await refresh()
  }

  async function del(id){
    const r = await fetch(`${API_BASE}/api/posts/${encodeURIComponent(id)}`, {
      method:'DELETE', headers:{ 'x-admin-token': token }
    })
    if(!r.ok){
      await fetch(`${API_BASE}/api/posts/${encodeURIComponent(id)}/delete`, {
        method:'POST', headers:{ 'x-admin-token': token }
      })
    }
    await refresh()
  }
  async function restore(id){
    await fetch(`${API_BASE}/api/posts/${encodeURIComponent(id)}/restore`, {
      method:'POST', headers:{ 'x-admin-token': token }
    })
    await refresh()
  }

  return (
    <div className="admin" style={{paddingBottom:'80px'}} onDragOver={(e)=>e.preventDefault()} onDrop={onDrop}>
      <div className="section">
        <h3>Auth</h3>
        <div className="body row">
          <input type="text" placeholder="Admin token" value={token} onChange={e=>setToken(e.target.value)} />
          <button onClick={saveToken}>Save</button>
          <a href="#/"><button className="secondary">← Back to Home</button></a>
        </div>
      </div>

      <div className="section">
        <h3>Upload Audio</h3>
        <div className="body">
          <div className="row">
            <input type="file" accept="audio/*" onChange={e=>setFile(e.target.files?.[0]||null)} />
            <button onClick={upload} disabled={!file || busy}>Upload</button>
            {file && <span className="badge">{file.name}</span>}
          </div>
          <div className="progress" style={{marginTop:10}}><span style={{width: `${progress}%`}}></span></div>
          <div style={{fontSize:12, color:'#666', marginTop:8}}>Drag & drop supported</div>
        </div>
      </div>

      <div className="section">
        <h3>Posts</h3>
        <div className="body">
          <div className="row" style={{marginBottom:10}}>
            <input type="search" placeholder="Search..." value={query} onChange={e=>setQuery(e.target.value)} />
            <button className={filter==='active'?'':'secondary'} onClick={()=>setFilter('active')}>Active</button>
            <button className={filter==='deleted'?'':'secondary'} onClick={()=>setFilter('deleted')}>Deleted</button>
            <button className={filter==='all'?'':'secondary'} onClick={()=>setFilter('all')}>All</button>
          </div>
          <table className="table">
            <thead>
              <tr><th>Title</th><th className="hide-mobile">Filename</th><th>Media</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {list.map(p=>(
                <tr key={p.id||p.filename}>
                  <td>{p.title||p.filename}</td>
                  <td className="hide-mobile" title={p.filename}>{p.filename}</td>
                  <td>
                    {p.videoUrl ? <span className="badge">video</span> : p.audioUrl ? <span className="badge">audio</span> : '-'}
                    {p.shortUrl ? <span className="badge">short</span> : null}
                  </td>
                  <td>
                    <button onClick={()=>gen('video', p.id||p.filename)}>Create Video</button>{' '}
                    <button className="secondary" onClick={()=>gen('short', p.id||p.filename)}>Create Short</button>{' '}
                    <button className="yellow" onClick={()=>rename(p.id||p.filename)}>Rename</button>{' '}
                    {p.deleted ? (
                      <button onClick={()=>restore(p.id||p.filename)}>Restore</button>
                    ) : (
                      <button className="red" onClick={()=>del(p.id||p.filename)}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function App(){
  const [path] = useHashPath()
  useEffect(()=>{
    document.title = (path === '/admin') ? 'Admin · The Gargantuan' : 'The Gargantuan'
  },[path])
  return (
    <>
      <Masthead />
      {path === '/admin' ? <Admin /> : <Home />}
      <Footer />
    </>
  )
}

export default App
