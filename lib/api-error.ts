export async function apiError(
  response: Response,
  fallback: string,
): Promise<Error> {
  try {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = (await response.json()) as { error?: string };
      if (body.error) return new Error(body.error);
    } else {
      const message = (await response.text()).trim();
      if (message) return new Error(message);
    }
  } catch {
    // Fall through to the status-aware fallback.
  }
  return new Error(`${fallback} (HTTP ${response.status})`);
}
