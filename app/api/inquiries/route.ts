import { NextResponse } from "next/server";
import { runtimeEnv as env } from "@/lib/runtime-env";

const clean = (value: unknown, max = 2000) => typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const name = clean(body.name, 120);
    const email = clean(body.email, 180);
    if (!name || !email || !email.includes("@")) {
      return NextResponse.json({ error: "Please provide a valid name and email address." }, { status: 400 });
    }
    const now = new Date().toISOString();
    await env.DB.prepare(`INSERT INTO inquiries (kind,name,company,email,phone,product,capacity,location,message,details,status,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
      clean(body.kind, 20) || "contact", name, clean(body.company, 160), email,
      clean(body.phone, 40), clean(body.product, 80), clean(body.capacity, 80),
      clean(body.location, 180), clean(body.message, 5000), JSON.stringify(body.details ?? {}),
      "new", now, now,
    ).run();
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Inquiry submission failed", error);
    return NextResponse.json({ error: "We could not submit your request. Please try again." }, { status: 500 });
  }
}
