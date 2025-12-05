/**
 * Main Types Export
 * Central export point for all application types
 */

// AI-related types and enums
export * from './enums/ai'

// Re-export from schemas for convenience
export type {
  // Core types
  AIModelCategory,
  AIResponseFormat,
  AIGenerationType,
  AIStreamEventType,
  AITemperature,
  AITokenLimit,
  AIContextType,

  // Request types
  AIContext,
  AIRequest,
  AIStreamingRequest,
  AIBatchRequest,

  // Response types
  AIUsage,
  AIResponseMetadata,
  AIResponse,
  AIStreamEvent,
  AIBatchResponse,

  // Model types
  AIModelCapability,
  AIModelCost,
  AIModelConstraints,
  AIModel,
  AIModelSelection,

  // Operation types
  CompanyProfile,
  MissionAndCulture,
  Technologies,
  Position,
  InterviewStep,
  InterviewSteps,
  CompanyContext,
  CompanyAnalysisRequest,
  CompanyAnalysisResponse,

  // KSA types
  KSACategory,
  KSAItem,
  KSAFramework,
  KSAQuestion,
  KSAGenerationRequest,
  KSAGenerationResponse,

  // Streaming types
  StreamConfig,
  StreamChunk,
  StreamProgress,
  StreamEvent,
  StreamResponse,
  StreamState,
  StreamCallbacks,
  MultiStreamConfig,
  MultiStreamState
} from '@/schemas/ai'

// Other type categories will be added here as we expand
// export * from './enums/auth'
// export * from './enums/database'
// export * from './ui'