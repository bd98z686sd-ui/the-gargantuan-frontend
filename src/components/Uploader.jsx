import React,{useRef,useState} from 'react'
const API_BASE = import.meta.env.VITE_API_BASE || 'https://the-gargantuan-backend.onrender.com'

export default function Uploader({token,toast,onUploaded}){
  const ref=useRef(null)
  const [drag,setDrag]=useState(false),[busy,setBusy]=useState(false),[progress,setProgress]=useState(0)
  const [autoVideo,setAutoVideo]=useState(true)

  function onDrop(e){e.preventDefault();setDrag(false);const f=e.dataTransfer.files?.[0]; if(f) ref.current.files=e.dataTransfer.files}
  function onDrag(e){e.preventDefault();setDrag(true)}; function onLeave(e){e.preventDefault();setDrag(false)}

  async function upload(){
    const f=ref.current?.files?.[0]; if(!f) return toast?.show('Pick a file','error')
    setBusy(true); setProgress(0)
    try{
      const fd=new FormData(); fd.append('audio',f)
      // upload with progress
      const fileKey = await new Promise((resolve,reject)=>{ const xhr=new XMLHttpRequest()
        xhr.open('POST', `${API_BASE}/api/upload`); xhr.setRequestHeader('x-admin-token', token||'')
        xhr.upload.onprogress = (e)=>{ if(e.lengthComputable) setProgress(Math.round((e.loaded/e.total)*100)) }
        xhr.onload=()=>{
          try{
            const j = JSON.parse(xhr.responseText||'{}')
            if(xhr.status>=200 && xhr.status<300 && j.key) resolve(j.key); else reject(new Error('upload failed'))
          }catch{ reject(new Error('upload failed')) }
        }
        xhr.onerror=reject; xhr.send(fd)
      })

      toast?.show('Uploaded','ok')

      // optionally auto-generate spectral video
      if (autoVideo && fileKey) {
        try{
          const r = await fetch(`${API_BASE}/api/generate-video`, {
            method:'POST',
            headers:{'Content-Type':'application/json','x-admin-token':token||''},
            body: JSON.stringify({ filename: fileKey, title: '' })
          })
          if(r.ok){
            const j = await r.json()
            toast?.show('Spectral video created','ok')
          } else {
            toast?.show('Video render failed','error')
          }
        }catch{
          toast?.show('Video render failed','error')
        }
      }

      onUploaded?.()
    }catch(e){ toast?.show('Upload failed','error') }
    finally{ setBusy(false); setProgress(0) }
  }

  return (
    <div className="bg-white border border-[#dcdcdc] rounded p-4">
      <h3 className="font-sans font-semibold mb-2">Upload MP3</h3>
      <div className={`border-2 border-dashed rounded p-6 text-center mb-3 ${drag?'border-[#052962]':'border-[#dcdcdc]'}`}
        onDragOver={onDrag} onDragEnter={onDrag} onDragLeave={onLeave} onDrop={onDrop}>
        <p className="text-sm text-[#666] mb-2">Drag & drop an MP3 here, or pick a file</p>
        <input type="file" accept="audio/*" ref={ref} className="block mx-auto"/>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={autoVideo} onChange={e=>setAutoVideo(e.target.checked)}/> Auto‑create spectral video after upload</label>
      {busy && <div className="w-full h-2 bg-[#eee] rounded mt-2"><div className="h-2 bg-[#052962] rounded" style={{width:`${progress}%`}}/></div>}
      <div className="mt-3"><button onClick={upload} disabled={busy} className="px-4 py-2 bg-[#052962] text-white rounded disabled:opacity-50">{busy?`Uploading… ${progress}%`:'Upload'}</button></div>
    </div>
  )
}
