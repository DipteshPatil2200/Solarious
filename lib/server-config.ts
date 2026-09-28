import "server-only";
import { env as runtimeEnv } from "cloudflare:workers";

type ServerKey =
  | "BACKEND_API_URL"
  | "VITE_API_URL"
  | "ADMIN_API_TOKEN"
  | "ADMIN_USERNAME"
  | "ADMIN_PASSWORD";

const bindings = runtimeEnv as Record<string, string | undefined>;

export function serverValue(key: ServerKey): string {
  return (process.env[key] ?? bindings[key] ?? "").trim();
}

export function backendApiUrl(): string {
  const viteUrl = import.meta.env.VITE_API_URL as string | undefined;
  return (
    serverValue("BACKEND_API_URL") ||
    serverValue("VITE_API_URL") ||
    viteUrl?.trim() ||
    ""
  ).replace(/\/$/, "");
}

export function adminCredentials() {
  return {
    username: serverValue("ADMIN_USERNAME"),
    password: serverValue("ADMIN_PASSWORD"),
    apiToken: serverValue("ADMIN_API_TOKEN"),
  };
}
