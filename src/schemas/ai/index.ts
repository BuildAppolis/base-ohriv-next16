/**
 * AI Schemas - Main Exports
 * Central export point for all AI-related Zod schemas and types
 */

// Core schemas
export * from './core/types'
export * from './core/request'
export * from './core/response'

// Model schemas
export * from './models'

// Operation-specific schemas
export * from './operations/company-analysis'
export * from './operations/ksa-generation'

// Streaming schemas
export * from './streaming'

// Re-exports for convenience - commenting out non-existent exports
// export type {
//   // Core types
//   AIModelCategory,
//   AIResponseFormat,
//   AIGenerationType,
//   AIStreamEventType,
//   AITemperature,
//   AITokenLimit,
//   AIContextType,
//
//   // Request types
//   AIContext,
//   AIRequest,
//   AIStreamingRequest,
//   AIBatchRequest,
//
//   // Response types
//   AIUsage,
//   AIResponseMetadata,
//   AIResponse,
//   AIStreamEvent,
//   AIBatchResponse,
//
//   // Model types
//   AIModelCapability,
//   AIModelCost,
//   AIModelConstraints,
//   AIModel,
//   AIModelSelection,
//
//   // Operation types
//   CompanyProfile,
//   MissionAndCulture,
//   Technologies,
//   Position,
//   InterviewStep,
//   InterviewSteps,
//   CompanyContext,
//   CompanyAnalysisRequest,
//   CompanyAnalysisResponse,
//
//   // KSA types
//   KSACategory,
//   KSAItem,
//   KSAFramework,
//   KSAQuestion,
//   KSAGenerationRequest,
//   KSAGenerationResponse,
//
//   // Streaming types
//   StreamConfig,
//   StreamChunk,
//   StreamProgress,
//   StreamEvent,
//   StreamResponse,
//   StreamState,
//   StreamCallbacks,
//   MultiStreamConfig,
//   MultiStreamState
// } from './core/types'

// Re-export schema objects for validation - commenting out non-existent exports
// export {
//   AIModelCategorySchema,
//   AIResponseFormatSchema,
//   AIGenerationTypeSchema,
//   AIStreamEventTypeSchema,
//   AITemperatureSchema,
//   AITokenLimitSchema,
//   AIContextTypeSchema,
//
//   AIContextSchema,
//   AIRequestSchema,
//   AIStreamingRequestSchema,
//   AIBatchRequestSchema,
//
//   AIUsageSchema,
//   AIResponseMetadataSchema,
//   AIResponseSchema,
//   AIStreamEventSchema,
//   AIBatchResponseSchema,
//
//   AIModelCapabilitySchema,
//   AIModelCostSchema,
//   AIModelConstraintsSchema,
//   AIModelSchema,
//   AIModelSelectionSchema,
//
//   CompanyProfileSchema,
//   MissionAndCultureSchema,
//   TechnologiesSchema,
//   PositionSchema,
//   InterviewStepSchema,
//   InterviewStepsSchema,
//   CompanyContextSchema,
//   CompanyAnalysisRequestSchema,
//   CompanyAnalysisResponseSchema,
//
//   KSACategorySchema,
//   KSAItemSchema,
//   KSAFrameworkSchema,
//   KSAQuestionSchema,
//   KSAGenerationRequestSchema,
//   KSAGenerationResponseSchema,
//
//   StreamConfigSchema,
//   StreamChunkSchema,
//   StreamProgressSchema,
//   StreamEventSchema,
//   StreamResponseSchema,
//   StreamStateSchema,
//   StreamCallbacksSchema,
//   MultiStreamConfigSchema,
//   MultiStreamStateSchema
// } from './core/types'

// Model registry export
export { AI_MODELS } from './models'