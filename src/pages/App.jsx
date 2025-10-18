import React,{useEffect,useState}from'react'
const API=import.meta.env.VITE_API_BASE||''

export default function App(){
  const[today]=useState(()=>new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'}))
  const[posts,setPosts]=useState([])
  useEffect(()=>{fetch(API+'/api/posts').then(r=>r.json()).then(setPosts).catch(console.error)},[])
  const hero=posts[0];const rest=posts.slice(1)

  return(<div style={{paddingBottom:'60px'}}>
    <header className="mast">
      <div className="mwrap">
        <div className="brand">The Gargantuan</div>
        <div className="dateline">{today} · Edited by The Gargantuan</div>
        <div className="redbar"></div>
      </div>
      <nav className="nav"><span>NEWS</span><span>CULTURE</span><span>SOUND</span><span>IDEAS</span><span>DISPATCHES</span></nav>
    </header>

    <main className="container">
      {hero?<article className="hero">
        <div className="playCircle"><div className="playTriangle"></div></div>
        <h1 className="title">{hero.title||hero.filename}</h1>
        <div className="meta">{hero.createdAt?new Date(hero.createdAt).toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'}):''}</div>
        <div className="controls">
          <a className="btn" href={hero.url||('#')} target="_blank" rel="noreferrer">Play</a>
        </div>
      </article>:<div className="meta">Loading…</div>}

      {rest.length>0&&<section>
        <h2 className="sectionH">Recent</h2>
        {rest.map((p,i)=>(<div key={i}className="item">
          <div className="title" style={{fontSize:'22px'}}>{p.title||p.filename}</div>
          <div className="meta">{p.createdAt?new Date(p.createdAt).toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'}):''}</div>
        </div>))}
      </section>}
    </main>

    <footer className="footer">
      © {new Date().getFullYear()} The Gargantuan · Contact: <a href="mailto:hellogargantuan69@gmail.com" style={{color:'#fff'}}>hellogargantuan69@gmail.com</a>
    </footer>
  </div>)
}
