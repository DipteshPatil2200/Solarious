"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Eye, FileUp, ImageUp, Loader2, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import { apiError } from "@/lib/api-error";

type AdminProduct = {
  id?: string;
  slug: string;
  name: string;
  modelNumber?: string;
  category?: string;
  technology: string;
  summary: string;
  description?: string;
  image?: string;
  imageStorageId?: string;
  datasheetUrl?: string;
  datasheetStorageId?: string;
  applications?: string[];
  features?: string[];
  powerRating?: string;
  efficiency?: string;
  cellType?: string;
  dimensions?: string;
  warranty?: string;
  displayOrder?: number;
  published?: boolean;
};

const emptyProduct = (): AdminProduct => ({
  slug: "", name: "", modelNumber: "", category: "Mono PERC", technology: "",
  summary: "", description: "", image: "", datasheetUrl: "", applications: [], features: [],
  powerRating: "", efficiency: "", cellType: "", dimensions: "", warranty: "", displayOrder: 0, published: false,
});

const listValue = (value: string) => value.split("\n").map((item) => item.trim()).filter(Boolean);
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"image" | "datasheet" | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminFetch("/api/admin/products");
      if (!response.ok) throw await apiError(response, "Products could not be loaded");
      const data = await response.json() as { products?: AdminProduct[] };
      setProducts(data.products ?? []);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Products could not be loaded.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const upload = async (file: File, type: "image" | "datasheet") => {
    if (!editing) return;
    setError(""); setNotice(""); setUploading(type);
    try {
      const form = new FormData(); form.append(type === "image" ? "image" : "datasheet", file);
      const response = await adminFetch(`/api/admin/products/upload-${type}`, { method: "POST", body: form });
      if (!response.ok) throw await apiError(response, `${type === "image" ? "Image" : "Datasheet"} upload failed`);
      const data = await response.json() as { url: string; storageId: string };
      setEditing((product) => product ? { ...product, [type === "image" ? "image" : "datasheetUrl"]: data.url, [type === "image" ? "imageStorageId" : "datasheetStorageId"]: data.storageId } : product);
      setNotice(`${type === "image" ? "Image" : "Datasheet"} uploaded. Save the product to keep this link.`);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Upload failed.");
    } finally { setUploading(null); }
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const creating = !products.some((product) => product.slug === editing.slug);
    const payload = { ...editing, slug: slugify(editing.slug || editing.name) };
    if (!payload.slug || !payload.name.trim() || !payload.technology.trim() || !payload.summary.trim()) {
      setError("Product name, slug, technology and short description are required."); return;
    }
    setSaving(true); setError(""); setNotice("");
    try {
      const response = await adminFetch("/api/admin/products", {
        method: creating ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (!response.ok) throw await apiError(response, "Product could not be saved");
      const data = await response.json() as { product: AdminProduct };
      setProducts((current) => creating ? [...current, data.product].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)) : current.map((item) => item.slug === editing.slug ? data.product : item));
      setEditing(null); setNotice(creating ? "Product created successfully." : "Product changes saved successfully.");
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Product could not be saved.");
    } finally { setSaving(false); }
  };

  const remove = async (product: AdminProduct) => {
    if (!confirm(`Delete ${product.name}? This cannot be undone.`)) return;
    setError(""); setNotice("");
    try {
      const response = await adminFetch(`/api/admin/products?slug=${encodeURIComponent(product.slug)}`, { method: "DELETE" });
      if (!response.ok) throw await apiError(response, "Product could not be deleted");
      setProducts((current) => current.filter((item) => item.slug !== product.slug));
      setNotice("Product deleted successfully.");
    } catch (cause: unknown) { setError(cause instanceof Error ? cause.message : "Product could not be deleted."); }
  };

  const togglePublished = async (product: AdminProduct) => {
    setError(""); setNotice("");
    try {
      const response = await adminFetch("/api/admin/products", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...product, published: product.published === false }) });
      if (!response.ok) throw await apiError(response, "Product publication status could not be changed");
      const data = await response.json() as { product: AdminProduct };
      setProducts((current) => current.map((item) => item.slug === product.slug ? data.product : item));
      setNotice(product.published === false ? "Product published to the public catalogue." : "Product returned to draft.");
    } catch (cause: unknown) { setError(cause instanceof Error ? cause.message : "Product publication status could not be changed."); }
  };

  const productCount = useMemo(() => products.length, [products.length]);

  return <section className="admin-panel">
    <div className="admin-panel-head"><div><h2>Manage products</h2><p>{productCount} catalogue {productCount === 1 ? "product" : "products"}. Drafts stay private until published.</p></div><button className="button" onClick={() => { setError(""); setNotice(""); setEditing(emptyProduct()); }}><Plus size={16}/> Add product</button></div>
    {notice && <div className="admin-notice">{notice}</div>}{error && <div className="admin-notice admin-notice-error">{error}</div>}
    {loading ? <div className="admin-loading"><Loader2 className="spin"/> Loading products…</div> : <div className="admin-product-grid">{products.map((product) => <article key={product.slug}>
      {product.image ? <img src={product.image} alt=""/> : <div className="admin-product-image-empty">No image</div>}
      <div><span>{product.category || product.technology}</span><h3>{product.name}</h3><p>{product.summary}</p><small>{product.published === false ? "Draft" : "Published"} · Order {product.displayOrder ?? 0}</small><div className="admin-inline-actions"><button className="button button-ghost" onClick={() => { setError(""); setEditing({ ...product, applications: product.applications ?? [], features: product.features ?? [] }); }}><Pencil size={15}/> Edit</button><button className="button button-ghost" onClick={() => void togglePublished(product)}>{product.published === false ? "Publish" : "Unpublish"}</button><button className="icon-button danger" onClick={() => void remove(product)} aria-label={`Delete ${product.name}`}><Trash2 size={16}/></button></div></div>
    </article>)}</div>}
    {!loading && !products.length && <div className="admin-empty">No products have been added yet.</div>}
    {editing && <div className="admin-modal-backdrop" role="presentation" onMouseDown={() => !saving && setEditing(null)}><div className="admin-modal admin-product-modal" role="dialog" aria-modal="true" aria-labelledby="product-editor" onMouseDown={(event) => event.stopPropagation()}><h2 id="product-editor">{products.some((item) => item.slug === editing.slug) ? "Edit product" : "Add product"}</h2><form onSubmit={save}>
      <div className="admin-form-grid"><label>Product name *<input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value, slug: editing.slug || slugify(event.target.value) })} required/></label><label>Model number<input value={editing.modelNumber ?? ""} onChange={(event) => setEditing({ ...editing, modelNumber: event.target.value })}/></label><label>Slug *<input value={editing.slug} onChange={(event) => setEditing({ ...editing, slug: slugify(event.target.value) })} required/></label><label>Category<select value={editing.category ?? ""} onChange={(event) => setEditing({ ...editing, category: event.target.value })}><option>Mono PERC</option><option>TOPCon</option><option>HJT</option><option>Bifacial</option><option>Other</option></select></label><label>Technology *<input value={editing.technology} onChange={(event) => setEditing({ ...editing, technology: event.target.value })} required/></label><label>Display order<input type="number" min="0" value={editing.displayOrder ?? 0} onChange={(event) => setEditing({ ...editing, displayOrder: Number(event.target.value) || 0 })}/></label></div>
      <label>Short description *<textarea rows={3} value={editing.summary} onChange={(event) => setEditing({ ...editing, summary: event.target.value })} required/></label><label>Detailed description<textarea rows={4} value={editing.description ?? ""} onChange={(event) => setEditing({ ...editing, description: event.target.value })}/></label>
      <div className="admin-form-grid"><label>Power range<input value={editing.powerRating ?? ""} onChange={(event) => setEditing({ ...editing, powerRating: event.target.value })}/></label><label>Module efficiency<input value={editing.efficiency ?? ""} onChange={(event) => setEditing({ ...editing, efficiency: event.target.value })}/></label><label>Cell technology<input value={editing.cellType ?? ""} onChange={(event) => setEditing({ ...editing, cellType: event.target.value })}/></label><label>Dimensions<input value={editing.dimensions ?? ""} onChange={(event) => setEditing({ ...editing, dimensions: event.target.value })}/></label><label>Warranty<input value={editing.warranty ?? ""} onChange={(event) => setEditing({ ...editing, warranty: event.target.value })}/></label><label>Status<select value={editing.published === false ? "draft" : "published"} onChange={(event) => setEditing({ ...editing, published: event.target.value === "published" })}><option value="draft">Draft</option><option value="published">Published</option></select></label></div>
      <label>Applications (one per line)<textarea rows={3} value={(editing.applications ?? []).join("\n")} onChange={(event) => setEditing({ ...editing, applications: listValue(event.target.value) })}/></label><label>Features (one per line)<textarea rows={3} value={(editing.features ?? []).join("\n")} onChange={(event) => setEditing({ ...editing, features: listValue(event.target.value) })}/></label>
      <div className="admin-form-grid"><label>Main image URL<input value={editing.image ?? ""} onChange={(event) => setEditing({ ...editing, image: event.target.value })}/></label><label className="admin-file-label"><ImageUp size={16}/> {uploading === "image" ? "Uploading image…" : "Upload main image"}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploading !== null} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file, "image"); }}/></label><label>Datasheet PDF URL<input value={editing.datasheetUrl ?? ""} onChange={(event) => setEditing({ ...editing, datasheetUrl: event.target.value })}/></label><label className="admin-file-label"><FileUp size={16}/> {uploading === "datasheet" ? "Uploading datasheet…" : "Upload datasheet PDF"}<input type="file" accept="application/pdf,.pdf" disabled={uploading !== null} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file, "datasheet"); }}/></label></div>
      <div className="admin-modal-actions">{editing.published !== false && editing.slug && <a className="button button-ghost" href={`/products/${editing.slug}`} target="_blank" rel="noreferrer"><Eye size={16}/> Preview</a>}<button type="button" className="button button-ghost" disabled={saving} onClick={() => setEditing(null)}>Cancel</button><button className="button" type="submit" disabled={saving || uploading !== null}>{saving ? <Loader2 className="spin" size={16}/> : <Save size={16}/>} {editing.published === false ? "Save draft" : "Publish product"}</button></div>
    </form></div></div>}
  </section>;
}
