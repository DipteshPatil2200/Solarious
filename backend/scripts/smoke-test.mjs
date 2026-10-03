const baseUrl = (process.env.API_BASE_URL || "http://127.0.0.1:4000").replace(/\/+$/, "");
const adminToken = process.env.ADMIN_API_TOKEN?.trim();
const frontendOrigin = process.env.SMOKE_TEST_ORIGIN || "https://solarious-five.vercel.app";

if (!adminToken) throw new Error("ADMIN_API_TOKEN is required for the smoke test");

async function check(name, path, options, expectedStatus) {
  const response = await fetch(`${baseUrl}${path}`, {
    redirect: "manual",
    ...options,
  });
  if (response.status !== expectedStatus) {
    const body = await response.text();
    throw new Error(`${name}: expected ${expectedStatus}, received ${response.status}: ${body.slice(0, 200)}`);
  }
  console.log(`${name}: ${response.status}`);
  return response;
}

const health = await check("health", "/api/health", {}, 200);
const healthBody = await health.json();
if (healthBody.ok !== true || healthBody.status !== "ok" || healthBody.database !== "connected") {
  throw new Error("health: application or database is not healthy");
}

await check("admin without token", "/api/admin/inquiries", {}, 401);
await check(
  "admin with token",
  "/api/admin/inquiries",
  { headers: { "x-admin-token": adminToken } },
  200,
);
const preflight = await check(
  "CORS preflight",
  "/api/admin/inquiries",
  {
    method: "OPTIONS",
    headers: {
      Origin: frontendOrigin,
      "Access-Control-Request-Method": "GET",
      "Access-Control-Request-Headers": "x-admin-token,content-type",
    },
  },
  204,
);
if (preflight.headers.get("access-control-allow-origin") !== frontendOrigin) {
  throw new Error("CORS preflight did not return the expected allowed origin");
}

console.log("Solarious backend smoke test passed.");
