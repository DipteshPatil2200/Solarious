# Solarious production deployment

## Render API

- Root Directory: `backend`
- Build Command: `npm ci && npm run build`
- Start Command: `npm start`
- Health Check: `/api/health`
- Node: `22.22.0`

Required environment variables are listed in `backend/.env.example`. Configure them in Render; never commit their real values. `MONGODB_URI` must be an Atlas SRV URI and `DB_NAME` should remain `solarious`. `FRONTEND_ORIGINS` is a comma-separated allowlist of the production Vercel/custom frontend origins.

## Vercel frontend

- Framework preset: Next.js
- Root Directory: repository root
- Install Command: `npm ci`
- Build Command: `npm run build`

Set these server-side environment variables in Vercel:

- `BACKEND_API_URL=https://YOUR-RENDER-SERVICE.onrender.com` (preferred)
- `VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com` (compatibility alias; optional when `BACKEND_API_URL` is set)
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_API_TOKEN` (must exactly match Render)
- `NEXT_PUBLIC_SITE_URL=https://YOUR-PRODUCTION-FRONTEND-DOMAIN`

For a Render-hosted frontend, set the same frontend variables on the web service that owns the public frontend URL, not on `solarious-api`. `ADMIN_USERNAME` and `ADMIN_PASSWORD` have no production code defaults. `ADMIN_API_TOKEN` must be identical on both services. `BACKEND_API_URL` must contain only the backend origin (for example, `https://service.onrender.com`) and must not end in `/api`.

This is a standard Next.js App Router application, not a React Router SPA. Do not add a blanket rewrite to `index.html`; Next.js handles filesystem routes, direct navigation, refreshes, and the server-side API forwarding route.

## MongoDB Atlas

1. Create the `solarious` database and a least-privilege database user.
2. Allow Render outbound access using the Atlas network access controls appropriate for the service.
3. Set the SRV connection string only in Render as `MONGODB_URI`.
4. Export existing D1 rows to JSON and run `npm run migrate:d1 -- path/to/d1-export.json` from `backend/` with `MONGODB_URI` configured.
5. Existing R2 objects must be copied to Cloudinary separately; database documents store URLs/storage IDs only and never binary/Base64 files.

### MongoDB Compass

1. In Atlas open **Database → Connect → Compass** and copy the SRV connection string for the same cluster used by Render.
2. Open Compass, choose **New Connection**, paste the SRV string, and replace only the username/password placeholders locally.
3. If the password contains reserved URL characters, URL-encode it before placing it in the URI.
4. In Atlas **Network Access**, allow the administrator's current public IP. Do not use an unrestricted network rule unless the organisation explicitly accepts that risk.
5. Connect and select the `solarious` database. Expected collections include `inquiries`, `products`, `resources`, `herobanners`, `settings`, `creatives`, and `applicationlogs`.
6. Save credentials only in Compass's local secure connection storage. Never paste the real URI into source files, Vercel client variables, Git, screenshots, tickets, or logs.
