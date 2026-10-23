import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("festival requests use the long creative timeout and structured errors", async () => {
  const [proxy, server, provider] = await Promise.all([
    read("app/api/[...path]/route.ts"),
    read("backend/server.mjs"),
    read("backend/services/image-generation.mjs"),
  ]);
  assert.match(proxy, /pathname === "\/api\/admin\/creatives\/festival"/);
  assert.match(server, /success:false,error:\{code:/);
  assert.match(provider, /PROVIDER_PAYMENT_REQUIRED/);
  assert.match(provider, /retryable: false/);
  assert.match(server, /error\?\.retryable===true/);
});

test("festival billing failures cannot silently fall back to a template", async () => {
  const [server, provider] = await Promise.all([
    read("backend/server.mjs"),
    read("backend/services/image-generation.mjs"),
  ]);
  assert.doesNotMatch(server, /FESTIVAL_TEMPLATE_FALLBACK/);
  assert.doesNotMatch(server, /deterministic-fallback/);
  assert.match(provider, /PROVIDER_PAYMENT_REQUIRED/);
  assert.match(provider, /retryable: false/);
  assert.match(provider, /FESTIVAL_TEMPLATE_FALLBACK === "true"/);
  assert.match(provider, /if \(!fallbackAllowed\) throw error/);
});

test("transparent home header removes the logo card without global image hacks", async () => {
  const header = await read("app/content-image-sizing.css");
  assert.match(
    header,
    /home-header:not\(\.scrolled\) \.brand[\s\S]*background:\s*transparent/,
  );
});

test("desktop content images use scoped responsive sizing", async () => {
  const css = await read("app/content-image-sizing.css");
  assert.match(css, /@media \(min-width: 901px\)/);
  assert.match(css, /manufacturing-editorial-image[\s\S]*width: 60%/);
  assert.match(css, /product-detail-image img[\s\S]*object-fit: contain/);
  assert.doesNotMatch(css, /hero-slide|gallery-lightbox/);
});
