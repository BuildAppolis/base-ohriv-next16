/**
 * Evaluation guideline models
 */

import {
  TenantScopedDocument,
  AuditableDocument,
  VersionedDocument
} from '../core/base';
import {
  EvaluationQuestionType,
  InterviewStageType,
  RubricGrade,
  SkillCategory,
  SkillProficiency
} from '../enums/evaluation';

/**
 * Evaluation Guideline Document - Defines evaluation criteria and scoring for jobs
 */
export interface EvaluationGuidelineDocument extends TenantScopedDocument, AuditableDocument, VersionedDocument {
  collection: "evaluation-guidelines";

  // Core guideline information
  guidelineId: string;
  name: string;
  description?: string;

  // Target role and level
  targetRole: string; // e.g., "Software Engineer", "Product Manager"
  targetLevel: "intern" | "entry" | "junior" | "mid" | "senior" | "lead" | "manager" | "director";
  applicableJobLevels: string[];

  // Scoring configuration
  scoring: {
    totalScore: number; // Total possible score (usually 100)
    passingScore: number; // Minimum score to pass
    weightDistribution: {
      jobFit: number; // Weight for job-specific skills
      valuesFit: number; // Weight for cultural values alignment
      custom: number; // Weight for custom criteria
    };
    scoreBands: Array<{
      min: number;
      max: number;
      grade: RubricGrade;
      description: string;
      action: "hire" | "consider" | "reject";
    }>;
  };

  // Evaluation sections
  sections: Array<{
    id: string;
    name: string;
    type: "job_fit" | "values_fit" | "technical" | "behavioral" | "custom";
    weight: number; // Weight within the section
    required: boolean; // Must this section be completed
    description?: string;
  }>;

  // Questions and rubrics
  questions: Array<{
    id: string;
    sectionId: string;
    category: string;
    question: string;
    type: EvaluationQuestionType;
    required: boolean;
    weight: number; // Weight within the section
    maxScore: number; // Maximum score for this question

    // For multiple choice questions
    options?: Array<{
      value: string;
      label: string;
      score: number;
      explanation?: string;
    }>;

    // For scale questions
    scaleConfig?: {
      min: number;
      max: number;
      step: number;
      labels?: Record<number, string>;
    };

    // For text questions
    textEvaluation?: {
      criteria: string[];
      keywords: Array<{
        word: string;
        weight: number;
        category: string;
      }>;
      maxScore: number;
    };

    // For file/code review
    reviewCriteria?: Array<{
      criterion: string;
      weight: number;
      description: string;
    }>;
  }>;

  // Interview stages this guideline applies to
  stages: Array<{
    stageType: InterviewStageType;
    duration: number; // Minutes
    evaluatorRole: string;
    autoAdvance: boolean;
  }>;

  // Cultural values alignment
  valuesAlignment: {
    companyValues: Array<{
      value: string;
      description: string;
      weight: number;
      indicators: string[]; // Behaviors that indicate alignment
    }>;
    assessmentCriteria: Array<{
      criterion: string;
      weight: number;
      questions: string[]; // Questions to assess this criterion
    }>;
  };

  // Templates and automation
  templates: {
    interviewScript?: string;
    evaluationForm?: string;
    feedbackTemplate?: string;
    rejectionReasons?: Array<{
      reason: string;
      template: string;
      category: string;
    }>;
  };

  // Usage statistics
  stats: {
    usedInJobs: number;
    totalEvaluations: number;
    averageScore: number;
    passRate: number;
    lastUpdated: string;
  };

  // Quality metrics
  qualityMetrics: {
    reliabilityScore?: number; // Inter-rater reliability
    validityScore?: number; // Predictive validity
    completionRate?: number; // % of evaluations completed
    averageDuration?: number; // Average evaluation time (minutes)
    lastCalculated?: string;
  };
}

/**
 * Evaluation Template Document - Reusable evaluation templates
 */
export interface EvaluationTemplateDocument extends TenantScopedDocument, AuditableDocument, VersionedDocument {
  collection: "evaluation-templates";

  templateId: string;
  name: string;
  description?: string;
  category: "technical" | "behavioral" | "cultural" | "custom";

  // Template configuration
  isPublic: boolean; // Available to other companies in tenant
  isDefault: boolean; // Template used by default for certain job types
  targetRoles: string[]; // Job roles this template applies to
  targetLevels: string[]; // Experience levels this template applies to

  // Template content (from guideline)
  content: any; // Reference to guideline structure

  // Usage tracking
  usage: {
    uses: number;
    lastUsed?: string;
    companies: string[]; // Companies that have used this template
    avgScore: number;
    feedback: Array<{
      userId: string;
      rating: number;
      comment?: string;
      timestamp: string;
    }>;
  };
}