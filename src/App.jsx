import React, { useEffect, useMemo, useState } from 'react'
import { clsx } from 'clsx'
import { useHashRoute } from './router'
const API = import.meta.env.VITE_API_BASE

function Masthead() {
  return (
    <header className="sticky top-0 z-40 bg-guardianBlue text-white border-b-4 border-guardianRed">
      <div className="mx-auto max-w-5xl px-4 py-4">
        <div className="font-display text-3xl md:text-5xl leading-none">The Gargantuan</div>
        <div className="text-sm mt-2 opacity-90">{
          new Date().toLocaleDateString(undefined, { day:'2-digit', month:'long', year:'numeric'})
        } · Edited by The Gargantuan</div>
      </div>
      <nav className="mx-auto max-w-5xl px-4">
        <div className="h-1 bg-guardianRed w-full" />
      </nav>
    </header>
  )
}

function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-guardianBlue text-white">
      <div className="mx-auto max-w-5xl px-4 py-4 flex flex-col md:flex-row gap-2 md:gap-8 text-sm">
        <div>© {new Date().getFullYear()} The Gargantuan</div>
        <div>Contact: <a className="underline" href="mailto:hellogargantuan69@gmail.com">hellogargantuan69@gmail.com</a></div>
      </div>
    </footer>
  )
}

function Tag({ children }) {
  return <span className="inline-flex items-center rounded-full bg-neutral-200/80 text-neutral-800 text-xs px-3 py-1">{children}</span>
}

function Media({ item }) {
  const src = item.videoUrl || item.audioUrl
  if (!src) return null
  const isVideo = /\.mp4(\?|$)/i.test(src)
  return (
    <div className="w-full">
      {isVideo ? (
        <video className="w-full rounded border" src={src} controls preload="none" />
      ) : (
        <audio className="w-full" src={src} controls preload="none" />
      )}
    </div>
  )
}

function PostCard({ item, size='m' }) {
  const font = "font-display"
  const titleSize = size==='xl' ? 'text-[clamp(28px,7vw,56px)]' :
                    size==='l' ? 'text-[clamp(24px,5.2vw,44px)]' :
                    size==='s' ? 'text-[clamp(18px,3.6vw,28px)]' :
                                 'text-[clamp(20px,4.2vw,34px)]'
  return (
    <article className={clsx("bg-white shadow-card border rounded-lg p-4 flex flex-col gap-3", size==='xl' && 'md:col-span-2')}>
      <div className="flex items-center gap-3">
        <div className="text-xs text-neutral-600">{new Date(item.date || item.createdAt || Date.now()).toLocaleDateString(undefined,{ day:'2-digit', month:'short', year:'numeric'})}</div>
        <Tag>Audio blog</Tag>
      </div>
      <h2 className={clsx("headline leading-tight", font, titleSize)}>{item.title || item.filename}</h2>
      <Media item={item} />
    </article>
  )
}

function usePosts() {
  const [posts,setPosts] = useState([])
  const [loading,setLoading] = useState(true)
  useEffect(() => {
    async function go() {
      try {
        const res = await fetch(`${API}/api/posts`)
        const data = await res.json()
        setPosts((data?.posts || data || []).sort((a,b)=>new Date(b.date||b.createdAt)-new Date(a.date||a.createdAt)))
      } catch(e){ console.error(e) }
      setLoading(false)
    }
    go()
  },[])
  return { posts, loading }
}

function Grid({ posts }) {
  // Simple newspaper-like layout: first is XL, next two L, rest M/S responsive
  const items = posts
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.slice(0,1).map(p => <PostCard key={p.id||p.filename+'xl'} item={p} size="xl" />)}
      {items.slice(1,3).map(p => <PostCard key={p.id||p.filename+'l'} item={p} size="l" />)}
      {items.slice(3).map((p,i) => <PostCard key={p.id||p.filename+i} item={p} size={ i%3===0 ? 'm' : 's'} />)}
    </div>
  )
}

function Admin() {
  const [token,setToken] = useState('')
  const [file,setFile] = useState(null)
  const [progress,setProgress] = useState(0)
  const [busy,setBusy] = useState(false)

  const upload = async () => {
    if (!file) return
    setBusy(true); setProgress(0)
    const form = new FormData()
    form.append('audio', file)
    const res = await fetch(`${API}/api/upload`, { method:'POST', headers: { 'x-admin-token': token }, body: form })
    const data = await res.json().catch(()=>({}))
    setBusy(false)
    alert(JSON.stringify(data,null,2))
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-3xl mb-4">Admin</h1>
      <label className="block mb-2 text-sm font-medium">Admin Token</label>
      <input className="w-full border rounded px-3 py-2 mb-4" type="password" value={token} onChange={e=>setToken(e.target.value)} placeholder="Enter admin token" />
      <div className="border-dashed border-2 rounded-lg p-6 text-center">
        <input type="file" accept="audio/*" onChange={e=>setFile(e.target.files?.[0])} />
        <div className="mt-4">
          <button disabled={!file||busy} onClick={upload} className="bg-guardianBlue text-white px-4 py-2 rounded disabled:opacity-50">Upload audio</button>
        </div>
      </div>
      {progress>0 && <div className="mt-4 h-2 bg-neutral-200 rounded"><div className="h-full bg-guardianRed rounded" style={{width:`${progress}%`}}/></div>}
      <div className="mt-8">
        <a href="/#/" className="underline">← Back to site</a>
      </div>
    </div>
  )
}

function App() {
  const { get, subscribe } = useHashRoute()
  const [route,setRoute] = useState(get())
  useEffect(()=>subscribe(setRoute),[])
  const { posts, loading } = usePosts()

  return (
    <div className="min-h-screen font-sans">
      <Masthead />
      {route.startsWith('admin') ? (
        <Admin />
      ) : (
        <>
          {loading ? <div className="mx-auto max-w-5xl px-4 py-10">Loading…</div> : <Grid posts={posts} />}
        </>
      )}
      <Footer />
    </div>
  )
}

export default App
