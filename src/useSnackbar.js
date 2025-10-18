import { useCallback, useState } from 'react';

export function useSnackbar() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [kind, setKind] = useState('ok');

  const show = useCallback((msg, k='ok', ttl=3800) => {
    setMessage(msg);
    setKind(k);
    setOpen(true);
    if (ttl) setTimeout(() => setOpen(false), ttl);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  return { open, message, kind, show, close };
}
