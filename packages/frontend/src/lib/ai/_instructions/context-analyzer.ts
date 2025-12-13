/**
 * AI Context Analyzer
 * Extracts structured company information from natural language descriptions
 */

import { openai, AI_MODELS } from "@/lib/open_ai/client";
import { CompanyContext, GenerationResult } from "@/types/old/company_old";
import { serverLogger as logger } from "@/lib/logger";
import {
  BUSINESS_MODELS,
  COMPANY_STAGES,
  INDUSTRIES,
  COMPANY_SIZES,
} from "@/types/old/company_old/company-enums";

export async function analyzeContext(
  description: string,
  companyName?: string
): Promise<GenerationResult<CompanyContext>> {
  const startTime = Date.now();

  try {
    logger.api.info("Analyzing company context", {
      descriptionLength: description.length,
      hasCompanyName: !!companyName,
    });

    const prompt = `
Extract structured hiring context from this company description and map to predefined categories.
${companyName ? `\n\nCompany Name: "${companyName}"\n` : ""}

AVAILABLE OPTIONS (you MUST return the ID, not the label):

INDUSTRIES:
${INDUSTRIES.map((i) => `- "${i.id}": ${i.label} (${i.description})`).join(
  "\n"
)}

COMPANY_SIZES:
${COMPANY_SIZES.map((s) => `- "${s.id}": ${s.label}`).join("\n")}

COMPANY_STAGES:
${COMPANY_STAGES.map((s) => `- "${s.id}": ${s.label} (${s.description})`).join(
  "\n"
)}

BUSINESS_MODELS:
${BUSINESS_MODELS.map((b) => `- "${b.id}": ${b.label} (${b.description})`).join(
  "\n"
)}

COMPANY CULTURE:

NOTE: Work Environment, Pace, Collaboration Style, and Autonomy are position-specific and will be generated per role, not at company level.

Return JSON with this EXACT structure:
{
  "name": "${
    companyName || "Extract company name if mentioned, otherwise null"
  }",
  "industry": "id_from_INDUSTRIES",
  "subIndustry": "optional specific sub-category (free text)",
  "size": "id_from_COMPANY_SIZES",
  "stage": "id_from_COMPANY_STAGES",
  "businessModel": "id_from_BUSINESS_MODELS",
  "techStack": ["React", "Node.js", "PostgreSQL"], // Extract ALL technologies, languages, frameworks, platforms, tools mentioned
  "culture": {
    "values": [
      {
        "name": "Title Case Value Name",
        "description": "Clear 50-150 char description",
        "color": "#HEX_COLOR",
        "icon": "emoji"
      }
    ]
  },
  "confidence": 0.0-1.0
}

CRITICAL RULES:
1. You MUST return IDs, not labels (e.g., "technology" not "Technology", "b2b_saas" not "B2B SaaS")
2. Generate 3-8 company values (MAXIMUM 8) with diverse colors and emojis
3. Values: Title Case names, 50-150 char descriptions, varied colors (#10B981, #3B82F6, #8B5CF6, #EC4899, #F59E0B, #14B8A6, #6366F1, #F97316, #EF4444, #84CC16), relevant emojis (💡🤝🎯🚀⭐💪🔥✨🌟🏆💚🧠👥🎨📈🔒⚡🌍🎓💼)
4. Tech Stack: Extract ALL mentioned technologies, programming languages, frameworks, cloud platforms, databases, and tools from the description. Use proper capitalization (React not react, PostgreSQL not postgres, AWS not aws). If none mentioned, return empty array [].
5. NEVER generate more than 8 company values - quality over quantity

Description: "${description}"

Return ONLY the JSON object, no markdown formatting or explanation.
    `.trim();

    const response = await openai.chat.completions.create({
      model: AI_MODELS.GPT_4_1,
      messages: [
        {
          role: "system",
          content:
            "You are an expert at extracting structured data from unstructured text. You always return valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower for structured extraction
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    const context = JSON.parse(content) as CompanyContext;

    // Enforce maximum 6 company values
    if (context.culture?.values && context.culture.values.length > 6) {
      logger.api.warn("Company values exceed maximum of 6, truncating", {
        original: context.culture.values.length,
        truncated: 6,
      });
      context.culture.values = context.culture.values.slice(0, 6);
    }

    // Preserve the original description for reference and additional AI context
    context.originalDescription = description;

    const generationTime = Date.now() - startTime;

    logger.api.info("Context analysis complete", {
      industry: context.industry,
      size: context.size,
      confidence: context.confidence,
      generationTime,
    });

    return {
      success: true,
      data: context,
      metadata: {
        model: AI_MODELS.GPT_4_1,
        tokensUsed: response.usage?.total_tokens,
        generationTime,
      },
    };
  } catch (error) {
    const generationTime = Date.now() - startTime;
    logger.api.error("Failed to analyze context", { error, generationTime });

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
