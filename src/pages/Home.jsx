import React,{useEffect,useState}from'react'
const API = import.meta.env.VITE_API_BASE || ''

export default function Home(){
  const [posts,setPosts]=useState([])
  const [dateStr] = useState(()=> new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'}))

  useEffect(()=>{
    fetch(API + '/api/posts')
      .then(r=>r.json()).then(arr=>{
        const sorted=[...(arr||[])].sort((a,b)=> (new Date(b.createdAt||0))-(new Date(a.createdAt||0)))
        setPosts(sorted)
      }).catch(console.error)
  },[])

  return(<div style={{paddingBottom:'60px'}}>
    <header className="mast">
      <div className="mwrap">
        <div className="brand">The Gargantuan</div>
        <div className="dateline">{dateStr} · Edited by The Gargantuan</div>
        <div className="redbar"></div>
      </div>
      <nav className="nav">
        <span>NEWS</span><span>CULTURE</span><span>SOUND</span><span>IDEAS</span><span>DISPATCHES</span>
      </nav>
    </header>

    <main className="container">
      {posts.length===0 && <div className="small">No posts yet. Check back soon.</div>}
      {posts.map((p,idx)=>(
        <article key={idx} className="card">
          <div className="playWrap">
            <div className="playCircle"><div className="playTriangle"></div></div>
            <div>
              <h1 className="title" style={{margin:0}}>{p.title || p.filename}</h1>
              <div className="meta">
                {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'}) : ''}
              </div>
              <div className="controls" style={{marginTop:8}}>
                {p.url && <a className="btn" href={p.url} target="_blank" rel="noreferrer">Open</a>}
              </div>
            </div>
          </div>
        </article>
      ))}
    </main>

    <footer className="footer">
      © {new Date().getFullYear()} The Gargantuan · Contact: <a href="mailto:hellogargantuan69@gmail.com" style={{color:'#fff'}}>hellogargantuan69@gmail.com</a>
    </footer>
  </div>)
}
