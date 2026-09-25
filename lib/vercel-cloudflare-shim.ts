/**
 * Build-time compatibility for Vercel's Node runtime.
 *
 * The public site gracefully falls back to its checked-in content when the
 * Cloudflare D1/R2 bindings are unavailable. Full database, admin and upload
 * features still require the native Cloudflare deployment.
 */
export const env = {} as {
  DB?: D1Database;
  BUCKET?: R2Bucket;
};
