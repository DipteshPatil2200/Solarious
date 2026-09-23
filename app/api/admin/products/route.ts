import { NextResponse } from "next/server";
import { runtimeEnv as env } from "@/lib/runtime-env";
import { getAdminUser } from "@/lib/admin-auth";
import { getSiteProducts } from "@/lib/site-products";

export async function GET() {
  if (!(await getAdminUser())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ products: await getSiteProducts(true) });
}

export async function PUT(request: Request) {
  if (!(await getAdminUser())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const product = await request.json() as Record<string, unknown>;
  const text = (key: string, max = 2000) => typeof product[key] === "string" ? product[key].trim().slice(0, max) : "";
  const slug = text("slug", 80);
  const name = text("name", 120);
  if (!/^[a-z0-9-]+$/.test(slug) || !name) return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  const list = (key: string) => Array.isArray(product[key]) ? (product[key] as unknown[]).filter((v): v is string => typeof v === "string").map(v => v.trim()).filter(Boolean).slice(0, 20) : [];
  await env.DB.prepare(`INSERT INTO product_overrides (slug,name,technology,summary,applications,features,bifacial,image,published,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(slug) DO UPDATE SET name=excluded.name,technology=excluded.technology,summary=excluded.summary,applications=excluded.applications,features=excluded.features,bifacial=excluded.bifacial,image=excluded.image,published=excluded.published,updated_at=excluded.updated_at`).bind(
    slug, name, text("technology", 200), text("summary", 3000), JSON.stringify(list("applications")),
    JSON.stringify(list("features")), text("bifacial", 100), text("image", 300), product.published === false ? 0 : 1, new Date().toISOString(),
  ).run();
  return NextResponse.json({ ok: true });
}
