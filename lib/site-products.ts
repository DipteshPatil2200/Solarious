import "server-only";
import { products as defaults, type Product } from "@/data/site";
import { backendApiUrl } from "@/lib/server-config";

export async function getSiteProducts(): Promise<Product[]> {
  try {
    const backend = backendApiUrl();
    if (backend) {
      const response = await fetch(`${backend}/api/products`, { cache: "no-store" });
      if (response.ok) {
        const remote = await response.json() as { products?: Product[] };
        if (remote.products?.length) return remote.products;
      }
      return defaults;
    }
    return defaults;
  } catch (error) {
    console.error("Unable to load product overrides", error);
    return defaults;
  }
}
