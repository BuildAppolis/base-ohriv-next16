/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * AI-Test Page Specific Types
 * Types that are specific to the AI-Test page functionality
 */

// Define GenerationStep locally to avoid import issues
export type GenerationStep = "attributes" | "questions" | "jobTemplate";

// Define DescriptionAnalysis locally to avoid import issues
export interface DescriptionAnalysis {
  canProceed: boolean;
  clarity: "clear" | "vague" | "insufficient";
  issues: Array<{
    severity: "blocking" | "warning" | "suggestion";
    message: string;
    recommendation: string;
    examples?: string[];
  }>;
  extractedInfo: {
    hasTechStack: boolean;
    hasValues: boolean;
    industry?: string;
  };
  suggestions: {
    techStack?: string[];
    missingDetails?: Array<{
      question: string;
      rationale?: string;
      examples?: string[];
    }>;
  };
}

// Types moved from _instructions/types.ts
import type {
  BusinessModelId,
  CompanyStageId,
  IndustryId,
  CompanySizeId,
  WorkPaceId,
  AutonomyLevelId,
} from "./company-enums";

// Re-export the enum types so they can be imported from this module
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
} from "./company-enums";

export interface CompanyStage {
  id?: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  order: number;
  isDefault?: boolean;
  isSystemDefault?: boolean;
  canDelete?: boolean;
  canReorder?: boolean;
  questionsEnabled?: boolean; // Whether to generate questions for this stage (default: true)
}

export interface CompanyValue {
  name: string;
  description: string;
  color: string;
  icon: string; // emoji
  weight?: number;
}

export interface CompanyContext {
  // Company identification
  name?: string; // Company name

  // Core identifiers (enum-based)
  industry: IndustryId;
  subIndustry?: string; // Free text for specificity
  size: CompanySizeId;
  stage: CompanyStageId;
  businessModel: BusinessModelId;

  // Technical
  techStack: string[];

  // Culture (company-wide characteristics)
  culture: {
    values: string[] | CompanyValue[]; // Support both old and new format
  };

  confidence?: number;

  // Enhanced context
  stages?: CompanyStage[];
  jobLevelCategory?: string; // e.g., "Tech Startup", "Traditional Corporate", "Healthcare"
  suggestedJobLevelCategories?: string[]; // AI-suggested categories based on industry/context
  originalDescription?: string; // Original company description from user input
  customContext?: string; // Additional user-provided context for AI generation
}

export interface CompanyContextData {
  name?: string;
  industry: IndustryId;
  subIndustry?: string;
  size: CompanySizeId;
  stage: CompanyStageId;
  businessModel: BusinessModelId;
  techStack: string[];
  culture: {
    values: string[] | CompanyValue[];
    pace?: WorkPaceId;
    structure?: AutonomyLevelId;
  };
  confidence?: number;
  stages?: CompanyStage[];
  jobLevelCategory?: string;
  originalDescription?: string;
  customContext?: string;
  // Analysis state persistence
  descriptionAnalysis?: DescriptionAnalysis;
  lastAnalyzedDescription?: string;
  descriptionHasBeenEnhanced?: boolean;
  enhancedDescription?: any;
  lastEnhancementType?: any;
  lastAdditions?: any;
}

export interface RoleDetails {
  title: string;
  normalizedTitle?: string;
  seniorityLevel?: string;
  jobLevel?: string; // e.g., "Entry Level", "Senior", "Lead", "Manager", etc.
  category?: string;
  additionalDetails?: string;
  responsibilities?: string[];
  technicalSkills?: string[];
  softSkills?: string[];
}

export interface PositionSuggestion {
  title: string;
  description: string;
  rationale: string; // Why this position fits the company
  baseImpactScope?: string; // Outcome-focused description of impact and sphere of influence
  suggestedStageIds: string[]; // IDs of stages that should apply to this position
}

export interface GeneratedAttribute {
  id: string; // Unique identifier for sorting and keying
  name: string;
  description: string;
  category: "KNOWLEDGE" | "SKILL" | "ABILITY" | "VALUE"; // KSA Framework
  icon: string;
  color: string;
  weight: number;
  subAttributes?: Array<{
    name: string;
    description: string;
  }>;
}

/**
 * 5x2 Scoring System - Each bucket represents 2 points on a 0-10 scale
 */
export interface ScoringAnchor {
  scoreRange: string; // e.g., "1-2", "3-4", "5-6", "7-8", "9-10"
  label: string; // e.g., "Unable to perform job duties"
  examples: string[]; // Specific indicators for this score range
}

export interface ScoringAnchors {
  bucket1_2: ScoringAnchor; // 1-2: Unable to perform job duties
  bucket3_4: ScoringAnchor; // 3-4: Needs much handholding
  bucket5_6: ScoringAnchor; // 5-6: Minimal guidance needed
  bucket7_8: ScoringAnchor; // 7-8: Positively impacts peers
  bucket9_10: ScoringAnchor; // 9-10: Transforms team delivery
}

export interface FollowUpQuestion {
  question: string;
  purpose: string;
  whenToAsk: string;
}

export interface GeneratedQuestion {
  id: string; // Unique identifier for drag-and-drop and React keys
  text: string;
  stage: string;
  stageName?: string; // Display name for stage (same as stage for backward compatibility)
  difficultyLevel: "Basic" | "Intermediate" | "Advanced" | "Expert";
  attributes: string[]; // Attribute names this question evaluates
  assessmentType: "company-fit" | "role-fit" | "both"; // Whether evaluating company values or job-specific skills
  assignedLevels?: string[]; // Job levels this question applies to (e.g., ["Senior", "Lead"])
  expectations: {
    scoringAnchors: ScoringAnchors; // 5x2 bucket scoring system
    followUpQuestions: FollowUpQuestion[];
  };
  internalNotes?: string;
}

export interface LevelExpectations {
  level: string; // e.g., "Senior", "Lead", "Entry Level"
  experienceRange: string; // e.g., "5-7 years", "0-2 years"
  customTitle?: string; // e.g., "Senior Full-Stack Developer" (optional override)

  // Core expectations for this level
  keyResponsibilities: string[]; // Level-specific responsibilities
  technicalExpectations: string[]; // What they should be able to do
  leadershipExpectations: string[]; // Mentoring, decision-making, etc.

  // Requirements beyond base
  additionalRequirements: string[]; // Must-haves specific to this level
  additionalNiceToHaves: string[]; // Nice-to-haves specific to this level

  // Context about this level
  autonomyLevel: "close_mentorship" | "guided" | "independent" | "leadership";
  scopeOfImpact:
    | "task"
    | "feature"
    | "project"
    | "product"
    | "team"
    | "organization";
  decisionMakingAuthority: string; // Description of what decisions they make
}

export interface GeneratedJobTemplate {
  title: string; // Base title without level (e.g., "Full-Stack Developer")
  baseDescription: string; // Core description shared across all levels
  baseRequirements: string[]; // Core requirements for any level
  niceToHaves?: string[]; // General nice-to-haves
  tags: string[];
  services?: string[]; // Tools/services used in this role

  // Position-specific culture characteristics (NOT company-wide)
  positionCulture: {
    workEnvironment: string; // How this role works (remote/hybrid/office)
    workPace: string; // Pace of this specific role
    collaborationStyle: string; // How this role collaborates
  };

  // Level-specific customizations (generated when level assignments are provided)
  levelCustomizations?: LevelExpectations[];
}

export interface GenerationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    model: string;
    tokensUsed?: number;
    generationTime: number;
  };
}

export interface LevelAssignment {
  id: string;
  level: string;
  positionCount: number;
  assignedStageIds: string[]; // Which interview stages apply to this level
  operations?: string; // Impact & scope for this level (outcomes and sphere of influence)
}

export interface GenerationProgress {
  currentStep: GenerationStep;
  stepNumber: number;
  totalSteps: number;
  stepLabel: string;
  progress: number; // 0-100
  operations?: any[];
}

// Execution tracking types
export interface CellResult {
  id: string;
  type:
    | "context"
    | "attributes"
    | "questions"
    | "role-setup"
    | "job-template"
    | "additional-role";
  status: "loading" | "success" | "error";
  input: any;
  output?: any;
  metadata?: any;
  generationTime?: number;
  error?: string;
}

// Enhanced type for execution tracking
export interface ExecutionTracking {
  cells: CellResult[];
}
