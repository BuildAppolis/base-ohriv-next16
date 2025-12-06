import { z } from 'zod'
// import { AIStreamEventTypeSchema } from '../core/types'
// import { AIUsageSchema } from '../core/response'

/**
 * Streaming AI Operation Schemas
 * Comprehensive schemas for all streaming AI operations
 */

// Stream Configuration
export const StreamConfigSchema = z.object({
  // Basic stream options
  enabled: z.boolean().default(true),
  chunkSize: z.number().min(1).max(1000).optional(), // characters
  interval: z.number().min(10).max(5000).optional(), // milliseconds between chunks
  timeout: z.number().min(5000).max(300000).optional(), // 5s to 5 minutes

  // Performance options
  bufferSize: z.number().min(1).max(100).optional(),
  compression: z.boolean().default(false),
  retryAttempts: z.number().min(0).max(5).optional(),
  retryDelay: z.number().min(100).max(10000).optional(), // milliseconds

  // Event options
  includeProgress: z.boolean().default(true),
  includeUsage: z.boolean().default(true),
  includeMetadata: z.boolean().default(true),
  includeTimestamps: z.boolean().default(true)
})

export type StreamConfig = z.infer<typeof StreamConfigSchema>

// Chunk Data Structure
export const StreamChunkSchema = z.object({
  id: z.string().optional(),
  content: z.string(),
  index: z.number().int().nonnegative(),
  isComplete: z.boolean().default(false),
  metadata: z.record(z.any()).optional()
})

export type StreamChunk = z.infer<typeof StreamChunkSchema>

// Progress Information
export const StreamProgressSchema = z.object({
  current: z.number().nonnegative(),
  total: z.number().positive().optional(),
  percentage: z.number().min(0).max(100).optional(),
  stage: z.string().optional(),
  eta: z.number().positive().optional(), // seconds remaining
  rate: z.number().positive().optional() // chunks per second
})

export type StreamProgress = z.infer<typeof StreamProgressSchema>

// Stream Event Types with comprehensive data
export const StreamEventSchema = z.object({
  // Core event information
  type: z.enum(['start', 'progress', 'chunk', 'complete', 'error']),
  id: z.string(),
  timestamp: z.string().datetime(),
  requestId: z.string(),
  sessionId: z.string().optional(),

  // Event-specific data
  data: z.any().optional(),
  content: z.string().optional(),
  chunk: StreamChunkSchema.optional(),

  // Progress tracking
  progress: StreamProgressSchema.optional(),

  // Usage and statistics
  usage: z.object({
    promptTokens: z.number().optional(),
    completionTokens: z.number().optional(),
    totalTokens: z.number().optional()
  }).optional(),
  stats: z.object({
    chunksReceived: z.number().int().nonnegative(),
    bytesReceived: z.number().int().nonnegative(),
    averageChunkSize: z.number().positive().optional(),
    processingSpeed: z.number().positive().optional() // chunks per second
  }).optional(),

  // Error information
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
    retryable: z.boolean().optional(),
    retryAfter: z.number().optional() // seconds
  }).optional(),

  // Completion information
  result: z.any().optional(),
  metadata: z.record(z.any()).optional()
})

export type StreamEvent = z.infer<typeof StreamEventSchema>

// Stream Response Schema (for API responses)
export const StreamResponseSchema = z.object({
  success: z.boolean(),
  streamId: z.string(),
  config: StreamConfigSchema.optional(),

  // Stream metadata
  metadata: z.object({
    startedAt: z.string().datetime(),
    estimatedDuration: z.number().positive().optional(), // seconds
    model: z.string(),
    requestId: z.string()
  }),

  // Initial event
  initialEvent: StreamEventSchema.optional(),

  // Error information if stream failed to start
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional()
  }).optional()
})

export type StreamResponse = z.infer<typeof StreamResponseSchema>

// Stream State Management
export const StreamStateSchema = z.object({
  id: z.string(),
  status: z.enum([
    'initializing',
    'connecting',
    'streaming',
    'paused',
    'completed',
    'error',
    'aborted'
  ]),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  lastActivityAt: z.string().datetime().optional(),

  // Current progress
  progress: StreamProgressSchema.optional(),
  currentContent: z.string().optional(),
  currentChunk: StreamChunkSchema.optional(),

  // Statistics
  stats: z.object({
    totalChunks: z.number().int().nonnegative(),
    receivedChunks: z.number().int().nonnegative(),
    totalBytes: z.number().int().nonnegative(),
    averageChunkSize: z.number().positive().optional(),
    currentSpeed: z.number().positive().optional(),
    errors: z.number().int().nonnegative()
  }),

  // Event history (limited size)
  recentEvents: z.array(StreamEventSchema).optional(),

  // Configuration and metadata
  config: StreamConfigSchema.optional(),
  metadata: z.record(z.any()).optional()
})

export type StreamState = z.infer<typeof StreamStateSchema>

// Stream Callback Function Types
export const StreamCallbacksSchema = z.object({
  onStart: z.function().optional(),
  onProgress: z.function().optional(),
  onChunk: z.function().optional(),
  onComplete: z.function().optional(),
  onError: z.function().optional(),
  onAbort: z.function().optional(),
  onStateChange: z.function().optional()
})

export type StreamCallbacks = z.infer<typeof StreamCallbacksSchema>

// Multi-stream Management
export const MultiStreamConfigSchema = z.object({
  streams: z.array(z.object({
    id: z.string(),
    config: StreamConfigSchema,
    callbacks: StreamCallbacksSchema.optional()
  })),
  // Coordination options
  sequential: z.boolean().optional(),
  failFast: z.boolean().optional(),
  timeout: z.number().positive().optional(),

  // Aggregation options
  aggregateResults: z.boolean().optional(),
  resultFormat: z.enum(['combined', 'separate', 'hierarchical']).optional()
})

export type MultiStreamConfig = z.infer<typeof MultiStreamConfigSchema>

export const MultiStreamStateSchema = z.object({
  id: z.string(),
  config: MultiStreamConfigSchema,
  streams: z.record(StreamStateSchema),
  status: z.enum([
    'initializing',
    'running',
    'completed',
    'error',
    'aborted'
  ]),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),

  // Aggregate statistics
  stats: z.object({
    totalStreams: z.number().int(),
    completedStreams: z.number().int(),
    failedStreams: z.number().int(),
    totalChunks: z.number().int(),
    totalBytes: z.number().int(),
    totalErrors: z.number().int()
  })
})

export type MultiStreamState = z.infer<typeof MultiStreamStateSchema>