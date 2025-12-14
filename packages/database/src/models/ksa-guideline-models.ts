// RavenDB Document Models for KSA (Knowledge, Skills, Abilities) Guidelines
// These models define the structure of KSA evaluation guidelines that match the frontend examples

import { RavenDocument } from "./tenant-models";

/**
 * Weighting Range Configuration
 * Defines min/max ranges for attribute weighting
 */
export interface WeightingRange {
  min: number;
  max: number;
}

/**
 * Weighting Preset Configuration
 * Defines weighting presets for different job levels/roles
 */
export interface WeightingPreset {
  center: number;
  leftPoints: number;
  rightPoints: number;
  rationale?: string;
}

/**
 * Question Evaluation Configuration
 */
export interface QuestionEvaluation {
  questionText: string;
  followUpProbes?: string[];
  evaluationCriteria?: string;
  expectedAnswers?: string;
  redFlagIndicators?: string[];
  difficulty?: "basic" | "intermediate" | "advanced" | "expert";
}

/**
 * Sample Indicators for Values Questions
 */
export interface SampleIndicators {
  strongResponse: string;
  weakResponse: string;
}

/**
 * Values Question Configuration
 */
export interface ValuesQuestion {
  id: number;
  questionText: string;
  followUpProbes?: string[];
  sampleIndicators?: SampleIndicators;
}

/**
 * KSA Attribute Definition
 * Defines a KSA attribute with its evaluation criteria
 */
export interface KSAAttribute {
  definition: string;
  evaluationScale: Record<string, string>;
  weighting: number | WeightingRange;
  redFlags?: string[];
}

/**
 * KSA Category Configuration
 * Represents a KSA category (Knowledge, Skills, Abilities)
 */
export interface KSACategory {
  attribute: KSAAttribute;
  questions: Array<QuestionEvaluation & { id: number }>;
}

/**
 * Values Category Configuration
 * Represents a company value with its questions
 */
export interface ValuesCategory {
  questions: ValuesQuestion[];
}

/**
 * KSA Guideline Document - Complete structure matching frontend examples
 */
export interface KSAGuidelineDocument extends RavenDocument {
  collection: "ksa-guidelines";

  // Core guideline information
  guidelineId: string;
  tenantId: string;
  name: string;
  description?: string;

  // Job categorization
  jobType: "technical" | "non-technical";

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

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number;
  isActive: boolean;

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
    levels: Array<
      | "intern"
      | "entry"
      | "junior"
      | "mid"
      | "senior"
      | "lead"
      | "manager"
      | "director"
      | "vp"
      | "c_level"
    >;
    industries?: string[];
    companySizes?: Array<
      "startup" | "small" | "medium" | "large" | "enterprise"
    >;
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
export interface KSAGuidelineTemplateDocument extends RavenDocument {
  collection: "ksa-guideline-templates";

  templateId: string;
  tenantId: string;
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

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number;
  isActive: boolean;
}

/**
 * Company Values Document - Company-specific values configuration
 */
export interface CompanyValuesDocument extends RavenDocument {
  collection: "company-values";

  companyId: string;
  tenantId: string;

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

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number;
  isActive: boolean;

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
export interface KSAEvaluationMappingDocument extends RavenDocument {
  collection: "ksa-evaluation-mappings";

  jobId: string;
  tenantId: string;
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

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;

  // Usage tracking
  usage: {
    evaluationsCount: number;
    averageScore: number;
    passRate: number;
    lastUpdated: string;
  };
}
