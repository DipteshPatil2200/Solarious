import { NextResponse } from "next/server";
import { backendApiUrl } from "@/lib/server-config";

const methodsWithBody = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const creativeTimeoutMs = 115_000;

async function forward(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const base = backendApiUrl();
  if (!base) {
    return NextResponse.json(
      { error: "Backend API is not configured. Set BACKEND_API_URL in the frontend environment." },
      { status: 503 },
    );
  }

  const { path } = await params;
  const pathname = `/api/${path.join("/")}`;
  const target = new URL(`${pathname}${new URL(request.url).search}`, base);
  const isCreativeGeneration = request.method === "POST" && pathname === "/api/admin/creatives";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), isCreativeGeneration ? creativeTimeoutMs : 30_000);
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  headers.delete("authorization");

  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
    redirect: "manual",
    cache: "no-store",
    signal: controller.signal,
  };
  if (methodsWithBody.has(request.method) && request.body) {
    init.body = request.body;
    init.duplex = "half";
  }

  try {
    const started = Date.now();
    const response = await fetch(target, init);
    if (isCreativeGeneration) console.error("[creative-proxy]", { backendHost: target.host, status: response.status, durationMs: Date.now() - started });
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    const detail = timedOut ? "timeout" : error instanceof Error ? error.message : "unknown connection error";
    if (isCreativeGeneration) console.error("[creative-proxy]", { backendHost: target.host, status: timedOut ? 504 : 503, durationMs: creativeTimeoutMs, detail });
    else console.error("Backend proxy failed", { target: target.origin, detail });
    return NextResponse.json(
      { error: timedOut ? "Creative generation timed out. Please check generation history before retrying." : "Backend service is unavailable." },
      { status: timedOut ? 504 : 503 },
    );
  } finally {
    clearTimeout(timeout);
  }
}

export const maxDuration = 120;

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
