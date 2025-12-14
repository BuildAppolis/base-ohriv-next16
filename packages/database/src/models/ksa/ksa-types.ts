/**
 * Core KSA (Knowledge, Skills, Abilities) type definitions
 * These are the fundamental types used in KSA evaluations
 */

/**
 * Weighting Range Configuration
 * Defines min/max ranges for attribute weighting
 */
export interface WeightingRange {
  min: number;
  max: number;
}

/**
 * Weighting Preset Configuration
 * Defines weighting presets for different job levels/roles
 */
export interface WeightingPreset {
  center: number;
  leftPoints: number;
  rightPoints: number;
  rationale?: string;
}

/**
 * Question Evaluation Configuration
 */
export interface QuestionEvaluation {
  questionText: string;
  followUpProbes?: string[];
  evaluationCriteria?: string;
  expectedAnswers?: string;
  redFlagIndicators?: string[];
  difficulty?: "basic" | "intermediate" | "advanced" | "expert";
}

/**
 * Sample Indicators for Values Questions
 */
export interface SampleIndicators {
  strongResponse: string;
  weakResponse: string;
}

/**
 * Values Question Configuration
 */
export interface ValuesQuestion {
  id: number;
  questionText: string;
  followUpProbes?: string[];
  sampleIndicators?: SampleIndicators;
}

/**
 * KSA Attribute Definition
 * Defines a KSA attribute with its evaluation criteria
 */
export interface KSAAttribute {
  definition: string;
  evaluationScale: Record<string, string>;
  weighting: number | WeightingRange;
  redFlags?: string[];
}

/**
 * KSA Category Configuration
 * Represents a KSA category (Knowledge, Skills, Abilities)
 */
export interface KSACategory {
  attribute: KSAAttribute;
  questions: Array<QuestionEvaluation & { id: number }>;
}

/**
 * Values Category Configuration
 * Represents a company value with its questions
 */
export interface ValuesCategory {
  questions: ValuesQuestion[];
}