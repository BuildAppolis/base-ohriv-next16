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
export type KSAJobFit = z.infer<typeof ksaJobFitSchema>;
export type CompanyValueCategory = z.infer<typeof companyValueCategorySchema>;
export type CompanyValuesFramework = z.infer<typeof coreValuesCompanyFitSchema>;
export type EvaluationGuideline = z.infer<typeof evaluationGuidelineSchema>;
export type WeightingBand = z.infer<typeof weightingBandSchema>;

export const jobTypeWeightingPresets: Record<
  JobType,
  Record<JobLevel, WeightingBand>
> = {
  technical: {
    intern: {
      Knowledge: 25,
      Skills: 50,
      Ability: 25,
      rationale:
        "Emphasize hands-on coding skills and ability to apply concepts; basic knowledge is useful; Ability supports learning agility.",
    },
    entry: {
      Knowledge: 28,
      Skills: 55,
      Ability: 17,
      rationale:
        "Strong focus on applying skills and growing a knowledge base; smaller but growing emphasis on problem-solving approach.",
    },
    junior: {
      Knowledge: 32,
      Skills: 50,
      Ability: 18,
      rationale:
        "More emphasis on solid knowledge and execution; Ability remains important for learning patterns and collaboration.",
    },
    mid: {
      Knowledge: 28,
      Skills: 55,
      Ability: 17,
      rationale:
        "Autonomous execution and design input grow; Skills remain key, with Knowledge supporting complexity handling.",
    },
    senior: {
      Knowledge: 22,
      Skills: 50,
      Ability: 28,
      rationale:
        "Leadership in technical decisions begins; Ability (leadership, mentoring) rises.",
    },
    principal: {
      Knowledge: 20,
      Skills: 40,
      Ability: 40,
      rationale:
        "Technical influence and systems thinking dominate; Knowledge/Skills still important, but Ability-led impact grows.",
    },
    teamLead: {
      Knowledge: 18,
      Skills: 38,
      Ability: 44,
      rationale:
        "People leadership and cross-team coordination strengthen; Ability becomes more central.",
    },
    manager: {
      Knowledge: 15,
      Skills: 30,
      Ability: 55,
      rationale:
        "Management across projects/teams; decision-making and organizational influence rise; Ability leads.",
    },
    director: {
      Knowledge: 12,
      Skills: 28,
      Ability: 60,
      rationale:
        "Strategic leadership and governance; Ability (vision, change leadership) dominates; Knowledge/Skills still useful.",
    },
    vp: {
      Knowledge: 10,
      Skills: 20,
      Ability: 70,
      rationale:
        "Executives drive strategy and outcomes; broad Abilities and influence are critical; Knowledge/Skills are supportive.",
    },
    cLevel: {
      Knowledge: 5,
      Skills: 15,
      Ability: 80,
      rationale:
        "Top-level leadership and transformation; Abilities (strategic foresight, crisis leadership) drive success; Knowledge/Skills become less differentiating.",
    },
  },
  "non-technical": {
    intern: {
      Knowledge: 25,
      Skills: 50,
      Ability: 25,
      rationale:
        "Early emphasis on selling skills and potential; product/market knowledge grows; Ability supports communication.",
    },
    entry: {
      Knowledge: 25,
      Skills: 55,
      Ability: 20,
      rationale:
        "Strong focus on sales process and relationship-building; knowledge grows alongside execution.",
    },
    junior: {
      Knowledge: 25,
      Skills: 55,
      Ability: 20,
      rationale:
        "Consistent sales execution; knowledge deepens; Ability remains important but not dominant.",
    },
    mid: {
      Knowledge: 25,
      Skills: 50,
      Ability: 25,
      rationale:
        "Solid product/market knowledge; process discipline; Ability and leadership capabilities start to matter more.",
    },
    senior: {
      Knowledge: 20,
      Skills: 45,
      Ability: 35,
      rationale:
        "Greater stakeholder management and strategic selling; Ability (influence, negotiation) rises.",
    },
    principal: {
      Knowledge: 20,
      Skills: 35,
      Ability: 45,
      rationale:
        "Thought leadership in sales strategy; Ability becomes the primary differentiator.",
    },
    teamLead: {
      Knowledge: 20,
      Skills: 30,
      Ability: 50,
      rationale:
        "People leadership and coaching; Ability focuses on developing the team and coaching.",
    },
    manager: {
      Knowledge: 15,
      Skills: 25,
      Ability: 60,
      rationale:
        "Management across accounts/teams; Ability (leadership, stakeholder influence) leads.",
    },
    director: {
      Knowledge: 15,
      Skills: 20,
      Ability: 65,
      rationale:
        "Strategic direction and governance; Ability dominates for driving organizational outcomes.",
    },
    vp: {
      Knowledge: 15,
      Skills: 20,
      Ability: 65,
      rationale:
        "Organization-wide impact; Abilities (vision, political acumen, executive presence) are critical; Knowledge/Skills supportive.",
    },
    cLevel: {
      Knowledge: 10,
      Skills: 15,
      Ability: 75,
      rationale:
        "Top-level transformation and strategy; Abilities (extensive influence, market-shaping leadership) are key.",
    },
  },
};
