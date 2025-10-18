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
  const [search,setSearch]=useState('')
  const dropRef=useRef(null)

  function log(s){ setLogs(l=>[s,...l]) }
  const headers = ()=> ({ 'x-admin-token': token })

  const refresh = async()=>{
    try{
      const qs = new URLSearchParams()
      if(filter==='deleted') qs.set('deleted','1')
      if(filter==='all') qs.set('includeDeleted','1')
      if(search.trim()) qs.set('q',search.trim())
      const res = await fetch(`${API}/api/posts${qs.toString()?`?${qs.toString()}`:''}`, { headers: headers() })
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

  async function request(kind, fileOverride){
    const target = fileOverride || filename
    if(!target){ log('No file to process'); return }
    const url = kind==='short' ? '/api/generate-short' : '/api/generate-video'
    const res = await fetch(API+url, {
      method:'POST', headers:{...headers(), 'Content-Type':'application/json'},
      body: JSON.stringify({ filename: target, title:'The Gargantuan'})
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

  return(<div className="min-h-screen bg-[#f6f6f6] pb-20">
    <header className="sticky top-0 z-50 bg-[#052962] text-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-3 sm:py-4 border-b-4 border-[#c70000]">
          <h1 className="brand-tt text-4xl sm:text-5xl tracking-tight">The Gargantuan — Admin</h1>
        </div>
      </div>
    </header>

    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-1 bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="headline-tt text-xl mb-3">Upload audio</h2>
          <div ref={dropRef} className="border-2 border-dashed rounded-lg p-5 text-center text-gray-600">
            Drag & drop MP3/M4A here, or{" "}
            <input type="file" accept="audio/*" onChange={e=>e.target.files[0]&&uploadFile(e.target.files[0])} />
          </div>
          <div className="mt-3">
            <div className="w-full max-w-md h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-2 bg-[#c70000]" style={{width:progress+'%'}}></div>
            </div>
            {filename && <div className="text-xs text-gray-600 mt-1">Saved as <code className="bg-gray-100 rounded px-1">{filename}</code></div>}
          </div>
          <div className="mt-3 flex gap-2">
            <button className="bg-[#052962] text-white px-3 py-2 rounded" onClick={()=>request('video')}>Create Video</button>
            <button className="bg-gray-100 px-3 py-2 rounded border" onClick={()=>request('short')}>Create Short</button>
          </div>
        </section>

        <section className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <h2 className="headline-tt text-xl mr-auto">All posts</h2>
            <select className="border rounded px-2 py-1" value={filter} onChange={e=>setFilter(e.target.value)}>
              <option value="active">Active</option>
              <option value="deleted">Deleted</option>
              <option value="all">All</option>
            </select>
            <input className="border rounded px-2 py-1" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} />
            <button className="bg-gray-100 px-3 py-2 rounded border" onClick={refresh}>Reload</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead><tr className="text-left border-b">
                <th className="py-2 pr-3">Title</th>
                <th className="py-2 pr-3">Media</th>
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2">Actions</th>
              </tr></thead>
              <tbody>
                {items.map(p=>{
                  const id = p.id || p._id || p.key || p.filename
                  const deleted = !!p.deleted
                  const media = p.videoUrl || p.url || p.audioUrl || p.filename
                  const date = p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'}) : ''
                  return (<tr key={id} className="border-b">
                    <td className="py-2 pr-3"><input className="border rounded px-2 py-1 w-full" defaultValue={p.title||p.filename} onBlur={e=>saveTitle(id,e.target.value)} /></td>
                    <td className="py-2 pr-3 text-gray-600" title={media}>{(media||'').toString().slice(0,40)}…</td>
                    <td className="py-2 pr-3">{date}</td>
                    <td className="py-2 pr-3">{deleted ? <span className="bg-gray-100 rounded-full px-2 py-0.5">deleted</span> : <span className="bg-green-50 border border-green-200 rounded-full px-2 py-0.5">active</span>}</td>
                    <td className="py-2 pr-3 flex gap-2">
                      {!deleted ? <button className="bg-gray-100 px-2 py-1 rounded border" onClick={()=>del(id)}>Delete</button>
                                : <button className="bg-[#052962] text-white px-2 py-1 rounded" onClick={()=>restore(id)}>Restore</button>}
                      <button className="bg-gray-100 px-2 py-1 rounded border" onClick={()=>request('video', p.filename)}>Regen Video</button>
                      <button className="bg-gray-100 px-2 py-1 rounded border" onClick={()=>request('short', p.filename)}>Regen Short</button>
                    </td>
                  </tr>)
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Activity</h3>
        <ul className="text-xs text-gray-700 space-y-1">
          {logs.map((l,i)=>(<li key={i}>{l}</li>))}
        </ul>
      </div>
    </main>

    <footer className="fixed bottom-0 left-0 right-0 bg-[#052962] text-white text-sm text-center py-3 px-4">
      © {new Date().getFullYear()} The Gargantuan · Contact: <a href="mailto:hellogargantuan69@gmail.com" className="underline">hellogargantuan69@gmail.com</a>
    </footer>
  </div>)
}
