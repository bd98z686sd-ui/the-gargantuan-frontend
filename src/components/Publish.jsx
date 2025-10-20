import React, { useState, useRef } from 'react';
import MDEditor from '@uiw/react-md-editor';

// Unified publish form for The Gargantuan.  Allows the admin to create
// multimedia posts consisting of markdown text, optional images and optional
// audio.  When audio is provided the backend will automatically generate a
// spectrum video.  Posts can also be saved as drafts by toggling the draft
// checkbox.
const API_BASE = import.meta.env.VITE_API_BASE || 'https://the-gargantuan-backend.onrender.com';

export default function Publish({ token, toast, onDone }) {
  const [title, setTitle] = useState('The Gargantuan');
  const [body, setBody] = useState('');
  const [draft, setDraft] = useState(false);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const imageInputRef = useRef(null);

  // Insert an image into the markdown.  When the user selects a file this
  // handler uploads it to the `/api/images/upload` endpoint and inserts the
  // returned URL into the editor at the current cursor position.
  async function handleInsertImage(e) {
    e.preventDefault();
    if (!token) {
      toast?.show('Unauthorized (insert image).', 'error');
      return;
    }
    const file = imageInputRef.current?.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API_BASE}/api/images/upload`, {
        method: 'POST',
        headers: { 'x-admin-token': token },
        body: fd,
      });
      if (res.status === 401) {
        toast?.show('Unauthorized (image upload).', 'error');
        return;
      }
      if (!res.ok) throw new Error(`Image upload failed (${res.status})`);
      const { url } = await res.json();
      // Insert markdown image syntax at end of body.
      setBody(prev => `${prev}\n\n![alt](${url})`);
      toast?.show('Image uploaded', 'ok');
      // Reset the input so the same image can be selected again.
      imageInputRef.current.value = '';
    } catch (err) {
      toast?.show(err.message || 'Image upload failed', 'error');
    }
  }

  // Helper to show an unauthorized message.
  function unauthorized(where) {
    const msg = `Unauthorized (${where}). Check your admin token.`;
    setStatus('error');
    setMessage(msg);
    toast?.show(msg, 'error');
  }

  // Publish the post.  If an audio file is selected we must first upload it
  // using `/api/upload`, then generate a video and finally patch the meta with
  // the body and draft flag.  Otherwise we directly create a post via
  // `/api/create-post`.
  async function handlePublish(e) {
    e.preventDefault();
    if (!token) {
      unauthorized('no token');
      return;
    }
    const audioFile = audioRef.current?.files?.[0];
    try {
      if (audioFile) {
        // Step 1: upload audio
        setStatus('uploading');
        setProgress(0);
        setMessage('Uploading audio…');
        const fd = new FormData();
        fd.append('audio', audioFile);
        const upRes = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `${API_BASE}/api/upload`);
          xhr.setRequestHeader('x-admin-token', token);
          xhr.upload.onprogress = (evt) => {
            if (evt.lengthComputable) {
              setProgress(Math.round((evt.loaded / evt.total) * 100));
            }
          };
          xhr.onload = () => {
            if (xhr.status === 401) return reject({ unauthorized: true });
            if (xhr.status >= 200 && xhr.status < 300) {
              try { resolve(JSON.parse(xhr.responseText)); } catch { reject(new Error('Bad JSON')); }
            } else reject(new Error(`Upload failed (${xhr.status})`));
          };
          xhr.onerror = () => reject(new Error('Network error during upload'));
          xhr.send(fd);
        }).catch(err => {
          if (err?.unauthorized) unauthorized('upload');
          else toast?.show(err.message || 'Upload failed', 'error');
          throw err;
        });
        // Step 2: generate video
        setStatus('generating');
        setMessage('Generating video…');
        const genRes = await fetch(`${API_BASE}/api/generate-video`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
          body: JSON.stringify({ filename: `${upRes.id}.${audioFile.name.split('.').pop()}`, title }),
        });
        if (genRes.status === 401) {
          unauthorized('generate');
          return;
        }
        if (!genRes.ok) throw new Error(`Generate failed (${genRes.status})`);
        const { id } = await genRes.json();
        // Step 3: patch metadata with body, image and draft flag
        setStatus('saving');
        setMessage('Saving metadata…');
        const patchRes = await fetch(`${API_BASE}/api/posts/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
          body: JSON.stringify({ title, body, imageUrl: '', draft }),
        });
        if (patchRes.status === 401) {
          unauthorized('patch');
          return;
        }
        if (!patchRes.ok) throw new Error(`Patch failed (${patchRes.status})`);
        setStatus('done');
        setMessage('All done!');
        toast?.show('Published successfully.', 'ok');
        setTimeout(() => onDone?.(), 500);
      } else {
        // No audio; create text/image post directly
        setStatus('publishing');
        setMessage('Publishing…');
        const res = await fetch(`${API_BASE}/api/create-post`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
          body: JSON.stringify({ title, body, imageUrl: '', published: !draft }),
        });
        if (res.status === 401) {
          unauthorized('create');
          return;
        }
        if (!res.ok) throw new Error(`Publish failed (${res.status})`);
        setStatus('done');
        setMessage('All done!');
        toast?.show('Published successfully.', 'ok');
        setTimeout(() => onDone?.(), 500);
      }
      // Reset form
      setTitle('The Gargantuan');
      setBody('');
      setDraft(false);
      if (audioRef.current) audioRef.current.value = '';
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="bg-white border border-[#dcdcdc] rounded-lg p-4 sm:p-6">
      <h3 className="font-headline text-xl mb-2">Publish</h3>
      <form onSubmit={handlePublish} className="space-y-4">
        <div>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Title" className="w-full border border-[#dcdcdc] rounded px-3 py-2 text-sm" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold">Body (Markdown)</label>
          <div className="border border-[#dcdcdc] rounded">
            <MDEditor value={body} onChange={setBody} height={300} />
          </div>
          <div className="flex gap-3 items-center">
            <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={handleInsertImage} />
            <button type="button" onClick={() => imageInputRef.current?.click()} className="px-3 py-2 bg-[#052962] text-white rounded text-sm">Insert Image</button>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={draft} onChange={(e) => setDraft(e.target.checked)} /> Save as draft
            </label>
          </div>
        </div>
        <div>
          <label className="block mb-1 text-sm font-semibold">Optional audio (MP3/WAV)</label>
          <input type="file" accept="audio/*" ref={audioRef}
            className="w-full text-sm file:mr-4 file:py-2 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#052962] file:text-white hover:file:bg-[#173a7a]" />
        </div>
        <div className="flex justify-end gap-3 items-center">
          {status === 'uploading' && (<div className="w-full bg-[#eee] rounded h-2 overflow-hidden"><div className="h-2 bg-[#052962]" style={{ width: `${progress}%` }} /></div>)}
          {status === 'generating' && (<div className="w-full bg-[#eee] rounded h-2 overflow-hidden relative"><div className="h-2 bg-[#052962] animate-pulse w-1/3 absolute left-0" /></div>)}
          {message && <p className="text-sm text-[#052962]">{message}</p>}
          <button type="submit" className="px-4 py-2 bg-[#c70000] text-white rounded text-sm font-semibold hover:brightness-110">Publish</button>
        </div>
      </form>
    </div>
  );
}