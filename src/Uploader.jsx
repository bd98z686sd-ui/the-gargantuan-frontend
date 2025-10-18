import React, { useRef, useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://the-gargantuan-backend.onrender.com';

export default function Uploader({ onDone, token, requireToken, toast }) {
  const fileRef = useRef(null);
  const [title, setTitle] = useState('The Gargantuan');
  const [status, setStatus] = useState('idle'); // idle | uploading | generating | done | error
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file && file.type.match(/audio\/(mp3|mpeg)/)) {
        const dt = new DataTransfer();
        dt.items.add(file);
        fileRef.current.files = dt.files;
        setMessage(`Selected: ${file.name}`);
      } else {
        setStatus('error');
        setMessage('Please drop an MP3 file.');
        toast?.show('Please drop an MP3 file.', 'error');
      }
    }
  }, [toast]);

  function onDragOver(e) { e.preventDefault(); e.stopPropagation(); setDragActive(true); }
  function onDragLeave(e) { e.preventDefault(); e.stopPropagation(); setDragActive(false); }

  function handleUnauthorized(where='request') {
    setStatus('error');
    const msg = `Unauthorized (${where}). Check your admin token.`;
    setMessage(msg);
    toast?.show(msg, 'error');
  }

  async function handleUpload(e) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setStatus('error');
      setMessage('Please choose an audio file (.mp3)');
      toast?.show('Please choose an audio file (.mp3)', 'error');
      return;
    }
    if (requireToken && !token) {
      handleUnauthorized('no token provided');
      return;
    }
    try {
      setStatus('uploading');
      setProgress(0);
      setMessage('Uploading audio…');

      // Use XHR to track upload progress
      const fd = new FormData();
      fd.append('audio', file);

      const upJson = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE}/api/upload`);
        if (token) xhr.setRequestHeader('x-admin-token', token);
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            const pct = Math.round((evt.loaded / evt.total) * 100);
            setProgress(pct);
          }
        };
        xhr.onload = () => {
          if (xhr.status === 401) return reject({ unauthorized: true });
          if (xhr.status >= 200 && xhr.status < 300) {
            try { resolve(JSON.parse(xhr.responseText)); }
            catch { reject(new Error('Bad JSON from server')); }
          } else {
            reject(new Error(`Upload failed (${xhr.status})`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(fd);
      }).catch((err) => {
        if (err && err.unauthorized) { handleUnauthorized('upload'); }
        else { setStatus('error'); setMessage(err.message || 'Upload failed'); toast?.show(err.message || 'Upload failed', 'error'); }
        throw err;
      });

      if (!upJson || !upJson.filename) return;

      setStatus('generating');
      setMessage('Generating video…');

      const gen = await fetch(`${API_BASE}/api/generate-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'x-admin-token': token } : {}),
        },
        body: JSON.stringify({ filename: upJson.filename, title }),
      });

      if (gen.status === 401) {
        handleUnauthorized('generate');
        return;
      }
      if (!gen.ok) throw new Error(`Generate failed (${gen.status})`);
      const genJson = await gen.json();

      setStatus('done');
      setMessage('All done! Refreshing feed…');
      toast?.show('Published successfully.', 'ok');
      setTimeout(() => onDone?.(genJson), 800);
    } catch (err) {
      // already handled
    }
  }

  return (
    <div className="bg-white border border-[#dcdcdc] rounded-lg p-4 sm:p-6">
      <h3 className="font-headline text-xl mb-2">Publish today’s audio</h3>
      <p className="text-sm text-[#555] mb-4">Upload your MP3 and I’ll generate a video automatically.</p>

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={
          `mb-3 rounded border-2 border-dashed p-6 text-center transition
           ${dragActive ? 'border-[#052962] bg-[#e6ecf6]' : 'border-[#dcdcdc] bg-[#fafafa]'}`
        }
      >
        <p className="text-sm text-[#333] mb-2">Drag & drop your MP3 here, or choose a file</p>
        <input
          type="file"
          accept="audio/mp3,audio/mpeg"
          ref={fileRef}
          className="mx-auto block text-sm file:mr-4 file:py-2 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#052962] file:text-white hover:file:bg-[#173a7a]"
        />
      </div>

      <form onSubmit={handleUpload} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="flex-1 border border-[#dcdcdc] rounded px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#c70000] text-white rounded text-sm font-semibold hover:brightness-110 disabled:opacity-50"
            disabled={status === 'uploading' || status === 'generating' || (requireToken && !token)}
            title={(requireToken && !token) ? 'Set admin token first' : ''}
          >
            {status === 'uploading' ? 'Uploading…' : status === 'generating' ? 'Generating…' : 'Publish'}
          </button>
        </div>

        {(status === 'uploading') && (
          <div className="w-full bg-[#eee] rounded h-2 overflow-hidden">
            <div className="h-2 bg-[#052962] transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}

        {(status === 'generating') && (
          <div className="w-full bg-[#eee] rounded h-2 overflow-hidden relative">
            <div className="h-2 bg-[#052962] animate-pulse w-1/3 absolute left-0 right-0" />
          </div>
        )}

        {status !== 'idle' && (
          <p className={
            status === 'error'
              ? 'text-red-600 text-sm'
              : 'text-[#052962] text-sm'
          }>{message}</p>
        )}
      </form>

      <p className="text-xs text-[#777] mt-3">If enabled, the admin token is required and sent as <code>x-admin-token</code>.</p>
    </div>
  );
}
