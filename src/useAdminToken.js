import { useEffect, useState } from 'react';

const STORAGE_KEY = 'gargantuan_admin_token';
const REQUIRE_KEY = 'gargantuan_require_token';

export function useAdminToken() {
  const [token, setToken] = useState('');
  const [requireToken, setRequireToken] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const req = localStorage.getItem(REQUIRE_KEY);
    if (saved) setToken(saved);
    if (req) setRequireToken(req === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, token || '');
  }, [token]);

  useEffect(() => {
    localStorage.setItem(REQUIRE_KEY, String(requireToken));
  }, [requireToken]);

  return { token, setToken, requireToken, setRequireToken };
}
