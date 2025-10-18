import React, { useRef, useState } from 'react';
const API_BASE = import.meta.env.VITE_API_BASE || 'https://the-gargantuan-backend.onrender.com';
export default function Uploader({ token, toast, onUploaded }){
  const fileRef = useRef(null);
  const [loading, setLoading] = useState(false);
  async function doUpload(){
    const f = fileRef.current?.files?.[0];
    if(!f){ toast?.show('Pick a file','error'); return; }
    setLoading(true);
    try{
      const fd = new FormData();
      fd.append('audio', f);
      const r = await fetch(`${API_BASE}/api/upload`, { method:'POST', headers: { 'x-admin-token': token }, body: fd });
      if(r.status===401) return toast?.show('Unauthorized (token)','error');
      if(!r.ok) throw new Error('Upload failed');
      const j = await r.json();
      toast?.show('Uploaded','ok'); onUploaded?.(j);
    }catch(e){ toast?.show('Upload failed','error'); }
    finally{ setLoading(false); }
  }
  return (
    <div className="bg-white border border-[#dcdcdc] rounded p-4">
      <h3 className="font-headline text-xl mb-2">Upload MP3</h3>
      <input type="file" accept="audio/mp3,audio/mpeg" ref={fileRef} className="mb-2"/>
      <div>
        <button onClick={doUpload} disabled={loading} className="px-4 py-2 bg-[#052962] text-white rounded disabled:opacity-50">
          {loading?'Uploading…':'Upload'}
        </button>
      </div>
    </div>
  );
}
