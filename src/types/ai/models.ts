/**
 * AI Models Type Definitions
 *
 * Type definitions for AI models used throughout the application
 */

// ============================================================================
// Model Identifiers
// ============================================================================

export type AIModelId =
  // Frontier Models (Most Advanced)
  | "gpt-5.1"
  | "gpt-5-pro"
  | "gpt-5"
  | "gpt-5-mini"
  | "gpt-5-nano"
  | "gpt-4.1"
  | "gpt-4.1-mini"
  | "gpt-4.1-nano"
  | "gpt-4o"
  | "gpt-4o-mini"

  // Research Models
  | "o3-deep-research"
  | "o4-mini-deep-research"
  | "o3-pro"
  | "o3"
  | "o4-mini"
  | "o1-pro"
  | "o1"

  // Legacy Models (Still Available)
  | "gpt-4-turbo"
  | "gpt-4"
  | "gpt-3.5-turbo";

// ============================================================================
// Model Categories
// ============================================================================

export type AIModelCategory =
  | "frontier"   // Latest and most advanced models
  | "research"   // Reasoning and research models
  | "legacy";    // Older but still available models

export type AIModelCost =
  | "highest"    // Most expensive
  | "high"       // Premium pricing
  | "medium"     // Standard pricing
  | "low"        // Budget-friendly
  | "lowest";    // Most affordable

// ============================================================================
// Model Configuration
// ============================================================================

export interface AIModel {
  /** Unique model identifier */
  id: AIModelId;

  /** Human-readable display name */
  name: string;

  /** Brief description of model capabilities */
  description: string;

  /** Model category grouping */
  category: AIModelCategory;

  /** Cost tier relative to other models */
  cost: AIModelCost;

  /** Maximum input tokens supported */
  maxInputTokens?: number;

  /** Maximum output tokens supported */
  maxOutputTokens?: number;

  /** Whether this model supports JSON response format */
  supportsJsonFormat?: boolean;

  /** Whether this model supports streaming */
  supportsStreaming?: boolean;

  /** Recommended temperature range */
  temperatureRange?: {
    min: number;
    max: number;
    recommended: number;
  };

  /** Model-specific capabilities */
  capabilities?: {
    code?: boolean;
    reasoning?: boolean;
    multimodal?: boolean;
    functionCalling?: boolean;
  };
}

// ============================================================================
// Model Collections
// ============================================================================

export interface AIModelCollection {
  /** All available models */
  all: AIModel[];

  /** Models grouped by category */
  byCategory: Record<AIModelCategory, AIModel[]>;

  /** Models grouped by cost tier */
  byCost: Record<AIModelCost, AIModel[]>;

  /** Lookup by model ID */
  byId: Record<AIModelId, AIModel>;
}

// ============================================================================
// Model Selection Types
// ============================================================================

export interface AIModelSelection {
  /** Selected model ID */
  id: AIModelId;

  /** Optional custom temperature override */
  temperature?: number;

  /** Optional custom max tokens override */
  maxTokens?: number;

  /** Whether to use streaming if available */
  enableStreaming?: boolean;
}

// ============================================================================
// Model Options for UI Components
// ============================================================================

export interface AIModelOption {
  value: AIModelId;
  label: string;
  description: string;
  group: string;
}

// ============================================================================
// Temperature Optimization
// ============================================================================

export interface TemperatureOptimization {
  /** Original requested temperature */
  original: number;

  /** Optimized temperature for specific model */
  optimized: number;

  /** Whether temperature was adjusted */
  wasAdjusted: boolean;

  /** Reason for adjustment if any */
  adjustmentReason?: string;
}

// ============================================================================
// Default Model Configuration
// ============================================================================

export const DEFAULT_AI_MODEL: AIModelId = "gpt-4o";

export const DEFAULT_TEMPERATURE = 0.7;
export const DEFAULT_MAX_TOKENS = 2000;

export const MODEL_TEMPERATURE_LIMITS = {
  // Reasoning models work best with lower temperatures
  "o3-deep-research": { max: 0.7, recommended: 0.5 },
  "o3-pro": { max: 0.7, recommended: 0.5 },
  "o3": { max: 0.7, recommended: 0.6 },
  "o4-mini": { max: 0.7, recommended: 0.6 },
  "o1-pro": { max: 0.7, recommended: 0.5 },
  "o1": { max: 0.7, recommended: 0.6 },

  // Mini models work better with slightly higher temperatures
  "gpt-4o-mini": { min: 0.3, recommended: 0.8 },
  "gpt-4.1-mini": { min: 0.3, recommended: 0.8 },
  "gpt-5-mini": { min: 0.3, recommended: 0.8 },
  "gpt-5-nano": { min: 0.3, recommended: 0.8 },
  "gpt-4.1-nano": { min: 0.3, recommended: 0.8 },
  "gpt-3.5-turbo": { min: 0.3, recommended: 0.7 },
} as const;