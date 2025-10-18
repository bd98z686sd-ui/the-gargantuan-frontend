import React, { useEffect, useState } from 'react'
const API = import.meta.env.VITE_API_BASE || ''

export default function Home(){
  const [posts, setPosts] = useState(null)
  const [shorts, setShorts] = useState(null)
  const [error, setError] = useState(null)

  useEffect(()=>{
    fetch(API+'/api/posts').then(r=> r.ok ? r.json() : Promise.reject(r.statusText))
      .then(setPosts).catch(e=> setError('posts: '+String(e)))
    fetch(API+'/api/shorts').then(r=> r.ok ? r.json() : Promise.reject(r.statusText))
      .then(setShorts).catch(e=> setError(prev => (prev? prev+'; ' : '') + 'shorts: '+String(e)))
  }, [])

  return (
    <div className="container">
      {error && <p className="notice">Error: {error}</p>}
      {!posts && !error && <p className="notice">Loading…</p>}

      {shorts && shorts.length>0 && (
        <section style={{paddingTop:24}}>
          <h3 className="title" style={{fontSize:20, marginBottom:8}}>Shorts</h3>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:12}}>
            {shorts.map(s => (
              <a key={s.id} className="card" style={{padding:8}} href={s.url||'#'} target="_blank" rel="noreferrer">
                <video className="thumb" src={s.url||''} muted preload="metadata" style={{width:'100%', height: 'auto'}} />
                <div className="meta" style={{marginTop:6}}>{new Date(s.createdAt).toLocaleString()}</div>
              </a>
            ))}
          </div>
          <hr className="sep"/>
        </section>
      )}

      {posts && <div className="list">
        {posts.map((p, i)=> <Post key={i} post={p} />)}
      </div>}
    </div>
  )
}

function Post({ post }){
  const date = post.date ? new Date(post.date).toLocaleString() : ''
  const title = post.title || (post.filename?.split('/').pop())
  return (
    <article className="card">
      {post.type === 'video'
        ? <video className="thumb" src={post.url} muted playsInline preload="metadata" />
        : <div className="thumb" />}
      <div style={{flex:1}}>
        <div className="title">{title}</div>
        <div className="meta">{date} {post.tagline ? ' · '+post.tagline : ''}</div>
        <div className="controls">
          <a className="btn secondary" href={post.url} target="_blank" rel="noreferrer">Open</a>
        </div>
      </div>
    </article>
  )
}
