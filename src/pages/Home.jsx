import React, { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://the-gargantuan-backend.onrender.com'

function Masthead(){
  const now = new Date()
  const date = now.toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })
  return (
    <header className="sticky top-0 z-50 bg-[#052962] text-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-3 sm:py-4 border-b-4 border-[#c70000]">
          <h1 className="text-5xl sm:text-6xl font-serif italic font-extrabold tracking-tight">The Gargantuan</h1>
          <p className="text-xs sm:text-sm mt-1 text-white/80">{date} · Edited by The Gargantuan</p>
        </div>
        <nav className="flex gap-5 py-2 sm:py-3 text-xs sm:text-sm uppercase tracking-wide font-semibold">
          {['News','Culture','Sound','Ideas','Dispatches'].map(x => (
            <a key={x} className="hover:underline decoration-2 underline-offset-4 decoration-[#c70000]">{x}</a>
          ))}
          <a href="/admin" className="ml-auto underline">Admin</a>
        </nav>
      </div>
    </header>
  )
}

export default function Home(){
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/posts`)
        const j = await r.json()
        setPosts(Array.isArray(j) ? j : [])
      } catch { setPosts([]) }
      finally { setLoading(false) }
    })()
  }, [])

  return (
    <div className="min-h-screen bg-[#f6f6f6] text-[#121212]">
      <Masthead/>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {loading && <p className="text-sm text-[#666]">Loading…</p>}
        {!loading && posts.length === 0 && (
          <div className="bg-white border border-[#dcdcdc] rounded-lg p-10 text-center italic text-[#444]">
            No posts yet — new audio will appear here soon.
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-6">
            {posts.map((p) => {
              const date = p.date ? new Date(p.date) : null
              const displayDate = date ? date.toLocaleDateString() : ''
              const title = p.title || (p.filename ? p.filename.split('/').pop() : 'Post')
              return (
                <article key={p.filename} className="bg-white rounded-lg border border-[#dcdcdc] overflow-hidden hover:shadow transition">
                  <div className="p-5 sm:p-6">
                    <h2 className="text-2xl sm:text-3xl font-serif font-semibold mb-2">{title}</h2>
                    <p className="text-sm text-[#666] mb-3 italic">{displayDate}</p>
                    {p.tagline && <p className="mb-4 text-base italic text-[#333]">{p.tagline}</p>}
                    {p.type === 'audio' ? (
                      <audio controls className="w-full">
                        <source src={p.absoluteUrl || p.url} type="audio/mpeg" />
                      </audio>
                    ) : (
                      <video controls className="w-full aspect-video bg-black">
                        <source src={p.absoluteUrl || p.url} type="video/mp4" />
                      </video>
                    )}
                  </div>
                </article>
              )
            })}
          </div>

          <aside className="space-y-6">
            <h3 className="font-sans text-xl font-semibold">Recent</h3>
            <div className="border-t border-[#dcdcdc]" />
            <ul className="space-y-3">
              {posts.slice(0,5).map((p) => (
                <li key={p.filename} className="truncate">
                  <span className="text-[#052962] font-medium">{p.title || p.filename.split('/').pop()}</span>
                </li>
              ))}
            </ul>
          </aside>
        </section>
      </main>
      <footer className="py-8 text-center text-sm text-[#666]">
        © {new Date().getFullYear()} The Gargantuan · Contact: hellogargantuan69@gmail.com
      </footer>
    </div>
  )
}
