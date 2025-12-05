import { z } from 'zod'
import { AIModelCategorySchema } from '../core/types'

/**
 * AI Model Configuration Schemas
 * These schemas define model capabilities, constraints, and configuration
 */

// Model Capability Schema
export const AIModelCapabilitySchema = z.object({
  code: z.boolean().default(false),
  reasoning: z.boolean().default(false),
  multimodal: z.boolean().default(false),
  functionCalling: z.boolean().default(false),
  streaming: z.boolean().default(true),
  jsonMode: z.boolean().default(false),
  vision: z.boolean().default(false),
  audio: z.boolean().default(false)
})

export type AIModelCapability = z.infer<typeof AIModelCapabilitySchema>

// Model Cost Information
export const AIModelCostSchema = z.object({
  inputTokens: z.number().nonnegative(), // cost per 1M tokens
  outputTokens: z.number().nonnegative(),
  currency: z.string().default('USD')
})

export type AIModelCost = z.infer<typeof AIModelCostSchema>

// Model Constraints
export const AIModelConstraintsSchema = z.object({
  maxTokens: z.number().int().positive(),
  maxInputLength: z.number().int().positive(),
  temperature: z.object({
    min: z.number(),
    max: z.number()
  }),
  topP: z.object({
    min: z.number(),
    max: z.number()
  }),
  supportsStreaming: z.boolean().default(true),
  supportsJsonMode: z.boolean().default(false),
  supportsImages: z.boolean().default(false)
})

export type AIModelConstraints = z.infer<typeof AIModelConstraintsSchema>

// Complete Model Definition
export const AIModelSchema = z.object({
  // Basic information
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: AIModelCategorySchema,

  // Capabilities and performance
  capabilities: AIModelCapabilitySchema,
  cost: AIModelCostSchema,
  constraints: AIModelConstraintsSchema,

  // Technical details
  provider: z.string(),
  apiEndpoint: z.string().optional(),
  modelFamily: z.string().optional(),
  version: z.string().optional(),

  // Status and availability
  status: z.enum(['active', 'deprecated', 'beta', 'experimental']),
  deprecatedAt: z.string().datetime().optional(),
  experimental: z.boolean().default(false),

  // Usage statistics
  popularity: z.number().min(0).max(100).optional(),
  recommendedUses: z.array(z.string()).optional()
})

export type AIModel = z.infer<typeof AIModelSchema>

// Model Selection Criteria
export const AIModelSelectionSchema = z.object({
  // Required capabilities
  requiredCapabilities: z.array(z.string()).optional(),

  // Performance requirements
  minQuality: z.number().min(0).max(1).optional(),
  maxCost: z.number().nonnegative().optional(),
  maxLatency: z.number().positive().optional(), // milliseconds

  // Specific requirements
  requiresStreaming: z.boolean().optional(),
  requiresJsonMode: z.boolean().optional(),
  requiresVision: z.boolean().optional(),
  requiresFunctionCalling: z.boolean().optional(),

  // User preferences
  preferredCategory: z.enum(['reasoning', 'generation', 'multimodal', 'legacy']).optional(),
  excludeExperimental: z.boolean().default(true)
})

export type AIModelSelection = z.infer<typeof AIModelSelectionSchema>

// Predefined model registry (this would typically be loaded from config)
export const AI_MODELS = {
  // Reasoning Models
  'gpt-5.1': {
    id: 'gpt-5.1',
    name: 'GPT-5.1',
    description: 'Advanced reasoning model with enhanced problem-solving capabilities',
    category: 'reasoning' as const,
    capabilities: {
      code: true,
      reasoning: true,
      multimodal: false,
      functionCalling: true,
      streaming: true,
      jsonMode: true,
      vision: false,
      audio: false
    },
    cost: {
      inputTokens: 15.0,
      outputTokens: 60.0,
      currency: 'USD'
    },
    constraints: {
      maxTokens: 200000,
      maxInputLength: 1000000,
      temperature: { min: 0, max: 2 },
      topP: { min: 0, max: 1 },
      supportsStreaming: true,
      supportsJsonMode: true,
      supportsImages: false
    },
    provider: 'OpenAI',
    modelFamily: 'GPT-5',
    status: 'beta' as const,
    experimental: true
  },

  // Generation Models
  'gpt-4o': {
    id: 'gpt-5.1',
    name: 'GPT-5.1',
    description: 'Advanced reasoning model with enhanced problem-solving capabilities',
    category: 'reasoning' as const,
    capabilities: {
      code: true,
      reasoning: true,
      multimodal: false,
      functionCalling: true,
      streaming: true,
      jsonMode: true,
      vision: false,
      audio: false
    },
    cost: {
      inputTokens: 15.0,
      outputTokens: 60.0,
      currency: 'USD'
    },
    constraints: {
      maxTokens: 200000,
      maxInputLength: 1000000,
      temperature: { min: 0, max: 2 },
      topP: { min: 0, max: 1 },
      supportsStreaming: true,
      supportsJsonMode: true,
      supportsImages: false
    },
    provider: 'OpenAI',
    modelFamily: 'GPT-5',
    status: 'beta' as const,
    experimental: true
  },

  // Generation Models
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Optimized model for efficient general-purpose generation',
    category: 'generation' as const,
    capabilities: {
      code: true,
      reasoning: false,
      multimodal: true,
      functionCalling: true,
      streaming: true,
      jsonMode: true,
      vision: true,
      audio: false
    },
    cost: {
      inputTokens: 5.0,
      outputTokens: 15.0,
      currency: 'USD'
    },
    constraints: {
      maxTokens: 128000,
      maxInputLength: 128000,
      temperature: { min: 0, max: 2 },
      topP: { min: 0, max: 1 },
      supportsStreaming: true,
      supportsJsonMode: true,
      supportsImages: true
    },
    provider: 'OpenAI',
    modelFamily: 'GPT-4',
    status: 'active' as const,
    experimental: false
  },

  // Legacy Models
  'gpt-3.5-turbo': {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and efficient model for simple tasks',
    category: 'legacy' as const,
    capabilities: {
      code: true,
      reasoning: false,
      multimodal: false,
      functionCalling: true,
      streaming: true,
      jsonMode: true,
      vision: false,
      audio: false
    },
    cost: {
      inputTokens: 0.5,
      outputTokens: 1.5,
      currency: 'USD'
    },
    constraints: {
      maxTokens: 4096,
      maxInputLength: 16384,
      temperature: { min: 0, max: 2 },
      topP: { min: 0, max: 1 },
      supportsStreaming: true,
      supportsJsonMode: true,
      supportsImages: false
    },
    provider: 'OpenAI',
    modelFamily: 'GPT-3.5',
    status: 'active' as const,
    experimental: false
  }
} satisfies Record<string, Omit<AIModel, 'id'>>