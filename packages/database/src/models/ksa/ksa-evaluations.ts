/**
 * KSA Evaluation result models
 */

import {
  CompanyScopedDocument,
  TenantScopedDocument,
  AuditableDocument
} from '../core/base';
import { EvaluationRecommendation, RedFlagSeverity } from '../enums/evaluation';
import {
  KSACategory,
  ValuesCategory
} from './ksa-types';

/**
 * Question Response - Candidate's response to a specific question
 */
export interface QuestionResponse {
  questionId: number;
  category: string;
  questionText: string;
  response: string;
  followUpResponses?: Record<string, string>; // key: probe question, value: response
  score?: number; // 1-10 scale
  confidence?: number; // 0-1 scale
  notes?: string;
  evidence?: string[]; // Specific evidence from response
  redFlags?: string[]; // Any red flags detected
  timeSpent?: number; // Seconds spent on this question
}

/**
 * KSA Category Evaluation - Evaluation results for a KSA category
 */
export interface KSACategoryEvaluation {
  category: "Knowledge" | "Skills" | "Ability";
  weight: number;
  maxScore: number;
  questionResponses: QuestionResponse[];
  rawScore: number; // Sum of question scores
  weightedScore: number; // rawScore * (weight / 100)
  percentage: number; // rawScore / maxScore * 100
  strengths: string[]; // Key strengths identified
  concerns: string[]; // Key concerns identified
  notes?: string;
}

/**
 * Values Category Evaluation - Evaluation results for a values category
 */
export interface ValuesCategoryEvaluation {
  value: string;
  questionResponses: Array<{
    id: number;
    questionText: string;
    response: string;
    alignment: "strong" | "moderate" | "weak" | "misaligned";
    evidence: string[];
    notes?: string;
  }>;
  overallAlignment: "strong" | "moderate" | "weak" | "misaligned";
  score: number; // 1-10 scale
  weight?: number;
  indicators: {
    positive: string[]; // Positive indicators observed
    negative: string[]; // Negative indicators observed
  };
}

/**
 * KSA Evaluation Summary - Overall evaluation summary
 */
export interface KSAEvaluationSummary {
  totalScore: number; // Weighted total score
  maxScore: number;
  percentage: number;
  recommendation: EvaluationRecommendation;
  confidence: number; // 0-1 scale
  finalDecision: {
    decision: "hire" | "consider" | "reject";
    rationale: string;
    nextSteps: string[];
  };
  keyStrengths: string[]; // Top 3-5 strengths
  keyConcerns: string[]; // Top 3-5 concerns
  redFlags: string[]; // Critical red flags
  cultureFit: {
    overallScore: number;
    alignmentWithValues: string[];
    potentialConcerns: string[];
  };
}

/**
 * Candidate KSA Evaluation Document - Complete evaluation record
 */
export interface CandidateKSADocument extends CompanyScopedDocument, AuditableDocument {
  collection: "candidate-ksa-evaluations";

  // Core evaluation information
  evaluationId: string;
  candidateId: string;
  applicationId: string;
  stageId: string; // Which pipeline stage this evaluation belongs to

  // Evaluator information
  evaluatorId: string;
  evaluatorRole: string;
  evaluatorName: string;

  // Guideline information
  ksaGuidelineId: string;
  ksaGuidelineVersion?: number;
  evaluationMappingId?: string; // Job-specific customizations used

  // Status and timing
  status: "in_progress" | "completed" | "reviewed" | "final";
  startedAt: string;
  completedAt?: string;
  duration?: number; // Minutes
  lastSavedAt: string;

  // KSA Job Fit Evaluation
  jobFitEvaluation: {
    Knowledge?: KSACategoryEvaluation;
    Skills?: KSACategoryEvaluation;
    Ability?: KSACategoryEvaluation;
    totalScore: number;
    weightedScores: Record<string, number>;
  };

  // Values Fit Evaluation
  valuesFitEvaluation: Record<string, ValuesCategoryEvaluation>;
  valuesFitScore: number;
  valuesAlignment: Record<string, "strong" | "moderate" | "weak" | "misaligned">;

  // Overall evaluation summary
  summary: KSAEvaluationSummary;

  // Detailed notes and observations
  notes: {
    overallImpression: string;
    technicalAssessment?: string;
    behavioralNotes?: string;
    culturalObservations?: string;
    concerns?: string;
    recommendations?: string;
  };

  // Evidence and artifacts
  evidence: {
    codeReview?: {
      repositoryUrl?: string;
      commits: Array<{
        hash: string;
        message: string;
        score: number;
        feedback: string;
      }>;
    };
    portfolioReview?: {
      url: string;
      artifacts: Array<{
        name: string;
        score: number;
        feedback: string;
      }>;
    };
    referenceChecks?: Array<{
      referrerName: string;
      relationship: string;
      feedback: string;
      credibility: number;
    }>;
  };

  // Comparison with other candidates (optional)
  comparison?: {
    percentileRank: number;
    comparedTo: number; // Number of candidates compared against
    benchmarkScores: Record<string, number>;
  };

  // Review and approval
  review: {
    reviewedBy?: string;
    reviewedAt?: string;
    reviewerComments?: string;
    adjustments?: Array<{
      originalScore: number;
      adjustedScore: number;
      reason: string;
      adjustedBy: string;
      adjustedAt: string;
    }>;
    approved: boolean;
    finalApprovalBy?: string;
    finalApprovalAt?: string;
  };

  // Quality metrics
  qualityMetrics: {
    completeness: number; // Percentage of required questions answered
    consistency: number; // Score consistency across similar evaluations
    thoroughness: number; // Quality of notes and evidence
    timeEfficiency: number; // Score vs time taken ratio
    lastCalculated?: string;
  };

  // Automation and AI assistance
  aiAssistance?: {
    transcription?: {
      audioUrl: string;
      transcript: string;
      confidence: number;
    };
    sentimentAnalysis?: {
      overallSentiment: "positive" | "neutral" | "negative";
      confidence: number;
      keyPhrases: string[];
    };
    suggestedScores?: Record<string, number>;
    autoFlaggedIssues?: Array<{
      type: "red_flag" | "concern" | "inconsistency";
      description: string;
      confidence: number;
    }>;
  };
}

/**
 * KSA Evaluation Template Response Document - Template for responses
 */
export interface KSAResponseTemplateDocument extends TenantScopedDocument, AuditableDocument {
  collection: "ksa-response-templates";

  templateId: string;
  name: string;
  description?: string;

  // Template configuration
  templateType: "question_probes" | "evaluation_criteria" | "feedback_templates" | "score_justification";

  // Template content
  content: {
    // For question probes
    probes?: Record<string, string[]>; // questionId -> follow-up probes

    // For evaluation criteria
    criteria?: Record<string, {
      excellent: string;
      good: string;
      satisfactory: string;
      needsImprovement: string;
    }>;

    // For feedback templates
    feedback?: {
      positive: string[];
      constructive: string[];
      redFlag: string[];
    };

    // For score justification
    justifications?: Record<number, string>; // score -> justification template
  };

  // Usage tracking
  usage: {
    usedInEvaluations: number;
    lastUsed?: string;
    feedback: Array<{
      userId: string;
      helpful: boolean;
      comment?: string;
      timestamp: string;
    }>;
  };

  isActive: boolean;
  tags: string[];
}

/**
 * KSA Evaluation Benchmark Document - Benchmark data for comparisons
 */
export interface KSABenchmarkDocument extends TenantScopedDocument, AuditableDocument {
  collection: "ksa-benchmarks";

  benchmarkId: string;
  name: string;
  description?: string;

  // Benchmark scope
  scope: {
    roles: string[];
    levels: string[];
    industries?: string[];
    timeRange: {
      start: string;
      end: string;
    };
    sampleSize: number;
  };

  // Benchmark data
  benchmarks: {
    // KSA score distributions
    scoreDistributions: {
      Knowledge: Array<{ score: number; percentile: number }>;
      Skills: Array<{ score: number; percentile: number }>;
      Ability: Array<{ score: number; percentile: number }>;
      overall: Array<{ score: number; percentile: number }>;
    };

    // Values alignment distributions
    valuesAlignment: Record<string, {
      strong: number; // percentage
      moderate: number;
      weak: number;
      misaligned: number;
    }>;

    // Common question responses
    commonResponses: Array<{
      questionId: number;
      category: string;
      topResponses: Array<{
        response: string;
        frequency: number;
        averageScore: number;
      }>;
    }>;

    // Red flag frequencies
    redFlagFrequency: Record<string, number>; // red flag -> occurrence percentage

    // Success correlations
    successCorrelations: {
      highPerformers: {
        averageScores: Record<string, number>;
        commonStrengths: string[];
        keyIndicators: string[];
      };
      lowPerformers: {
        averageScores: Record<string, number>;
        commonWeaknesses: string[];
        keyIndicators: string[];
      };
    };
  };

  lastCalculated: string;
  isActive: boolean;

  // Validation
  validation: {
    confidenceLevel: number; // Statistical confidence
    marginOfError: number;
    validatedAt: string;
    validatedBy: string;
  };
}