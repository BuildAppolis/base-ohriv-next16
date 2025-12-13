import { z } from 'zod'
import { AIStreamEventTypeSchema } from './types'

/**
 * Core AI Response Schemas
 * These schemas define the structure for all AI operation responses
 */

// Usage Statistics for AI responses
export const AIUsageSchema = z.object({
  promptTokens: z.number().int().nonnegative(),
  completionTokens: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
  cost: z.number().nonnegative().optional(),
  model: z.string().optional(),
  timestamp: z.string().datetime().optional()
})

export type AIUsage = z.infer<typeof AIUsageSchema>

// Common Response Metadata
export const AIResponseMetadataSchema = z.object({
  model: z.string(),
  requestId: z.string().optional(),
  sessionId: z.string().optional(),
  timestamp: z.string().datetime(),
  processingTime: z.number().nonnegative(), // milliseconds
  usage: AIUsageSchema.optional(),

  // Quality and performance metrics
  qualityScore: z.number().min(0).max(1).optional(),
  relevanceScore: z.number().min(0).max(1).optional(),
  confidence: z.number().min(0).max(1).optional(),

  // System information
  version: z.string().optional(),
  environment: z.enum(['development', 'staging', 'production']).optional()
})

export type AIResponseMetadata = z.infer<typeof AIResponseMetadataSchema>

// Standard AI Response
export const AIResponseSchema = z.object({
  success: z.boolean(),
  content: z.string(),
  data: z.any().optional(), // For structured JSON responses

  // Response metadata
  metadata: AIResponseMetadataSchema,

  // Error information
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
    retryable: z.boolean().optional()
  }).optional()
})

export type AIResponse = z.infer<typeof AIResponseSchema>

// Stream Event Schema
export const AIStreamEventSchema = z.object({
  type: AIStreamEventTypeSchema,
  timestamp: z.string().datetime(),
  requestId: z.string().optional(),

  // Event-specific data
  data: z.any().optional(),
  content: z.string().optional(),
  progress: z.object({
    current: z.number().nonnegative(),
    total: z.number().positive().optional(),
    percentage: z.number().min(0).max(100).optional()
  }).optional(),

  // Error information for error events
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
    retryAfter: z.number().optional() // seconds
  }).optional(),

  // Completion information
  result: z.any().optional(),
  usage: AIUsageSchema.optional()
})

export type AIStreamEvent = z.infer<typeof AIStreamEventSchema>

// Batch Response Schema
export const AIBatchResponseSchema = z.object({
  success: z.boolean(),
  results: z.array(AIResponseSchema),
  metadata: z.object({
    totalRequests: z.number().int(),
    successfulRequests: z.number().int(),
    failedRequests: z.number().int(),
    totalProcessingTime: z.number().nonnegative(),
    averageProcessingTime: z.number().nonnegative().optional(),
    totalTokens: z.number().int().nonnegative(),
    totalCost: z.number().nonnegative().optional()
  })
})

export type AIBatchResponse = z.infer<typeof AIBatchResponseSchema>