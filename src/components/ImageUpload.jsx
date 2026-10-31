import React, { useRef, useState } from 'react';
const API_BASE = import.meta.env.VITE_API_BASE || 'https://the-gargantuan-backend.onrender.com';

export default function ImageUpload({ token, onInserted }){
  const inp = useRef(null)
  const [busy, setBusy] = useState(false)
  async function go(){
    const f = inp.current?.files?.[0]
    if(!f) return
    setBusy(true)
    try{
      const fd = new FormData(); fd.append('image', f)
      const res = await fetch(`${API_BASE}/api/images/upload`, { method:'POST', headers:{ 'x-admin-token': token }, body: fd })
      if(!res.ok) throw new Error('upload failed')
      const data = await res.json()
      onInserted?.(data.url)
    }catch(e){ console.error(e) } finally{ setBusy(false); inp.current.value='' }
  }
  return (
    <div className="flex items-center gap-2">
      <input type="file" accept="image/*" ref={inp} />
      <button disabled={busy} className="px-3 py-1 rounded border" onClick={go}>{busy?'Uploading…':'Insert image'}</button>
    </div>
  )
}
