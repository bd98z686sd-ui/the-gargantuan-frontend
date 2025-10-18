# The Gargantuan — Frontend (Public + Private Admin)

- Public homepage at `/` (no uploader, just posts)
- Private admin tools at `/admin` (uploader with token)
- No visible link to `/admin` on the site; you must visit the URL directly

## Config
- Env var in Vercel: `VITE_API_BASE=https://YOUR-BACKEND.onrender.com`

## Admin flow
1. Go to `/admin`
2. Enter your admin token (same as backend `ADMIN_TOKEN`, stored locally)
3. Drag-and-drop MP3 → Upload progress → Generate video → Success snackbar

Backend must be deployed with the auth middleware and `ADMIN_TOKEN` set.
