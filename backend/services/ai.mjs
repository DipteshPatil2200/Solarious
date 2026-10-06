import OpenAI from "openai";

const defaultBaseUrl = "https://api.apinex.bond/v1";
const defaultModel = "free/mimo-v2.6-pro";

export const aiConfiguration = () => ({
  configured: Boolean(process.env.APINEX_API_KEY?.trim()),
  baseURL: process.env.APINEX_BASE_URL?.trim() || defaultBaseUrl,
  model: process.env.APINEX_MODEL?.trim() || defaultModel,
});

const serviceError = (message, stage, status, details = {}) =>
  Object.assign(new Error(message), { status, stage, ...details });

const client = () => {
  const { configured, baseURL } = aiConfiguration();
  if (!configured) throw serviceError("AI service is not configured.", "ai_configuration", 503);
  return new OpenAI({ apiKey: process.env.APINEX_API_KEY.trim(), baseURL });
};

export async function generateAIText(prompt, systemPrompt = "You are a professional Solarious Energy AI assistant.") {
  const { model } = aiConfiguration();
  try {
    const completion = await client().chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });
    const content = completion.choices?.[0]?.message?.content?.trim();
    if (!content) throw serviceError("AI provider returned an empty response.", "ai_response", 502);
    return content;
  } catch (error) {
    if (error?.stage) throw error;
    const status = Number(error?.status) || 502;
    const providerMessage = String(error?.message || "Unknown provider error").slice(0, 300);
    console.error("[ai:apinex:error]", {
      status,
      provider: "apinex",
      model,
      requestId: error?.request_id || error?.requestId || undefined,
      message: providerMessage,
    });
    const message = status === 401 ? "AI service authentication failed."
      : status === 403 ? "AI service access was denied."
      : status === 404 ? "AI model or endpoint is unavailable."
      : status === 429 ? "AI service quota or rate limit was reached."
      : "AI service is temporarily unavailable.";
    throw serviceError(message, "ai_provider", status, { provider: "apinex", providerStatus: status });
  }
}
