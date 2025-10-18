import React,{useEffect,useMemo,useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useAdminToken} from '../useAdminToken.js'
import Uploader from '../components/Uploader.jsx'
import ShortsTab from '../components/ShortsTab.jsx'

const API_BASE=import.meta.env.VITE_API_BASE||'https://the-gargantuan-backend.onrender.com'

function ToolbarTab({id,label,active,onClick}){
  return <button onClick={()=>onClick(id)} className={`px-4 py-2 rounded-t ${active?'bg-white text-[#052962] border border-b-0':'bg-[#e9eef6] text-[#052962]/80'}`}>{label}</button>
}

function PostsPanel({token}){
  const[posts,setPosts]=useState([])
  const[editing,setEditing]=useState(null)
  const[title,setTitle]=useState(''); const[tagline,setTagline]=useState('')
  const[query,setQuery]=useState('')
  const[checked,setChecked]=useState({})

  async function load(){const r=await fetch(`${API_BASE}/api/posts`); const j=await r.json(); setPosts(Array.isArray(j)?j:[])}
  useEffect(()=>{load()},[])

  const filtered=useMemo(()=>{
    if(!query) return posts
    const q=query.toLowerCase()
    return posts.filter(p=>(p.title||p.filename).toLowerCase().includes(q))
  },[posts,query])

  function toggleAll(e){const m={}; if(e.target.checked) filtered.forEach(p=>m[p.filename]=true); setChecked(m)}
  function toggleOne(fn){setChecked(s=>({...s,[fn]:!s[fn]}))}
  const selected=Object.keys(checked).filter(k=>checked[k])

  async function softDeleteMany(){ if(!selected.length) return
    await fetch(`${API_BASE}/api/soft-delete`,{method:'POST',headers:{'Content-Type':'application/json','x-admin-token':token},body:JSON.stringify({filenames:selected})})
    setChecked({}); load()
  }
  async function restoreMany(){ if(!selected.length) return
    await fetch(`${API_BASE}/api/restore`,{method:'POST',headers:{'Content-Type':'application/json','x-admin-token':token},body:JSON.stringify({filenames:selected})})
    setChecked({}); load()
  }
  async function saveMeta(){ if(!editing) return
    await fetch(`${API_BASE}/api/meta`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({filename:editing,title,tagline})})
    setEditing(null); load()
  }

  return (<div className="bg-white border border-[#dcdcdc] rounded-b p-4">
    <div className="flex items-center justify-between gap-3 mb-3">
      <input placeholder="Filter…" value={query} onChange={e=>setQuery(e.target.value)} className="border border-[#dcdcdc] rounded px-3 py-2 text-sm w-full"/>
      <button onClick={load} className="px-3 py-2 text-sm underline text-[#052962]">Refresh</button>
    </div>
    <div className="flex items-center gap-3 mb-2">
      <label className="text-sm"><input type="checkbox" onChange={toggleAll}/> Select all (filtered)</label>
      <button onClick={softDeleteMany} className="px-3 py-1.5 bg-[#052962] text-white rounded text-sm disabled:opacity-50" disabled={!selected.length}>Trash</button>
      <button onClick={restoreMany} className="px-3 py-1.5 bg-[#2b7a0b] text-white rounded text-sm disabled:opacity-50" disabled={!selected.length}>Restore</button>
    </div>
    <ul className="divide-y divide-[#eee]">
      {filtered.map(p=>(<li key={p.filename} className="py-3 flex items-center justify-between gap-3">
        <label className="flex items-center gap-3 min-w-0">
          <input type="checkbox" checked={!!checked[p.filename]} onChange={()=>toggleOne(p.filename)}/>
          <div className="min-w-0">
            <p className="font-medium truncate">{p.title||p.filename.split('/').pop()}</p>
            <p className="text-xs text-[#666]">{p.type} • {p.tagline||''}</p>
          </div>
        </label>
        <div className="flex gap-3 items-center shrink-0">
          <a href={p.absoluteUrl||p.url} target="_blank" className="text-sm underline text-[#052962]">Open</a>
          {p.type==='audio' && <button onClick={async()=>{await fetch((import.meta.env.VITE_API_BASE||'https://the-gargantuan-backend.onrender.com')+'/api/generate-video',{method:'POST',headers:{'Content-Type':'application/json','x-admin-token':token},body:JSON.stringify({filename:p.filename,title:p.title||''})}); load();}} className="text-sm underline text-[#052962]">Make Video</button>}
          <button onClick={()=>{setEditing(p.filename); setTitle(p.title||''); setTagline(p.tagline||'')}} className="text-sm underline text-[#052962]">Edit</button>
        </div>
      </li>))}
    </ul>
    {editing&&(<div className="border-t border-[#ccc] pt-3 mt-3">
      <h4 className="font-sans font-semibold mb-2">Edit metadata</h4>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="block border border-[#ccc] rounded px-2 py-1 mb-2 w-full"/>
      <input value={tagline} onChange={e=>setTagline(e.target.value)} placeholder="Tagline" className="block border border-[#ccc] rounded px-2 py-1 mb-2 w-full"/>
      <button onClick={saveMeta} className="px-4 py-2 bg-[#052962] text-white rounded text-sm">Save</button>
    </div>)}
  </div>)
}

export default function Admin(){
  const{token,setToken}=useAdminToken()
  const[view,setView]=useState('upload')
  const[show,setShow]=useState(!!token)
  const nav=useNavigate()

  return (<div className="min-h-screen bg-[#f6f6f6] text-[#121212]">
    <header className="bg-[#052962] text-white">
      <div className="max-w-6xl mx-auto px-4 py-4 border-b-4 border-[#c70000]">
        <h1 className="font-serif italic font-extrabold text-3xl">The Gargantuan — Admin</h1>
      </div>
    </header>

    <main className="max-w-6xl mx-auto px-4 py-6">
      {!show?(
        <div className="bg-white border border-[#dcdcdc] rounded p-4">
          <h3 className="font-sans font-semibold mb-2">Enter admin token</h3>
          <div className="flex gap-3">
            <input type="password" value={token} onChange={e=>setToken(e.target.value)} placeholder="Admin token" className="flex-1 border border-[#dcdcdc] rounded px-3 py-2 text-sm"/>
            <button className="px-4 py-2 bg-[#052962] text-white rounded text-sm font-semibold" onClick={()=>setShow(true)}>Continue</button>
          </div>
          <button className="mt-3 text-sm underline text-[#052962]" onClick={()=>nav('/')}>← Back to site</button>
        </div>
      ):(
        <>
          <div className="flex gap-1">
            <ToolbarTab id="upload" label="Upload" active={view==='upload'} onClick={setView}/>
            <ToolbarTab id="manage" label="Manage" active={view==='manage'} onClick={setView}/>
            <ToolbarTab id="shorts" label="Shorts" active={view==='shorts'} onClick={setView}/>
          </div>
          {view==='upload' && <div className="bg-white border border-[#dcdcdc] rounded-b p-4"><Uploader token={token} onUploaded={()=>{}}/></div>}
          {view==='manage' && <PostsPanel token={token}/>}
          {view==='shorts' && <div className="bg-white border border-[#dcdcdc] rounded-b p-4"><ShortsTab token={token}/></div>}
          <div className="mt-6"><button className="text-sm underline text-[#052962]" onClick={()=>nav('/')}>← Back to site</button></div>
        </>
      )}
    </main>
  </div>)
}