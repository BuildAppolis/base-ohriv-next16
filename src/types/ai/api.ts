/**
 * AI API Types
 *
 * Type definitions for the dynamic AI generation API system
 */

// ============================================================================
// Request Types
// ============================================================================

/**
 * Core AI generation request body
 */
export interface AIGenerationRequestBody {
  /** The main prompt or task description */
  prompt: string;

  /** Context data object (company data, user data, etc.) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: any;

  /** Additional instructions to supplement the instruction set */
  instructions?: string;

  /** Instruction set ID to load from the instruction system */
  instructionSet?: string;

  /** Temperature for creativity (0.0-2.0) */
  temperature?: number;

  /** Maximum tokens to generate */
  maxTokens?: number;

  /** Generation type for specialized behavior */
  type?: AIGenerationType;

  /** Custom system prompt to override defaults */
  systemPrompt?: string;

  /** Response format for structured output */
  responseFormat?: AIResponseFormat;
}

/**
 * Query parameters for GET requests (minimal - only model selection)
 */
export interface AIGenerationQueryParams {
  /** AI model to use for generation */
  model?: string;
}

/**
 * Complete generation request (query params + body)
 */
export interface AIGenerationRequest {
  query: AIGenerationQueryParams;
  body: AIGenerationRequestBody;
}

// ============================================================================
// Configuration Types
// ============================================================================

/** AI generation type categories */
export type AIGenerationType =
  | "general" // General purpose generation
  | "analysis" // Analytical and insight generation
  | "recommendations" // Recommendation generation
  | "custom" // Custom specialized generation
  | "json"; // Structured JSON output

/** AI response format options */
export type AIResponseFormat =
  | "text" // Plain text response
  | "json"; // Structured JSON response

/** AI model identifiers */
export type AIModelId = string;

// ============================================================================
// Response Types
// ============================================================================

/**
 * AI generation result metadata
 */
export interface AIGenerationResult {
  /** Generated content */
  content: string;

  /** Length of generated content in characters */
  contentLength: number;

  /** AI model used for generation */
  model: string;

  /** Temperature setting used */
  temperature: number;

  /** Generation type */
  type: string;

  /** Response format */
  responseFormat: string;

  /** Generation timestamp */
  timestamp: string;
}

/**
 * AI generation event types for streaming
 */
export type AIStreamEventType =
  | "start" // Generation started
  | "progress" // Generation progress with partial content
  | "complete" // Generation completed successfully
  | "error"; // Generation failed

/**
 * AI streaming event data
 */
export interface AIStreamEvent {
  /** Event type */
  type: AIStreamEventType;

  /** Optional message for the event */
  message?: string;

  /** Partial content (for progress events) */
  content?: string;

  /** Progress percentage (0-100) */
  progress?: number;

  /** Final result (for complete events) */
  result?: AIGenerationResult;

  /** Error message (for error events) */
  error?: string;
}

/**
 * Streaming callback function type
 */
export type AIStreamCallback = (event: AIStreamEvent) => void;

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Default configuration values
 */
export const AI_GENERATION_DEFAULTS = {
  /** Default model if not specified */
  MODEL: "gpt-4o" as AIModelId,

  /** Default temperature */
  TEMPERATURE: 0.7,

  /** Default max tokens */
  MAX_TOKENS: 2000,

  /** Default generation type */
  TYPE: "general" as AIGenerationType,

  /** Default response format */
  RESPONSE_FORMAT: "text" as AIResponseFormat,

  /** Default streaming enabled */
  ENABLE_STREAMING: true,
} as const;

// ============================================================================
// Error Types
// ============================================================================

/**
 * API error response structure
 */
export interface AIApiErrorResponse {
  /** Error message */
  error: string;

  /** Optional error details */
  details?: string;

  /** Error code for categorization */
  code?: string;
}

// ============================================================================
// Legacy Compatibility (to be removed after migration)
// ============================================================================

/**
 * @deprecated Use AIGenerationRequestBody instead
 */
export interface AIGenerateOptions extends AIGenerationRequestBody {
  model?: string;
}
