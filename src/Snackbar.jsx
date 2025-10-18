import React from 'react';

export default function Snackbar({ open, kind = 'ok', message, onClose }) {
  if (!open) return null;
  return (
    <div className={`snackbar ${kind === 'error' ? 'snackbar--error' : 'snackbar--ok'}`} role="status" aria-live="polite">
      <span>{message}</span>
      <button className="snackbar__close" onClick={onClose} aria-label="Close">×</button>
    </div>
  );
}
