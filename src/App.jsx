import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE || "";

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

export default function App() {
  const [posts, setPosts] = useState([]);
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    fetch(API + "/api/posts")
      .then(r=>r.json())
      .then(arr=>{
        const sorted=[...(arr||[])].sort((a,b)=> (new Date(b.createdAt||0))-(new Date(a.createdAt||0)));
        setPosts(sorted);
      })
      .catch(()=>setPosts([]));
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f6f6] text-[#121212] pb-20">
      <header className="sticky top-0 z-50 bg-[#052962] text-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="py-3 sm:py-4 border-b-4 border-[#c70000]">
            <h1 className="brand-tt text-5xl sm:text-6xl tracking-tight">The Gargantuan</h1>
            <p className="text-xs sm:text-sm mt-1 text-white/80">
              {today} · Edited by The Gargantuan
            </p>
          </div>

          <nav className="flex gap-5 py-2 sm:py-3 text-xs sm:text-sm uppercase tracking-wide font-semibold">
            {["News", "Culture", "Sound", "Ideas", "Dispatches"].map((item) => (
              <span key={item} className="hover:underline decoration-2 underline-offset-4 decoration-[#c70000]">
                {item}
              </span>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-3xl mr-auto">
          {posts.length > 0 ? (
            posts.map((p,idx) => {
              const v = pickVideoUrl(p);
              const a = pickAudioUrl(p);
              return (
                <article key={p.id || p._id || idx} className="bg-white rounded-lg border border-[#dcdcdc] overflow-hidden mb-6">
                  <div className="p-5 sm:p-6">
                    {v ? (
                      <video controls playsInline preload="metadata" className="w-full rounded-md bg-black mb-4" src={v}/>
                    ) : a ? (
                      <audio controls className="w-full mb-4">
                        <source src={a} />
                      </audio>
                    ) : null}
                    <h2 className="headline-tt text-3xl sm:text-4xl mb-2">{p.title || p.filename}</h2>
                    <p className="text-sm text-[#666] italic">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'}) : ''}
                    </p>
                  </div>
                </article>
              )
            })
          ) : (
            <div className="bg-white border border-[#dcdcdc] rounded-lg p-10 text-center italic text-[#444]">
              No posts yet — new audio will appear here soon.
            </div>
          )}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-[#052962] text-white text-sm text-center py-3 px-4">
        © {new Date().getFullYear()} The Gargantuan · Contact: <a href="mailto:hellogargantuan69@gmail.com" className="underline">hellogargantuan69@gmail.com</a>
      </footer>
    </div>
  );
}
