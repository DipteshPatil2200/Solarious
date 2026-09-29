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
  const raw = (
    serverValue("BACKEND_API_URL") ||
    serverValue("VITE_API_URL") ||
    ""
  ).replace(/\/+$/, "");

  if (!raw) return "";

  try {
    const url = new URL(raw);
    if (!(["http:", "https:"].includes(url.protocol)) || url.pathname !== "/") {
      console.error("Invalid backend API configuration", {
        backendConfigured: Boolean(serverValue("BACKEND_API_URL")),
        compatibilityUrlConfigured: Boolean(serverValue("VITE_API_URL")),
        reason: "The backend URL must be an HTTP(S) origin without an /api path.",
      });
      return "";
    }
    return url.origin;
  } catch {
    console.error("Invalid backend API configuration", {
      backendConfigured: Boolean(serverValue("BACKEND_API_URL")),
      compatibilityUrlConfigured: Boolean(serverValue("VITE_API_URL")),
      reason: "The backend URL is not a valid absolute URL.",
    });
    return "";
  }
}

export function adminCredentials() {
  return {
    username: serverValue("ADMIN_USERNAME"),
    password: serverValue("ADMIN_PASSWORD"),
    apiToken: serverValue("ADMIN_API_TOKEN"),
  };
}
