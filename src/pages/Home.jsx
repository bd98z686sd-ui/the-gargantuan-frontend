import React,{useEffect,useState}from'react'
const API = import.meta.env.VITE_API_BASE || ''

function pickVideoUrl(p){
  if(p.videoUrl) return p.videoUrl;
  if(p.url && /\.mp4(\?|$)/i.test(p.url)) return p.url;
  if(p.filename) return `${API}/uploads/${p.filename.replace(/\.[^/.]+$/, '.mp4')}`
  return null;
}
function pickAudioUrl(p){
  if(p.audioUrl) return p.audioUrl;
  if(p.url && /\.(mp3|m4a|wav)(\?|$)/i.test(p.url)) return p.url;
  if(p.filename) return `${API}/uploads/${p.filename}`
  return null;
}

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
      {posts.map((p,idx)=>{
        const v = pickVideoUrl(p);
        const a = pickAudioUrl(p);
        return (
        <article key={idx} className="card">
          <div className="playWrap">
            {v ? (
              <video className="item-media" controls playsInline preload="metadata" src={v} />
            ) : a ? (
              <audio className="item-media" controls src={a} />
            ) : (
              <div className="item-media" style={{height:180,display:'grid',placeItems:'center',color:'#888'}}>No media</div>
            )}
            <div>
              <h1 className="title" style={{margin:0}}>{p.title || p.filename}</h1>
              <div className="meta">
                {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'}) : ''}
              </div>
            </div>
          </div>
        </article>
      )})}
    </main>

    <footer className="footer">
      © {new Date().getFullYear()} The Gargantuan · Contact: <a href="mailto:hellogargantuan69@gmail.com" style={{color:'#fff'}}>hellogargantuan69@gmail.com</a>
    </footer>
  </div>)
}
