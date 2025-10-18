import React,{useEffect,useRef,useState}from'react'
const API = import.meta.env.VITE_API_BASE || ''

export default function Admin(){
  const [token,setToken]=useState(localStorage.getItem('adminToken')||'')
  const [valid,setValid]=useState(!!token)
  const [progress,setProgress]=useState(0)
  const [filename,setFilename]=useState('')
  const [logs,setLogs]=useState([])
  const dropRef=useRef(null)

  function log(s){ setLogs(l=>[s,...l]) }

  useEffect(()=>{
    const z = dropRef.current
    if(!z) return
    const stop=e=>{e.preventDefault();e.stopPropagation()}
    const onDrop = e=>{
      stop(e)
      const f = e.dataTransfer.files?.[0]
      if(f) uploadFile(f)
    }
    z.addEventListener('dragover',stop)
    z.addEventListener('drop',onDrop)
    return ()=>{
      z.removeEventListener('dragover',stop)
      z.removeEventListener('drop',onDrop)
    }
  },[])

  const saveToken = ()=>{
    localStorage.setItem('adminToken',token)
    setValid(!!token)
  }

  async function uploadFile(file){
    setProgress(0); setFilename('')
    const form = new FormData()
    form.append('audio', file)
    log('Uploading ' + file.name + ' …')
    const res = await fetch(API + '/api/upload', { method:'POST', body: form, headers: {'x-admin-token': token }})
    if(!res.ok){ log('Upload failed'); return }
    const data = await res.json()
    setFilename(data.filename||'')
    setProgress(100)
    log('Uploaded as ' + data.filename)
  }

  async function generate(kind){
    if(!filename){ log('No file uploaded'); return }
    const url = kind==='short' ? '/api/generate-short' : '/api/generate-video'
    log('Requesting ' + kind + ' …')
    const res = await fetch(API + url, {
      method:'POST',
      headers:{'Content-Type':'application/json','x-admin-token':token},
      body: JSON.stringify({ filename, title: 'The Gargantuan'})
    })
    const data = await res.json().catch(()=>({}))
    log(kind + ' → ' + JSON.stringify(data))
  }

  if(!valid){
    return(<div className="container" style={{paddingBottom:'60px'}}>
      <header className="mast">
        <div className="mwrap"><div className="brand">The Gargantuan — Admin</div><div className="redbar"></div></div>
      </header>
      <main className="container">
        <h2 className="title" style={{fontSize:28}}>Admin access</h2>
        <input className="token" value={token} onChange={e=>setToken(e.target.value)} placeholder="Enter admin token" />
        <div className="row"><button className="btn" onClick={saveToken}>Save</button></div>
        <p className="small">The token will be stored in your browser only (localStorage) and sent as <code class="inline">x-admin-token</code> header.</p>
      </main>
      <footer className="footer">© {new Date().getFullYear()} The Gargantuan</footer>
    </div>)
  }

  return(<div style={{paddingBottom:'60px'}}>
    <header className="mast">
      <div className="mwrap"><div className="brand">The Gargantuan — Admin</div><div className="redbar"></div></div>
    </header>

    <main className="container">
      <div className="card">
        <h2 className="title" style={{fontSize:28,marginTop:0}}>Upload audio</h2>
        <div ref={dropRef} className="zone">Drag & drop MP3/M4A here, or <input type="file" accept="audio/*" onChange={e=>e.target.files[0]&&uploadFile(e.target.files[0])} /></div>
        <div className="row">
          <div className="progress"><div style={{width:progress+'%'}}></div></div>
          {filename && <span className="small">Saved as <code className="inline">{filename}</code></span>}
        </div>
        <div className="row">
          <button className="btn" onClick={()=>generate('video')}>Create Video</button>
          <button className="btn secondary" onClick={()=>generate('short')}>Create Short</button>
        </div>
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
