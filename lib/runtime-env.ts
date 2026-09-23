import { env } from "cloudflare:workers";
export const runtimeEnv = env as typeof env & { DB: D1Database; BUCKET: R2Bucket };
