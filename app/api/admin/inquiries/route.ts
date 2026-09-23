import { NextResponse } from "next/server";
import { runtimeEnv as env } from "@/lib/runtime-env";
import { getAdminUser } from "@/lib/admin-auth";

async function authorized() { return Boolean(await getAdminUser()); }

export async function GET() {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await env.DB.prepare("SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 500").all();
  return NextResponse.json({ inquiries: rows.results });
}

export async function PATCH(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status } = await request.json() as { id?: number; status?: string };
  if (!id || !["new", "contacted", "qualified", "closed"].includes(status ?? "")) {
    return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  }
  await env.DB.prepare("UPDATE inquiries SET status = ?, updated_at = ? WHERE id = ?").bind(status, new Date().toISOString(), id).run();
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  await env.DB.prepare("DELETE FROM inquiries WHERE id = ?").bind(id).run();
  return NextResponse.json({ ok: true });
}
