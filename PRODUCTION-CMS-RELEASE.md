# Production CMS release

## Safe rollout

1. Create a MongoDB Atlas snapshot or export the `products`, `resources`, `settings`, `businesslocations`, and `creatives` collections.
2. Configure `MONGODB_URI`, `DB_NAME`, `CLOUDINARY_URL`, `FRONTEND_ORIGINS`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `PUBLIC_SITE_URL` on the backend. Keep secrets server-only.
3. Run `npm --prefix backend run migrate:cms:plan` and review the dry-run summary.
4. Run `npm --prefix backend run migrate:cms` once approved. The migration uses upserts and does not delete records.
5. Deploy the backend to staging, set the frontend `BACKEND_API_URL` to that staging origin, then deploy the frontend preview.
6. Complete authenticated upload, CMS, preview, mobile, and refresh checks in staging before promoting either deployment.

## Admin workflow

- **Products:** create or duplicate a draft, set technology independently from module type, upload an image, upload a PDF directly to Cloudinary, review the preview, then publish.
- **Site CMS:** edit About and Manufacturing copy, roadmap entries, locations, and branding. Client-supplied coordinates remain `pending` until confirmed.
- **Resources:** use the Certificates category for verified certificates. These appear on About; other documents remain in Resources.
- **Marketing / AI:** configure verified branding, select an occasion, language and output ratio, adjust typography, then generate. A deterministic template is used if the image provider is unavailable.

Product PDF uploads use a short-lived signed browser-to-Cloudinary request and server verification, so the 20 MiB file does not traverse the Vercel frontend function.
