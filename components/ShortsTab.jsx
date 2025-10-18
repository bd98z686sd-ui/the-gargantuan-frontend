import React,{useEffect,useState} from 'react'
const API_BASE = import.meta.env.VITE_API_BASE || 'https://the-gargantuan-backend.onrender.com'
export default function ShortsTab({token,toast}){
  const[posts,setPosts]=useState([]),[sel,setSel]=useState(''),[maxSeconds,setMax]=useState(45),[jobs,setJobs]=useState([])
  async function loadPosts(){const r=await fetch(`${API_BASE}/api/posts`); setPosts(await r.json())}
  async function loadJobs(){const r=await fetch(`${API_BASE}/api/shorts`); setJobs(await r.json())}
  useEffect(()=>{loadPosts(); loadJobs(); const t=setInterval(loadJobs,5000); return ()=>clearInterval(t)},[])
  async function enqueue(){ if(!sel) return toast?.show('Pick audio','error')
    const r=await fetch(`${API_BASE}/api/shorts/request`,{method:'POST',headers:{'Content-Type':'application/json','x-admin-token':token},body:JSON.stringify({filename:sel,maxSeconds})})
    if(!r.ok) return toast?.show('Queue failed','error'); toast?.show('Queued','ok'); loadJobs()
  }
  const aud=posts.filter(p=>p.type==='audio')
  return (<div className="bg-white border border-[#dcdcdc] rounded p-4 space-y-3">
    <h3 className="font-sans font-semibold">Generate Shorts</h3>
    <div className="flex flex-col sm:flex-row gap-3 items-center">
      <select value={sel} onChange={e=>setSel(e.target.value)} className="border border-[#dcdcdc] rounded px-3 py-2 text-sm flex-1">
        <option value="">Select an audio…</option>{aud.map(a=><option key={a.filename} value={a.filename}>{a.title||a.filename}</option>)}
      </select>
      <input type="number" min="10" max="60" value={maxSeconds} onChange={e=>setMax(Number(e.target.value)||45)} className="w-28 border border-[#dcdcdc] rounded px-3 py-2 text-sm"/>
      <button onClick={enqueue} className="px-4 py-2 bg-[#052962] text-white rounded text-sm font-semibold">Generate</button>
    </div>
    <div className="pt-2"><h4 className="font-sans font-semibold mb-2">Completed</h4>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{jobs.map(j=>(<div key={j.id} className="border border-[#eee] rounded p-3">
        <div className="text-xs break-all mb-2">{j.source}</div>{j.url?<video className="w-full aspect-[9/16]" src={j.url} controls/>:<div className="aspect-[9/16] bg-[#eee]"/>}{j.url&&<a className="text-sm underline mt-2 inline-block" href={j.url} target="_blank">Open</a>}</div>))}</div>
    </div></div>)
}