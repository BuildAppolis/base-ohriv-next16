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

const MAX_QUESTIONS_PER_STAGE = 4;

/**
 * Generate questions one by one for real-time progress updates
 */
export async function generateQuestionsWithProgress(
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
    logger.api.info("Starting question generation with progress", {
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

    // Use level assignments if available, otherwise default to ["Junior", "Mid", "Senior"]
    const levels =
      levelAssignments && levelAssignments.length > 0
        ? levelAssignments.map((la) => la.level)
        : ["Entry Level", "Junior", "Mid", "Senior", "Lead"];

    // Generate questions per level per stage (max 4 per combination)
    const allQuestions: GeneratedQuestion[] = [];
    let questionIndex = 0;

    // Generate questions for each level × stage combination
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

        // Generate 4 questions for this level-stage combination
        for (let i = 0; i < MAX_QUESTIONS_PER_STAGE; i++) {
          questionIndex++;

          const question = await generateSingleQuestion(
            context,
            role,
            attributes,
            stageName,
            services,
            questionIndex,
            level, // Pass the level for proper assignment
            i + 1 // Question number within this level-stage (for difficulty variation)
          );

          allQuestions.push(question);
        }
      }
    }

    // Return progress or completion based on currentIndex
    if (currentIndex < allQuestions.length) {
      // Return single question progress
      const currentQuestion = allQuestions[currentIndex];

      logger.api.info("Question generation progress", {
        current: currentIndex + 1,
        total: allQuestions.length,
        questionText: currentQuestion.text,
      });

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
      logger.api.info("Question generation complete", {
        totalQuestions: allQuestions.length,
      });

      return {
        success: true,
        questions: allQuestions,
      };
    }
  } catch (error) {
    logger.api.error("Error in question generation", {
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
 * Generate a single question
 */
async function generateSingleQuestion(
  context: CompanyContext,
  role: RoleDetails,
  attributes: GeneratedAttribute[],
  stage: string,
  services?: string[],
  questionIndex?: number,
  level?: string,
  questionNumberInLevel?: number
): Promise<GeneratedQuestion> {
  // Select relevant attributes for this question
  const relevantAttributes = attributes.slice(0, 3); // Use top 3 attributes

  // Determine difficulty based on level and question number
  const getDifficultyForLevel = (
    level: string,
    questionNum: number
  ): string => {
    const levelDifficultyMap: Record<string, string[]> = {
      "Entry Level": ["Basic", "Basic", "Intermediate", "Intermediate"],
      Junior: ["Basic", "Intermediate", "Intermediate", "Advanced"],
      Mid: ["Intermediate", "Intermediate", "Advanced", "Advanced"],
      Senior: ["Intermediate", "Advanced", "Advanced", "Expert"],
      Lead: ["Advanced", "Advanced", "Expert", "Expert"],
    };
    return levelDifficultyMap[level]?.[questionNum - 1] || "Intermediate";
  };

  const targetDifficulty = getDifficultyForLevel(
    level || "Mid",
    questionNumberInLevel || 1
  );

  const prompt = `Generate a single interview question for this role at the ${level} level for the ${stage} stage.

COMPANY CONTEXT:
- Industry: ${context.industry}
- Size: ${context.size}
- Stage: ${context.stage}
- Business Model: ${context.businessModel}
- Tech Stack: ${context.techStack.join(", ")}

ROLE DETAILS:
- Title: ${role.title}
- Level: ${level || "Not specified"}
- Responsibilities: ${role.responsibilities?.join(", ") || "Not specified"}
- Required Skills: ${role.technicalSkills?.join(", ") || "Not specified"}
${
  services && services.length > 0
    ? `- Tools/Services: ${services.join(", ")}`
    : ""
}

RELEVANT ATTRIBUTES TO EVALUATE:
${relevantAttributes
  .map((attr) => `- ${attr.name}: ${attr.description}`)
  .join("\n")}

STAGE: ${stage}
LEVEL: ${level}
DIFFICULTY: ${targetDifficulty}
${
  stage === "Screening"
    ? "Screening questions should be broad, filter out obvious mismatches, and assess basic fit and interest for the ${level} level."
    : stage === "Technical"
    ? "Technical questions should assess specific skills, problem-solving abilities, and technical depth appropriate for a ${level} candidate."
    : stage === "Team"
    ? "Team questions should assess collaboration, communication, and cultural fit for a ${level} level."
    : "Final stage questions should assess overall fit, motivation, and decision-making for a ${level} position."
}

Generate ONE interview question that:
1. Evaluates one or more of the relevant attributes listed above
2. Is appropriate for the ${stage} interview stage and ${level} level
3. Has ${targetDifficulty.toLowerCase()} difficulty level
4. Is specific and actionable for interviewers
5. Has a clear expected answer or evaluation criteria

Return JSON in this exact format:
{
  "question": "The interview question text",
  "attribute": "Primary attribute this evaluates",
  "type": "${stage.toLowerCase()}",
  "difficulty": "${targetDifficulty}",
  "expectedAnswer": "What to look for in the response",
  "followUp": "Possible follow-up questions"
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
    max_tokens: 400,
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
    logger.api.error("Failed to parse OpenAI question JSON response", {
      error:
        parseError instanceof Error ? parseError.message : String(parseError),
      content: cleanedContent,
    });
    throw new Error(
      `Failed to parse OpenAI question response as JSON: ${
        parseError instanceof Error ? parseError.message : "Unknown parse error"
      }`
    );
  }

  return {
    id: `q-${Date.now()}-${questionIndex || Math.random()}`,
    text: parsed.question,
    stage: stage,
    stageName: stage, // Display name for stage
    difficultyLevel: (parsed.difficulty || targetDifficulty) as
      | "Basic"
      | "Intermediate"
      | "Advanced"
      | "Expert",
    attributes: relevantAttributes.map((attr) => attr.name), // Attribute names this question evaluates
    assessmentType: "role-fit" as const, // Default to role-fit for job-specific skills
    assignedLevels: level ? [level] : [], // Assign this question to the specific level
    expectations: {
      scoringAnchors: {
        bucket1_2: {
          scoreRange: "1-2",
          label: "Poor Response",
          examples: [
            "Shows no understanding of the core concepts",
            "Provides irrelevant or incorrect information",
            "Cannot articulate a coherent approach",
          ],
        },
        bucket3_4: {
          scoreRange: "3-4",
          label: "Below Average",
          examples: [
            "Shows partial understanding but misses key points",
            "Provides basic information with little detail",
            "Struggles to apply concepts to practical scenarios",
          ],
        },
        bucket5_6: {
          scoreRange: "5-6",
          label: "Average",
          examples: [
            "Demonstrates adequate understanding of core concepts",
            "Provides relevant information with some depth",
            "Can apply concepts to common scenarios",
          ],
        },
        bucket7_8: {
          scoreRange: "7-8",
          label: "Good",
          examples: [
            "Shows solid understanding with good examples",
            "Provides detailed, well-structured responses",
            "Demonstrates ability to handle complex scenarios",
          ],
        },
        bucket9_10: {
          scoreRange: "9-10",
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
          whenToAsk: "",
        },
        {
          question:
            "What would you do differently if the circumstances changed?",
          purpose: "Tests adaptability and problem-solving flexibility",
          whenToAsk: "",
        },
      ],
    },
    internalNotes: `Generated for ${level} level at ${stage} stage. Difficulty: ${targetDifficulty}.`,
  };
}
