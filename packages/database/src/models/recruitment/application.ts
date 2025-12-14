/**
 * Application model for recruitment domain
 */

import {
  CompanyScopedDocument,
  AuditableDocument
} from '../core/base';
import {
  ApplicationStatus,
  AttachmentType,
  CommunicationType
} from '../enums/system';
import {
  EvaluatorRole,
  EvaluationRecommendation,
  StageStatus
} from '../enums/evaluation';

/**
 * Application Document - Represents a candidate's application for a specific job
 */
export interface ApplicationDocument extends CompanyScopedDocument, AuditableDocument {
  collection: "applications";

  // Core application information
  applicationId: string;
  jobId: string;
  candidateId: string;

  // Application details
  status: ApplicationStatus;
  appliedAt: string;
  source?: string;
  referral?: {
    referrerUserId: string;
    referrerName: string;
    relationship: string;
  };

  // Current stage
  currentStageId?: string;
  stageHistory: Array<{
    stageId: string;
    stageName: string;
    enteredAt: string;
    exitedAt?: string;
    duration?: number; // Minutes
    status: StageStatus;
    evaluatorId?: string;
    notes?: string;
  }>;

  // Evaluations and scores
  evaluations: Array<{
    stageId: string;
    evaluatorId: string;
    evaluatorRole: EvaluatorRole;
    status: "pending" | "in_progress" | "completed" | "skipped";
    startedAt?: string;
    completedAt?: string;
    overallScore?: number;
    recommendation?: EvaluationRecommendation;
    responses: Array<{
      questionId: string;
      answer: string;
      score?: number;
      confidence?: number;
      notes?: string;
    }>;
    rubricScores?: Array<{
      dimension: string;
      score: number;
      weight?: number;
      notes?: string;
    }>;
    summary?: {
      overallScore: number;
      recommendation: EvaluationRecommendation;
      strengths: string[];
      concerns: string[];
      notes: string;
    };
  }>;

  // Decision
  decision: {
    status: "pending" | "offer" | "hired" | "rejected" | "withdrawn";
    decidedBy: string;
    decidedAt: string;
    reason?: string;
    offerDetails?: {
      salary: number;
      bonus?: number;
      startDate: string;
      deadline: string;
      status: "pending" | "accepted" | "rejected" | "expired";
    };
  };

  // Communication
  communications: Array<{
    type: "application_update" | "interview_schedule" | "offer" | "rejection" | "general";
    channel: "email" | "sms" | "portal";
    sentAt: string;
    template?: string;
    content: string;
    automated: boolean;
  }>;

  // Attachments submitted with application
  attachments: Array<{
    type: AttachmentType;
    url: string;
    fileName: string;
    uploadedAt: string;
    notes?: string;
  }>;

  // Notes and activities
  notes: Array<{
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    createdAt: string;
    visibility: "private" | "team" | "company";
    tags: string[];
  }>;
  activities: Array<{
    type: "status_change" | "evaluation_completed" | "interview_scheduled" | "note_added" | "communication_sent";
    description: string;
    userId: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }>;

  // Analytics
  metrics: {
    timeToApplication: number; // Days from job posting to application
    timeInProcess: number; // Days from application to decision
    responseTime: number; // Hours until first communication
    interviewCount: number;
    evaluatorCount: number;
    lastUpdated: string;
  };

  // Privacy compliance
  gdpr: {
    consentProvidedAt: string;
    dataProcessingBasis: string;
    retentionPeriod: number; // Days to retain data
    deletionRequested?: string;
    deletedAt?: string;
  };
}