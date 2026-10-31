import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminToken } from '../useAdminToken.js';
import Publish from '../components/Publish.jsx';
import ManagePosts from '../components/ManagePosts.jsx';
import Trash from '../components/Trash.jsx';
import Snackbar from '../components/Snackbar.jsx';
import { useSnackbar } from '../useSnackbar.js';

const TABS = ['publish', 'manage', 'trash'];

export default function Admin() {
  const { token, setToken } = useAdminToken();
  const toast = useSnackbar();
  const nav = useNavigate();
  const [showTools, setShowTools] = useState(!!token);
  const [tab, setTab] = useState('publish');
  const [draft, setDraft] = useState('');

  function handleContinue() {
    if (!draft.trim()) {
      toast.show('Please enter your admin token.', 'error');
      return;
    }
    setToken(draft.trim());
    setShowTools(true);
  }

  function handleLock() {
    setToken('');
    setDraft('');
    setShowTools(false);
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6] text-[#121212]">

      {/* ── Header ── */}
      <header className="bg-[#052962] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between py-4 border-b border-white/20">
            <div>
              <p className="text-xs text-white/50 uppercase tracking-widest font-sans">
                Admin
              </p>
              <p className="text-xs text-white/40 mt-0.5 font-sans">
                Private publishing tools
              </p>
            </div>
            <div className="text-right leading-none">
              <span className="block text-sm font-serif italic text-white/80">The</span>
              <span className="block text-4xl sm:text-5xl font-serif font-black italic tracking-tight">
                Gargantuan
              </span>
            </div>
          </div>

          {/* Tab bar — only shown when logged in */}
          {showTools && (
            <nav className="flex gap-0">
              {TABS.map(k => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={`
                    px-4 py-3 text-sm font-semibold font-sans capitalize whitespace-nowrap
                    border-b-4 transition-colors
                    ${tab === k
                      ? 'border-[#c70000] text-white'
                      : 'border-transparent text-white/70 hover:text-white hover:border-white/30'}
                  `}
                >
                  {k}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* ── Red rule ── */}
      <div className="h-[3px] bg-[#c70000]" />

      {/* ── Main ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Token entry screen */}
        {!showTools && (
          <div className="bg-white border border-[#dcdcdc] p-6 max-w-md">
            <h2 className="font-serif font-bold text-2xl mb-1">Sign in</h2>
            <p className="text-sm text-[#555] mb-4">
              Enter the admin token you set in Render to continue.
            </p>
            <input
              type="password"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleContinue()}
              placeholder="Admin token"
              className="w-full border border-[#dcdcdc] rounded-none px-3 py-2 text-sm mb-3 focus:outline-none focus:border-[#052962]"
            />
            <div className="flex gap-3">
              <button
                onClick={handleContinue}
                className="px-5 py-2 bg-[#052962] text-white text-sm font-semibold hover:brightness-110"
              >
                Continue
              </button>
              <button
                onClick={() => nav('/')}
                className="px-5 py-2 border border-[#dcdcdc] text-sm font-semibold hover:bg-[#f0f0f0]"
              >
                ← Back to site
              </button>
            </div>
          </div>
        )}

        {/* Tools */}
        {showTools && (
          <>
            {tab === 'publish' && (
              <Publish
                token={token}
                toast={toast}
                onDone={() => toast.show('Published successfully.', 'ok')}
              />
            )}
            {tab === 'manage' && (
              <ManagePosts token={token} toast={toast} />
            )}
            {tab === 'trash' && (
              <Trash token={token} toast={toast} />
            )}

            <div className="flex gap-4 pt-2">
              <button
                onClick={() => nav('/')}
                className="text-sm underline text-[#052962]"
              >
                ← Back to site
              </button>
              <button
                onClick={handleLock}
                className="text-sm underline text-[#c70000]"
              >
                Lock admin
              </button>
            </div>
          </>
        )}
      </main>

      <Snackbar open={toast.open} kind={toast.kind} message={toast.message} onClose={toast.close} />
    </div>
  );
}
