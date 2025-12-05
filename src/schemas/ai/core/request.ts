import { z } from 'zod'
import {
  AIResponseFormatSchema,
  AIGenerationTypeSchema,
  AITemperatureSchema,
  AITokenLimitSchema
} from './types'

/**
 * Core AI Request Schemas
 * These schemas define the structure for all AI operation requests
 */

// Universal AI Context Schema
export const AIContextSchema = z.object({
  type: z.string(),
  content: z.any(),
  metadata: z.record(z.any()).optional(),
  timestamp: z.string().datetime().optional(),
  source: z.string().optional()
})

export type AIContext = z.infer<typeof AIContextSchema>

// Core AI Request Body Schema
export const AIRequestSchema = z.object({
  // Required fields
  prompt: z.string()
    .min(1, 'Prompt cannot be empty')
    .max(100000, 'Prompt cannot exceed 100,000 characters'),

  // Optional configuration
  type: AIGenerationTypeSchema,
  responseFormat: AIResponseFormatSchema,
  temperature: AITemperatureSchema,
  maxTokens: AITokenLimitSchema,

  // Context and instructions
  context: AIContextSchema.optional(),
  instructions: z.string()
    .max(5000, 'Instructions cannot exceed 5,000 characters')
    .optional(),
  instructionSet: z.string().optional(),
  systemPrompt: z.string()
    .max(10000, 'System prompt cannot exceed 10,000 characters')
    .optional(),

  // Advanced options
  seed: z.number().int().optional(),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),

  // Metadata
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  requestId: z.string().optional(),

  // Function calling for advanced models
  tools: z.array(z.any()).optional(),
  toolChoice: z.any().optional()
})

export type AIRequest = z.infer<typeof AIRequestSchema>

// Streaming Request Schema (extends AIRequest)
export const AIStreamingRequestSchema = AIRequestSchema.extend({
  // Streaming-specific options
  stream: z.literal(true),
  streamOptions: z.object({
    includeUsage: z.boolean().optional(),
    temperature: AITemperatureSchema,
    maxTokens: AITokenLimitSchema
  }).optional(),

  // Event callbacks (client-side)
  onStart: z.function().optional(),
  onProgress: z.function().optional(),
  onComplete: z.function().optional(),
  onError: z.function().optional(),
  onChunk: z.function().optional()
})

export type AIStreamingRequest = z.infer<typeof AIStreamingRequestSchema>

// Batch Request Schema for multiple operations
export const AIBatchRequestSchema = z.object({
  requests: z.array(AIRequestSchema)
    .min(1, 'Batch must contain at least one request')
    .max(10, 'Batch cannot exceed 10 requests'),

  // Batch execution options
  sequential: z.boolean().optional(),
  failFast: z.boolean().optional(),
  timeout: z.number().min(1000).max(300000).optional() // 1s to 5 minutes
})

export type AIBatchRequest = z.infer<typeof AIBatchRequestSchema>