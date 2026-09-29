import "server-only";

type ServerKey =
  | "BACKEND_API_URL"
  | "VITE_API_URL"
  | "ADMIN_API_TOKEN"
  | "ADMIN_USERNAME"
  | "ADMIN_PASSWORD";

export function serverValue(key: ServerKey): string {
  return (process.env[key] ?? "").trim();
}

export function backendApiUrl(): string {
  return (
    serverValue("BACKEND_API_URL") ||
    serverValue("VITE_API_URL") ||
    ""
  ).replace(/\/+$/, "");
}

export function adminCredentials() {
  return {
    username: serverValue("ADMIN_USERNAME") || "admin",
    password: serverValue("ADMIN_PASSWORD"),
    apiToken: serverValue("ADMIN_API_TOKEN"),
  };
}
