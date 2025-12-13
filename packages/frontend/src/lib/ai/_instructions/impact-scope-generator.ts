/**
 * AI Impact & Scope Generator
 * Generates suggested impact & scope descriptions for different seniority levels
 */

import { openai, AI_MODELS } from "@/lib/open_ai/client";
import { CompanyContext } from "@/types/old/company_old";
import { serverLogger as logger } from "@/lib/logger";

export interface LevelImpactSuggestion {
  level: string;
  suggestedImpact: string;
}

export interface ImpactScopeResult {
  suggestions: LevelImpactSuggestion[];
  metadata?: {
    generationTime: number;
    model: string;
  };
}

export async function generateImpactScopeForLevels(
  context: CompanyContext,
  roleTitle: string,
  roleDetails?: string,
  levels?: string[]
): Promise<ImpactScopeResult> {
  const startTime = Date.now();

  // Default levels if not provided
  const levelsToGenerate = levels || [
    "Junior",
    "Mid-Level",
    "Senior",
    "Staff",
    "Principal",
  ];

  try {
    logger.api.info("Generating impact & scope suggestions", {
      roleTitle,
      levels: levelsToGenerate,
      industry: context.industry,
    });

    const prompt = `
Generate Impact & Scope descriptions for a ${roleTitle} position at ${
      context.name || `a ${context.industry} company`
    }.

Company Context:
${context.name ? `- Company: ${context.name}` : ""}
- Industry: ${context.industry}${
      context.subIndustry ? ` (${context.subIndustry})` : ""
    }
- Size: ${context.size}
- Stage: ${context.stage}
- Tech Stack: ${context.techStack.join(", ")}
- Business Model: ${context.businessModel}

Role: ${roleTitle}
${roleDetails ? `Details: ${roleDetails}` : ""}

FRAMEWORK - Impact & Scope:
- IMPACT: What outcomes and results does this level achieve? What difference do they make?
- SCOPE: What is their breadth of influence? (individual → team → feature → product → organization)

For each seniority level below, generate a 1-2 sentence description focused on outcomes and sphere of influence:

Levels: ${levelsToGenerate.join(", ")}

EXAMPLES OF GOOD IMPACT & SCOPE:

Junior/Entry Level:
"Deliver features under guidance, contribute to team goals, build technical foundation, grow capabilities within assigned areas"

Mid-Level:
"Own features end-to-end, deliver quality solutions independently, collaborate across teams, impact team velocity and product quality"

Senior:
"Drive technical direction for major features, scale team capabilities through mentorship, ensure architectural integrity, influence product outcomes"

Staff:
"Shape technical strategy across multiple teams, set standards and best practices, solve complex organizational challenges, multiply effectiveness across engineering"

Principal:
"Define company-wide technical vision, influence product and business strategy, drive transformational initiatives, impact organizational success and culture"

Return JSON with this structure:
{
  "suggestions": [
    {
      "level": "Junior",
      "suggestedImpact": "Deliver features under guidance, contribute to team goals..."
    },
    {
      "level": "Mid-Level",
      "suggestedImpact": "Own features end-to-end, deliver quality solutions..."
    }
  ]
}

IMPORTANT:
- Focus on OUTCOMES, not activities
- Emphasize SPHERE OF INFLUENCE (how broad their impact is)
- Keep it concise but actionable
- Tailor to the specific role and company context
- Return ONLY the JSON, no markdown formatting
    `.trim();

    const response = await openai.chat.completions.create({
      model: AI_MODELS.GPT_4_1,
      messages: [
        {
          role: "system",
          content:
            "You are an expert in organizational design and career laddering. Generate impact & scope descriptions that focus on outcomes and breadth of influence.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    const parsed = JSON.parse(content);
    const generationTime = Date.now() - startTime;

    logger.api.info("Impact & scope generation complete", {
      generationTime,
      suggestionsCount: parsed.suggestions?.length || 0,
    });

    return {
      suggestions: parsed.suggestions || [],
      metadata: {
        generationTime,
        model: AI_MODELS.GPT_4_1,
      },
    };
  } catch (error) {
    const generationTime = Date.now() - startTime;
    logger.api.error("Impact & scope generation failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      generationTime,
    });
    throw error;
  }
}
