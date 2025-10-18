import React, { useRef, useState } from 'react'
const API_BASE = import.meta.env.VITE_API_BASE || 'https://the-gargantuan-backend.onrender.com'

export default function Uploader({ token, toast, onUploaded }){
  const fileRef = useRef(null)
  const [drag, setDrag] = useState(false)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)

  function onDrop(e){
    e.preventDefault()
    setDrag(false)
    const f = e.dataTransfer.files?.[0]
    if (f) fileRef.current.files = e.dataTransfer.files
  }
  function onDrag(e){ e.preventDefault(); setDrag(true) }
  function onDragLeave(e){ e.preventDefault(); setDrag(false) }

  async function upload(){
    const f = fileRef.current?.files?.[0]
    if(!f){ toast?.show('Pick a file','error'); return }
    setBusy(true); setProgress(0)
    try{
      const fd = new FormData(); fd.append('audio', f)

      // raw XHR for progress
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', `${API_BASE}/api/upload`)
        xhr.setRequestHeader('x-admin-token', token || '')
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
        }
        xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('upload failed'))
        xhr.onerror = reject
        xhr.send(fd)
      })
      toast?.show('Uploaded', 'ok')
      onUploaded?.()
    }catch(e){
      toast?.show('Upload failed','error')
    }finally{
      setBusy(false); setProgress(0)
    }
  }

  return (
    <div className="bg-white border border-[#dcdcdc] rounded p-4">
      <h3 className="font-sans font-semibold mb-2">Upload MP3</h3>
      <div
        className={`border-2 border-dashed rounded p-6 text-center mb-3 ${drag?'border-[#052962]':'border-[#dcdcdc]'}`}
        onDragOver={onDrag} onDragEnter={onDrag} onDragLeave={onDragLeave} onDrop={onDrop}
      >
        <p className="text-sm text-[#666] mb-2">Drag & drop an MP3 here, or pick a file</p>
        <input type="file" accept="audio/*" ref={fileRef} className="block mx-auto"/>
      </div>
      {busy && <div className="w-full h-2 bg-[#eee] rounded"><div className="h-2 bg-[#052962] rounded" style={{width:`${progress}%`}}/></div>}
      <div className="mt-3">
        <button onClick={upload} disabled={busy} className="px-4 py-2 bg-[#052962] text-white rounded disabled:opacity-50">
          {busy?`Uploading… ${progress}%`:'Upload'}
        </button>
      </div>
    </div>
  )
}
