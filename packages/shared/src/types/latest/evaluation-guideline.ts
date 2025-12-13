import { z } from "zod";
import { JobLevel, jobLevels } from "./enums";
import { stagePlanSchema } from "./evaluation";

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
export const MIN_TOTAL_RANGE = 2; // Minimum total leniency points
export const MAX_TOTAL_RANGE = 20; // Maximum total leniency points

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

      // Validate total range constraints
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
