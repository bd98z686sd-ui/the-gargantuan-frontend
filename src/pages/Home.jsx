import React, { useEffect, useState } from 'react'
const API = import.meta.env.VITE_API_BASE || ''

export default function Home(){
  const [posts, setPosts] = useState(null)
  const [error, setError] = useState(null)

  useEffect(()=>{
    fetch(API+'/api/posts').then(r=> r.ok ? r.json() : Promise.reject(r.statusText))
      .then(data=>{
        // newest first (server should already do it; keep defensive)
        data.sort((a,b)=> (new Date(b.date||0))-(new Date(a.date||0)))
        setPosts(data)
      })
      .catch(e=> setError('posts: '+String(e)))
  }, [])

  if(error) return <div className="container"><p className="meta">Error: {error}</p></div>
  if(!posts) return <div className="container"><p className="meta">Loading…</p></div>

  const [hero, ...rest] = posts

  return (
    <div className="container">
      {hero && <Hero post={hero}/>}
      {rest.length>0 && <>
        <h2 className="sectionH">Recent</h2>
        <div>
          {rest.map((p,i)=> <Item key={i} post={p} />)}
        </div>
      </>}
    </div>
  )
}

function Hero({ post }){
  const title = post.title || (post.filename?.split('/').pop())
  const date = post.date ? new Date(post.date).toLocaleDateString(undefined, { day:'2-digit', month:'long', year:'numeric' }) : ''
  return (
    <article className="hero">
      <div className="heroMedia">
        {/* If you have poster thumbnails, you can swap this block to <video ...> */}
        <div className="play" />
      </div>
      <h1 className="title">{title}</h1>
      <div className="meta">{date}</div>
      <div className="controls">
        <a className="btn" href={post.url} target="_blank" rel="noreferrer">Play</a>
      </div>
    </article>
  )
}

function Item({ post }){
  const title = post.title || (post.filename?.split('/').pop())
  const date = post.date ? new Date(post.date).toLocaleDateString(undefined, { day:'2-digit', month:'long', year:'numeric' }) : ''
  return (
    <div className="item">
      <div className="ititle">{title}</div>
      <div className="meta">{date}</div>
    </div>
  )
}
