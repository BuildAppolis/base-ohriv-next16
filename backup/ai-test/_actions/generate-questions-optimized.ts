/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { openai } from "@/lib/open_ai/client";
import type {
  CompanyContext,
  RoleDetails,
  GeneratedAttribute,
  GeneratedQuestion,
} from "../_types";
import { serverLogger as logger } from "@/lib/logger";

export interface QuestionGenerationRequest {
  context: CompanyContext;
  role: RoleDetails;
  attributes: GeneratedAttribute[];
  services?: string[];
  assignedStageIds?: string[];
  levelAssignments?: Array<{
    id: string;
    level: string;
    positionCount: number;
    assignedStageIds: string[];
  }>;
  currentIndex?: number; // Track current position in generation
}

export interface QuestionGenerationResult {
  success: boolean;
  questions?: GeneratedQuestion[];
  error?: string;
  progress?: {
    current: number;
    total: number;
    stage: string;
    question: GeneratedQuestion;
  };
}

const MAX_QUESTIONS_PER_LEVEL_STAGE = 4;

/**
 * ULTRA-OPTIMIZED: Generate multiple questions in single API calls
 * This version generates questions in batches (level × stage combinations)
 */
export async function generateQuestionsWithProgressOptimized(
  request: QuestionGenerationRequest
): Promise<QuestionGenerationResult> {
  const {
    context,
    role,
    attributes,
    services,
    assignedStageIds,
    levelAssignments,
    currentIndex = 0,
  } = request;

  try {
    logger.api.info("Starting optimized question generation", {
      role: role.title,
      attributeCount: attributes.length,
      hasServices: !!services?.length,
      currentIndex,
    });

    // Get assigned stages and levels
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

    // Use level assignments if available, otherwise default to common levels
    const levels =
      levelAssignments && levelAssignments.length > 0
        ? levelAssignments.map((la) => la.level)
        : ["Entry Level", "Junior", "Mid", "Senior", "Lead"];

    // Create all level-stage combinations that need questions
    const levelStageCombinations: Array<{ level: string; stage: string }> = [];
    for (const level of levels) {
      for (const stageName of stageNames) {
        // Check if this level should have questions for this stage
        const levelAssignment = levelAssignments?.find(
          (la) => la.level === level
        );
        if (
          levelAssignment &&
          !levelAssignment.assignedStageIds.includes(stageName)
        ) {
          continue; // Skip this level-stage combination if not assigned
        }
        levelStageCombinations.push({ level, stage: stageName });
      }
    }

    // Generate questions in batches (one API call per level-stage combination)
    const allQuestions: GeneratedQuestion[] = [];
    let questionIndex = 0;

    // Generate questions for each level-stage combination in parallel batches
    const batchSize = 3; // Generate 3 level-stage combinations in parallel
    for (let i = 0; i < levelStageCombinations.length; i += batchSize) {
      const batch = levelStageCombinations.slice(i, i + batchSize);

      const batchPromises = batch.map(({ level, stage }) =>
        generateQuestionBatch(
          context,
          role,
          attributes,
          stage,
          level,
          services,
          questionIndex
        ).then((questions) => {
          questionIndex += questions.length;
          return questions;
        })
      );

      const batchResults = await Promise.all(batchPromises);
      allQuestions.push(...batchResults.flat());
    }

    logger.api.info("Optimized question generation complete", {
      totalQuestions: allQuestions.length,
      apiCalls: levelStageCombinations.length, // Much fewer API calls!
      batchSize: batchSize,
    });

    // Return progress or completion based on currentIndex
    if (currentIndex < allQuestions.length) {
      // Return single question progress for streaming
      const currentQuestion = allQuestions[currentIndex];

      return {
        success: true,
        progress: {
          current: currentIndex + 1,
          total: allQuestions.length,
          stage: currentQuestion.stage,
          question: currentQuestion,
        },
      };
    } else {
      // All questions completed
      return {
        success: true,
        questions: allQuestions,
      };
    }
  } catch (error) {
    logger.api.error("Error in optimized question generation", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate multiple questions for a specific level-stage combination in a single API call
 */
async function generateQuestionBatch(
  context: CompanyContext,
  role: RoleDetails,
  attributes: GeneratedAttribute[],
  stage: string,
  level: string,
  services?: string[],
  startQuestionIndex: number = 0
): Promise<GeneratedQuestion[]> {
  // Determine difficulty progression for this level
  const getDifficultyProgression = (level: string): string[] => {
    const levelDifficultyMap: Record<string, string[]> = {
      "Entry Level": ["Basic", "Basic", "Intermediate", "Intermediate"],
      Junior: ["Basic", "Intermediate", "Intermediate", "Advanced"],
      Mid: ["Intermediate", "Intermediate", "Advanced", "Advanced"],
      Senior: ["Intermediate", "Advanced", "Advanced", "Expert"],
      Lead: ["Advanced", "Advanced", "Expert", "Expert"],
    };
    return (
      levelDifficultyMap[level] || [
        "Intermediate",
        "Intermediate",
        "Advanced",
        "Advanced",
      ]
    );
  };

  const difficultyProgression = getDifficultyProgression(level);

  const prompt = `Generate ${MAX_QUESTIONS_PER_LEVEL_STAGE} interview questions for this role at the ${level} level for the ${stage} stage.

COMPANY CONTEXT:
- Industry: ${context.industry}
- Size: ${context.size}
- Stage: ${context.stage}
- Business Model: ${context.businessModel}
- Tech Stack: ${context.techStack.join(", ")}

ROLE DETAILS:
- Title: ${role.title}
- Level: ${level}
- Responsibilities: ${role.responsibilities?.join(", ") || "Not specified"}
- Required Skills: ${role.technicalSkills?.join(", ") || "Not specified"}
${
  services && services.length > 0
    ? `- Tools/Services: ${services.join(", ")}`
    : ""
}

RELEVANT ATTRIBUTES TO EVALUATE:
${attributes
  .slice(0, 6)
  .map((attr) => `- ${attr.name}: ${attr.description}`)
  .join("\n")}

STAGE: ${stage}
LEVEL: ${level}
DIFFICULTY PROGRESSION: ${difficultyProgression.join(", ")}
${
  stage === "Screening"
    ? "Screening questions should be broad, filter out obvious mismatches, and assess basic fit and interest for the ${level} level."
    : stage === "Technical"
    ? "Technical questions should assess specific skills, problem-solving abilities, and technical depth appropriate for a ${level} candidate."
    : stage === "Team"
    ? "Team questions should assess collaboration, communication, and cultural fit for a ${level} level."
    : "Final stage questions should assess overall fit, motivation, and decision-making for a ${level} position."
}

Generate ${MAX_QUESTIONS_PER_LEVEL_STAGE} interview questions with these requirements:
1. Each question should be unique and assess different aspects
2. Follow the difficulty progression: ${difficultyProgression.join(" → ")}
3. Are appropriate for the ${stage} interview stage and ${level} level
4. Evaluate one or more of the relevant attributes listed above
5. Are specific and actionable for interviewers
6. Have clear expected answers or evaluation criteria

Return JSON in this exact format:
{
  "questions": [
    {
      "question": "First interview question text",
      "attribute": "Primary attribute this evaluates",
      "type": "${stage.toLowerCase()}",
      "difficulty": "${difficultyProgression[0]}",
      "expectedAnswer": "What to look for in the response",
      "followUp": "Possible follow-up questions"
    },
    {
      "question": "Second interview question text",
      "attribute": "Primary attribute this evaluates",
      "type": "${stage.toLowerCase()}",
      "difficulty": "${difficultyProgression[1]}",
      "expectedAnswer": "What to look for in the response",
      "followUp": "Possible follow-up questions"
    },
    {
      "question": "Third interview question text",
      "attribute": "Primary attribute this evaluates",
      "type": "${stage.toLowerCase()}",
      "difficulty": "${difficultyProgression[2]}",
      "expectedAnswer": "What to look for in the response",
      "followUp": "Possible follow-up questions"
    },
    {
      "question": "Fourth interview question text",
      "attribute": "Primary attribute this evaluates",
      "type": "${stage.toLowerCase()}",
      "difficulty": "${difficultyProgression[3]}",
      "expectedAnswer": "What to look for in the response",
      "followUp": "Possible follow-up questions"
    }
  ]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an expert interviewer and talent evaluator. Create specific, insightful interview questions. Always respond with valid JSON only.",
      },
      {
        role: "user",
        content:
          prompt +
          "\n\nIMPORTANT: Respond with valid JSON only. No markdown formatting, no code blocks, just raw JSON.",
      },
    ],
    temperature: 0.7,
    max_tokens: 3000, // Increased token limit for batch generation
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content returned from OpenAI");
  }

  const cleanedContent = content
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleanedContent);
  } catch (parseError) {
    logger.api.error("Failed to parse OpenAI batch question JSON response", {
      error:
        parseError instanceof Error ? parseError.message : String(parseError),
      content: cleanedContent,
    });
    throw new Error(
      `Failed to parse OpenAI batch question response as JSON: ${
        parseError instanceof Error ? parseError.message : "Unknown parse error"
      }`
    );
  }

  // Transform the response into GeneratedQuestion objects
  return (parsed.questions || []).map((q: any, index: number) => ({
    id: `q-${Date.now()}-${startQuestionIndex + index}`,
    text: q.question,
    stage: stage,
    stageName: stage,
    difficultyLevel: q.difficulty as
      | "Basic"
      | "Intermediate"
      | "Advanced"
      | "Expert",
    attributes: [q.attribute], // Primary attribute
    assessmentType: "role-fit" as const,
    assignedLevels: [level], // Assign to this specific level
    expectations: {
      scoringAnchors: {
        bucket1_2: {
          label: "Poor Response",
          examples: [
            "Shows no understanding of the core concepts",
            "Provides irrelevant or incorrect information",
            "Cannot articulate a coherent approach",
          ],
        },
        bucket3_4: {
          label: "Below Average",
          examples: [
            "Shows partial understanding but misses key points",
            "Provides basic information with little detail",
            "Struggles to apply concepts to practical scenarios",
          ],
        },
        bucket5_6: {
          label: "Average",
          examples: [
            "Demonstrates adequate understanding of core concepts",
            "Provides relevant information with some depth",
            "Can apply concepts to common scenarios",
          ],
        },
        bucket7_8: {
          label: "Good",
          examples: [
            "Shows solid understanding with good examples",
            "Provides detailed, well-structured responses",
            "Demonstrates ability to handle complex scenarios",
          ],
        },
        bucket9_10: {
          label: "Excellent",
          examples: [
            "Exhibits mastery with exceptional insights",
            "Provides comprehensive, nuanced responses",
            "Demonstrates expert-level thinking and innovation",
          ],
        },
      },
      followUpQuestions: [
        {
          question:
            "Can you provide a specific example of when you've handled this?",
          purpose: "Tests practical application and experience",
        },
        {
          question:
            "What would you do differently if the circumstances changed?",
          purpose: "Tests adaptability and problem-solving flexibility",
        },
      ],
    },
    internalNotes: `Generated for ${level} level at ${stage} stage. Difficulty: ${q.difficulty}.`,
  }));
}
