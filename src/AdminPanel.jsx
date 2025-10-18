import React from 'react';

export default function AdminPanel({ token, setToken, requireToken, setRequireToken }) {
  return (
    <div className="bg-white border border-[#dcdcdc] rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={requireToken}
          onChange={(e) => setRequireToken(e.target.checked)}
          className="h-4 w-4"
        />
        Require admin token to publish
      </label>
      <input
        type="password"
        placeholder="Set admin token…"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        className="border border-[#dcdcdc] rounded px-3 py-2 text-sm flex-1 w-full sm:w-80"
      />
      <span className="text-xs text-[#777]">Saved locally in your browser.</span>
    </div>
  );
}
