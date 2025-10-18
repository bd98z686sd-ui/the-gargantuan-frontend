import React,{useEffect,useRef,useState}from'react'
const API = import.meta.env.VITE_API_BASE || ''

export default function Admin(){
  const [token,setToken]=useState(localStorage.getItem('adminToken')||'')
  const [authed,setAuthed]=useState(!!localStorage.getItem('adminToken'))
  const [progress,setProgress]=useState(0)
  const [filename,setFilename]=useState('')
  const [logs,setLogs]=useState([])
  const [items,setItems]=useState([])
  const [filter,setFilter]=useState('active')
  const dropRef=useRef(null)

  function log(s){ setLogs(l=>[s,...l]) }
  const headers = ()=> ({ 'x-admin-token': token })

  const refresh = async()=>{
    try{
      const url = API + '/api/posts' + (filter==='all' ? '?includeDeleted=1' : filter==='deleted' ? '?deleted=1' : '')
      const res = await fetch(url, { headers: headers() })
      const arr = await res.json()
      const sorted = [...(arr||[])].sort((a,b)=> (new Date(b.createdAt||0))-(new Date(a.createdAt||0)))
      setItems(sorted)
    }catch(e){ log('Load failed: '+e) }
  }

  useEffect(()=>{ if(authed) refresh() },[authed,filter])

  useEffect(()=>{
    const z=dropRef.current;if(!z)return
    const stop=e=>{e.preventDefault();e.stopPropagation()}
    const onDrop=e=>{stop(e);const f=e.dataTransfer.files?.[0];if(f)uploadFile(f)}
    z.addEventListener('dragover',stop);z.addEventListener('drop',onDrop)
    return()=>{z.removeEventListener('dragover',stop);z.removeEventListener('drop',onDrop)}
  },[])

  const saveToken=()=>{localStorage.setItem('adminToken',token);setAuthed(!!token)}

  async function uploadFile(file){
    setProgress(0); setFilename('')
    const form=new FormData(); form.append('audio',file)
    log('Uploading '+file.name+' …')
    const xhr = new XMLHttpRequest()
    xhr.open('POST', API + '/api/upload')
    xhr.setRequestHeader('x-admin-token', token)
    xhr.upload.onprogress = (e)=>{
      if(e.lengthComputable){ setProgress(Math.round((e.loaded/e.total)*100)) }
    }
    xhr.onload = ()=>{
      if(xhr.status>=200 && xhr.status<300){
        const data = JSON.parse(xhr.responseText||'{}')
        setFilename(data.filename||'')
        log('Uploaded as '+(data.filename||''))
        setProgress(100); refresh()
      } else {
        log('Upload failed: ' + xhr.status)
      }
    }
    xhr.onerror = ()=> log('Upload error')
    xhr.send(form)
  }

  async function request(kind){
    if(!filename){ log('No file uploaded'); return }
    const url = kind==='short' ? '/api/generate-short' : '/api/generate-video'
    const res = await fetch(API+url, {
      method:'POST', headers:{...headers(), 'Content-Type':'application/json'},
      body: JSON.stringify({ filename, title:'The Gargantuan'})
    })
    const data = await res.json().catch(()=>({}))
    log(kind+' → '+JSON.stringify(data))
  }

  async function del(id){
    let ok=false
    try{
      const r1 = await fetch(API+'/api/posts/'+id, { method:'DELETE', headers: headers() })
      ok = r1.ok
      if(!ok){
        const r2 = await fetch(API+'/api/posts/'+id+'/delete', { method:'POST', headers: headers() })
        ok = r2.ok
      }
    }catch{}
    if(!ok) log('Delete failed'); else { log('Deleted '+id); refresh() }
  }

  async function restore(id){
    const r = await fetch(API+'/api/posts/'+id+'/restore', { method:'POST', headers: headers() })
    if(!r.ok) log('Restore failed'); else { log('Restored '+id); refresh() }
  }

  async function saveTitle(id,title){
    let ok=false
    try{
      const r1 = await fetch(API+'/api/posts/'+id, { method:'PATCH', headers:{...headers(),'Content-Type':'application/json'}, body: JSON.stringify({ title }) })
      ok = r1.ok
      if(!ok){
        const r2 = await fetch(API+'/api/posts/'+id+'/title', { method:'POST', headers:{...headers(),'Content-Type':'application/json'}, body: JSON.stringify({ title }) })
        ok = r2.ok
      }
    }catch{}
    if(!ok) log('Save title failed'); else { log('Saved title'); refresh() }
  }

  if(!authed){
    return(<div className="container" style={{paddingBottom:'60px'}}>
      <header className="mast"><div className="mwrap"><div className="brand">The Gargantuan — Admin</div><div className="redbar"></div></div></header>
      <main className="container">
        <h2 className="title" style={{fontSize:28}}>Admin access</h2>
        <input className="token" value={token} onChange={e=>setToken(e.target.value)} placeholder="Enter admin token" />
        <div className="row"><button className="btn" onClick={saveToken}>Save</button></div>
        <p className="small">Token is stored locally and sent as <code class="inline">x-admin-token</code>.</p>
      </main>
      <footer className="footer">© {new Date().getFullYear()} The Gargantuan</footer>
    </div>)
  }

  return(<div style={{paddingBottom:'60px'}}>
    <header className="mast"><div className="mwrap"><div className="brand">The Gargantuan — Admin</div><div className="redbar"></div></div></header>

    <main className="container">
      <div className="card">
        <h2 className="title" style={{fontSize:28,marginTop:0}}>Upload audio</h2>
        <div ref={dropRef} className="zone">Drag & drop MP3/M4A here, or <input type="file" accept="audio/*" onChange={e=>e.target.files[0]&&uploadFile(e.target.files[0])} /></div>
        <div className="row">
          <div className="progress"><div style={{width:progress+'%'}}></div></div>
          {filename && <span className="small">Saved as <code className="inline">{filename}</code></span>}
        </div>
        <div className="row">
          <button className="btn" onClick={()=>request('video')}>Create Video</button>
          <button className="btn secondary" onClick={()=>request('short')}>Create Short</button>
          <button className="btn secondary" onClick={refresh}>Refresh</button>
        </div>
      </div>

      <div className="card">
        <h3 className="title" style={{fontSize:22,marginTop:0}}>All posts</h3>
        <div className="row">
          <label className="small">Filter: </label>
          <select className="input" style={{maxWidth:160}} value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="active">Active</option>
            <option value="deleted">Deleted</option>
            <option value="all">All</option>
          </select>
          <button className="btn secondary" onClick={refresh}>Reload</button>
        </div>
        <table className="table">
          <thead><tr><th>Title</th><th>Media</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map(p=>{
              const id = p.id || p._id || p.key || p.filename
              const deleted = !!p.deleted
              const media = p.videoUrl || p.url || p.audioUrl || p.filename
              const date = p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'}) : ''
              return (<tr key={id}>
                <td>
                  <input className="input" defaultValue={p.title||p.filename} onBlur={e=>saveTitle(id,e.target.value)} />
                </td>
                <td className="small" title={media}>{(media||'').toString().slice(0,38)}…</td>
                <td className="small">{date}</td>
                <td>{deleted ? <span className="badge">deleted</span> : <span className="badge" style={{background:'#e3f7e5'}}>active</span>}</td>
                <td>
                  {!deleted ? <button className="btn secondary" onClick={()=>del(id)}>Delete</button>
                            : <button className="btn" onClick={()=>restore(id)}>Restore</button>}
                </td>
              </tr>)
            })}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 className="title" style={{fontSize:22,marginTop:0}}>Logs</h3>
        <div className="small">{logs.map((l,i)=>(<div key={i}>{l}</div>))}</div>
      </div>
    </main>

    <footer className="footer">
      © {new Date().getFullYear()} The Gargantuan · Contact: <a href="mailto:hellogargantuan69@gmail.com" style={{color:'#fff'}}>hellogargantuan69@gmail.com</a>
    </footer>
  </div>)
}
