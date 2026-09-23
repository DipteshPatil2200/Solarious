import "server-only";
import { env } from "cloudflare:workers";
import { products as defaults, type Product } from "@/data/site";

type ProductRow = Omit<Product, "applications" | "features"> & {
  applications: string;
  features: string;
  published: number;
};

export async function getSiteProducts(includeUnpublished = false): Promise<Product[]> {
  try {
    if (!env.DB) return defaults;
    const result = await env.DB.prepare("SELECT slug, name, technology, summary, applications, features, bifacial, image, published FROM product_overrides").all<ProductRow>();
    const overrides = new Map(result.results.map((row) => [row.slug, row]));
    return defaults.flatMap((fallback) => {
      const row = overrides.get(fallback.slug);
      if (!row) return [fallback];
      if (!includeUnpublished && !row.published) return [];
      return [{
        slug: row.slug,
        name: row.name,
        technology: row.technology,
        summary: row.summary,
        applications: JSON.parse(row.applications),
        features: JSON.parse(row.features),
        bifacial: row.bifacial,
        image: row.image,
      }];
    });
  } catch (error) {
    console.error("Unable to load product overrides", error);
    return defaults;
  }
}
