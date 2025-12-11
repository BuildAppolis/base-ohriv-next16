import { z } from "zod";

const jobTypes = ["technical", "non-technical"] as const;

export type JobType = (typeof jobTypes)[number];

const jobLevels = [
  "intern",
  "entry",
  "junior",
  "mid",
  "senior",
  "principal",
  "teamLead",
  "manager",
  "director",
  "vp",
  "cLevel",
] as const;

export type JobLevel = (typeof jobLevels)[number];

const questionDifficulties = [
  "basic",
  "intermediate",
  "advanced",
  "expert",
] as const;

const weightingBandSchema = z
  .object({
    Knowledge: z.number(),
    Skills: z.number(),
    Ability: z.number(),
    rationale: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    const total = value.Knowledge + value.Skills + value.Ability;
    if (Math.round(total) !== 100) {
      ctx.addIssue({
        code: "custom",
        message: "Knowledge + Skills + Ability weightings must sum to 100",
      });
    }
    if (value.Knowledge < 0 || value.Skills < 0 || value.Ability < 0) {
      ctx.addIssue({
        code: "custom",
        message: "Weightings must be non-negative",
      });
    }
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
        const total = band.Knowledge + band.Skills + band.Ability;
        if (Math.round(total) !== 100) {
          ctx.addIssue({
            code: "custom",
            message: "Knowledge + Skills + Ability weightings must sum to 100",
            path: ["weightingPresets", level],
          });
        }
      });
    }),
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
