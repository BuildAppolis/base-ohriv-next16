/**
 * Compiled Types - Complete type structure in one file
 * Generated: December 13, 2025
 *
 * This file contains all type definitions from the latest types directory.
 * Excludes: to-refactor, examples, and presets directories
 */

import { z } from "zod";

// ============================================================================
// ENUMS
// ============================================================================

export enum Industries {
  Technology = "technology",
  Healthcare = "healthcare",
  Finance = "finance",
  Ecommerce = "ecommerce",
  Education = "education",
  Manufacturing = "manufacturing",
  Retail = "retail",
  RealEstate = "real_estate",
  Media = "media",
  Travel = "travel",
  Food = "food",
  Energy = "energy",
  Logistics = "logistics",
  Telecommunications = "telecommunications",
  Automotive = "automotive",
  Agriculture = "agriculture",
  Construction = "construction",
  Government = "government",
  Nonprofit = "nonprofit",
  Other = "other",
}

export enum CompanySize {
  Small = "small",
  Medium = "medium",
  Large = "large",
  Enterprise = "enterprise",
}

export enum CompanyStage {
  Startup = "startup",
  Growth = "growth",
  Established = "established",
  Enterprise = "enterprise",
}

export enum BusinessModel {
  B2B = "b2b",
  B2C = "b2c",
  C2C = "c2c",
  SaaS = "saas",
  Marketplace = "marketplace",
  Subscription = "subscription",
  Freemium = "freemium",
  Other = "other",
}

export enum JobLevel {
  Intern = "intern",
  Entry = "entry",
  Junior = "junior",
  Mid = "mid",
  Senior = "senior",
  Principal = "principal",
  TeamLead = "teamLead",
  Manager = "manager",
  Director = "director",
  VP = "vp",
  CLevel = "cLevel",
}

export const jobLevels: JobLevel[] = [
  JobLevel.Intern,
  JobLevel.Entry,
  JobLevel.Junior,
  JobLevel.Mid,
  JobLevel.Senior,
  JobLevel.Principal,
  JobLevel.TeamLead,
  JobLevel.Manager,
  JobLevel.Director,
  JobLevel.VP,
  JobLevel.CLevel,
];

export enum WorkEnvironment {
  Remote = "remote",
  Hybrid = "hybrid",
  Office = "office",
  Flexible = "flexible",
}

// ============================================================================
// USER & TENANT TYPES
// ============================================================================

export const tenantPlans = ["free", "standard", "enterprise"] as const;
export const tenantStatuses = ["active", "suspended"] as const;
export const partnerStatuses = ["active", "suspended"] as const;
export const userStatuses = ["active", "invited", "disabled"] as const;
export const tenantMembershipRoles = [
  "owner",
  "admin",
  "recruiter",
  "interviewer",
  "viewer",
  "partner_manager",
] as const;

export const tenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  plan: z.enum(tenantPlans),
  status: z.enum(tenantStatuses),
  ownerUserId: z.string(),
  companyLimit: z.number().int().positive().default(1),
  defaultCompanyId: z.string().optional(),
  settings: z
    .object({
      branding: z.object({ logoUrl: z.string().url().optional() }).optional(),
      sso: z.object({ enabled: z.boolean() }).optional(),
    })
    .optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export const partnerSchema = z.object({
  id: z.string(),
  name: z.string(),
  tenantId: z.string(),
  customerTenantIds: z.array(z.string()).default([]),
  status: z.enum(partnerStatuses),
  revSharePercent: z.number().min(0).max(100).optional(),
  branding: z.object({ logoUrl: z.string().url().optional() }).optional(),
});

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  primaryTenantId: z.string().optional(),
  partnerId: z.string().optional(),
  status: z.enum(userStatuses).default("invited"),
});

export const tenantMembershipSchema = z.object({
  userId: z.string(),
  tenantId: z.string(),
  role: z.enum(tenantMembershipRoles),
  scopes: z.array(z.string()).optional(),
  invitedBy: z.string().optional(),
  invitedAt: z.string().optional(),
});

export const partnerInviteSchema = z.object({
  id: z.string(),
  token: z.string(),
  tenantId: z.string(),
  invitedEmail: z.string().email(),
  role: z.literal("partner_manager"),
  createdBy: z.string(),
  expiresAt: z.string().optional(),
  acceptedAt: z.string().optional(),
  acceptedByUserId: z.string().optional(),
  partnerId: z.string().optional(),
});

export type TenantPlan = (typeof tenantPlans)[number];
export type TenantStatus = (typeof tenantStatuses)[number];
export type PartnerStatus = (typeof partnerStatuses)[number];
export type UserStatus = (typeof userStatuses)[number];
export type TenantMembershipRole = (typeof tenantMembershipRoles)[number];
export type Tenant = z.infer<typeof tenantSchema>;
export type Partner = z.infer<typeof partnerSchema>;
export type User = z.infer<typeof userSchema>;
export type TenantMembership = z.infer<typeof tenantMembershipSchema>;
export type PartnerInvite = z.infer<typeof partnerInviteSchema>;

// ============================================================================
// EVALUATION TYPES
// ============================================================================

export const evaluatorRoles = [
  "sourcer",
  "recruiter",
  "hiring_manager",
  "technical_interviewer",
  "values_interviewer",
  "peer",
  "partner",
] as const;

export const evaluationSections = ["jobFit", "valuesFit", "custom"] as const;

export const stageStatuses = [
  "not_started",
  "in_progress",
  "completed",
  "skipped",
] as const;

export const applicationStatuses = [
  "applied",
  "in_process",
  "offer",
  "hired",
  "rejected",
  "withdrawn",
] as const;

export const evaluationRecommendations = ["advance", "hold", "reject"] as const;

export const questionRefSchema = z.object({
  section: z.enum(evaluationSections),
  category: z.string(),
  questionId: z.union([z.number(), z.string()]),
  weight: z.number().min(0).max(100).optional(),
  tags: z.array(z.string()).optional(),
});

export const stagePlanSchema = z.object({
  stageId: z.string(),
  evaluatorRole: z.enum(evaluatorRoles).optional(),
  allowedEvaluatorIds: z.array(z.string()).optional(),
  weightingPresetLevel: z.nativeEnum(JobLevel).optional(),
  questionRefs: z.array(questionRefSchema),
  passScore: z.number().min(0).max(100).optional(),
  autoAdvanceOnPass: z.boolean().optional(),
  expectedDurationMinutes: z.number().optional(),
  notes: z.string().optional(),
});

export const scoreBandSchema = z.object({
  dimension: z.string(),
  score: z.number().min(0).max(10),
  weight: z.number().min(0).max(100).optional(),
  confidence: z.number().min(0).max(1).optional(),
  notes: z.string().optional(),
});

export const questionResponseSchema = z.object({
  questionId: z.union([z.number(), z.string()]),
  section: z.enum(evaluationSections),
  category: z.string(),
  answer: z.string().optional(),
  score: z.number().min(0).max(10).optional(),
  confidence: z.number().min(0).max(1).optional(),
  notes: z.string().optional(),
});

export const stageEvaluationSchema = z.object({
  stageId: z.string(),
  evaluatorId: z.string().optional(),
  evaluatorRole: z.enum(evaluatorRoles).optional(),
  status: z.enum(stageStatuses).default("not_started"),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  questionResponses: z.array(questionResponseSchema).default([]),
  rubricScores: z.array(scoreBandSchema).optional(),
  summary: z
    .object({
      overallScore: z.number().min(0).max(100).optional(),
      recommendation: z.enum(evaluationRecommendations).optional(),
      notes: z.string().optional(),
    })
    .optional(),
});

export const applicationDecisionSchema = z.object({
  status: z
    .enum(["pending", "offer", "hired", "rejected", "withdrawn"])
    .default("pending"),
  decidedBy: z.string().optional(),
  decidedAt: z.string().optional(),
  notes: z.string().optional(),
});

export const candidateApplicationSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  companyId: z.string(),
  jobId: z.string(),
  guidelineId: z.string().optional(),
  pipelineId: z.string().optional(),
  status: z.enum(applicationStatuses).default("applied"),
  source: z.string().optional(),
  currentStageId: z.string().optional(),
  stageEvaluations: z.array(stageEvaluationSchema).default([]),
  aggregatedScores: z.array(scoreBandSchema).optional(),
  decision: applicationDecisionSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export type EvaluatorRole = (typeof evaluatorRoles)[number];
export type EvaluationSection = (typeof evaluationSections)[number];
export type StageStatus = (typeof stageStatuses)[number];
export type ApplicationStatus = (typeof applicationStatuses)[number];
export type EvaluationRecommendation =
  (typeof evaluationRecommendations)[number];
export type QuestionRef = z.infer<typeof questionRefSchema>;
export type StagePlan = z.infer<typeof stagePlanSchema>;
export type ScoreBand = z.infer<typeof scoreBandSchema>;
export type QuestionResponse = z.infer<typeof questionResponseSchema>;
export type StageEvaluation = z.infer<typeof stageEvaluationSchema>;
export type ApplicationDecision = z.infer<typeof applicationDecisionSchema>;
export type CandidateApplication = z.infer<typeof candidateApplicationSchema>;

// ============================================================================
// EVALUATION GUIDELINE TYPES
// ============================================================================

const jobTypes = ["technical", "non-technical"] as const;

export type JobType = (typeof jobTypes)[number];

const questionDifficulties = [
  "basic",
  "intermediate",
  "advanced",
  "expert",
] as const;

const WEIGHT_MIN = 1;
const WEIGHT_MAX = 100;
const MAX_SIDE_POINTS = 10;
export const MIN_TOTAL_RANGE = 2;
export const MAX_TOTAL_RANGE = 20;

export function computeWeightRange(
  delta: number,
  leftPoints: number,
  rightPoints: number
) {
  return {
    min: Math.max(WEIGHT_MIN, delta - leftPoints),
    max: Math.min(WEIGHT_MAX, delta + rightPoints),
  };
}

const weightRangeSchema = z.object({
  delta: z.number().min(WEIGHT_MIN).max(WEIGHT_MAX),
  leftPoints: z.number().min(0).max(MAX_SIDE_POINTS),
  rightPoints: z.number().min(0).max(MAX_SIDE_POINTS),
});

const weightingBandSchema = z
  .object({
    Knowledge: weightRangeSchema,
    Skills: weightRangeSchema,
    Ability: weightRangeSchema,
    rationale: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    const total =
      value.Knowledge.delta + value.Skills.delta + value.Ability.delta;
    if (Math.round(total) !== 100) {
      ctx.addIssue({
        code: "custom",
        message: "Knowledge + Skills + Ability centers must sum to 100",
      });
    }

    (["Knowledge", "Skills", "Ability"] as const).forEach((key) => {
      const { delta: center, leftPoints, rightPoints } = value[key];
      if (leftPoints > MAX_SIDE_POINTS || rightPoints > MAX_SIDE_POINTS) {
        ctx.addIssue({
          code: "custom",
          message: `${key} side leniency cannot exceed ${MAX_SIDE_POINTS} points`,
          path: [key],
        });
      }
      if (
        center - leftPoints < WEIGHT_MIN ||
        center + rightPoints > WEIGHT_MAX
      ) {
        ctx.addIssue({
          code: "custom",
          message: `${key} range must stay within ${WEIGHT_MIN}-${WEIGHT_MAX} (center ± side points)`,
          path: [key],
        });
      }

      const totalLeniency = leftPoints + rightPoints;
      if (totalLeniency < MIN_TOTAL_RANGE) {
        ctx.addIssue({
          code: "custom",
          message: `${key} total leniency must be at least ${MIN_TOTAL_RANGE} points (current: ${totalLeniency})`,
          path: [key],
        });
      }
      if (totalLeniency > MAX_TOTAL_RANGE) {
        ctx.addIssue({
          code: "custom",
          message: `${key} total leniency cannot exceed ${MAX_TOTAL_RANGE} points (current: ${totalLeniency})`,
          path: [key],
        });
      }
    });
  });

const baseQuestionSchema = z.object({
  id: z.number(),
  questionText: z.string().optional(),
  followUpProbes: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

const jobFitQuestionSchema = baseQuestionSchema.extend({
  difficulty: z.enum(questionDifficulties),
  evaluationCriteria: z.string().optional(),
  expectedAnswers: z.string().optional(),
  redFlagIndicators: z.array(z.string()).optional(),
});

const companyValueQuestionSchema = baseQuestionSchema.extend({
  sampleIndicators: z.object({
    strongResponse: z.string(),
    weakResponse: z.string(),
  }),
});

const evaluationScaleSchema = z.record(z.string(), z.string());

const ksaAttributeSchema = z.object({
  definition: z.string(),
  evaluationScale: evaluationScaleSchema,
  weighting: z
    .object({
      min: z.number(),
      max: z.number(),
    })
    .superRefine((value, ctx) => {
      if (value.min > value.max) {
        ctx.addIssue({
          code: "custom",
          message: "weighting.min must be less than or equal to weighting.max",
        });
      }
      if (value.min < 0 || value.max < 0) {
        ctx.addIssue({
          code: "custom",
          message: "weighting values must be non-negative",
        });
      }
      if (value.min > 100 || value.max > 100) {
        ctx.addIssue({
          code: "custom",
          message: "weighting values must be <= 100",
        });
      }
    }),
  redFlags: z.array(z.string()),
});

const jobFitCategorySchema = z.object({
  attribute: ksaAttributeSchema,
  questions: z.array(jobFitQuestionSchema),
});

const jobFitSchema = z.object({
  Knowledge: jobFitCategorySchema,
  Skills: jobFitCategorySchema,
  Ability: jobFitCategorySchema,
});

const companyValueCategorySchema = z.object({
  questions: z.array(companyValueQuestionSchema),
});

const companyFitSchema = z
  .record(z.string(), companyValueCategorySchema)
  .superRefine((value, ctx) => {
    const count = Object.keys(value).length;
    if (count < 2 || count > 6) {
      ctx.addIssue({
        code: "custom",
        message: "CompanyFit must include between 2 and 6 company values",
      });
    }
  });

export const evaluationGuidelineSchema = z.object({
  jobType: z.enum(jobTypes),
  jobFit: jobFitSchema,
  valuesFit: companyFitSchema,
  weightingPresets: z
    .record(z.string(), weightingBandSchema)
    .optional()
    .superRefine((value, ctx) => {
      if (!value) return;
      const levelSet = new Set<JobLevel>(jobLevels);
      Object.entries(value).forEach(([level, band]) => {
        if (!levelSet.has(level as JobLevel)) {
          ctx.addIssue({
            code: "custom",
            message: `Unknown job level "${level}" in weightingPresets`,
            path: ["weightingPresets", level],
          });
        }
        const total =
          band.Knowledge.delta + band.Skills.delta + band.Ability.delta;
        if (Math.round(total) !== 100) {
          ctx.addIssue({
            code: "custom",
            message: "Knowledge + Skills + Ability weightings must sum to 100",
            path: ["weightingPresets", level],
          });
        }
      });
    })
    .optional(),
  stagePlan: z.array(stagePlanSchema).optional(),
});

export type QuestionDifficulty = (typeof questionDifficulties)[number];
export type BaseQuestion = z.infer<typeof baseQuestionSchema>;
export type JobFitQuestion = z.infer<typeof jobFitQuestionSchema>;
export type CompanyValueQuestion = z.infer<typeof companyValueQuestionSchema>;
export type KSAAttribute = z.infer<typeof ksaAttributeSchema>;
export type KSAJobFitCategory = z.infer<typeof jobFitCategorySchema>;
export type KSAJobFit = z.infer<typeof jobFitSchema>;
export type CompanyValueCategory = z.infer<typeof companyValueCategorySchema>;
export type CompanyValuesFramework = z.infer<typeof companyFitSchema>;
export type EvaluationGuideline = z.infer<typeof evaluationGuidelineSchema>;
export type WeightingBand = z.infer<typeof weightingBandSchema>;
export type WeightRange = z.infer<typeof weightRangeSchema>;

// ============================================================================
// STAGE TYPES
// ============================================================================

export const stageSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  color: z.string(),
  icon: z.string(),
  order: z.number(),
  isSystem: z.boolean().optional(),
  canReorder: z.boolean().optional(),
  questionsEnabled: z.boolean().optional(),
});

export type Stage = z.infer<typeof stageSchema>;

// ============================================================================
// JOB TYPES
// ============================================================================

export const jobSchema = z.object({
  id: z.string().optional(),
  tenantId: z.string().optional(),
  companyId: z.string().optional(),
  partnerId: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  level: z.nativeEnum(JobLevel),
  workEnvironment: z.nativeEnum(WorkEnvironment).optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  type: z.string().optional(),
  guidelineId: z.string().optional(),
  evaluationGuideline: evaluationGuidelineSchema.optional(),
  pipeline: z.array(stagePlanSchema).optional(),
});

export type Job = z.infer<typeof jobSchema>;

// ============================================================================
// COMPANY TYPES
// ============================================================================

export const companySchema = z.object({
  id: z.string(),
  tenantId: z.string().optional(),
  partnerId: z.string().optional(),
  ownerUserId: z.string().optional(),
  isDefault: z.boolean().default(false),
  name: z.string().optional(),
  website: z.string().url().optional(),
  industry: z.nativeEnum(Industries),
  subIndustry: z.string().optional(),
  size: z.nativeEnum(CompanySize),
  stage: z.nativeEnum(CompanyStage),
  businessModel: z.nativeEnum(BusinessModel),
  stages: z.array(stageSchema).optional(),
  jobs: z.array(jobSchema).optional(),
});

export type Company = z.infer<typeof companySchema>;

// ============================================================================
// CANDIDATE TYPES
// ============================================================================

const candidateSourceSchema = z.object({
  channel: z.string(),
  details: z.string().optional(),
  referrerUserId: z.string().optional(),
});

const candidateAttachmentSchema = z.object({
  type: z
    .enum(["resume", "portfolio", "cover_letter", "other"])
    .default("other"),
  url: z.string(),
  title: z.string().optional(),
  uploadedAt: z.string().optional(),
});

export const candidateSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  companyId: z.string().optional(),
  partnerId: z.string().optional(),
  nameFirst: z.string().optional(),
  nameLast: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  portfolioUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  source: candidateSourceSchema.optional(),
  attachments: z.array(candidateAttachmentSchema).default([]),
  applications: z.array(candidateApplicationSchema).default([]),
  primaryApplicationId: z.string().optional(),
  status: z.enum(applicationStatuses).default("applied"),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export type Candidate = z.infer<typeof candidateSchema>;
export type CandidateSource = z.infer<typeof candidateSourceSchema>;
export type CandidateAttachment = z.infer<typeof candidateAttachmentSchema>;

// ============================================================================
// PERMISSIONS
// ============================================================================

export const evaluatorRolePermissions: Record<
  EvaluatorRole,
  TenantMembershipRole[]
> = {
  sourcer: ["owner", "admin", "recruiter"],
  recruiter: ["owner", "admin", "recruiter"],
  hiring_manager: ["owner", "admin", "interviewer"],
  technical_interviewer: ["owner", "admin", "interviewer"],
  values_interviewer: ["owner", "admin", "recruiter", "interviewer"],
  peer: ["owner", "admin", "interviewer"],
  partner: ["owner", "admin", "partner_manager"],
};

export function roleCanPerformEvaluatorRole(
  membershipRole: TenantMembershipRole,
  evaluatorRole: EvaluatorRole
) {
  if (membershipRole === "owner" || membershipRole === "admin") return true;
  return (evaluatorRolePermissions[evaluatorRole] || []).includes(
    membershipRole
  );
}

// ============================================================================
// HELPERS
// ============================================================================

export const prettyPrintJobLevel = ({ level }: { level: JobLevel }) => {
  switch (level) {
    case "intern":
      return "Internship";
    case "entry":
      return "Entry Level";
    case "junior":
      return "Junior Level";
    case "mid":
      return "Mid Level";
    case "senior":
      return "Senior Level";
    case "principal":
      return "Principal Level";
    case "teamLead":
      return "Team Lead";
    case "manager":
      return "Manager";
    case "director":
      return "Director";
    case "vp":
      return "Vice President";
    case "cLevel":
      return "C-Level Executive";
    default:
      return level;
  }
};
