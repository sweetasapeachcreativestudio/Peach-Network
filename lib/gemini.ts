import { GoogleGenAI, ThinkingLevel } from "@google/genai";

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export { ThinkingLevel };

/**
 * Resilient wrapper around Gemini API that handles rate limits (429 / RESOURCE_EXHAUSTED),
 * timeouts, and model fallbacks gracefully. Returns raw text on success, or null on failure
 * so callers can immediately switch to their deterministic local domain engine without
 * throwing or exposing raw error messages to users.
 */
export async function safeGenerateContent(params: {
  contents: any;
  config?: any;
  timeoutMs?: number;
  preferredModel?: string;
  fallbackModel?: string;
}): Promise<string | null> {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  const preferred = params.preferredModel || "gemini-3.8-flash";
  const fallback = params.fallbackModel || "gemini-3.1-flash-lite";
  const timeoutMs = params.timeoutMs || 22000;

  // Multi-tier attempt: first preferred model, then fallback lighter model
  for (const model of [preferred, fallback]) {
    try {
      const callPromise = ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        const id = setTimeout(() => {
          reject(new Error(`Timeout after ${timeoutMs}ms`));
        }, timeoutMs);
        if (typeof (id as any)?.unref === "function") {
          (id as any).unref();
        }
      });

      const res = await Promise.race([callPromise, timeoutPromise]);
      if (res && typeof res.text === "string" && res.text.trim()) {
        return res.text;
      }
    } catch (err: any) {
      const errMsg = String(err?.message || err || "").toLowerCase();
      const isRateLimit =
        errMsg.includes("429") ||
        errMsg.includes("rate") ||
        errMsg.includes("quota") ||
        errMsg.includes("exhausted") ||
        errMsg.includes("resource_exhausted") ||
        errMsg.includes("too many requests");

      console.warn(
        `[safeGenerateContent] Model "${model}" failed (rateLimit=${isRateLimit}):`,
        err?.message || err
      );

      // If already at fallback model, loop terminates and returns null
    }
  }

  return null;
}
