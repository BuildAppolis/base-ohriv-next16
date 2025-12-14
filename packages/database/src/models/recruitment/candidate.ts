/**
 * Candidate model for recruitment domain
 */

import {
  TenantScopedDocument,
  AuditableDocument,
  ActivityTracking,
  SoftDelete
} from '../core/base';
import { AttachmentType, CommunicationType } from '../enums/system';
import { Attachment } from '../core/common';

/**
 * Candidate Document - Represents a job candidate
 */
export interface CandidateDocument extends TenantScopedDocument, AuditableDocument, ActivityTracking, SoftDelete {
  collection: "candidates";

  // Core candidate information
  candidateId: string;
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
  attachments: Array<Attachment & {
    type: AttachmentType;
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

  // Communication history
  communications: Array<{
    id: string;
    type: CommunicationType;
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