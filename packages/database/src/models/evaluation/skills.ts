/**
 * Skills assessment models
 */

import {
  TenantScopedDocument,
  AuditableDocument,
  SoftDelete
} from '../core/base';
import {
  SkillCategory,
  SkillProficiency
} from '../enums/evaluation';

/**
 * Skill Assessment Document - Skills taxonomy and assessment criteria
 */
export interface SkillAssessmentDocument extends TenantScopedDocument, AuditableDocument, SoftDelete {
  collection: "skill-assessments";

  // Skill information
  skillId: string;
  name: string;
  category: SkillCategory;
  subcategory?: string;

  // Skill definition
  definition: {
    description: string;
    proficiencyLevels: Array<{
      level: SkillProficiency;
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
      level: SkillProficiency;
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

  // Usage statistics
  stats: {
    assessmentCount: number;
    averageLevel: number;
    lastUsed?: string;
  };
}