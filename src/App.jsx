import React, {useEffect, useMemo, useState} from 'react'
const API = import.meta.env.VITE_API_BASE || ''

function pickVideoUrl(p){
  if(p.videoUrl) return p.videoUrl;
  if(p.url && /\.mp4(\?|$)/i.test(p.url)) return p.url;
  if(p.filename) return `${API}/uploads/${p.filename.replace(/\.[^/.]+$/, '.mp4')}`;
  return null;
}
function pickAudioUrl(p){
  if(p.audioUrl) return p.audioUrl;
  if(p.url && /\.(mp3|m4a|wav)(\?|$)/i.test(p.url)) return p.url;
  if(p.filename) return `${API}/uploads/${p.filename}`;
  return null;
}

function StubPosts(){
  // dummy content for newspaper look when API empty
  const d = new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'})
  const pool = [
    {title:'The Gargantuan launches daily audio dispatch', createdAt:Date.now()},
    {title:'On loops and headlines: a manifesto', createdAt:Date.now()-1e6},
    {title:'Music, narration, mustard — a palette', createdAt:Date.now()-2e6},
    {title:'Spectral videos return, properly embedded', createdAt:Date.now()-3e6},
    {title:'Shorts pipeline: first tests passed', createdAt:Date.now()-4e6},
  ]
  return pool.map(p=>({...p, stub:true, date:d}))
}

function usePosts(){
  const [posts,setPosts]=useState(null)
  useEffect(()=>{
    fetch(API+'/api/posts').then(r=>r.json()).then(arr=>{
      const sorted = [...(arr||[])].filter(p=>!p.deleted).sort((a,b)=> (new Date(b.createdAt||0))-(new Date(a.createdAt||0)))
      setPosts(sorted)
    }).catch(()=>setPosts([]))
  },[])
  return posts
}

// Decide grid spans (like a newspaper): top feature wide, next two half, then a mix
function layout(posts){
  return posts.map((p,i)=>{
    // default span 4 cols out of 12
    let span = 4
    if(i===0) span = 12         // big splash
    else if(i===1 || i===2) span = 6  // two across
    else if(i%5===0) span = 8   // occasional big
    else if(i%7===0) span = 3   // small teaser
    return {...p, _span: span}
  })
}

export default function App(){
  const posts = usePosts()
  const today = new Date().toLocaleDateString('en-GB',{day:'numeric', month:'long', year:'numeric'})
  const feed = useMemo(()=>{
    const source = (posts && posts.length) ? posts : StubPosts()
    return layout(source)
  },[posts])

  return (
    <div className="min-h-screen bg-[#f6f6f6] text-[#121212] pb-20">
      <header className="sticky top-0 z-50 bg-[#052962] text-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="py-3 sm:py-4 border-b-4 border-[#c70000]">
            <h1 className="brand-tt text-5xl sm:text-6xl tracking-tight">The Gargantuan</h1>
            <p className="text-xs sm:text-sm mt-1 text-white/80">{today} · Edited by The Gargantuan</p>
          </div>
          <nav className="flex gap-5 py-2 sm:py-3 text-xs sm:text-sm uppercase tracking-wide font-semibold">
            {['News','Culture','Sound','Ideas','Dispatches'].map(s=>(
              <span key={s} className="hover:underline decoration-2 underline-offset-4 decoration-[#c70000]">{s}</span>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="newspaper-grid">
          {feed.map((p,idx)=>{
            const v = pickVideoUrl(p)
            const a = pickAudioUrl(p)
            const span = p._span || 4
            return (
              <article key={p.id || p._id || p.filename || idx}
                className="card"
                style={{ gridColumn: `span ${span} / span ${span}` }}>
                <div className="media">
                  {v ? (
                    <video controls playsInline preload="metadata" className="w-full h-full object-cover" src={v} />
                  ) : a ? (
                    <div className="w-full h-full flex items-center justify-center bg-black/90">
                      <audio controls className="w-[92%]">
                        <source src={a} />
                      </audio>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-black/80"></div>
                  )}
                </div>
                <div className="body">
                  <h2 className="headline-tt text-2xl sm:text-3xl">{p.title || p.filename || 'Untitled'}</h2>
                  <p className="text-xs text-[#666] italic mt-1">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'}) : (p.date || '')}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </main>

      <footer className="sticky-footer">
        © {new Date().getFullYear()} The Gargantuan · Contact: <a href="mailto:hellogargantuan69@gmail.com" className="underline">hellogargantuan69@gmail.com</a>
      </footer>
    </div>
  )
}
