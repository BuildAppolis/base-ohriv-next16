/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Streaming AI Question Generator
 * Generates interview questions one-by-one for real-time progress updates
 */

import { openai, AI_MODELS } from "@/lib/open_ai/client";
import {
  CompanyContext,
  RoleDetails,
  GeneratedAttribute,
  GeneratedQuestion,
} from "@/types/company_old";
import { serverLogger as logger } from "@/lib/logger";
import {
  getJobLevelsForDifficulty,
  getDifficultyLevelsForJobLevel,
  getDifficultyFocusDescription,
  type QuestionDifficulty,
  type JobSeniorityLevel,
} from "@/types/company_old/job_levels";
export interface LevelAssignment {
  id: string;
  level: string;
  positionCount: number;
  assignedStageIds: string[];
  operations?: string;
}

const MAX_QUESTIONS_PER_STAGE = 4; // Maximum 4 questions per stage total

export interface QuestionProgress {
  type: "progress";
  current: number;
  total: number;
  stage: string;
  question: GeneratedQuestion;
}

export interface QuestionComplete {
  type: "complete";
  questions: GeneratedQuestion[];
  duration: number;
}

export type QuestionStreamEvent = QuestionProgress | QuestionComplete;

/**
 * Generate questions one-by-one with progress updates
 */
export async function* streamQuestions(
  context: CompanyContext,
  role: RoleDetails,
  attributes: GeneratedAttribute[],
  services?: string[],
  assignedStageIds?: string[],
  levelAssignments?: LevelAssignment[]
): AsyncGenerator<QuestionStreamEvent> {
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

    // Extract level names from assignments
    const availableLevels = levelAssignments?.map((a) => a.level) || [];

    // Calculate questions: Maximum 4 questions per stage total
    const questionsPerStage = MAX_QUESTIONS_PER_STAGE;
    const totalQuestions = questionsPerStage * stageNames.length;

    logger.api.info("Starting streaming question generation", {
      attributeCount: attributes.length,
      maxQuestionsPerStage: MAX_QUESTIONS_PER_STAGE,
      stageCount: stageNames.length,
      questionsPerStage,
      totalQuestions,
      calculation: `${MAX_QUESTIONS_PER_STAGE} questions × ${stageNames.length} stages = ${totalQuestions}`,
    });

    const allQuestions: GeneratedQuestion[] = [];
    let questionIndex = 0;

    // Generate questions for each stage
    for (const stageName of stageNames) {
      logger.api.info(`Generating questions for stage: ${stageName}`);

      // Get stage-specific details
      const stageInfo = assignedStages.find((s) => s.name === stageName);

      // Generate questions one-by-one for this stage
      for (let i = 0; i < questionsPerStage; i++) {
        questionIndex++;

        const question = await generateSingleQuestion(
          context,
          role,
          attributes,
          stageName,
          stageInfo,
          services,
          availableLevels,
          questionIndex
        );

        allQuestions.push(question);

        // Yield progress
        yield {
          type: "progress",
          current: questionIndex,
          total: totalQuestions,
          stage: stageName,
          question,
        };
      }
    }

    const duration = Date.now() - startTime;

    logger.api.info("Streaming question generation complete", {
      totalQuestions: allQuestions.length,
      duration,
    });

    // Yield completion
    yield {
      type: "complete",
      questions: allQuestions,
      duration,
    };
  } catch (error) {
    logger.api.error("Error in streaming question generation", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

/**
 * Generate a single interview question
 */
async function generateSingleQuestion(
  context: CompanyContext,
  role: RoleDetails,
  attributes: GeneratedAttribute[],
  stageName: string,
  stageInfo: any,
  services?: string[],
  availableLevels?: string[],
  questionIndex?: number
): Promise<GeneratedQuestion> {
  // Extract culture values
  const cultureValues = Array.isArray(context.culture.values)
    ? context.culture.values.map((v) =>
        typeof v === "string" ? v : v.name || v
      )
    : [];

  const prompt = `Generate a single high-quality interview question for this position and stage.

COMPANY CONTEXT:
- Industry: ${context.industry}
- Size: ${context.size}
- Stage: ${context.stage}
- Business Model: ${context.businessModel}
- Tech Stack: ${context.techStack.join(", ")}
- Culture Values: ${cultureValues.join(", ")}

ROLE DETAILS:
- Title: ${role.title}
${
  role.jobLevel
    ? `- Job Level: ${role.jobLevel}`
    : role.seniorityLevel
    ? `- Level: ${role.seniorityLevel}`
    : ""
}
- Responsibilities: ${role.responsibilities?.join(", ") || "Not specified"}
- Technical Skills: ${role.technicalSkills?.join(", ") || "Not specified"}
${
  services && services.length > 0
    ? `- Tools/Services: ${services.join(", ")}`
    : ""
}

INTERVIEW STAGE: ${stageName}
${stageInfo?.description ? `Stage Focus: ${stageInfo.description}` : ""}

EVALUATION ATTRIBUTES:
${attributes
  .map((attr) => `- ${attr.name} (${attr.category}): ${attr.description}`)
  .join("\n")}

Generate ONE interview question that:
1. Fits the ${stageName} stage appropriately
2. Assesses 2-3 of the evaluation attributes (aim for even coverage across all attributes)
3. Is specific to this role and company context
${
  role.jobLevel
    ? `4. Is appropriate for ${role.jobLevel} level candidates
   ${(() => {
     const validDifficulties = getDifficultyLevelsForJobLevel(role.jobLevel!);
     const focusDescription = getDifficultyFocusDescription(role.jobLevel!);
     return `   Required Difficulty Levels: ${validDifficulties.join(", ")}
   Difficulty Focus: ${focusDescription}`;
   })()}`
    : ""
}
5. Includes 5x2 scoring anchors (0-10 scale with 5 buckets)
6. Includes follow-up questions to probe deeper

IMPORTANT: The system will generate exactly ${MAX_QUESTIONS_PER_STAGE} questions per stage total. Focus on creating high-quality, unique questions that provide good coverage across all KSAV attributes.

DIFFICULTY LEVEL DEFINITIONS:
- Basic: Entry-level questions for foundational knowledge and skills
- Intermediate: Questions requiring some experience and practical application
- Advanced: Complex questions requiring deep expertise and strategic thinking
- Expert: Senior-level questions involving leadership, architecture, and high-level strategy

SCORING ANCHORS (5x2 System):
Provide 2-3 specific examples for EACH bucket:
- Bucket 1-2 (Unable to perform job duties): Red flags, critical gaps
- Bucket 3-4 (Needs much handholding/training/coaching): Basic understanding but requires support
- Bucket 5-6 (Performs with minimal guidance): Competent, meets expectations
- Bucket 7-8 (Positively impacts peers' performance): Above average, mentors others
- Bucket 9-10 (Transforms team delivery): Exceptional, changes processes

${
  role.jobLevel
    ? `IMPORTANT: Tailor scoring anchors to ${role.jobLevel} level expectations. Higher-level candidates should demonstrate greater autonomy, impact, and leadership.`
    : ""
}

ASSESSMENT TYPE:
- "company-fit": If evaluating ONLY VALUE attributes
- "role-fit": If evaluating ONLY KNOWLEDGE/SKILL/ABILITY attributes
- "both": If evaluating both VALUE and K/S/A attributes

Return JSON in this exact format:
{
  "question": {
    "text": "The interview question text",
    "stage": "${stageName}",
    "difficultyLevel": "Basic|Intermediate|Advanced|Expert",
    "attributes": ["attribute name 1", "attribute name 2"],
    "assessmentType": "company-fit|role-fit|both",
    "expectations": {
      "scoringAnchors": {
        "bucket1_2": {
          "scoreRange": "1-2",
          "label": "Unable to perform job duties",
          "examples": ["Example 1", "Example 2"]
        },
        "bucket3_4": {
          "scoreRange": "3-4",
          "label": "Needs much handholding, training, and coaching",
          "examples": ["Example 1", "Example 2"]
        },
        "bucket5_6": {
          "scoreRange": "5-6",
          "label": "Performs with minimal guidance",
          "examples": ["Example 1", "Example 2"]
        },
        "bucket7_8": {
          "scoreRange": "7-8",
          "label": "Positively impacts peers' performance",
          "examples": ["Example 1", "Example 2"]
        },
        "bucket9_10": {
          "scoreRange": "9-10",
          "label": "Transforms team delivery",
          "examples": ["Example 1", "Example 2"]
        }
      },
      "followUpQuestions": [
        {
          "question": "Follow-up question 1",
          "whenToAsk": "When to ask this follow-up"
        }
      ]
    },
    "internalNotes": "Guidance for interviewer"
  }
}`;

  const response = await openai.chat.completions.create({
    model: AI_MODELS.GPT_4_1,
    messages: [
      {
        role: "system",
        content:
          "You are an expert at creating behavioral and technical interview questions. Generate questions that reveal candidate qualities and align with company values. Always respond with valid JSON only.",
      },
      {
        role: "user",
        content:
          prompt +
          "\n\nIMPORTANT: Respond with valid JSON only. No markdown formatting, no code blocks, just raw JSON.",
      },
    ],
    temperature: 0.9, // High creativity for diverse questions
    max_tokens: 800, // Smaller since generating 1 question
    stream: true, // REAL OpenAI streaming
  });

  let fullContent = "";

  // Process the real OpenAI stream
  for await (const chunk of response) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) {
      fullContent += delta;
    }
  }

  if (!fullContent) {
    throw new Error("No content returned from OpenAI stream");
  }

  // Clean up the content - remove any potential markdown formatting
  const cleanedContent = fullContent
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  logger.api.debug("Parsing OpenAI response", {
    contentLength: cleanedContent.length,
    preview: cleanedContent.substring(0, 200),
  });

  let parsed;
  try {
    parsed = JSON.parse(cleanedContent);
  } catch (parseError) {
    logger.api.error("Failed to parse OpenAI JSON response", {
      error:
        parseError instanceof Error ? parseError.message : String(parseError),
      content: cleanedContent,
      originalContent: fullContent,
    });
    throw new Error(
      `Failed to parse OpenAI response as JSON: ${
        parseError instanceof Error ? parseError.message : "Unknown parse error"
      }`
    );
  }
  const question = parsed.question;

  // Validate the response structure
  if (!question || !question.text) {
    logger.api.error("Invalid question structure from OpenAI", {
      parsed,
      question,
    });
    throw new Error(
      "Invalid question structure returned from OpenAI: missing question.text"
    );
  }

  // Determine assessmentType based on attribute categories
  const attributeCategories = new Map<string, string>();
  attributes.forEach((attr) => {
    attributeCategories.set(attr.name, attr.category);
  });

  const hasValueAttributes = question.attributes.some(
    (attrName: string) => attributeCategories.get(attrName) === "VALUE"
  );
  const hasKSAAttributes = question.attributes.some((attrName: string) => {
    const category = attributeCategories.get(attrName);
    return (
      category === "KNOWLEDGE" || category === "SKILL" || category === "ABILITY"
    );
  });

  let assessmentType: "company-fit" | "role-fit" | "both" = "role-fit";
  if (hasValueAttributes && hasKSAAttributes) {
    assessmentType = "both";
  } else if (hasValueAttributes) {
    assessmentType = "company-fit";
  } else if (hasKSAAttributes) {
    assessmentType = "role-fit";
  }

  // Determine which levels this question applies to based on difficulty
  const assignedLevels = determineAssignedLevels(
    question.difficultyLevel,
    availableLevels || []
  );

  // Add unique ID and determined assessmentType
  const generatedQuestion: GeneratedQuestion = {
    id: `q-${Date.now()}-${questionIndex || Math.random()}`,
    text: question.text,
    stage: stageName,
    stageName: stageName,
    difficultyLevel: question.difficultyLevel,
    attributes: question.attributes,
    assessmentType,
    assignedLevels,
    expectations: question.expectations,
    internalNotes: question.internalNotes,
  };

  return generatedQuestion;
}

/**
 * Determine which job levels a question should be assigned to based on difficulty
 * Uses the new job level configuration system based on client requirements
 */
function determineAssignedLevels(
  difficultyLevel: "Basic" | "Intermediate" | "Advanced" | "Expert",
  availableLevels: string[]
): string[] {
  if (availableLevels.length === 0) {
    return [];
  }

  // If only one level, assign all questions to it
  if (availableLevels.length === 1) {
    return [availableLevels[0]];
  }

  // Get job levels that should receive this difficulty based on client requirements
  const targetLevels = getJobLevelsForDifficulty(
    difficultyLevel as QuestionDifficulty
  );

  // Filter to only include levels that are actually available
  const assigned = availableLevels.filter((level) =>
    targetLevels.includes(level as JobSeniorityLevel)
  );

  // If no matches (unlikely but possible), fall back to all available levels
  if (assigned.length === 0) {
    logger.api.warn(
      "No available levels match difficulty requirements, assigning to all levels",
      {
        difficultyLevel,
        availableLevels,
        targetLevels,
      }
    );
    return availableLevels;
  }

  return assigned;
}
