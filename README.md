# Namma Bites

Namma Bites is a campus food ordering app. Users can browse menus, place orders, pay, and track status. Vendors can manage menus, subscriptions, and send notifications.

## Deploy on Render (Backend + Frontend)

### 1) Prerequisites
- Code in GitHub (root contains `backend/` and `frontend/`)
- Accounts/credentials:
  - MongoDB Atlas (MONGODB_URI)
  - Redis (Upstash or Render Redis) → REDIS_URL
  - Cloudinary (optional uploads) → CLOUDINARY_URL (or individual keys)
  - JWT secrets → JWT_SECRET, JWT_REFRESH_SECRET

### 2) Backend (Express API)
Create a Render Web Service:
- Root: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

Environment (Render → Service → Settings → Environment):
- `NODE_ENV=production`
- `CLIENT_ORIGIN=https://YOUR-FRONTEND.onrender.com`
- `MONGODB_URI=YOUR_ATLAS_URI`
- `JWT_SECRET=YOUR_LONG_RANDOM_STRING`
- `JWT_REFRESH_SECRET=YOUR_LONG_RANDOM_STRING`
- `REDIS_URL=rediss://USER:PASSWORD@HOST:PORT`
- `CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME` (or individual vars)

Wait for deploy → note Backend URL (e.g., `https://your-backend.onrender.com`).

### 3) Frontend (Vite Static Site)
Create a Render Static Site:
- Root: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`

Environment (Static Site):
- `VITE_API_URL=https://YOUR-BACKEND.onrender.com/api`
- `VITE_SERVER_URL=https://YOUR-BACKEND.onrender.com`

Wait for deploy → note Frontend URL (e.g., `https://your-frontend.onrender.com`).

### 4) Cross-wire URLs and redeploy
- Backend `CLIENT_ORIGIN` must be the exact frontend URL (HTTPS).
- Frontend `VITE_API_URL` must point to backend `/api`.
- If you change either URL, update envs and redeploy both services.

### 5) Verify
1. Open frontend URL (HTTPS). Login/register.
2. Check cookies in browser devtools → Application → Cookies:
   - `accessToken` and `refreshToken` should be `httpOnly=true`, `secure=true`, `sameSite=none`.
3. Test flows: place order, order confirmation (dynamic estimate), notifications (counter & details), vendor actions.

### 6) Notes / Troubleshooting
- CORS: backend uses `CLIENT_ORIGIN`, `credentials: true`.
- Proxy: `app.set('trust proxy', 1)` enabled (required for secure cookies on Render).
- Avoid hardcoded localhost in frontend; use `VITE_API_URL` and `VITE_SERVER_URL`.
- Redis & Cloudinary: ensure env vars are present/valid.
- Static hosting: backend serves only API; frontend is separate static site.
- Notification TTL: auto-deletes based on `validUntil` (TTL index).
- Render filesystem is ephemeral: persist images in Cloudinary.

### 7) Optional hardening
- Add compression middleware to backend
- Add CSP via Helmet
- Health checks and monitoring

---

## Environment Templates

Backend (.env on Render web service):
```
NODE_ENV=production
CLIENT_ORIGIN=https://YOUR-FRONTEND.onrender.com
MONGODB_URI=YOUR_ATLAS_URI
JWT_SECRET=YOUR_LONG_RANDOM_STRING
JWT_REFRESH_SECRET=YOUR_LONG_RANDOM_STRING
REDIS_URL=rediss://USER:PASSWORD@HOST:PORT
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

Frontend (.env on Render static site):
```
VITE_API_URL=https://YOUR-BACKEND.onrender.com/api
VITE_SERVER_URL=https://YOUR-BACKEND.onrender.com
```

---

## Local Development
Backend:
```
cd backend
npm install
npm run dev
```

Frontend:
```
cd frontend
npm install
npm run dev
```

---

## Features Snapshot
- User auth with secure cookies (httpOnly, secure, sameSite=none)
- Order placement with dynamic preparation time & queue updates
- Notifications (TTL auto-clean by validUntil; order-ready expires in 24h)
- Vendor notification form with validation & quick timing helpers
- Vendor subscriptions, menu management

