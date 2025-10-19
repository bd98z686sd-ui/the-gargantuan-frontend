import { useEffect, useState } from 'react'
import Masthead from './components/Masthead'
import Footer from './components/Footer'
import PostCard from './components/PostCard'
import Admin from './components/Admin'
import { fetchPosts } from './api'

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash || '#/')
  useEffect(() => {
    const onHash = () => setHash(window.location.hash || '#/')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return hash.replace(/^#/, '') || '/'
}

export default function App() {
  const route = useHashRoute()
  const [posts, setPosts] = useState([])

  useEffect(() => {
    (async () => {
      const data = await fetchPosts()
      if (!data?.length) {
        try {
          const demo = await fetch('/README-assets/dummy_posts.json').then(r=>r.json())
          setPosts(demo)
        } catch (e) {
          setPosts([])
        }
      } else {
        setPosts(data.sort((a,b)=> new Date(b.date) - new Date(a.date)))
      }
    })()
  }, [])

  if (route.startsWith('/admin')) {
    return (
      <div className="min-h-full flex flex-col">
        <Masthead />
        <Admin />
        <Footer />
      </div>
    )
  }

  const [first, second, third, ...rest] = posts

  return (
    <div className="min-h-full flex flex-col">
      <Masthead />
      <main className="flex-1 mx-auto max-w-5xl px-4 py-6">
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