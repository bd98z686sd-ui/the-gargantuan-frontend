import { useEffect, useState } from 'react';
const STORAGE_KEY = 'gargantuan_admin_token';
export function useAdminToken() {
  const [token, setToken] = useState('');
  useEffect(() => { const s = localStorage.getItem(STORAGE_KEY); if (s) setToken(s); }, []);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, token||''); }, [token]);
  return { token, setToken };
}
