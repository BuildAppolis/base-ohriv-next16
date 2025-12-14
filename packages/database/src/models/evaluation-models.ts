// RavenDB Document Models for Evaluation System
// These models define the structure of evaluation-related documents stored in tenant databases

import { RavenDocument } from "./tenant-models";

/**
 * Evaluation Guideline Document - Defines evaluation criteria and scoring for jobs
 */
export interface EvaluationGuidelineDocument extends RavenDocument {
  collection: "evaluation-guidelines";

  // Core guideline information
  guidelineId: string;
  tenantId: string;
  name: string;
  description?: string;

  // Target role and level
  targetRole: string; // e.g., "Software Engineer", "Product Manager"
  targetLevel:
    | "intern"
    | "entry"
    | "junior"
    | "mid"
    | "senior"
    | "lead"
    | "manager"
    | "director";
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
      grade: "A" | "B" | "C" | "D" | "F";
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
    type: "multiple_choice" | "scale" | "text" | "file_review" | "code_review";
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
    stageType: "screening" | "phone" | "technical" | "behavioral" | "final";
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

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number;
  isActive: boolean;

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
 * Stage Evaluation Document - Tracks evaluation progress for a specific application stage
 */
export interface StageEvaluationDocument extends RavenDocument {
  collection: "stage-evaluations";

  // Core evaluation information
  evaluationId: string;
  applicationId: string;
  stageId: string;
  candidateId: string;
  jobId: string;
  tenantId: string;

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
    type: string;
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
          severity: "low" | "medium" | "high" | "critical";
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
    recommendation: "advance" | "hold" | "reject";
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
      severity: "low" | "medium" | "high";
      evidence: string[]; // Response IDs that support this
    }>;
    redFlags?: Array<{
      flag: string;
      description: string;
      severity: "warning" | "stop" | "critical";
    }>;
  };

  // Skills assessment
  skillsAssessment?: {
    technicalSkills: Array<{
      skill: string;
      level: number; // 1-5 scale
      demonstrated: boolean;
      evidence?: string;
    }>;
    softSkills: Array<{
      skill: string;
      level: number; // 1-5 scale
      demonstrated: boolean;
      evidence?: string;
    }>;
    gaps: Array<{
      skill: string;
      requiredLevel: number;
      currentLevel: number;
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

  // Metadata
  createdAt: string;
  updatedAt: string;
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

/**
 * Evaluation Template Document - Reusable evaluation templates
 */
export interface EvaluationTemplateDocument extends RavenDocument {
  collection: "evaluation-templates";

  // Template information
  templateId: string;
  tenantId: string;
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

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number;
  isActive: boolean;
}

/**
 * Skill Assessment Document - Skills taxonomy and assessment criteria
 */
export interface SkillAssessmentDocument extends RavenDocument {
  collection: "skill-assessments";

  // Skill information
  skillId: string;
  tenantId: string;
  name: string;
  category: "technical" | "soft" | "language" | "certification" | "domain";
  subcategory?: string;

  // Skill definition
  definition: {
    description: string;
    proficiencyLevels: Array<{
      level: number;
      name: string;
      description: string;
      indicators: string[]; // Behaviors that demonstrate this level
    }>;
    relatedSkills: string[]; // Prerequisites or related skills
  };

  // Assessment criteria
  assessment: {
    questions: Array<{
      question: string;
      type: "self_assessment" | "interview" | "practical" | "certification";
      weight: number;
    }>;
    rubric: Array<{
      level: number;
      criteria: string[];
      evidence: string[];
    }>;
  };

  // Industry and role context
  context: {
    industries: string[];
    roles: string[];
    seniority: string[];
    tools?: string[]; // Specific tools or technologies
  };

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isActive: boolean;

  // Usage statistics
  stats: {
    assessmentCount: number;
    averageLevel: number;
    lastUsed?: string;
  };
}
