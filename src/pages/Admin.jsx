import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminToken } from '../useAdminToken.js';
import Publish from '../components/Publish.jsx';
import ManagePosts from '../components/ManagePosts.jsx';
import Trash from '../components/Trash.jsx';
import Snackbar from '../components/Snackbar.jsx';
import { useSnackbar } from '../useSnackbar.js';

export default function Admin(){
  const { token, setToken } = useAdminToken();
  const toast = useSnackbar();
  const nav = useNavigate();
  const [showTools, setShowTools] = useState(!!token);
  const [tab, setTab] = useState('publish'); // 'publish' | 'manage' | 'trash'

  return (
    <div className="min-h-screen bg-[#f6f6f6] text-[#121212]">
      <header className="bg-[#052962] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 border-b-4 border-[#c70000]">
          <h1 className="text-3xl font-serif italic font-extrabold">The Gargantuan — Admin</h1>
          <p className="text-xs text-white/80 mt-1">Private publishing tools</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {!showTools && (
          <div className="bg-white border border-[#dcdcdc] rounded-lg p-4">
            <h3 className="font-headline text-xl mb-2">Enter admin token</h3>
            <p className="text-sm text-[#555] mb-3">Set the same token you configured on the backend (`ADMIN_TOKEN`).</p>
            <div className="flex gap-3">
              <input type="password" value={token} onChange={e=>setToken(e.target.value)}
                placeholder="Admin token" className="flex-1 border border-[#dcdcdc] rounded px-3 py-2 text-sm" />
              <button className="px-4 py-2 bg-[#052962] text-white rounded text-sm font-semibold"
                onClick={()=> setShowTools(true)}>Continue</button>
            </div>
            <button className="mt-3 text-sm underline text-[#052962]" onClick={()=>nav('/')}>← Back to site</button>
          </div>
        )}

        {showTools && (
          <>
            <div className="bg-white border border-[#dcdcdc] rounded-lg p-2 flex gap-2">
              {['publish','manage','trash'].map(k => (
                <button key={k} onClick={()=>setTab(k)}
                  className={`px-3 py-2 rounded ${tab===k?'bg-[#052962] text-white':'hover:bg-[#f0f0f0]'}`}>
                  {k[0].toUpperCase()+k.slice(1)}
                </button>
              ))}
            </div>

            {tab==='publish' && <Publish token={token} toast={toast} onDone={()=>toast.show('Published successfully.','ok')} />}
            {tab==='manage' && <ManagePosts token={token} toast={toast} />}
            {tab==='trash' && <Trash token={token} toast={toast} />}

            <button className="text-sm underline text-[#052962]" onClick={()=>nav('/')}>← Back to site</button>
          </>
        )}
      </main>

      <Snackbar open={toast.open} kind={toast.kind} message={toast.message} onClose={toast.close} />
    </div>
  );
}
