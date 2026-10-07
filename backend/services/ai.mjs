const defaultBaseUrl = "https://api.apinex.bond/v1";
const defaultModel = "free/mimo-v2.6-pro";

export const aiConfiguration = () => ({
  configured: Boolean(process.env.APINEX_API_KEY?.trim()),
  baseURL: (process.env.APINEX_BASE_URL?.trim() || defaultBaseUrl).replace(/\/+$/, ""),
  model: process.env.APINEX_MODEL?.trim() || defaultModel,
});

const serviceError = (message, stage, status, details = {}) => Object.assign(new Error(message), { status, stage, ...details });

const providerMessage = status => status === 401 ? "AI service authentication failed."
  : status === 403 ? "AI service access was denied."
  : status === 404 ? "AI model or endpoint is unavailable."
  : status === 429 ? "AI service quota or rate limit was reached."
  : "AI service is temporarily unavailable.";

export async function generateAIText(prompt, systemPrompt = "You are a professional Solarious Energy AI assistant.") {
  const { configured, baseURL, model } = aiConfiguration();
  if (!configured) throw serviceError("AI service is not configured.", "ai_configuration", 503);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);
  try {
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.APINEX_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }], temperature: 0.4 }),
      signal: controller.signal,
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const safeMessage = String(body?.error?.message || body?.message || "Provider request failed").slice(0, 300);
      console.error("[ai:apinex:error]", { status: response.status, provider: "apinex", model, requestId: response.headers.get("x-request-id") || undefined, message: safeMessage });
      throw serviceError(providerMessage(response.status), "ai_provider", response.status, { provider: "apinex", providerStatus: response.status });
    }
    const content = body?.choices?.[0]?.message?.content?.trim();
    if (!content) throw serviceError("AI provider returned an empty response.", "ai_response", 502);
    return content;
  } catch (error) {
    if (error?.stage) throw error;
    if (error?.name === "AbortError") throw serviceError("AI service timed out.", "ai_provider", 504, { provider: "apinex" });
    console.error("[ai:apinex:error]", { status: "network", provider: "apinex", model, message: String(error?.message || "Unknown provider error").slice(0, 300) });
    throw serviceError("AI service is temporarily unavailable.", "ai_provider", 502, { provider: "apinex" });
  } finally { clearTimeout(timeout); }
}

const parseJson = value => {
  const candidate = String(value).trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try { return JSON.parse(candidate); } catch { throw serviceError("AI provider returned invalid marketing content.", "ai_response", 502); }
};

export async function generateMarketingContent({ date, campaignType, companyName, defaultCta, recentConcepts = [] }) {
  const recent = recentConcepts.length ? ` Recent themes and image prompts to avoid: ${JSON.stringify(recentConcepts.slice(0, 14))}. Do not repeat a substantially similar concept, location, building type, camera angle, time of day, composition, installation, background, or lighting.` : "";
  const prompt = `Create one original ${companyName || "Solarious Energy"} solar marketing campaign for ${date}. Campaign focus: ${campaignType}. Return only JSON with string fields: theme, headline, caption, cta, hashtags, imagePrompt. Include practical residential, commercial, or industrial solar relevance as suitable. Use responsible language for subsidy, savings, and environmental topics; do not invent financial claims, government programs, or technical specifications. CTA default: ${defaultCta || "Contact Us Today"}. imagePrompt must describe a professional photorealistic 1080x1080 solar visual with no text, logos, people, watermarks, phone numbers, or fake data, with clear lower-area space reserved for post-production branding.${recent}`;
  const content = await generateAIText(prompt, "You are Solarious Energy's B2B marketing strategist. Return valid compact JSON only, without markdown.");
  const value = parseJson(content);
  for (const key of ["theme", "headline", "caption", "cta", "hashtags", "imagePrompt"]) if (!String(value?.[key] || "").trim()) throw serviceError("AI provider returned incomplete marketing content.", "ai_response", 502);
  return Object.fromEntries(["theme", "headline", "caption", "cta", "hashtags", "imagePrompt"].map(key => [key, String(value[key]).trim().slice(0, key === "caption" || key === "imagePrompt" ? 1200 : 300)]));
}
