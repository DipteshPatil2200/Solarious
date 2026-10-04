import { NextResponse } from "next/server";
import { backendApiUrl } from "@/lib/server-config";

const methodsWithBody = new Set(["POST", "PUT", "PATCH", "DELETE"]);

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
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  headers.delete("authorization");

  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
    redirect: "manual",
    cache: "no-store",
  };
  if (methodsWithBody.has(request.method) && request.body) {
    init.body = request.body;
    init.duplex = "half";
  }

  try {
    const response = await fetch(target, init);
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown connection error";
    console.error("Backend proxy failed", { target: target.origin, detail });
    return NextResponse.json(
      { error: `Backend service is unavailable: ${detail}` },
      { status: 503 },
    );
  }
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
