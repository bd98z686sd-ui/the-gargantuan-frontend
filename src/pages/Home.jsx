import React, { useEffect, useState } from 'react';
const API_BASE = import.meta.env.VITE_API_BASE || 'https://the-gargantuan-backend.onrender.com';
export default function Home(){
  const [posts,setPosts]=useState([]);const[loading,setLoading]=useState(true);
  useEffect(()=>{(async()=>{
    try{const r=await fetch(`${API_BASE}/api/posts`);const j=await r.json();setPosts(Array.isArray(j)?j:[]);}catch{setPosts([]);}finally{setLoading(false);}
  })();},[]);
  return(<div className='min-h-screen bg-[#f6f6f6] text-[#121212]'>
    <header className='bg-[#052962] text-white border-b-4 border-[#c70000]'><div className='max-w-6xl mx-auto px-4 py-4'><h1 className='text-4xl font-serif italic font-extrabold'>The Gargantuan</h1></div></header>
    <main className='max-w-6xl mx-auto px-4 py-6'>
      <div className='flex items-center justify-between mb-4'><h2 className='text-xl font-semibold'>Latest posts</h2><a href='/admin' className='text-sm underline text-[#052962]'>Admin</a></div>
      {loading&&<p className='text-sm text-[#666]'>Loading…</p>}
      {!loading&&posts.length===0&&<p className='text-sm text-[#666]'>No posts yet.</p>}
      <ul className='space-y-6'>
        {posts.map(p=>{const date=p.date?new Date(p.date):null;const displayDate=date?date.toLocaleDateString():'',title=p.title||p.filename.split('/').pop(),tagline=p.tagline||'';
          return(<li key={p.filename} className='bg-white border border-[#e6e6e6] rounded-lg p-4'><div className='flex items-center justify-between mb-3'><div><h3 className='text-lg font-semibold'>{title}</h3><p className='text-xs text-[#666]'>{displayDate}</p><p className='text-sm italic text-[#444]'>{tagline}</p></div><a className='text-sm underline text-[#052962]' href={p.absoluteUrl||p.url} target='_blank'>Open</a></div>{p.type==='audio'?<audio controls className='w-full'><source src={p.absoluteUrl||p.url} type='audio/mpeg'/></audio>:<video controls className='w-full aspect-video bg-black'><source src={p.absoluteUrl||p.url} type='video/mp4'/></video>}</li>);
        })}
      </ul>
    </main></div>);
}