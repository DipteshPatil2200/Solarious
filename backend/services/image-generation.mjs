const defaultProvider = "stability";
const defaultModel = "core";
const apiBase = "https://api.stability.ai/v2beta/stable-image/generate";

const providerError = (message, code, status, details = {}) => Object.assign(new Error(message), { code, status, stage: "image_generation", ...details });

export const imageConfiguration = () => ({
  provider: (process.env.IMAGE_PROVIDER?.trim() || "").toLowerCase(),
  configured: Boolean(process.env.IMAGE_PROVIDER?.trim() && process.env.IMAGE_API_KEY?.trim()),
  model: process.env.IMAGE_MODEL?.trim() || defaultModel,
});

const errorForStatus = status => status === 401 ? ["Image provider authentication failed.", "IMAGE_AUTH_FAILED"]
  : status === 429 ? ["Image provider rate limit was reached.", "IMAGE_RATE_LIMITED"]
  : ["Image generation failed.", "IMAGE_GENERATION_FAILED"];

export async function generateMarketingImage({ prompt }) {
  const { provider, configured, model } = imageConfiguration();
  if (!configured) throw providerError("Image generation is not configured. Set IMAGE_PROVIDER=stability, IMAGE_API_KEY, and IMAGE_MODEL=core or ultra on Render.", "IMAGE_PROVIDER_NOT_CONFIGURED", 503);
  if (provider !== defaultProvider) throw providerError("Unsupported image provider. Configure IMAGE_PROVIDER=stability.", "IMAGE_PROVIDER_NOT_CONFIGURED", 503);
  if (!["core", "ultra"].includes(model)) throw providerError("Unsupported Stability image model. Use IMAGE_MODEL=core or IMAGE_MODEL=ultra.", "IMAGE_PROVIDER_NOT_CONFIGURED", 503);

  const form = new FormData();
  form.set("prompt", prompt);
  form.set("output_format", "webp");
  if (model === "core") {
    form.set("aspect_ratio", "1:1");
    form.set("negative_prompt", "text, words, letters, logo, watermark, phone number, people, distorted solar panels");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);
  try {
    const response = await fetch(apiBase + "/" + model, {
      method: "POST",
      headers: { Authorization: "Bearer " + process.env.IMAGE_API_KEY, Accept: "image/*" },
      body: form,
      signal: controller.signal,
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      const [message, code] = errorForStatus(response.status);
      console.error("[image:stability:error]", { status: response.status, model, message: body.slice(0, 300) });
      throw providerError(message, code, response.status, { provider: defaultProvider, providerStatus: response.status });
    }
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) throw providerError("Image provider returned an invalid response.", "IMAGE_GENERATION_FAILED", 502, { provider: defaultProvider });
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length) throw providerError("Image provider returned an empty image.", "IMAGE_GENERATION_FAILED", 502, { provider: defaultProvider });
    return { buffer: bytes, provider: defaultProvider, model, mimeType: contentType };
  } catch (error) {
    if (error?.stage) throw error;
    if (error?.name === "AbortError") throw providerError("Image generation timed out.", "IMAGE_GENERATION_FAILED", 504, { provider: defaultProvider });
    console.error("[image:stability:error]", { status: "network", model, message: String(error?.message || "Unknown image error").slice(0, 300) });
    throw providerError("Image generation failed.", "IMAGE_GENERATION_FAILED", 502, { provider: defaultProvider });
  } finally {
    clearTimeout(timeout);
  }
}

