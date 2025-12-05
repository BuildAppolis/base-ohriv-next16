import { z } from 'zod'

/**
 * Core AI operation types and enums
 * These are the fundamental building blocks for all AI operations
 */

// AI Model Categories
export const AIModelCategorySchema = z.enum([
  'reasoning',
  'generation',
  'multimodal',
  'legacy'
])

export type AIModelCategory = z.infer<typeof AIModelCategorySchema>

// AI Response Formats
export const AIResponseFormatSchema = z.enum([
  'text',
  'json',
  'markdown'
])

export type AIResponseFormat = z.infer<typeof AIResponseFormatSchema>

// AI Operation Types
export const AIGenerationTypeSchema = z.enum([
  'general',
  'analysis',
  'recommendations',
  'custom',
  'json',
  'company_analysis',
  'ksa_generation',
  'streaming'
])

export type AIGenerationType = z.infer<typeof AIGenerationTypeSchema>

// Stream Event Types
export const AIStreamEventTypeSchema = z.enum([
  'start',
  'progress',
  'chunk',
  'complete',
  'error'
])

export type AIStreamEventType = z.infer<typeof AIStreamEventTypeSchema>

// AI Temperature Ranges with validation
export const AITemperatureSchema = z.number()
  .min(0, 'Temperature must be at least 0')
  .max(2, 'Temperature must be at most 2')
  .optional()

export type AITemperature = z.infer<typeof AITemperatureSchema>

// Token Limits with validation
export const AITokenLimitSchema = z.number()
  .min(1, 'Max tokens must be at least 1')
  .max(200000, 'Max tokens cannot exceed 200,000')
  .optional()

export type AITokenLimit = z.infer<typeof AITokenLimitSchema>

// Common AI Context Types
export const AIContextTypeSchema = z.enum([
  'company_profile',
  'interview_data',
  'technical_spec',
  'user_preferences',
  'session_history',
  'system_state'
])

export type AIContextType = z.infer<typeof AIContextTypeSchema>