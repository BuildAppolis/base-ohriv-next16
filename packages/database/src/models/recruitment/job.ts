/**
 * Job model for recruitment domain
 */

import {
  CompanyScopedDocument,
  AuditableDocument,
  SoftDelete
} from '../core/base';
import {
  JobLevel,
  EmploymentType,
  WorkEnvironment
} from '../enums/job';
import { Department } from '../enums/job';
import { EvaluationQuestionType, InterviewStageType } from '../enums/evaluation';
import { Address, DateRange, MonetaryAmount } from '../core/common';

/**
 * Job Document - Represents a job posting within a company
 */
export interface JobDocument extends CompanyScopedDocument, AuditableDocument, SoftDelete {
  collection: "jobs";

  // Core job information
  jobId: string;
  title: string;
  description: string;
  summary?: string;

  // Job classification
  level: JobLevel;
  type: EmploymentType;
  workEnvironment: WorkEnvironment;
  department?: Department;

  // Compensation
  compensation: {
    salary?: MonetaryAmount & {
      min: number;
      max: number;
      frequency: "hourly" | "monthly" | "yearly";
    };
    equity?: {
      min: number;
      max: number;
      vestingYears: number;
      cliffMonths: number;
    };
    bonus?: MonetaryAmount & {
      target: number;
      guaranteed: number;
    };
    benefits: string[];
  };

  // Requirements
  requirements: {
    experience?: {
      min: number; // Years
      max?: number;
      level: string; // Seniority level description
    };
    education?: Array<{
      level: string; // High school, Bachelor's, Master's, PhD
      field?: string;
      required: boolean;
    }>;
    skills: Array<{
      name: string;
      type: "technical" | "soft" | "language" | "certification";
      level: "required" | "preferred";
      proficiency?: number; // 1-5 scale
    }>;
    certifications?: Array<{
      name: string;
      issuer: string;
      required: boolean;
      expiry?: boolean;
    }>;
  };

  // Location
  location: {
    type: "remote" | "onsite" | "hybrid" | "multiple";
    remote?: {
      policy: "fully_remote" | "hybrid" | "flexible";
      timezones?: string[];
      countries?: string[];
    };
    onsite?: Array<{
      address: string;
      city: string;
      state: string;
      country: string;
      remoteOption: boolean;
    }>;
  };

  // Application process
  application: {
    deadline?: string;
    startDate?: string;
    duration?: string; // "3 months", "6 months", etc.
    contactEmail: string;
    applicationUrl?: string;
    screeningQuestions: Array<{
      question: string;
      type: "text" | "multiple_choice" | "yes_no" | "file" | "link";
      required: boolean;
      options?: string[]; // For multiple choice
      validation?: {
        minLength?: number;
        maxLength?: number;
        pattern?: string;
      };
    }>;
  };

  // Evaluation pipeline
  pipeline: {
    stages: Array<{
      stageId: string;
      name: string;
      type: InterviewStageType;
      order: number;
      evaluators: string[]; // User IDs
      autoAdvance: boolean;
      passScore?: number;
      durationMinutes?: number;
    }>;
    guidelineId?: string; // Reference to evaluation guideline
    ksaGuidelineId?: string; // Reference to KSA evaluation guideline
    evaluationMappingId?: string; // Reference to job-specific KSA customizations
  };

  // Publishing and visibility
  publishing: {
    status: "draft" | "published" | "closed" | "paused";
    publishedAt?: string;
    expiresAt?: string;
    visibility: "public" | "internal" | "private";
    distribution: string[]; // Job boards where it's posted
  };

  // Configuration
  modifiedBy?: string;

  // Statistics
  stats: {
    views: number;
    applications: number;
    screened: number;
    interviews: number;
    offers: number;
    hires: number;
    rejected: number;
    withdrew: number;
    timeStats: {
      averageScreeningTime: number;
      averageInterviewTime: number;
      averageTimeToHire: number;
    };
    lastUpdated: string;
  };

  // Collaboration
  collaborators: Array<{
    userId: string;
    role: "owner" | "editor" | "viewer" | "interviewer";
    permissions: string[];
  }>;
}