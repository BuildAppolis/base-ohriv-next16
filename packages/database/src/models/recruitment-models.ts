// RavenDB Document Models for Recruitment System
// These models define the structure of recruitment-related documents stored in tenant databases

import { RavenDocument } from './tenant-models';

/**
 * Company Document - Represents a company/organization within a tenant
 */
export interface CompanyDocument extends RavenDocument {
  collection: "companies";

  // Core company information
  companyId: string;
  tenantId: string;          // Which tenant owns this company
  name: string;
  website?: string;

  // Business information
  industry: string;
  subIndustry?: string;
  size: "startup" | "small" | "medium" | "large" | "enterprise";
  stage: "seed" | "early" | "growth" | "mature" | "declining";
  businessModel: "b2b" | "b2c" | "b2b2c" | "marketplace" | "saas" | "other";

  // Location information
  headquarters: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    timezone: string;
  };
  remotePolicy: "fully_remote" | "hybrid" | "onsite" | "flexible";
  locations: Array<{
    type: "office" | "remote";
    address: string;
    city: string;
    state: string;
    country: string;
    isPrimary: boolean;
  }>;

  // Company culture and values
  culture: {
    mission?: string;
    vision?: string;
    values: string[];
    description?: string;
    benefits: string[];
    techStack: string[];
    workEnvironment: "casual" | "business" | "creative" | "technical";
  };

  // Recruitment settings
  recruitment: {
    processTimeline?: number; // Days from application to decision
    approvalWorkflow: string[]; // Required approvers for hiring decisions
    diversityGoals?: {
      gender: Record<string, number>;
      ethnicity: Record<string, number>;
      veterans: number;
      disabilities: number;
    };
    branding: {
      logoUrl?: string;
      heroImageUrl?: string;
      careersUrl?: string;
      socialMedia?: {
        linkedin?: string;
        twitter?: string;
        facebook?: string;
        instagram?: string;
      };
    };
  };

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isActive: boolean;
  isDefault: boolean;       // For single-company tenants

  // Statistics and analytics
  stats: {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    activeApplications: number;
    totalHires: number;
    averageTimeToHire: number;
    lastUpdated: string;
  };

  // Integrations
  integrations: Array<{
    type: "ats" | "job_board" | "hris" | "calendar" | "slack";
    provider: string;
    status: "active" | "inactive" | "error";
    config: Record<string, any>;
    lastSync?: string;
  }>;
}

/**
 * Job Document - Represents a job posting within a company
 */
export interface JobDocument extends RavenDocument {
  collection: "jobs";

  // Core job information
  jobId: string;
  tenantId: string;
  companyId: string;
  title: string;
  description: string;
  summary?: string;

  // Job classification
  level: "intern" | "entry" | "junior" | "mid" | "senior" | "lead" | "manager" | "director" | "vp" | "c_level";
  type: "full_time" | "part_time" | "contract" | "temporary" | "internship" | "fellowship";
  workEnvironment: "remote" | "onsite" | "hybrid" | "flexible";
  department?: string;

  // Compensation
  compensation: {
    salary?: {
      min: number;
      max: number;
      currency: string;
      frequency: "hourly" | "monthly" | "yearly";
    };
    equity?: {
      min: number;
      max: number;
      vestingYears: number;
      cliffMonths: number;
    };
    bonus?: {
      target: number;
      guaranteed: number;
      currency: string;
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
      type: "screening" | "assessment" | "interview" | "offer" | "onboarding";
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

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
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

/**
 * Candidate Document - Represents a job candidate
 */
export interface CandidateDocument extends RavenDocument {
  collection: "candidates";

  // Core candidate information
  candidateId: string;
  tenantId: string;
  primaryCompanyId?: string; // Default company for direct applications
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  timezone?: string;

  // Professional information
  professional: {
    title?: string;
    summary?: string;
    experience: Array<{
      company: string;
      position: string;
      startDate: string;
      endDate?: string; // null for current position
      description?: string;
      achievements?: string[];
      technologies?: string[];
    }>;
    education: Array<{
      institution: string;
      degree: string;
      field: string;
      startDate: string;
      endDate?: string;
      gpa?: number;
      honors?: string[];
    }>;
    skills: Array<{
      name: string;
      category: "technical" | "soft" | "language" | "tool";
      proficiency: number; // 1-5 scale
      yearsExperience?: number;
    }>;
    certifications: Array<{
      name: string;
      issuer: string;
      dateEarned?: string;
      expires?: string;
      credentialId?: string;
    }>;
  };

  // Portfolio and profiles
  profiles: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    personal?: string;
    other?: Record<string, string>;
  };

  // Job preferences
  preferences: {
    jobTypes: string[]; // full_time, part_time, contract, remote, etc.
    locations: Array<{
      city?: string;
      state?: string;
      country?: string;
      remote: boolean;
    }>;
    salary?: {
      min: number;
      max: number;
      currency: string;
      negotiable: boolean;
    };
    remotePreference: "only_remote" | "prefer_remote" | "open_to_remote" | "no_remote";
    industries: string[];
    companySizes: string[];
  };

  // Source and tracking
  source: {
    channel: string; // job_board, referral, linkedin, website, etc.
    campaign?: string;
    referrerUserId?: string;
    referrerReward?: number;
    trackingData?: Record<string, any>;
  };

  // Attachments
  attachments: Array<{
    type: "resume" | "cover_letter" | "portfolio" | "transcript" | "certificate" | "other";
    url: string;
    title: string;
    fileName: string;
    fileSize: number;
    uploadedAt: string;
    tags?: string[];
  }>;

  // Notes and tags
  notes: Array<{
    id: string;
    content: string;
    authorId: string;
    createdAt: string;
    updatedAt?: string;
    visibility: "private" | "team" | "company";
  }>;
  tags: string[];

  // Status and pipeline
  status: "active" | "inactive" | "blacklisted";
  stage: "new" | "engaged" | "interviewing" | "offered" | "hired" | "rejected" | "withdrawn";

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastActiveAt?: string;

  // Communication history
  communications: Array<{
    id: string;
    type: "email" | "phone" | "sms" | "meeting" | "note";
    direction: "inbound" | "outbound";
    subject?: string;
    content: string;
    from: string; // User ID or system
    to: string[];
    timestamp: string;
    attachments?: string[];
    metadata?: Record<string, any>;
  }>;

  // Privacy and consent
  privacy: {
    dataProcessingConsent: boolean;
    marketingConsent: boolean;
    consentDate: string;
    gdprRequests: Array<{
      type: "access" | "deletion" | "correction" | "portability";
      requestedAt: string;
      completedAt?: string;
      status: "pending" | "completed" | "rejected";
    }>;
  };
}

/**
 * Application Document - Represents a candidate's application for a specific job
 */
export interface ApplicationDocument extends RavenDocument {
  collection: "applications";

  // Core application information
  applicationId: string;
  tenantId: string;
  companyId: string;
  jobId: string;
  candidateId: string;

  // Application details
  status: "applied" | "in_process" | "screening" | "interviewing" | "offer" | "hired" | "rejected" | "withdrawn";
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
    status: "in_progress" | "passed" | "failed" | "skipped";
    evaluatorId?: string;
    notes?: string;
  }>;

  // Evaluations and scores
  evaluations: Array<{
    stageId: string;
    evaluatorId: string;
    evaluatorRole: string;
    status: "pending" | "in_progress" | "completed" | "skipped";
    startedAt?: string;
    completedAt?: string;
    overallScore?: number;
    recommendation?: "advance" | "hold" | "reject";
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
      recommendation: "advance" | "hold" | "reject";
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
    type: "resume" | "cover_letter" | "portfolio" | "assignment" | "other";
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