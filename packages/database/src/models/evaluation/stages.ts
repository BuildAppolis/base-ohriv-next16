/**
 * Stage evaluation models
 */

import {
  CompanyScopedDocument,
  AuditableDocument,
  SoftDelete
} from '../core/base';
import {
  EvaluationQuestionType,
  EvaluationRecommendation,
  RedFlagSeverity,
  SkillCategory,
  SkillProficiency
} from '../enums/evaluation';

/**
 * Stage Evaluation Document - Tracks evaluation progress for a specific application stage
 */
export interface StageEvaluationDocument extends CompanyScopedDocument, AuditableDocument, SoftDelete {
  collection: "stage-evaluations";

  // Core evaluation information
  evaluationId: string;
  applicationId: string;
  stageId: string;
  candidateId: string;
  jobId: string;

  // Evaluator information
  evaluatorId: string;
  evaluatorRole: string; // recruiter, hiring_manager, technical_interviewer, etc.
  evaluatorName: string;

  // Status and timing
  status: "not_started" | "in_progress" | "completed" | "skipped" | "on_hold";
  startedAt?: string;
  completedAt?: string;
  duration?: number; // Minutes
  scheduledFor?: string; // Future interview date
  scheduledAt?: string;

  // Guideline being used
  guidelineId?: string;
  guidelineVersion?: number;

  // Question responses
  responses: Array<{
    questionId: string;
    question: string;
    sectionId: string;
    category: string;
    type: EvaluationQuestionType;
    answer?: string; // Text or multiple choice answer
    score?: number; // 0-10 scale or section score
    confidence?: number; // 0-1 scale
    notes?: string;
    timeSpent?: number; // Seconds
    attachments?: string[]; // URLs to uploaded files

    // For code review
    codeReview?: {
      repositoryUrl?: string;
      commitHash?: string;
      filesReviewed: Array<{
        fileName: string;
        score: number;
        feedback: string;
        issues: Array<{
          type: "bug" | "style" | "performance" | "security";
          severity: RedFlagSeverity;
          description: string;
        }>;
      }>;
    };

    // For file review
    fileReview?: {
      fileUrl: string;
      fileName: string;
      reviewCriteria: Array<{
        criterion: string;
        score: number;
        feedback: string;
      }>;
    };
  }>;

  // Scoring and recommendations
  scoring: {
    sectionScores: Array<{
      sectionId: string;
      sectionName: string;
      sectionWeight: number;
      rawScore: number;
      weightedScore: number;
      maxScore: number;
    }>;
    overallScore: number; // Weighted total score
    percentageScore: number; // Score as percentage
    recommendation: EvaluationRecommendation;
    confidence: number; // Confidence in recommendation (0-1)
  };

  // Detailed assessment
  assessment: {
    strengths: Array<{
      area: string;
      description: string;
      evidence: string[]; // Response IDs that support this
    }>;
    concerns: Array<{
      area: string;
      description: string;
      severity: RedFlagSeverity;
      evidence: string[]; // Response IDs that support this
    }>;
    redFlags?: Array<{
      flag: string;
      description: string;
      severity: RedFlagSeverity;
    }>;
  };

  // Skills assessment
  skillsAssessment?: {
    technicalSkills: Array<{
      skill: string;
      level: SkillProficiency;
      demonstrated: boolean;
      evidence?: string;
    }>;
    softSkills: Array<{
      skill: string;
      level: SkillProficiency;
      demonstrated: boolean;
      evidence?: string;
    }>;
    gaps: Array<{
      skill: string;
      requiredLevel: SkillProficiency;
      currentLevel: SkillProficiency;
      impact: string;
    }>;
  };

  // Interview notes and observations
  notes: {
    candidateImpression: string;
    culturalFit: string;
    motivation: string;
    careerGoals: string;
    concerns: string;
    additionalNotes?: string;
  };

  // Follow-up actions
  followUp: {
    nextSteps: string[];
    additionalEvaluators: string[];
    materialsNeeded: string[];
    timeline?: string;
  };

  // Audio/Video recording
  recording?: {
    audioUrl?: string;
    videoUrl?: string;
    transcript?: string;
    duration?: number; // Seconds
    size?: number; // Bytes
  };

  completedBy?: string;

  // Quality metrics
  quality: {
    completeness: number; // % of required questions answered
    consistency: number; // Score consistency across similar evaluations
    thoroughness: number; // Quality of notes and evidence
    timeEfficiency: number; // Score vs time taken ratio
    lastCalculated?: string;
  };

  // Review and approval
  review?: {
    reviewedBy?: string;
    reviewedAt?: string;
    feedback?: string;
    approved: boolean;
    adjustments?: {
      originalScore: number;
      adjustedScore: number;
      reason: string;
    }[];
  };
}