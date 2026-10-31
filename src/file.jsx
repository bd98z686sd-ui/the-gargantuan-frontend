import React, { useState, useRef } from 'react';

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

  const [coverFile, setCoverFile] = useState(null);
  const [coverUrl, setCoverUrl] = useState('');
  const [generateVideo, setGenerateVideo] = useState(true);

  // Insert an image into the markdown body.
  async function handleInsertImage(e) {
    e.preventDefault();
    if (!token) { toast?.show('Unauthorized (insert image).', 'error'); return; }
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
      if (res.status === 401) { toast?.show('Unauthorized (image upload).', 'error'); return; }
      if (!res.ok) throw new Error(`Image upload failed (${res.status})`);
      const { url } = await res.json();
      setBody(prev => `${prev}\n\n![alt](${url})`);
      toast?.show('Image uploaded', 'ok');
      imageInputRef.current.value = '';
    } catch (err) {
      toast?.show(err.message || 'Image upload failed', 'error');
    }
  }

  // FIX: accept the file as an argument instead of reading from state,
  // which avoids the React state update race condition.
  async function uploadCover(fileToUpload) {
    if (!fileToUpload) return '';
    if (!token) { toast?.show('Unauthorized (cover upload).', 'error'); return ''; }
    try {
      const fd = new FormData();
      fd.append('image', fileToUpload);
      const res = await fetch(`${API_BASE}/api/images/upload`, {
        method: 'POST',
        headers: { 'x-admin-token': token },
        body: fd,
      });
      if (res.status === 401) { toast?.show('Unauthorized (cover upload).', 'error'); return ''; }
      if (!res.ok) throw new Error(`Cover upload failed (${res.status})`);
      const { url } = await res.json();
      setCoverUrl(url);
      toast?.show('Cover uploaded', 'ok');
      return url;
    } catch (err) {
      toast?.show(err.message || 'Cover upload failed', 'error');
      return '';
    }
  }

  // FIX: pass the file directly to uploadCover rather than relying on state.
  function handleCoverChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverUrl('');
    uploadCover(file);
  }

  function unauthorized(where) {
    const msg = `Unauthorized (${where}). Check your admin token.`;
    setStatus('error');
    setMessage(msg);
    toast?.show(msg, 'error');
  }

  async function handlePublish(e) {
    e.preventDefault();
    if (!token) { unauthorized('no token'); return; }
    const audioFile = audioRef.current?.files?.[0];
    try
