const defaultProvider = "stability";
const defaultModel = "core";
const apiBase = "https://api.stability.ai/v2beta/stable-image/generate";
const supportedModels = new Set(["core", "ultra"]);
const supportedAspectRatios = new Set(["1:1", "4:5", "16:9", "9:16"]);

const providerError = (message, code, status, details = {}) =>
  Object.assign(new Error(message), {
    code,
    status,
    stage: "image_generation",
    retryable: false,
    ...details,
  });

const sanitized = value =>
  String(value || "")
    .replace(/bearer\s+[a-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/(api[_ -]?key|token|secret)\s*[:=]\s*[^\s,;]+/gi, "$1=[redacted]")
    .replace(/[\r\n\t]+/g, " ")
    .slice(0, 300);

const providerDetails = async response => {
  const raw = await response.text().catch(() => "");
  try {
    const body = JSON.parse(raw);
    const message = Array.isArray(body?.errors)
      ? body.errors.join("; ")
      : body?.error?.message || body?.message || body?.error || raw;
    return {
      providerCode: String(body?.error?.code || body?.code || body?.name || "").slice(0, 80),
      providerMessage: sanitized(message),
    };
  } catch {
    return { providerCode: "", providerMessage: sanitized(raw) };
  }
};

export const classifyProviderFailure = (status, details = {}) => {
  const common = { provider: defaultProvider, providerStatus: status, ...details };
  if (status === 400 || status === 422)
    return providerError("The image provider rejected the generation request.", "PROVIDER_INVALID_REQUEST", 400, common);
  if (status === 401)
    return providerError("Image provider authentication failed.", "PROVIDER_AUTHENTICATION_ERROR", 401, common);
  if (status === 402)
    return providerError("Image generation credits are unavailable.", "PROVIDER_PAYMENT_REQUIRED", 402, common);
  if (status === 403)
    return providerError("The image provider denied this generation request.", "PROVIDER_PERMISSION_DENIED", 403, common);
  if (status === 408)
    return providerError("Image generation timed out.", "PROVIDER_TIMEOUT", 408, { ...common, retryable: true });
  if (status === 429)
    return providerError("The image provider rate limit was reached.", "PROVIDER_RATE_LIMITED", 429, { ...common, retryable: true });
  return providerError("The image provider is temporarily unavailable.", "PROVIDER_UPSTREAM_ERROR", 502, { ...common, retryable: true });
};

export const imageConfiguration = () => {
  const provider = (process.env.IMAGE_PROVIDER?.trim() || "").toLowerCase();
  const model = (process.env.IMAGE_MODEL?.trim() || defaultModel).toLowerCase();
  return {
    provider,
    configured: Boolean(provider && process.env.IMAGE_API_KEY?.trim()),
    model,
    capability: provider === defaultProvider && supportedModels.has(model) ? "text-to-image" : "unsupported",
  };
};

export async function generateMarketingImage({ prompt, aspectRatio = "1:1" }) {
  const { provider, configured, model, capability } = imageConfiguration();
  if (!configured)
    throw providerError("Image generation is not configured.", "IMAGE_PROVIDER_NOT_CONFIGURED", 503, { provider, model });
  if (provider !== defaultProvider || capability !== "text-to-image")
    throw providerError("The configured provider or model does not support image generation.", "IMAGE_PROVIDER_CAPABILITY_UNSUPPORTED", 503, { provider, model });
  if (!supportedAspectRatios.has(aspectRatio))
    throw providerError("The selected image aspect ratio is not supported.", "PROVIDER_INVALID_REQUEST", 400, { provider, model });

  const form = new FormData();
  form.set("prompt", prompt);
  form.set("output_format", "webp");
  form.set("aspect_ratio", aspectRatio);
  form.set("negative_prompt", "text, words, letters, logo, watermark, phone number, distorted people, distorted solar panels");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);
  const started = Date.now();
  try {
    const response = await fetch(`${apiBase}/${model}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.IMAGE_API_KEY}`, Accept: "image/*" },
      body: form,
      signal: controller.signal,
    });
    const requestId = sanitized(response.headers.get("x-request-id") || response.headers.get("stability-request-id"));
    const durationMs = Date.now() - started;
    if (!response.ok) {
      const details = await providerDetails(response);
      const classified = classifyProviderFailure(response.status, { ...details, requestId, durationMs, model });
      console.error("[image:provider:error]", {
        provider,
        model,
        status: response.status,
        providerCode: details.providerCode,
        message: details.providerMessage,
        requestId,
        durationMs,
      });
      throw classified;
    }
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/"))
      throw classifyProviderFailure(502, { providerCode: "INVALID_RESPONSE_TYPE", providerMessage: sanitized(contentType), requestId, durationMs, model });
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length)
      throw classifyProviderFailure(502, { providerCode: "EMPTY_IMAGE", providerMessage: "Provider returned an empty image.", requestId, durationMs, model });
    console.info("[image:provider:success]", { provider, model, status: response.status, requestId, durationMs });
    return { buffer: bytes, provider, model, mimeType: contentType };
  } catch (error) {
    if (error?.stage) throw error;
    const durationMs = Date.now() - started;
    if (error?.name === "AbortError") {
      const classified = classifyProviderFailure(408, { model, durationMs });
      console.error("[image:provider:error]", { provider, model, status: 408, providerCode: classified.code, message: classified.message, requestId: "", durationMs });
      throw classified;
    }
    console.error("[image:provider:error]", {
      provider,
      model,
      status: 503,
      providerCode: "PROVIDER_NETWORK_ERROR",
      message: sanitized(error?.message || "Unknown provider network error"),
      requestId: "",
      durationMs,
    });
    throw providerError("The image provider is temporarily unavailable.", "PROVIDER_UNAVAILABLE", 503, { provider, model, retryable: true, durationMs });
  } finally {
    clearTimeout(timeout);
  }
}
