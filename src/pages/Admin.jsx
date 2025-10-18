import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminToken } from '../useAdminToken.js';
import { useSnackbar } from '../useSnackbar.js';
import Snackbar from '../components/Snackbar.jsx';
import Uploader from '../components/Uploader.jsx';
import ShortsTab from '../components/ShortsTab.jsx';

export default function Admin(){
  const { token, setToken } = useAdminToken();
  const toast = useSnackbar();
  const nav = useNavigate();
  const [showTools, setShowTools] = useState(!!token);
  return (
    <div className="min-h-screen bg-[#f6f6f6] text-[#121212]">
      <header className="bg-[#052962] text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 border-b-4 border-[#c70000]">
          <h1 className="text-3xl font-serif italic font-extrabold">The Gargantuan — Admin</h1>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {!showTools && (
          <div className="bg-white border border-[#dcdcdc] rounded p-4">
            <h3 className="font-headline text-xl mb-2">Enter admin token</h3>
            <div className="flex gap-3">
              <input type="password" value={token} onChange={e=>setToken(e.target.value)} placeholder="Admin token" className="flex-1 border border-[#dcdcdc] rounded px-3 py-2 text-sm" />
              <button className="px-4 py-2 bg-[#052962] text-white rounded text-sm font-semibold" onClick={()=> setShowTools(true)}>Continue</button>
            </div>
            <button className="mt-3 text-sm underline text-[#052962]" onClick={()=>nav('/')}>← Back to site</button>
          </div>
        )}
        {showTools && (<>
          <Uploader token={token} toast={toast} onUploaded={()=>{}} />
          <ShortsTab token={token} toast={toast} />
          <button className="text-sm underline text-[#052962]" onClick={()=>nav('/')}>← Back to site</button>
        </>)}
      </main>
      <Snackbar open={toast.open} kind={toast.kind} message={toast.message} onClose={toast.close} />
    </div>
  );
}
