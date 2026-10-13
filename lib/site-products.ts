import "server-only";
import { products as defaults, type Product } from "@/data/site";
import { backendApiUrl } from "@/lib/server-config";

export async function getSiteProducts(): Promise<Product[]> {
  const normalise = (items: unknown[]): Product[] => items.filter((item): item is Product => Boolean(item && typeof item === "object" && typeof (item as Product).slug === "string" && typeof (item as Product).name === "string")).map(item => ({ ...item, applications: Array.isArray(item.applications) ? item.applications : [], features: Array.isArray(item.features) ? item.features : [], image: item.image || "/utility-solar.webp", summary: item.summary || "Technical configuration available on request.", technology: item.technology || "Solar module" }));
  try {
    const backend = backendApiUrl();
    if (backend) {
      const response = await fetch(`${backend}/api/products?limit=100`, { cache: "no-store", signal: AbortSignal.timeout(8_000) });
      if (response.ok) {
        const remote = await response.json() as { products?: Product[] };
        if (Array.isArray(remote.products)) return normalise(remote.products);
      }
      return defaults;
    }
    return defaults;
  } catch (error) {
    console.error("Unable to load product overrides", error);
    return defaults;
  }
}
