import { useEffect, useState } from 'react'
import Masthead from './components/Masthead'
import Footer from './components/Footer'
import PostCard from './components/PostCard'
import Admin from './components/Admin'
import Exports from './components/Exports'
import { fetchPosts } from './api'
import './index.css'

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash || '#/')
  useEffect(()=>{
    const onHash = () => setHash(window.location.hash || '#/')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return hash.replace(/^#/, '') || '/'
}


function Nav({ route }){
  const hasToken = typeof localStorage !== 'undefined' && !!localStorage.getItem('ADMIN_TOKEN')
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="mx-auto max-w-5xl px-4 py-3 flex gap-4 text-sm">
        <a href="#/" className={route==='/'?'font-bold underline':''}>Home</a>
        {hasToken && <a href="#/admin" className={route==='/admin'?'font-bold underline':''}>Admin</a>}
        <a href="#/exports" className={route==='/exports'?'font-bold underline text-guardian-red underline':''}>Exports</a>
      </div>
    </nav>
  )
}


function HomeFeed(){
  const [posts, setPosts] = useState([])
  useEffect(()=>{ (async()=>{
    const real = await fetchPosts()
    if (real && real.length) setPosts(real)
    else setPosts([
      { id:'a1', title:'Chaos reigns, vibes immaculate', tagline:'Opinion', text:'A funny placeholder post about vibes.', date:new Date().toISOString() },
      { id:'b2', title:'Breaking: My kettle is on fire', tagline:'News', text:'Local man confesses he left it on.', date:new Date().toISOString() },
      { id:'c3', title:'Top 7 noodles for rainy days', tagline:'Food', text:'Ramen supremacy continues.', date:new Date().toISOString() },
      { id:'d4', title:'AI wrote this, I blame it', tagline:'Culture', text:'The bots made me do it.', date:new Date().toISOString() },
      { id:'e5', title:'Microwave risotto: a manifesto', tagline:'Lifestyle', text:'Do not try this at home.', date:new Date().toISOString() }
    ])
  })() }, [])
  const [first, second, third, ...rest] = posts
  return (
    <div className="flex-1">
      <main className="mx-auto max-w-5xl px-4 py-6">
        <section className="grid md:grid-cols-2 gap-4 mb-4">
          {first && <PostCard post={first} big />}
          <div className="grid gap-4">
            {second && <PostCard post={second} />}
            {third && <PostCard post={third} />}
          </div>
        </section>
        <section className="grid md:grid-cols-3 gap-4">
          {rest.map(p => <PostCard key={p.id} post={p} />)}
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default function App(){
  const route = useHashRoute()
  return (
    <div className="min-h-full flex flex-col">
      <Masthead />
      <Nav route={route} />
      {route==='/' && <HomeFeed />}
      {route==='/admin' && <Admin />}
      {route==='/exports' && <Exports />}
    </div>
  )
}
