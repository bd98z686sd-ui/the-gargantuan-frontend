import React,{useEffect,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAdminToken} from '../useAdminToken.js';
const API_BASE=import.meta.env.VITE_API_BASE||'https://the-gargantuan-backend.onrender.com';
function PostsPanel(){
  const[posts,setPosts]=useState([]);
  const[editing,setEditing]=useState(null);
  const[title,setTitle]=useState('');
  const[tagline,setTagline]=useState('');
  async function load(){try{const r=await fetch(`${API_BASE}/api/posts`);const j=await r.json();setPosts(Array.isArray(j)?j:[]);}catch{setPosts([]);}}
  async function saveMeta(){if(!editing)return;await fetch(`${API_BASE}/api/meta`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({filename:editing,title,tagline})});setEditing(null);load();}
  useEffect(()=>{load();},[]);
  return(<div className='bg-white border border-[#dcdcdc] rounded p-4 space-y-2'>
    <div className='flex items-center justify-between'><h3 className='font-headline text-xl'>Posts</h3><button onClick={load} className='text-sm underline text-[#052962]'>Refresh</button></div>
    {posts.length===0&&<p className='text-sm text-[#666]'>No posts yet.</p>}
    <ul className='divide-y divide-[#eee]'>
      {posts.map(p=>(<li key={p.filename} className='py-3 flex items-center justify-between'>
        <div className='min-w-0'><p className='font-medium truncate'>{p.title||p.filename.split('/').pop()}</p><p className='text-xs text-[#666]'>{p.type} • {p.tagline||''}</p></div>
        <div className='flex gap-3 items-center'><a href={p.absoluteUrl||p.url} target='_blank' className='text-sm underline text-[#052962]'>Open</a><button onClick={()=>{setEditing(p.filename);setTitle(p.title||'');setTagline(p.tagline||'');}} className='text-sm underline text-[#052962]'>Edit</button></div>
      </li>))}
    </ul>
    {editing&&(<div className='border-t border-[#ccc] pt-3'><h4 className='font-semibold mb-2'>Edit metadata</h4><input value={title} onChange={e=>setTitle(e.target.value)} placeholder='Title' className='block border border-[#ccc] rounded px-2 py-1 mb-2 w-full'/><input value={tagline} onChange={e=>setTagline(e.target.value)} placeholder='Tagline' className='block border border-[#ccc] rounded px-2 py-1 mb-2 w-full'/><button onClick={saveMeta} className='px-4 py-2 bg-[#052962] text-white rounded text-sm'>Save</button><button onClick={()=>setEditing(null)} className='ml-3 text-sm underline text-[#052962]'>Cancel</button></div>)}
  </div>);
}
export default function Admin(){
  const{token,setToken}=useAdminToken();const nav=useNavigate();
  const[showTools,setShowTools]=useState(!!token);
  return(<div className='min-h-screen bg-[#f6f6f6] text-[#121212]'>
    <header className='bg-[#052962] text-white'><div className='max-w-6xl mx-auto px-4 py-4 border-b-4 border-[#c70000]'><h1 className='text-3xl font-serif italic font-extrabold'>The Gargantuan — Admin</h1></div></header>
    <main className='max-w-6xl mx-auto px-4 py-6 space-y-6'>
      {!showTools&&(<div className='bg-white border border-[#dcdcdc] rounded p-4'><h3 className='font-headline text-xl mb-2'>Enter admin token</h3><div className='flex gap-3'><input type='password' value={token} onChange={e=>setToken(e.target.value)} placeholder='Admin token' className='flex-1 border border-[#dcdcdc] rounded px-3 py-2 text-sm'/><button className='px-4 py-2 bg-[#052962] text-white rounded text-sm font-semibold' onClick={()=>setShowTools(true)}>Continue</button></div><button className='mt-3 text-sm underline text-[#052962]' onClick={()=>nav('/')}>← Back to site</button></div>)}
      {showTools&&(<PostsPanel/>)}
    </main>
  </div>);
}