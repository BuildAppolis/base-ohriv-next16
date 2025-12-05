/**
 * AI Position Suggester
 * Generates position suggestions based on company context
 */

import { openai, AI_MODELS } from "../../../../lib/open_ai/client";
import {
  GenerationResult,
  PositionSuggestion,
  CompanyContext,
  CompanyStage,
} from "../_types";
import { serverLogger as logger } from "@/lib/logger";

interface PositionSuggesterInput {
  context: CompanyContext;
  stages: CompanyStage[];
}

export async function generatePositionSuggestions(
  input: PositionSuggesterInput
): Promise<GenerationResult<PositionSuggestion[]>> {
  const startTime = Date.now();
  const { context, stages } = input;

  try {
    logger.api.info("Generating position suggestions", {
      industry: context.industry,
      size: context.size,
      stage: context.stage,
      stageCount: stages.length,
    });

    const stageList = stages
      .map((s) => `- ${s.name} (${s.id}): ${s.description || "No description"}`)
      .join("\n");

    const prompt = `
You are an expert HR consultant helping a company identify key positions to hire for.

Company Context:
- Industry: ${context.industry}${
      context.subIndustry ? ` (${context.subIndustry})` : ""
    }
- Company Size: ${context.size}
- Company Stage: ${context.stage}
- Business Model: ${context.businessModel}
- Tech Stack: ${context.techStack.join(", ")}
- Values: ${
      Array.isArray(context.culture.values)
        ? context.culture.values
            .map((v) => (typeof v === "string" ? v : v.name))
            .join(", ")
        : "Not specified"
    }

Available Interview Stages:
${stageList}

Based on this company's profile, suggest 4-5 positions they should hire for that would make the most impact.

For each position:
1. Choose a specific, realistic job title
2. Write a 1-2 sentence description of what this role would do
3. Explain WHY this position is critical for this company's stage and goals
4. Write base impact & scope (1-2 sentences focusing on outcomes and influence across ALL levels)
5. Suggest which interview stages from the list above should apply to this position (use stage IDs)

Consider:
- Company stage (early startups need generalists, mature companies need specialists)
- Industry-specific roles (fintech needs compliance, healthtech needs clinical expertise)
- Size (small teams need multi-skilled roles, large teams can specialize)
- Tech stack (if tech company, suggest engineering roles matching their stack)
- Business model (B2B needs sales, SaaS needs customer success, etc.)

IMPORTANT:
- Suggest practical positions they actually need NOW, not aspirational roles
- Match titles to the company's stage (startups: "Full-Stack Engineer", enterprise: "Senior Backend Engineer")
- Be specific and relevant to their industry
- Stage assignments should make sense (entry-level might skip executive review, leadership roles might need it)
- Base impact & scope should focus on OUTCOMES (what difference they make) not activities

IMPACT & SCOPE FRAMEWORK:
- Focus on outcomes and results this position achieves
- Describe breadth of influence across the organization
- Keep it outcome-focused, not task-focused
- Should apply to all seniority levels of this position

Example Impact & Scope:
- For Developer: "Drive product innovation through quality code, improve user experience and system reliability, contribute to technical excellence and team velocity"
- For Product Manager: "Shape product direction and feature prioritization, ensure market fit and user value, influence business outcomes through data-driven decisions"
- For Sales Rep: "Drive revenue growth and market expansion, build lasting client relationships, impact company success through strategic deal closures"

Return JSON with this structure:
{
  "positions": [
    {
      "title": "Specific Job Title",
      "description": "What this person will do day-to-day",
      "rationale": "Why this role is critical for this company right now",
      "baseImpactScope": "Outcome-focused description of impact and sphere of influence",
      "suggestedStageIds": ["default-1", "default-2", "default-3"]
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
          content:
            "You are an expert HR consultant who suggests highly relevant positions based on company context. Always return valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    const result = JSON.parse(content) as { positions: PositionSuggestion[] };
    const generationTime = Date.now() - startTime;

    logger.api.info("Position suggestions generated", {
      positionCount: result.positions.length,
      generationTime,
    });

    return {
      success: true,
      data: result.positions,
      metadata: {
        model: AI_MODELS.GPT_4_1,
        tokensUsed: response.usage?.total_tokens,
        generationTime,
      },
    };
  } catch (error) {
    const generationTime = Date.now() - startTime;
    logger.api.error("Failed to generate position suggestions", {
      error,
      generationTime,
    });

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
