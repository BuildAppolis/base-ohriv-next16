/**
 * Evaluation Pipeline Configuration Models
 * Stores stage definitions and weighting presets
 */

import {
  TenantScopedDocument,
  AuditableDocument,
  VersionedDocument,
  SoftDelete
} from '../core/base';

/**
 * Stage Definition Document
 * Represents a single stage in the evaluation pipeline
 */
export interface StageDefinitionDocument extends
  TenantScopedDocument,
  AuditableDocument,
  VersionedDocument,
  SoftDelete {
  collection: 'stage-definitions';

  // Core stage information
  id: string;
  name: string;
  description: string;

  // Visual configuration
  color: string; // Hex color code
  icon: string; // Emoji or icon identifier

  // Ordering and behavior
  order: number;
  isSystem: boolean; // System-defined or custom
  canReorder: boolean;

  // Configuration
  questionsEnabled: boolean;
  requiresApproval: boolean;
  isOptional: boolean;

  // Stage type and behavior
  stageType: 'screening' | 'interview' | 'assessment' | 'review' | 'decision';

  // Default settings
  defaultSettings: {
    duration?: number; // Minutes
    autoAdvance: boolean;
    notificationSettings: {
      notifyCandidate: boolean;
      notifyHiringManager: boolean;
      notifyRecruiter: boolean;
    };
  };

  // Integration with KSA guidelines
  ksaIntegration: {
    enabled: boolean;
    guidelineRequired: boolean;
    weightings?: {
      knowledge: number;
      skills: number;
      ability: number;
      values?: number;
    };
  };

  // Usage statistics
  usage: {
    companiesCount: number;
    jobsCount: number;
    evaluationsCount: number;
    lastUsed?: string;
  };

  // Tags for categorization
  tags: string[];

  // Active status
  isActive: boolean;
}

/**
 * Weighting Preset Document
 * Stores weighting configurations for different job types and levels
 */
export interface WeightingPresetDocument extends
  TenantScopedDocument,
  AuditableDocument,
  VersionedDocument,
  SoftDelete {
  collection: 'weighting-presets';

  // Core preset information
  id: string;
  name: string;
  description?: string;

  // Job categorization
  jobType: 'technical' | 'non-technical';
  jobLevel: 'intern' | 'entry' | 'junior' | 'mid' | 'senior' | 'principal' | 'teamLead' | 'manager' | 'director' | 'vp' | 'cLevel';

  // Weighting configuration (values must sum to 100)
  weightings: {
    knowledge: {
      delta: number; // Percentage weighting
      leftPoints: number; // Left anchor points on scale
      rightPoints: number; // Right anchor points on scale
    };
    skills: {
      delta: number;
      leftPoints: number;
      rightPoints: number;
    };
    ability: {
      delta: number;
      leftPoints: number;
      rightPoints: number;
    };
  };

  // Rationale for this weighting
  rationale: string;

  // Target configuration
  target: {
    industries?: string[];
    companySizes?: Array<'startup' | 'small' | 'medium' | 'large' | 'enterprise'>;
    departments?: string[];
  };

  // Usage statistics
  usage: {
    guidelinesCount: number;
    jobsCount: number;
    evaluationsCount: number;
    averageScore?: number;
    lastUsed?: string;
  };

  // Performance metrics
  performance: {
    predictiveValidity?: number; // Correlation with job performance
    candidateSatisfaction?: number;
    evaluatorFeedback?: {
      averageRating: number;
      comments: string[];
    };
    lastCalculated?: string;
  };

  // Preset metadata
  isDefault: boolean; // Default preset for job type/level
  isRecommended: boolean; // Recommended for new users
  tags: string[];
  isActive: boolean;
}

/**
 * Evaluation Pipeline Template Document
 * Defines a complete pipeline with stages and their configuration
 */
export interface EvaluationPipelineTemplateDocument extends
  TenantScopedDocument,
  AuditableDocument,
  VersionedDocument,
  SoftDelete {
  collection: 'evaluation-pipeline-templates';

  // Template information
  id: string;
  name: string;
  description?: string;
  category: string; // e.g., "Engineering", "Sales", "Marketing", "Executive"

  // Pipeline configuration
  pipeline: {
    stages: Array<{
      stageId: string;
      name: string;
      order: number;
      isRequired: boolean;
      conditions?: Array<{
        type: 'score_threshold' | 'must_pass' | 'manual_approval';
        value: number | string;
        stageId?: string; // For dependencies
      }>;
      settings?: {
        duration?: number;
        autoAdvance?: boolean;
        requireConsensus?: boolean;
        minimumEvaluators?: number;
      };
    }>;

    // Global settings
    settings: {
      allowStageSkipping: boolean;
      requireAllStages: boolean;
      timeToComplete: number; // Days
      reminderSettings: {
        enabled: boolean;
        frequency: number; // Hours
        recipients: string[]; // Role types
      };
    };
  };

  // KSA configuration
  ksaConfiguration: {
    defaultGuidelineId?: string;
    allowCustomGuidelines: boolean;
    weightings?: {
      jobType: string;
      jobLevel: string;
      presetId: string;
    }[];
  };

  // Target configuration
  target: {
    jobTypes: string[];
    jobLevels: string[];
    departments?: string[];
    industries?: string[];
  };

  // Usage and performance
  usage: {
    companiesCount: number;
    jobsCount: number;
    candidatesEvaluated: number;
    averageTimeToHire?: number; // Days
    qualityOfHire?: number; // 1-5 scale
    lastUsed?: string;
  };

  // Template metadata
  isPublic: boolean; // Available to other companies in tenant
  isDefault: boolean; // Default template for category
  author: string; // User who created it
  tags: string[];
  isActive: boolean;
}

/**
 * Company Pipeline Configuration Document
 * Company-specific pipeline configuration
 */
export interface CompanyPipelineConfigurationDocument extends
  TenantScopedDocument,
  AuditableDocument,
  VersionedDocument {
  collection: 'company-pipeline-configurations';

  // Company identification
  companyId: string;

  // Pipeline settings
  pipeline: {
    templateId?: string; // Base template used
    customStages?: Array<{
      id: string;
      name: string;
      description: string;
      stageType: string;
      order: number;
      isRequired: boolean;
    }>;

    // Stage overrides
    stageOverrides?: Array<{
      stageId: string;
      isEnabled: boolean;
      customSettings?: {
        duration?: number;
        autoAdvance?: boolean;
        requireApproval?: boolean;
        approvers?: string[];
      };
    }>;
  };

  // Weighting presets
  weightings: {
    presets: Array<{
      jobType: string;
      jobLevel: string;
      presetId?: string; // Use preset
      customWeightings?: {
        knowledge: number;
        skills: number;
        ability: number;
      };
    }>;
  };

  // Integration settings
  integrations: {
    ats: {
      enabled: boolean;
      stageMappings?: Record<string, string>; // Map pipeline stages to ATS stages
    };
    calendar: {
      enabled: boolean;
      defaultDuration: number; // Minutes
      bufferTime: number; // Minutes
    };
    video: {
      enabled: boolean;
      provider: string;
      settings?: Record<string, any>;
    };
  };

  // Configuration metadata
  version: number;
  isActive: boolean;
  lastUpdatedBy: string;
}