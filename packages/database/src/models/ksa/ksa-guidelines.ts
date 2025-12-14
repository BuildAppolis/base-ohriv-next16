/**
 * KSA Guideline models
 */

import {
  TenantScopedDocument,
  AuditableDocument,
  VersionedDocument
} from '../core/base';
import { JobType } from '../enums/job';
import { JobLevel } from '../enums/job';
import { CompanySize } from '../enums/job';
import {
  KSACategory,
  ValuesCategory,
  WeightingPreset,
  KSAAttribute
} from './ksa-types';

/**
 * KSA Guideline Document - Complete structure matching frontend examples
 */
export interface KSAGuidelineDocument extends TenantScopedDocument, AuditableDocument, VersionedDocument {
  collection: "ksa-guidelines";

  // Core guideline information
  guidelineId: string;
  name: string;
  description?: string;

  // Job categorization
  jobType: JobType;

  // KSA Job Fit Structure
  jobfit: {
    Knowledge?: KSACategory;
    Skills?: KSACategory;
    Ability?: KSACategory; // Note: Can be "Ability" or "Abilities" depending on format
  };

  // Values Fit Structure
  valuesFit: Record<string, ValuesCategory>;

  // Weighting Presets
  weightingPresets?: Record<string, Record<string, WeightingPreset>>;

  // Usage tracking
  usage: {
    companies: string[]; // Companies using this guideline
    jobsCount: number;
    evaluationsCount: number;
    lastUsed?: string;
  };

  // Target configuration
  target: {
    roles: string[];
    levels: JobLevel[];
    industries?: string[];
    companySizes?: CompanySize[];
  };

  // Quality metrics
  qualityMetrics: {
    completionRate?: number;
    averageScore?: number;
    averageTimeToEvaluate?: number; // Minutes
    interRaterReliability?: number;
    lastCalculated?: string;
  };
}

/**
 * KSA Guideline Template Document - Reusable templates
 */
export interface KSAGuidelineTemplateDocument extends TenantScopedDocument, AuditableDocument, VersionedDocument {
  collection: "ksa-guideline-templates";

  templateId: string;
  name: string;
  description?: string;
  category: string;

  // Template content (matches KSAGuideline structure without tenant-specific data)
  template: Omit<
    KSAGuidelineDocument,
    | "id"
    | "collection"
    | "guidelineId"
    | "tenantId"
    | "createdAt"
    | "updatedAt"
    | "createdBy"
    | "usage"
    | "qualityMetrics"
  >;

  // Template metadata
  isPublic: boolean; // Available to other companies in tenant
  isDefault: boolean; // Default template for certain job types
  tags: string[];

  // Usage tracking
  usage: {
    adoptionCount: number;
    companies: string[];
    feedback: Array<{
      userId: string;
      rating: number; // 1-5
      comment?: string;
      timestamp: string;
    }>;
  };
}

/**
 * Company Values Document - Company-specific values configuration
 */
export interface CompanyValuesDocument extends TenantScopedDocument, AuditableDocument, VersionedDocument {
  collection: "company-values";

  // Core values definition
  values: Array<{
    name: string;
    title?: string; // Display title (e.g., "Innovation & Creativity")
    description: string;
    behaviors: string[]; // Observable behaviors that demonstrate this value
    indicators: {
      positive: string[]; // Positive indicators
      negative: string[]; // Red flags
    };
    weight: number; // Relative importance in evaluation
  }>;

  // Values integration
  integration: {
    evaluationGuidelines: string[]; // Guidelines that use these values
    jobPosting: {
      includeInDescription: boolean;
      customText?: string;
    };
    interview: {
      dedicatedQuestions: boolean; // Separate values interview stage
      integratedQuestions: boolean; // Weave into technical questions
    };
  };

  // Usage statistics
  usage: {
    evaluationsCount: number;
    averageAlignmentScore?: number;
    lastCalculated?: string;
  };
}

/**
 * KSA Evaluation Mapping Document - Maps jobs to guidelines and customizations
 */
export interface KSAEvaluationMappingDocument extends TenantScopedDocument, AuditableDocument {
  collection: "ksa-evaluation-mappings";

  jobId: string;
  companyId: string;
  guidelineId: string;
  guidelineVersion?: number;

  // Customizations for this specific job
  customizations: {
    // Override weighting
    weightOverrides?: Record<string, number>;

    // Add custom questions
    additionalQuestions?: {
      category: "Knowledge" | "Skills" | "Ability";
      questions: Array<QuestionEvaluation & { id: number; isCustom: true }>;
    };

    // Remove/disable questions
    disabledQuestions?: Array<{
      category: string;
      questionId: number;
      reason?: string;
    }>;

    // Company-specific additions
    companySpecific?: {
      customValues: string[]; // Additional company values to evaluate
      customKSA: Partial<{
        Knowledge: Partial<KSACategory>;
        Skills: Partial<KSACategory>;
        Ability: Partial<KSACategory>;
      }>;
    };
  };

  // Evaluation configuration
  evaluation: {
    passingScore: number;
    requireAllSections: boolean;
    allowPartialCredit: boolean;
    randomizeQuestions: boolean;
    timeLimit?: number; // Minutes
  };

  // Usage tracking
  usage: {
    evaluationsCount: number;
    averageScore: number;
    passRate: number;
    lastUpdated: string;
  };
}

// Import the required types
import { QuestionEvaluation } from './ksa-types';