Vercel build:
- Set env VITE_API_BASE to your backend URL.
- Uses npm 10 (Node 20). Vercel will auto-generate package-lock.json on first build if missing.

If you prefer to pre-create a lockfile locally:
  npm install --package-lock-only
