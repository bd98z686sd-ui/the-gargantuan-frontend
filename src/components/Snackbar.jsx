import React from 'react';
export default function Snackbar({ open, kind='ok', message, onClose }) {
  if (!open) return null;
  return (
    <div className={`fixed right-4 bottom-4 z-50 min-w-[260px] max-w-[90vw] px-4 py-3 rounded-lg shadow-xl flex gap-2 items-center ${kind==='error'?'bg-[#c70000] text-white':'bg-[#052962] text-white'}`}>
      <span>{message}</span>
      <button className="ml-auto font-bold" onClick={onClose} aria-label="Close">×</button>
    </div>
  );
}
