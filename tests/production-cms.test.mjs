import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("20 MiB datasheets use direct cloud upload and server-side PDF verification", async () => {
  const [server, client] = await Promise.all([
    read("backend/server.mjs"),
    read("components/admin-products.tsx"),
  ]);
  const exactLimit = Buffer.alloc(20 * 1024 * 1024);
  assert.equal(exactLimit.byteLength, 20_971_520);
  assert.match(server, /PRODUCT_DATASHEET_MAX_BYTES=20\*1024\*1024/);
  assert.match(server, /signature!=="%PDF-"/);
  assert.match(server, /datasheetSignatureRateLimit/);
  assert.match(client, /uploadDirectly\(file,\s*signed,\s*setUploadProgress\)/);
  assert.doesNotMatch(client, /upload-datasheet.*body:\s*form/);
});
test("retired Technology route is a permanent redirect and is absent from navigation", async () => {
  const [route, header, sitemap] = await Promise.all([
    read("app/technology/page.tsx"),
    read("components/site-header.tsx"),
    read("app/sitemap.ts"),
  ]);
  assert.match(route, /permanentRedirect\("\/products"\)/);
  assert.doesNotMatch(header, /\["Technology","\/technology"\]/);
  assert.doesNotMatch(sitemap, /\/technology/);
});
test("CMS and public pages share database-backed settings with safe defaults", async () => {
  const [server, about, manufacturing, contact] = await Promise.all([
    read("backend/server.mjs"),
    read("app/about/page.tsx"),
    read("app/manufacturing/page.tsx"),
    read("app/contact/page.tsx"),
  ]);
  assert.match(server, /\/api\/site-settings\/:key/);
  assert.match(server, /\/api\/admin\/locations/);
  assert.match(about, /getAboutCms/);
  assert.match(manufacturing, /getManufacturingCms/);
  assert.match(contact, /getLocations/);
});
test("product fallbacks receive the same datasheet enrichment as database products", async () => {
  const loader = await read("lib/site-products.ts");
  assert.equal(loader.match(/return normalise\(defaults\);/g)?.length, 3);
  assert.match(loader, /item\.slug === "mono-perc"/);
  assert.match(loader, /series: monoPercSeries/);
  assert.match(loader, /datasheets: monoPercDatasheets/);
});
test("resource preview preserves MIME type and About owns certificate presentation", async () => {
  const [server, about, resources] = await Promise.all([
    read("backend/server.mjs"),
    read("app/about/page.tsx"),
    read("components/resource-browser.tsx"),
  ]);
  assert.match(server, /Content-Disposition/);
  assert.match(server, /X-Content-Type-Options/);
  assert.match(about, /CertificatesSection/);
  assert.match(resources, /item\.category\s*!==\s*"Certificates"/);
});
test("festival studio has deterministic fallback and supported aspect ratios", async () => {
  const [server, studio] = await Promise.all([
    read("backend/server.mjs"),
    read("components/admin-ai-creatives.tsx"),
  ]);
  for (const ratio of ["1:1", "4:5", "9:16", "16:9"]) {
    assert.ok(server.includes(`"${ratio}"`));
    assert.ok(studio.includes(`value="${ratio}"`));
  }
  assert.match(server, /model="deterministic-fallback"/);
  assert.match(server, /renderFestivalCreative/);
});
