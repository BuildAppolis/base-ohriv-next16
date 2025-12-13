import { z } from "zod";
import { evaluationGuidelineSchema } from "./evaluation-guideline";
import { stagePlanSchema } from "./evaluation";
import { JobLevel, WorkEnvironment } from "./enums";

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
  pipeline: z.array(stagePlanSchema).optional(), // stage/evaluator/question plan for this job
});

export type Job = z.infer<typeof jobSchema>;
