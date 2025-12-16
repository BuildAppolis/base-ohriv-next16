/**
 * Company model for recruitment domain
 */

import {
  CompanyScopedDocument,
  AuditableDocument,
  SoftDelete,
  StackAuthIntegratedDocument,
  StripeIntegratedDocument,
  MultiTenantBillingDocument
} from '../core/base';
import {
  CompanySize,
  CompanyStage,
  BusinessModel,
  RemotePolicy,
  WorkCulture
} from '../enums/job';
import { Address, ContactInfo } from '../core/common';

/**
 * Company Document - Represents a company/organization within a tenant
 */
export interface CompanyDocument extends
  CompanyScopedDocument,
  AuditableDocument,
  SoftDelete,
  StackAuthIntegratedDocument,
  StripeIntegratedDocument,
  MultiTenantBillingDocument {
  collection: "companies";

  // Core company information
  companyId: string;
  name: string;
  website?: string;

  // Business information
  industry: string;
  subIndustry?: string;
  size: CompanySize;
  stage: CompanyStage;
  businessModel: BusinessModel;

  // Location information
  headquarters: Address & {
    phone?: string;
  };
  remotePolicy: RemotePolicy;
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
    workEnvironment: WorkCulture;
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

  // Configuration
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