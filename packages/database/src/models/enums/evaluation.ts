/**
 * Evaluation-related enums and constants
 */

/**
 * Evaluator roles in the hiring process
 */
export const evaluatorRoles = [
  "sourcer",
  "recruiter",
  "hiring_manager",
  "technical_interviewer",
  "values_interviewer",
  "peer",
  "partner",
] as const;

export type EvaluatorRole = (typeof evaluatorRoles)[number];

/**
 * Evaluation sections
 */
export const evaluationSections = ["jobFit", "valuesFit", "custom"] as const;
export type EvaluationSection = (typeof evaluationSections)[number];

/**
 * Stage status in evaluation pipeline
 */
export const stageStatuses = [
  "not_started",
  "in_progress",
  "completed",
  "skipped",
] as const;

export type StageStatus = (typeof stageStatuses)[number];

/**
 * Evaluation recommendation types
 */
export const evaluationRecommendations = ["advance", "hold", "reject"] as const;
export type EvaluationRecommendation = (typeof evaluationRecommendations)[number];

/**
 * Question types in evaluations
 */
export enum EvaluationQuestionType {
  MultipleChoice = "multiple_choice",
  Scale = "scale",
  Text = "text",
  FileReview = "file_review",
  CodeReview = "code_review",
}

/**
 * Interview stage types
 */
export enum InterviewStageType {
  Screening = "screening",
  Phone = "phone",
  Technical = "technical",
  Behavioral = "behavioral",
  Final = "final",
}

/**
 * Skill categories
 */
export enum SkillCategory {
  Technical = "technical",
  Soft = "soft",
  Language = "language",
  Certification = "certification",
  Domain = "domain",
  Tool = "tool",
}

/**
 * Skill proficiency levels
 */
export enum SkillProficiency {
  Beginner = 1,
  Elementary = 2,
  Limited = 3,
  Professional = 4,
  Advanced = 5,
  Expert = 6,
}

/**
 * Question difficulty levels
 */
export enum QuestionDifficulty {
  Basic = "basic",
  Intermediate = "intermediate",
  Advanced = "advanced",
  Expert = "expert",
}

/**
 * Evaluation rubric grades
 */
export enum RubricGrade {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  F = "F",
}

/**
 * Red flag severity levels
 */
export enum RedFlagSeverity {
  Low = "low",
  Medium = "medium",
  High = "high",
  Critical = "critical",
}