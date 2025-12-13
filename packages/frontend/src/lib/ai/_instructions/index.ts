/**
 * AI Generation Services
 * Export all AI generation modules
 */

// Export specific types from _types to avoid conflicts
export type {
  BusinessModelId,
  CompanyStageId,
  IndustryId,
  CompanySizeId,
  WorkEnvironmentId,
  CollaborationStyleId,
  WorkPaceId,
  AutonomyLevelId,
  DecisionMakingStyleId,
  CompanyStage,
  CompanyValue,
  CompanyContext,
  CompanyContextData,
  RoleDetails,
  PositionSuggestion,
  GeneratedAttribute,
  ScoringAnchor,
  ScoringAnchors,
  FollowUpQuestion,
  GeneratedQuestion,
  LevelExpectations,
  GeneratedJobTemplate,
  GenerationResult,
  LevelAssignment,
  CellResult,
  ExecutionTracking,
} from "@/types/old/company_old";

export type {
  GenerationStep,
  DescriptionAnalysis,
} from "@/types/old/company_old";
export * from "@/lib/open_ai/client";
export * from "./context-analyzer";
export * from "./attribute-generator";
export * from "./question-generator";
export * from "./job-template-generator";
export * from "./company-description-generator";
export * from "./mock-database";
