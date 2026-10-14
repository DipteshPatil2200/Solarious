import assert from "node:assert/strict";
import test from "node:test";
import { v2 as sdk } from "cloudinary";
import {
  configureCloudinary,
  createSignedImageUpload,
  parseCloudinaryUrl,
  resetCloudinaryVerificationCache,
  verifyCloudinaryCredentials,
} from "./cloudinary.mjs";

test("reports missing Cloudinary credentials without exposing values", () => {
  assert.deepEqual(parseCloudinaryUrl(""), { configured: false, error: "CLOUDINARY_URL is missing." });
});

test("explicitly configures one decoded CLOUDINARY_URL credential source", () => {
  const values = {};
  const client = { config(next) { if (next) Object.assign(values, next); return values; } };
  const result = configureCloudinary("  cloudinary://12345:secret%2Dvalue@solarious-test  ", client);
  assert.deepEqual(result, { configured: true, cloudName: "solarious-test", apiKey: "12345" });
  assert.deepEqual(values, { cloud_name: "solarious-test", api_key: "12345", api_secret: "secret-value", secure: true });
});

test("creates an SDK signature from the exact uploaded parameters and Unix seconds", () => {
  const config = { cloud_name: "demo", api_key: "12345", api_secret: "secret" };
  const client = { config: () => config, utils: sdk.utils };
  const signed = createSignedImageUpload({ folder: "solarious/gallery", prefix: "gallery", now: 1_791_890_128_999, client });
  const params = { folder: signed.folder, overwrite: signed.overwrite, public_id: signed.publicId, timestamp: signed.timestamp };
  assert.equal(signed.timestamp, 1_791_890_128);
  assert.equal(signed.signature, sdk.utils.api_sign_request(params, config.api_secret));
  assert.deepEqual(Object.keys(params).sort(), ["folder", "overwrite", "public_id", "timestamp"]);
});

test("accepts verified credentials and rejects a wrong secret safely", async () => {
  resetCloudinaryVerificationCache();
  await verifyCloudinaryCredentials({ client: { api: { ping: async () => ({ status: "ok" }) } }, cacheMs: 0 });
  resetCloudinaryVerificationCache();
  await assert.rejects(
    verifyCloudinaryCredentials({ client: { api: { ping: async () => { throw new Error("401 including sensitive provider details"); } } } }),
    error => error.code === "CLOUDINARY_CREDENTIALS_INVALID" && !error.message.includes("sensitive"),
  );
});
