/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * AI Question Generator
 * Creates high-quality interview questions with answer characteristics
 */

import { openai, AI_MODELS } from "../../../../lib/open_ai/client";
import {
  CompanyContext,
  RoleDetails,
  GeneratedAttribute,
  GeneratedQuestion,
  GenerationResult,
} from "../_types";
import { serverLogger as logger } from "@/lib/logger";
import {
  getDifficultyDistribution,
  getDifficultyFocusDescription,
  getDifficultyLevelsForJobLevel,
  isDifficultyAppropriateForJobLevel,
  QuestionDifficulty,
} from "../_types/job_levels";

const MAX_QUESTIONS_PER_STAGE = 4; // Maximum 4 questions per stage total
const QUESTIONS_PER_BATCH = 8; // Questions per API call (to stay within token limits)

export async function generateQuestions(
  context: CompanyContext,
  role: RoleDetails,
  attributes: GeneratedAttribute[],
  services?: string[],
  assignedStageIds?: string[]
): Promise<GenerationResult<GeneratedQuestion[]>> {
  const startTime = Date.now();

  try {
    // Get assigned stage names from context
    const assignedStages =
      assignedStageIds && assignedStageIds.length > 0 && context.stages
        ? context.stages.filter((s) =>
            assignedStageIds.includes(s.id || s.name)
          )
        : [];

    const stageNames =
      assignedStages.length > 0
        ? assignedStages.map((s) => s.name)
        : ["Screening", "Technical", "Team", "Final"];

    // Calculate total questions: Maximum 4 questions per stage total
    const totalQuestions = MAX_QUESTIONS_PER_STAGE * stageNames.length;

    logger.api.info("Generating questions", {
      industry: context.industry,
      role: role.title,
      jobLevel: role.jobLevel,
      attributeCount: attributes.length,
      servicesCount: services?.length || 0,
      stageCount: stageNames.length,
      maxQuestionsPerStage: MAX_QUESTIONS_PER_STAGE,
      totalQuestions,
      calculation: `${MAX_QUESTIONS_PER_STAGE} questions × ${stageNames.length} stages = ${totalQuestions}`,
      cultureValues: context.culture.values,
    });

    // Generate questions in batches to avoid token limit issues
    const numBatches = Math.ceil(totalQuestions / QUESTIONS_PER_BATCH);
    const allQuestions: GeneratedQuestion[] = [];

    logger.api.info("Generating questions in batches", {
      totalQuestions,
      questionsPerBatch: QUESTIONS_PER_BATCH,
      numBatches,
    });

    // Generate questions - each batch focuses on specific attributes
    for (let batchIndex = 0; batchIndex < numBatches; batchIndex++) {
      const questionsInThisBatch = Math.min(
        QUESTIONS_PER_BATCH,
        totalQuestions - allQuestions.length
      );

      logger.api.info(`Generating batch ${batchIndex + 1}/${numBatches}`, {
        questionsInBatch: questionsInThisBatch,
        generatedSoFar: allQuestions.length,
      });

      const batchQuestions = await generateQuestionBatch(
        context,
        role,
        attributes,
        services,
        stageNames,
        assignedStages,
        questionsInThisBatch,
        batchIndex
      );

      allQuestions.push(...batchQuestions);
    }

    // Create a map of attribute names to their categories
    const attributeCategories = new Map<string, string>();
    attributes.forEach((attr) => {
      attributeCategories.set(attr.name, attr.category);
    });

    // Create a set of valid attribute names for quick lookup
    const validAttributeNames = new Set(attributes.map((a) => a.name));

    // Get job level difficulty requirements if role has job level
    const requiredDifficulties = role.jobLevel
      ? getDifficultyLevelsForJobLevel(role.jobLevel)
      : null;
    const difficultyDistribution = role.jobLevel
      ? getDifficultyDistribution(role.jobLevel)
      : null;

    // Validate, fix question attributes, and determine assessmentType
    const invalidReferences: string[] = [];
    const invalidDifficultyQuestions: GeneratedQuestion[] = [];

    allQuestions.forEach((q) => {
      // Filter out any invalid attribute references
      const validAttrs = q.attributes.filter((attrName) => {
        const isValid = validAttributeNames.has(attrName);
        if (!isValid) {
          invalidReferences.push(attrName);
        }
        return isValid;
      });
      q.attributes = validAttrs;

      // Validate difficulty level matches job level requirements
      if (role.jobLevel && requiredDifficulties && q.difficultyLevel) {
        if (
          !isDifficultyAppropriateForJobLevel(
            q.difficultyLevel as QuestionDifficulty,
            role.jobLevel
          )
        ) {
          invalidDifficultyQuestions.push(q);
          logger.api.warn(
            "Question has inappropriate difficulty for job level",
            {
              questionId: q.id,
              difficulty: q.difficultyLevel,
              jobLevel: role.jobLevel,
              text: q.text.substring(0, 100),
            }
          );
        }
      }

      // Determine assessmentType based on attribute categories
      const hasValueAttributes = validAttrs.some(
        (attrName) => attributeCategories.get(attrName) === "VALUE"
      );
      const hasKSAAttributes = validAttrs.some((attrName) => {
        const category = attributeCategories.get(attrName);
        return (
          category === "KNOWLEDGE" ||
          category === "SKILL" ||
          category === "ABILITY"
        );
      });

      if (hasValueAttributes && hasKSAAttributes) {
        q.assessmentType = "both";
      } else if (hasValueAttributes) {
        q.assessmentType = "company-fit";
      } else if (hasKSAAttributes) {
        q.assessmentType = "role-fit";
      } else {
        // Default to role-fit if no valid attributes
        q.assessmentType = "role-fit";
      }
    });

    // Remove questions with invalid difficulty levels
    if (invalidDifficultyQuestions.length > 0) {
      const validQuestions = allQuestions.filter(
        (q) => !invalidDifficultyQuestions.includes(q)
      );
      logger.api.warn("Removed questions with invalid difficulty levels", {
        removedCount: invalidDifficultyQuestions.length,
        originalCount: allQuestions.length,
        remainingCount: validQuestions.length,
        jobLevel: role.jobLevel,
        requiredDifficulties,
      });
      allQuestions.length = 0;
      allQuestions.push(...validQuestions);
    }

    // Log invalid attribute references
    if (invalidReferences.length > 0) {
      logger.api.warn("Questions referenced non-existent attributes", {
        invalidAttributes: [...new Set(invalidReferences)],
        validAttributes: Array.from(validAttributeNames),
      });
    }

    // Validate difficulty distribution if job level is specified
    if (role.jobLevel && difficultyDistribution) {
      const difficultyCounts: Record<string, number> = {
        Basic: 0,
        Intermediate: 0,
        Advanced: 0,
        Expert: 0,
      };

      allQuestions.forEach((q) => {
        if (
          q.difficultyLevel &&
          difficultyCounts.hasOwnProperty(q.difficultyLevel)
        ) {
          difficultyCounts[q.difficultyLevel]++;
        }
      });

      // Log difficulty distribution
      logger.api.info("Question difficulty distribution", {
        jobLevel: role.jobLevel,
        distribution: difficultyCounts,
        expectedDistribution: difficultyDistribution,
        totalQuestions: allQuestions.length,
      });

      // Check if distribution roughly matches requirements (within 20% tolerance)
      Object.entries(difficultyDistribution).forEach(
        ([difficulty, expectedPercentage]) => {
          if (expectedPercentage > 0) {
            const actualCount = difficultyCounts[difficulty];
            const actualPercentage = Math.round(
              (actualCount / allQuestions.length) * 100
            );
            const expectedCount = Math.round(
              (expectedPercentage / 100) * allQuestions.length
            );
            const tolerance = Math.round(expectedCount * 0.2); // 20% tolerance

            if (Math.abs(actualCount - expectedCount) > tolerance) {
              logger.api.warn(
                "Question difficulty distribution deviates from expected",
                {
                  difficulty,
                  actualCount,
                  expectedCount,
                  actualPercentage,
                  expectedPercentage,
                  tolerance,
                }
              );
            }
          }
        }
      );
    }

    // Validate coverage - ensure each attribute is covered by questions across stages
    const attributeCoverage = new Map<string, number>();
    attributes.forEach((attr) => attributeCoverage.set(attr.name, 0));

    allQuestions.forEach((q) => {
      q.attributes.forEach((attrName) => {
        const current = attributeCoverage.get(attrName) || 0;
        attributeCoverage.set(attrName, current + 1);
      });
    });

    // Log coverage warnings - expect at least 1 question per attribute, but aim for good coverage
    attributeCoverage.forEach((count, attrName) => {
      if (count < 1) {
        logger.api.warn("Attribute has no question coverage", {
          attribute: attrName,
          count,
        });
      }
    });

    // Validate stage distribution
    const stageDistribution = new Map<string, number>();
    stageNames.forEach((stage) => stageDistribution.set(stage, 0));

    allQuestions.forEach((q) => {
      const count = stageDistribution.get(q.stage) || 0;
      stageDistribution.set(q.stage, count + 1);
    });

    // Log stage distribution warnings - expect exactly MAX_QUESTIONS_PER_STAGE questions per stage
    stageDistribution.forEach((count, stageName) => {
      if (count < MAX_QUESTIONS_PER_STAGE) {
        logger.api.warn("Stage has insufficient questions", {
          stage: stageName,
          count,
          expected: MAX_QUESTIONS_PER_STAGE,
        });
      }
    });

    const generationTime = Date.now() - startTime;

    logger.api.info("Question generation complete", {
      count: allQuestions.length,
      targetCount: totalQuestions,
      stageDistribution: Array.from(stageDistribution.entries()),
      coverageStats: Array.from(attributeCoverage.entries()),
      generationTime,
    });

    return {
      success: true,
      data: allQuestions,
      metadata: {
        model: AI_MODELS.GPT_4_1,
        tokensUsed: undefined, // Sum of all batches
        generationTime,
      },
    };
  } catch (error) {
    const generationTime = Date.now() - startTime;
    logger.api.error("Failed to generate questions", { error, generationTime });

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      metadata: {
        model: AI_MODELS.GPT_4_1,
        generationTime,
      },
    };
  }
}

/**
 * Generate a single batch of questions
 */
async function generateQuestionBatch(
  context: CompanyContext,
  role: RoleDetails,
  attributes: GeneratedAttribute[],
  services: string[] | undefined,
  stageNames: string[],
  assignedStages: any[],
  batchSize: number,
  batchIndex: number
): Promise<GeneratedQuestion[]> {
  const attributesList = attributes.map((a) => a.name).join(", ");

  const prompt = `
Generate ${batchSize} interview questions for ${role.title}${
    role.jobLevel ? ` (${role.jobLevel} level)` : ""
  } at ${
    context.name
      ? `${context.name}, a ${context.industry} company`
      : `a ${context.industry} company`
  }.

IMPORTANT: This is batch ${
    batchIndex + 1
  } of a larger question set. Generate exactly ${batchSize} diverse, high-quality questions.

Company Context:
${context.name ? `- Company Name: ${context.name}` : ""}
- Industry: ${context.industry}
- Size: ${context.size}
- Tech Stack: ${context.techStack.join(", ")}
${
  services && services.length > 0
    ? `- Tools/Services: ${services.join(", ")}`
    : ""
}
- Culture Values: ${context.culture.values.join(", ")}
${
  context.originalDescription
    ? `- Original Company Description: "${context.originalDescription}"`
    : ""
}
${
  context.customContext
    ? `- Additional Context: "${context.customContext}"`
    : ""
}

Role Details:
- Title: ${role.title}
${role.jobLevel ? `- Job Level: ${role.jobLevel}` : ""}
${
  role.responsibilities
    ? `- Responsibilities: ${role.responsibilities.join(", ")}`
    : ""
}
${
  role.technicalSkills
    ? `- Technical Skills: ${role.technicalSkills.join(", ")}`
    : ""
}

Attributes to evaluate: ${attributesList}

CRITICAL: Each question MUST reference ONLY the EXACT attribute names listed above. Do not create new attribute names.

Requirements:
1. QUESTION COUNT:
   - Generate exactly ${MAX_QUESTIONS_PER_STAGE} questions per stage total
   - Total target: ${MAX_QUESTIONS_PER_STAGE} questions × ${
    stageNames.length
  } stages = ${MAX_QUESTIONS_PER_STAGE * stageNames.length} questions
   - This is batch ${batchIndex + 1} of multiple batches

2. DISTRIBUTION:
   - 25% behavioral questions ("Tell me about a time when...")
   - 40% technical/role-specific questions
   - 20% scenario-based questions ("What would you do if...")
   - 15% culture-fit questions

3. COVERAGE:
   - Each attribute should be evaluated by at least 1-2 questions across all stages
   - Questions can and should evaluate multiple attributes (efficient coverage)
   - Ensure good coverage across all ${attributes.length} KSAV attributes

4. ASSESSMENT TYPE (Company-Fit vs Role-Fit):
   - "company-fit": Questions that evaluate VALUE attributes (company culture alignment)
   - "role-fit": Questions that evaluate KNOWLEDGE/SKILL/ABILITY attributes (job-specific competencies)
   - "both": Questions that evaluate both VALUE and K/S/A attributes together

   IMPORTANT: Set assessmentType based on which attributes the question evaluates:
   - If evaluating ONLY VALUE attributes → "company-fit"
   - If evaluating ONLY KNOWLEDGE/SKILL/ABILITY attributes → "role-fit"
   - If evaluating BOTH types → "both"

5. QUALITY STANDARDS:
   - Questions must be specific and actionable
   - Avoid yes/no questions
   - Include context for behavioral questions
   - For technical questions, be specific to ${context.techStack.join(", ")}
   ${
     role.jobLevel
       ? `- Questions should be appropriate for ${role.jobLevel} level candidates`
       : ""
   }

6. SCORING ANCHORS (5x2 System):
   Each question must include scoring guidance for all 5 buckets (0-10 scale).
   Provide 2-3 specific examples for EACH bucket:

   - Bucket 1-2 (Unable to perform job duties): Red flags, critical gaps, concerning responses
   - Bucket 3-4 (Needs much handholding/training/coaching): Basic understanding but requires significant support
   - Bucket 5-6 (Performs with minimal guidance): Competent, meets expectations, self-sufficient
   - Bucket 7-8 (Positively impacts peers' performance): Above average, mentors others, improves team outcomes
   - Bucket 9-10 (Transforms team delivery): Exceptional, changes processes, elevates entire team performance

   ${
     role.jobLevel
       ? `IMPORTANT: Tailor scoring anchors to ${role.jobLevel} level expectations. For example, a ${role.jobLevel} candidate should demonstrate higher autonomy and impact than entry-level.`
       : ""
   }

7. FOLLOW-UP QUESTIONS:
   - 2-3 follow-ups per question
   - Specify when to ask each follow-up
   - Use follow-ups strategically to probe deeper on high scores (7+)

8. DIFFICULTY LEVELS:
   - Questions must be categorized as Basic, Intermediate, Advanced, or Expert
   - Difficulty distribution MUST match the job level requirements:
   ${
     role.jobLevel
       ? `

   Job Level: ${role.jobLevel}
   ${(() => {
     const distribution = getDifficultyDistribution(role.jobLevel);
     const validDifficulties = Object.entries(distribution)
       // eslint-disable-next-line @typescript-eslint/no-unused-vars
       .filter(([_, percentage]) => percentage > 0)
       .map(([difficulty]) => difficulty);

     return `Required Difficulty Levels: ${validDifficulties.join(", ")}
     ${Object.entries(distribution)
       // eslint-disable-next-line @typescript-eslint/no-unused-vars
       .filter(([_, percentage]) => percentage > 0)
       .map(
         ([difficulty, percentage]) =>
           `- ${difficulty}: ${percentage}% of questions`
       )
       .join("\n     ")}
     Focus: ${getDifficultyFocusDescription(role.jobLevel)}

     CRITICAL: Only generate questions with the difficulty levels listed above.`;
   })()}
   `
       : "- Default mix: 25% Basic, 25% Intermediate, 25% Advanced, 25% Expert"
   }

   Difficulty Level Definitions:
   - Basic: Entry-level questions for foundational knowledge and skills
   - Intermediate: Questions requiring some experience and practical application
   - Advanced: Complex questions requiring deep expertise and strategic thinking
   - Expert: Senior-level questions involving leadership, architecture, and high-level strategy

9. INTERVIEW STAGES:
   This position uses the following interview stages: ${stageNames.join(", ")}

   CRITICAL: Each stage must receive exactly ${MAX_QUESTIONS_PER_STAGE} questions total.
   Distribute questions evenly across all stages (aim for ${Math.ceil(
     batchSize / stageNames.length
   )}-${
    Math.floor(batchSize / stageNames.length) + 1
  } questions per stage in this batch):
   ${
     assignedStages.length > 0
       ? `
   Stage descriptions:
   ${assignedStages
     .map((s) => `   - ${s.name}: ${s.description || "No description"}`)
     .join("\n")}

   Match question difficulty and type to the stage purpose:
   - Early stages (screening): Focus on basic qualifications, culture fit
   - Middle stages (technical/panel): Dive deep into skills, problem-solving
   - Final stages (executive/reference): Leadership, strategic thinking, values alignment
   `
       : ""
   }

   IMPORTANT: Use the EXACT stage names provided above in your questions' "stage" field.

Return JSON in this format:
{
  "questions": [
    {
      "text": "Tell me about a time when you had to refactor a complex system. What was your approach?",
      "stage": "Technical",
      "difficultyLevel": "Advanced",
      "attributes": ["Technical Expertise", "Problem Solving"],
      "assessmentType": "role-fit",
      "expectations": {
        "scoringAnchors": {
          "bucket1_2": {
            "scoreRange": "1-2",
            "label": "Unable to perform job duties",
            "examples": [
              "Cannot provide a specific example of refactoring",
              "Shows no understanding of systematic refactoring approaches",
              "Unable to articulate any technical decision-making process"
            ]
          },
          "bucket3_4": {
            "scoreRange": "3-4",
            "label": "Needs much handholding, training, and coaching",
            "examples": [
              "Provides vague example without clear methodology",
              "Focuses only on code changes without considering impact",
              "Requires prompting to discuss trade-offs or alternatives"
            ]
          },
          "bucket5_6": {
            "scoreRange": "5-6",
            "label": "Performs with minimal guidance",
            "examples": [
              "Describes specific refactoring with clear technical approach",
              "Explains rationale for technical decisions",
              "Demonstrates awareness of code quality and maintainability"
            ]
          },
          "bucket7_8": {
            "scoreRange": "7-8",
            "label": "Positively impacts peers' performance",
            "examples": [
              "Detailed example with measurable business impact",
              "Discusses how they documented approach for team",
              "Considers both technical excellence and team knowledge sharing"
            ]
          },
          "bucket9_10": {
            "scoreRange": "9-10",
            "label": "Transforms team delivery",
            "examples": [
              "Created reusable refactoring frameworks adopted by team",
              "Established new patterns that improved system-wide architecture",
              "Mentored others on refactoring, elevating team technical capabilities"
            ]
          }
        },
        "followUpQuestions": [
          {
            "question": "How did you share learnings from this refactoring with your team?",
            "whenToAsk": "If candidate scores 7+ to assess peer impact"
          },
          {
            "question": "What metrics did you use to measure success?",
            "whenToAsk": "If candidate mentions measuring impact"
          }
        ]
      },
      "internalNotes": "Look for systematic thinking, impact awareness, and ability to elevate team performance at higher score ranges"
    }
  ]
}

Return ONLY the JSON object, no markdown formatting.
    `.trim();

  const response = await openai.chat.completions.create({
    model: AI_MODELS.GPT_4_1,
    messages: [
      {
        role: "system",
        content: `You are an expert interview designer with 15 years of experience creating structured interview processes for Fortune 500 companies and high-growth startups. Your questions are known for being insightful, fair, and predictive of candidate success.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8, // Higher for creative, diverse questions
    max_tokens: 4096, // Maximum supported by GPT-4 Turbo
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content returned from OpenAI");
  }

  const parsed = JSON.parse(content);
  return parsed.questions as GeneratedQuestion[];
}
