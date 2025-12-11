import { z } from "zod";

const jobTypes = ["technical", "non-technical"] as const;

export type JobType = (typeof jobTypes)[number];

const questionDifficulties = [
  "basic",
  "intermediate",
  "advanced",
  "expert",
] as const;

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

const ksaJobFitSchema = z.object({
  Knowledge: jobFitCategorySchema,
  Skills: jobFitCategorySchema,
  Ability: jobFitCategorySchema,
});

const companyValueCategorySchema = z.object({
  questions: z.array(companyValueQuestionSchema),
});

const coreValuesCompanyFitSchema = z
  .record(z.string(), companyValueCategorySchema)
  .superRefine((value, ctx) => {
    const count = Object.keys(value).length;
    if (count < 2 || count > 6) {
      ctx.addIssue({
        code: "custom",
        message:
          "CoreValues_CompanyFit must include between 2 and 6 company values",
      });
    }
  });

export const evaluationGuidelineSchema = z.object({
  jobType: z.enum(jobTypes),
  jobFit: ksaJobFitSchema,
  valuesFit: coreValuesCompanyFitSchema,
});

export type QuestionDifficulty = (typeof questionDifficulties)[number];
export type BaseQuestion = z.infer<typeof baseQuestionSchema>;
export type JobFitQuestion = z.infer<typeof jobFitQuestionSchema>;
export type CompanyValueQuestion = z.infer<typeof companyValueQuestionSchema>;
export type KSAAttribute = z.infer<typeof ksaAttributeSchema>;
export type KSAJobFitCategory = z.infer<typeof jobFitCategorySchema>;
export type KSAJobFit = z.infer<typeof ksaJobFitSchema>;
export type CompanyValueCategory = z.infer<typeof companyValueCategorySchema>;
export type CompanyValuesFramework = z.infer<typeof coreValuesCompanyFitSchema>;
export type EvaluationGuideline = z.infer<typeof evaluationGuidelineSchema>;
