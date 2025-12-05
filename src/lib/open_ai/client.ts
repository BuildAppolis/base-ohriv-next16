/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * OpenAI Server-Side Client
 * Server-only access to OpenAI API with secure API key handling
 */

import OpenAI from "openai";

// Export server-side OpenAI client with secure API key
export const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

// Server-side AI model constants for API route usage
export const AI_MODELS = {
  // Frontier Models (Most Advanced)
  GPT_5_1: "gpt-5.1",
  GPT_5_MINI: "gpt-5-mini",
  GPT_5_NANO: "gpt-5-nano",
  GPT_5_PRO: "gpt-5-pro",
  GPT_5: "gpt-5",
  GPT_4_1: "gpt-4.1",
  GPT_4_1_MINI: "gpt-4.1-mini",
  GPT_4_1_NANO: "gpt-4.1-nano",
  GPT_4O: "gpt-4o",
  GPT_4O_MINI: "gpt-4o-mini",

  // Research Models
  O3_DEEP_RESEARCH: "o3-deep-research",
  O4_MINI_DEEP_RESEARCH: "o4-mini-deep-research",
  O3_PRO: "o3-pro",
  O3: "o3",
  O4_MINI: "o4-mini",
  O1_PRO: "o1-pro",
  O1: "o1",

  // Legacy Models (Still Available)
  GPT_4_TURBO: "gpt-4-turbo",
  GPT_4: "gpt-4",
  GPT_35_TURBO: "gpt-3.5-turbo",
} as const;

// Models that use the responses endpoint instead of chat completions
export const RESPONSES_ENDPOINT_MODELS = new Set([
  AI_MODELS.GPT_5_1,
  AI_MODELS.GPT_5_MINI,
  AI_MODELS.GPT_5_NANO,
  AI_MODELS.GPT_5_PRO,
  AI_MODELS.GPT_5,
  AI_MODELS.O3_DEEP_RESEARCH,
  AI_MODELS.O4_MINI_DEEP_RESEARCH,
  AI_MODELS.O3_PRO,
  AI_MODELS.O3,
  AI_MODELS.O4_MINI,
] as const);

/**
 * Determines which endpoint to use for a given model
 */
export function getModelEndpoint(
  model: string
): "chat.completions" | "responses" {
  return RESPONSES_ENDPOINT_MODELS.has(model as any)
    ? "responses"
    : "chat.completions";
}

/**
 * Check if a model supports streaming
 */
export function supportsStreaming(model: string): boolean {
  // Most current models support streaming, but some future models might not
  const nonStreamingModels = new Set<string>([]);
  return !nonStreamingModels.has(model);
}

/**
 * Check if a model supports JSON response format
 */
export function supportsJSONFormat(model: string): boolean {
  // Responses endpoint models have different JSON handling
  const responsesEndpointModels = Array.from(RESPONSES_ENDPOINT_MODELS);
  return !responsesEndpointModels.includes(model as any);
}
