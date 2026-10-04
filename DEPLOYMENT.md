# Solarious production deployment

## Render API

- Root Directory: `backend`
- Build Command: `npm ci && npm run build`
- Start Command: `npm start`
- Health Check: `/api/health`
- Node: `22.22.0`

Required environment variables are listed in `backend/.env.example`. Configure them in Render; never commit their real values. `MONGODB_URI` must be the Atlas SRV URI for `cluster.il8ftxi.mongodb.net` and `DB_NAME` should remain `solarious`. `FRONTEND_ORIGINS` is a comma-separated allowlist of the production Vercel/custom frontend origins.

## Vercel frontend

- Framework preset: Next.js
- Root Directory: repository root
- Install Command: `npm ci`
- Build Command: `npm run build`

Set these server-side environment variables in Vercel:

- `BACKEND_API_URL=https://YOUR-RENDER-SERVICE.onrender.com`
- `VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com` (supported server-side compatibility alias; no secret belongs in this variable)
- `NEXT_PUBLIC_SITE_URL=https://YOUR-PRODUCTION-FRONTEND-DOMAIN`

Do not configure admin credentials or a permanent backend token on Vercel. The browser signs in through the frontend route, Render validates the server-side `ADMIN_USERNAME` and `ADMIN_PASSWORD`, and Render returns a signed, short-lived HttpOnly cookie. `BACKEND_API_URL` must contain only the backend origin and must not end in `/api`.

This is a standard Next.js App Router application, not a React Router SPA. Do not add a blanket rewrite to `index.html`; Next.js handles filesystem routes, direct navigation, refreshes, and the server-side API forwarding route.

## MongoDB Atlas

1. Create the `solarious` database and a least-privilege database user.
2. Allow Render outbound access using the Atlas network access controls appropriate for the service.
3. Set the SRV connection string only in Render as `MONGODB_URI`.
4. Install MongoDB Database Tools (`mongodump` and `mongorestore`) on the trusted migration workstation.
5. From `backend/`, set `ATLAS_MONGODB_URI`, keep `LOCAL_MONGODB_URI` pointed at local MongoDB, and run `npm run migrate:mongo:plan`. This dry-run changes no data and prints no credentials.
6. Run `npm run migrate:mongo` only after reviewing the plan. It creates BSON backups of both the local database and the current Atlas database before restore. It refuses to restore when Atlas contains any records and never uses `--drop`.
7. Keep the generated `backups/` directory outside Git and retain it until production verification is complete.
8. The older D1 importer remains available as `npm run migrate:d1 -- path/to/d1-export.json` only for a separately reviewed D1 export.
9. Existing R2 objects must be copied to Cloudinary separately; database documents store URLs/storage IDs only and never binary/Base64 files.

### MongoDB Compass

1. In Atlas open **Database → Connect → Compass** and copy the SRV connection string for the same cluster used by Render.
2. Open Compass, choose **New Connection**, paste the SRV string, and replace only the username/password placeholders locally.
3. If the password contains reserved URL characters, URL-encode it before placing it in the URI.
4. In Atlas **Network Access**, allow the administrator's current public IP. Do not use an unrestricted network rule unless the organisation explicitly accepts that risk.
5. Connect and select the `solarious` database. Expected collections include `inquiries`, `products`, `resources`, `herobanners`, `settings`, `creatives`, and `applicationlogs`.
6. Save credentials only in Compass's local secure connection storage. Never paste the real URI into source files, Vercel client variables, Git, screenshots, tickets, or logs.
