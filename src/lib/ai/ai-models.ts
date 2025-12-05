/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * AI Model Constants
 * Client-side safe model definitions
 */

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

// Model configuration for UI dropdowns
export const AI_MODEL_OPTIONS = [
  // Frontier Models
  {
    value: "gpt-5.1",
    label: "GPT-5.1",
    description: "Best model for coding and agentic tasks",
    group: "Frontier",
  },
  {
    value: "gpt-5-pro",
    label: "GPT-5 Pro",
    description: "Enhanced precision version",
    group: "Frontier",
  },
  {
    value: "gpt-5",
    label: "GPT-5",
    description: "Intelligent reasoning model",
    group: "Frontier",
  },
  {
    value: "gpt-5-mini",
    label: "GPT-5 Mini",
    description: "Faster, cost-efficient for well-defined tasks",
    group: "Frontier",
  },
  {
    value: "gpt-5-nano",
    label: "GPT-5 Nano",
    description: "Fastest, most cost-efficient",
    group: "Frontier",
  },
  {
    value: "gpt-4.1",
    label: "GPT-4.1",
    description: "Smartest non-reasoning model",
    group: "Frontier",
  },
  {
    value: "gpt-4.1-mini",
    label: "GPT-4.1 Mini",
    description: "Smaller, faster version of GPT-4.1",
    group: "Frontier",
  },
  {
    value: "gpt-4.1-nano",
    label: "GPT-4.1 Nano",
    description: "Fastest, most cost-efficient GPT-4.1",
    group: "Frontier",
  },
  {
    value: "gpt-4o",
    label: "GPT-4o",
    description: "Fast, intelligent, flexible GPT model",
    group: "Frontier",
  },
  {
    value: "gpt-4o-mini",
    label: "GPT-4o Mini",
    description: "Fast, affordable small model",
    group: "Frontier",
  },

  // Research Models
  {
    value: "o3-deep-research",
    label: "O3 Deep Research",
    description: "Most powerful deep research model",
    group: "Research",
  },
  {
    value: "o3-pro",
    label: "O3 Pro",
    description: "More compute for better responses",
    group: "Research",
  },
  {
    value: "o3",
    label: "O3",
    description: "Reasoning model for complex tasks",
    group: "Research",
  },
  {
    value: "o4-mini-deep-research",
    label: "O4 Mini Deep Research",
    description: "Faster, more affordable deep research",
    group: "Research",
  },
  {
    value: "o4-mini",
    label: "O4 Mini",
    description: "Fast, cost-efficient reasoning model",
    group: "Research",
  },
  {
    value: "o1-pro",
    label: "O1 Pro",
    description: "Version of o1 with more compute",
    group: "Research",
  },
  {
    value: "o1",
    label: "O1",
    description: "Previous full o-series reasoning model",
    group: "Research",
  },

  // Legacy Models
  {
    value: "gpt-4-turbo",
    label: "GPT-4 Turbo",
    description: "Older high-intelligence GPT model",
    group: "Legacy",
  },
  {
    value: "gpt-4",
    label: "GPT-4",
    description: "Older high-intelligence GPT model",
    group: "Legacy",
  },
  {
    value: "gpt-3.5-turbo",
    label: "GPT-3.5 Turbo",
    description: "Legacy GPT model for cheaper tasks",
    group: "Legacy",
  },
] as const;

// Type for AI model option
export type AIModelOption = (typeof AI_MODEL_OPTIONS)[number];

// GPT-5 Family Only Options (for test-response page)
export const GPT5_FAMILY_OPTIONS = [
  {
    value: "gpt-5.1",
    label: "GPT-5.1",
    description: "Best model for coding and agentic tasks",
    group: "Frontier",
  },
  {
    value: "gpt-5-pro",
    label: "GPT-5 Pro",
    description: "Enhanced precision version",
    group: "Frontier",
  },
  {
    value: "gpt-5",
    label: "GPT-5",
    description: "Intelligent reasoning model",
    group: "Frontier",
  },
  {
    value: "gpt-5-mini",
    label: "GPT-5 Mini",
    description: "Faster, cost-efficient for well-defined tasks",
    group: "Frontier",
  },
  {
    value: "gpt-5-nano",
    label: "GPT-5 Nano",
    description: "Fastest, most cost-efficient",
    group: "Frontier",
  },
] as const;

// Coordination model recommendations with enhanced metadata
export const COORDINATION_MODEL_RECOMMENDATIONS = [
  {
    value: "gpt-5.1",
    label: "GPT-5.1",
    description: "Best for complex coordination and multi-agent orchestration",
    icon: "🧠",
    category: "premium",
  },
  {
    value: "gpt-5-pro",
    label: "GPT-5 Pro",
    description: "Enhanced precision for detailed coordination tasks",
    icon: "⚡",
    category: "premium",
  },
  {
    value: "gpt-5",
    label: "GPT-5",
    description: "Intelligent reasoning for coordination workflows",
    icon: "🔥",
    category: "premium",
  },
  {
    value: "o3",
    label: "O3",
    description: "Advanced reasoning model for complex coordination",
    icon: "🎯",
    category: "research",
  },
  {
    value: "o3-pro",
    label: "O3 Pro",
    description: "High-compute coordination specialist",
    icon: "💎",
    category: "research",
  },
  {
    value: "gpt-4.1",
    label: "GPT-4.1",
    description: "Reliable coordination with fast response",
    icon: "🚀",
    category: "standard",
  },
] as const;

// Helper functions for model metadata
export function getModelDescription(model: string): string {
  const modelOption = AI_MODEL_OPTIONS.find((m) => m.value === model);
  return modelOption?.description || "";
}

export function getModelGroup(model: string): string {
  const modelOption = AI_MODEL_OPTIONS.find((m) => m.value === model);
  return modelOption?.group || "";
}

export function getModelCategory(model: string): string {
  const recommendation = COORDINATION_MODEL_RECOMMENDATIONS.find(
    (m) => m.value === model
  );
  return recommendation?.category || "standard";
}

export function getRecommendedModels(
  taskType: "coordination" | "general" = "coordination"
) {
  if (taskType === "coordination") {
    return COORDINATION_MODEL_RECOMMENDATIONS;
  }
  return AI_MODEL_OPTIONS.slice(0, 6); // First 6 models for general use
}

// Model compatibility configuration
export const MODEL_COMPATIBILITY = {
  // Models that use the responses endpoint
  responsesEndpoint: new Set<string>([
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
  ]),

  // Models that support streaming
  streamingSupported: new Set<string>([
    // All current models support streaming (empty set means all supported)
  ]),

  // Models that support JSON response format
  jsonSupported: new Set<string>([
    AI_MODELS.GPT_4O,
    AI_MODELS.GPT_4O_MINI,
    AI_MODELS.GPT_4_1,
    AI_MODELS.GPT_4_1_MINI,
    AI_MODELS.GPT_4_1_NANO,
    AI_MODELS.GPT_4_TURBO,
    AI_MODELS.GPT_4,
    AI_MODELS.GPT_35_TURBO,
  ]),

  // Models that support temperature parameter
  temperatureSupported: new Set<string>([
    AI_MODELS.GPT_4O,
    AI_MODELS.GPT_4O_MINI,
    AI_MODELS.GPT_4_1,
    AI_MODELS.GPT_4_1_MINI,
    AI_MODELS.GPT_4_1_NANO,
    AI_MODELS.GPT_4_TURBO,
    AI_MODELS.GPT_4,
    AI_MODELS.GPT_35_TURBO,
    // Note: GPT-5 and O-series may not support temperature
  ]),

  // Models with restricted token limits
  tokenLimits: {
    [AI_MODELS.GPT_35_TURBO]: 4096,
    [AI_MODELS.GPT_4O_MINI]: 16384,
    [AI_MODELS.GPT_4_1_NANO]: 8192,
    [AI_MODELS.GPT_5_NANO]: 8192,
    [AI_MODELS.GPT_5_1]: 4096, // GPT-5.1 has hard limit of 4096 tokens
    [AI_MODELS.GPT_5]: 8192, // GPT-5 standard limit
  },
} as const;

/**
 * Get maximum token limit for a model
 */
export function getMaxTokensForModel(model: string): number {
  return (
    MODEL_COMPATIBILITY.tokenLimits[
      model as keyof typeof MODEL_COMPATIBILITY.tokenLimits
    ] || 2000
  );
}

/**
 * Check if model supports streaming
 */
export function supportsStreaming(model: string): boolean {
  // All current models support streaming, but some future models might not
  return !MODEL_COMPATIBILITY.streamingSupported.has(model);
}

/**
 * Check if model supports JSON response format
 */
export function supportsJSONFormat(model: string): boolean {
  // Responses endpoint models have different JSON handling
  return MODEL_COMPATIBILITY.responsesEndpoint.has(model) ? false : true;
}

/**
 * Get which endpoint to use for a model
 */
export function getModelEndpoint(
  model: string
): "chat.completions" | "responses" {
  return MODEL_COMPATIBILITY.responsesEndpoint.has(model)
    ? "responses"
    : "chat.completions";
}

/**
 * Get model-specific parameter configuration
 */
export function getModelParameters(
  model: string,
  options: {
    temperature?: number;
    maxTokens?: number;
    responseFormat?: string;
  }
) {
  const endpoint = getModelEndpoint(model);
  const baseParams = {
    model,
    temperature: options.temperature || 0.7,
    stream: supportsStreaming(model),
  };

  if (endpoint === "responses") {
    // Responses API specific parameters
    return {
      ...baseParams,
      max_output_tokens: options.maxTokens || getMaxTokensForModel(model),
      input: "", // Will be set by the API route
      instructions: "", // Will be set by the API route
      // Note: Responses API has different JSON handling
      ...(options.responseFormat === "json" && supportsJSONFormat(model)
        ? {
            text: { format: { type: "json_object" } },
          }
        : {}),
    };
  } else {
    // Chat completions API parameters
    return {
      ...baseParams,
      max_completion_tokens: options.maxTokens || getMaxTokensForModel(model),
      messages: [], // Will be set by the API route
      ...(options.responseFormat === "json"
        ? {
            response_format: { type: "json_object" },
          }
        : {}),
    };
  }
}

/**
 * Check if a model supports temperature parameter
 */
export function supportsTemperature(
  model: string,
  reasoning?: string
): boolean {
  // GPT-5.1 only supports temperature when reasoning is 'none'
  if (model === AI_MODELS.GPT_5_1) {
    return (
      reasoning === "none" ||
      MODEL_COMPATIBILITY.temperatureSupported.has(model)
    );
  }
  return MODEL_COMPATIBILITY.temperatureSupported.has(model);
}

/**
 * Get the correct streaming response format for a model
 */
export function getStreamingDelta(chunk: any, model: string): string | null {
  const endpoint = getModelEndpoint(model);

  if (endpoint === "responses") {
    // Responses endpoint format - handle different response structures
    // Try common delta locations in order of likelihood
    const deltaSources = [
      chunk.delta,
      chunk.content,
      chunk.output?.[0]?.content,
      chunk.output?.content,
      chunk.output_text,
      chunk.text,
      chunk.response,
      chunk.data,
    ];

    for (const delta of deltaSources) {
      if (delta && typeof delta === "string" && delta.trim().length > 0) {
        return delta;
      }
    }

    // Log all available fields for debugging (only if no delta found)
    if (process.env.NODE_ENV === "development") {
      console.log(
        "No delta found in responses chunk. Available fields:",
        Object.keys(chunk),
        {
          hasDelta: !!chunk.delta,
          hasContent: !!chunk.content,
          hasOutput: !!chunk.output,
          outputKeys: chunk.output ? Object.keys(chunk.output) : [],
          hasOutputText: !!chunk.output_text,
          hasText: !!chunk.text,
          chunk: chunk,
        }
      );
    }

    return null;
  } else {
    // Chat completions endpoint format
    return chunk.choices?.[0]?.delta?.content || null;
  }
}

/**
 * Adjust temperature based on model constraints
 * Some models have specific temperature ranges for optimal performance
 */
export function adjustTemperatureForModel(
  model: string,
  temperature: number
): number {
  // Ensure temperature is within valid range
  const clampedTemp = Math.max(0, Math.min(2, temperature));

  // Model-specific temperature adjustments
  switch (model) {
    // Reasoning models (O-series) work best with lower temperatures
    case AI_MODELS.O3:
    case AI_MODELS.O3_PRO:
    case AI_MODELS.O4_MINI:
    case AI_MODELS.O1:
    case AI_MODELS.O1_PRO:
      return Math.min(clampedTemp, 0.7); // Cap at 0.7 for reasoning models

    // Mini models work better with slightly higher temperatures for creativity
    case AI_MODELS.GPT_4O_MINI:
    case AI_MODELS.GPT_4_1_MINI:
    case AI_MODELS.GPT_5_MINI:
    case AI_MODELS.GPT_5_NANO:
    case AI_MODELS.GPT_4_1_NANO:
    case AI_MODELS.GPT_35_TURBO:
      return Math.max(clampedTemp, 0.3); // Ensure at least 0.3 for mini models

    // Frontier models can handle the full temperature range
    case AI_MODELS.GPT_5_1:
    case AI_MODELS.GPT_5_PRO:
    case AI_MODELS.GPT_5:
    case AI_MODELS.GPT_4_1:
    case AI_MODELS.GPT_4O:
    default:
      return clampedTemp;
  }
}
