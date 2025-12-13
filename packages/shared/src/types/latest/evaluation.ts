import z from "zod";
import { JobLevel } from "./enums";

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
  status: z.enum(["pending", "offer", "hired", "rejected", "withdrawn"]).default("pending"),
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
export type EvaluationRecommendation = (typeof evaluationRecommendations)[number];
export type QuestionRef = z.infer<typeof questionRefSchema>;
export type StagePlan = z.infer<typeof stagePlanSchema>;
export type ScoreBand = z.infer<typeof scoreBandSchema>;
export type QuestionResponse = z.infer<typeof questionResponseSchema>;
export type StageEvaluation = z.infer<typeof stageEvaluationSchema>;
export type ApplicationDecision = z.infer<typeof applicationDecisionSchema>;
export type CandidateApplication = z.infer<typeof candidateApplicationSchema>;
