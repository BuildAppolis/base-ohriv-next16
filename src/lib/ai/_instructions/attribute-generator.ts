/**
 * AI Attribute Generator
 * Creates tailored evaluation attributes based on role and company context
 */

import { openai, AI_MODELS } from "@/lib/open_ai/client";
import {
  CompanyContext,
  RoleDetails,
  GeneratedAttribute,
  GenerationResult,
} from "@/types/company_old";
import { serverLogger as logger } from "@/lib/logger";

export async function generateAttributes(
  context: CompanyContext,
  role: RoleDetails,
  companyValues?: string[],
  services?: string[]
): Promise<GenerationResult<GeneratedAttribute[]>> {
  const startTime = Date.now();

  // Use company values from context if not explicitly provided
  const valuesToUse = companyValues || context.culture.values;

  // Extract value names from objects or strings
  const valueNames = valuesToUse.map((v) =>
    typeof v === "string" ? v : v.name
  ) as string[];
  const hasCompanyValues = valueNames.length > 0;

  try {
    logger.api.info("Generating attributes", {
      industry: context.industry,
      role: role.title,
      companyValuesCount: valueNames.length,
      servicesCount: services?.length || 0,
      valueNames: valueNames,
    });

    const prompt = `
Generate evaluation attributes for hiring a ${role.title} at ${
      context.name
        ? `${context.name}, a ${context.industry} company`
        : `a ${context.industry} company`
    } using the KSA Framework.

Company Context:
${context.name ? `- Company Name: ${context.name}` : ""}
- Size: ${context.size}
- Stage: ${context.stage}
- Culture: ${JSON.stringify(context.culture)}
- Tech Stack: ${context.techStack.join(", ")}
- Business Model: ${context.businessModel}
${
  context.originalDescription
    ? `\n- Original Company Description: "${context.originalDescription}"`
    : ""
}
${
  context.customContext
    ? `\n- Additional Context: "${context.customContext}"`
    : ""
}

Role: ${role.title}
${role.additionalDetails ? `Additional Details: ${role.additionalDetails}` : ""}
${
  services && services.length > 0
    ? `Tools/Services Used: ${services.join(", ")}`
    : ""
}

KSA FRAMEWORK (Knowledge-Skills-Abilities):
- KNOWLEDGE: What they know (technical expertise, domain knowledge, understanding)
- SKILL: What they can do (proficiency in tasks, execution, capabilities)
- ABILITY: How they work (problem-solving, learning agility, critical thinking, adaptability)

${
  hasCompanyValues
    ? `
NOTE: Company has ${valueNames.length} core values that will be added as VALUE attributes separately.
Your job is to generate only KNOWLEDGE, SKILL, and ABILITY attributes.
Do NOT create VALUE category attributes - these will be added automatically from company values.
`
    : "Generate VALUE attributes for culture fit if no company values are provided."
}

Generate 4-6 attributes based on KSA attributes needed specifically from impact & scope defaulting to the positions level, if none available, then utilize the base inputs, with the following requirements:
1. ${
      hasCompanyValues
        ? "ONLY generate KNOWLEDGE, SKILL, and ABILITY categories (NO VALUE attributes)"
        : "Include all four categories (KNOWLEDGE, SKILL, ABILITY, VALUE)"
    }
2. Suggested distribution : ${
      hasCompanyValues
        ? "40-50% KNOWLEDGE, 30-40% SKILL, 20-30% ABILITY"
        : "30-40% KNOWLEDGE, 25-35% SKILL, 20-30% ABILITY, 10-20% VALUE"
    }
3. Weights must total EXACTLY 100%
4. Each attribute must have:
   - name: concise, 2-4 words
   - category: MUST be one of "KNOWLEDGE", "SKILL", "ABILITY", or "VALUE"
   - description: clear, actionable (50-150 characters)
   - icon: valid Lucide icon name (e.g., "Code", "Brain", "MessageSquare", "Lightbulb", "Users")
   - color: valid hex code
   - weight: percentage (all weights must sum to 100)
   - subAttributes: array (optional) with name and description

Return JSON in this format:
{
  "attributes": [
    {
      "name": "Technical Expertise",
      "category": "KNOWLEDGE",
      "description": "Proficiency in required technologies and best practices",
      "icon": "Code",
      "color": "#3B82F6",
      "weight": 35,
      "subAttributes": [
        {
          "name": "Frontend Skills",
          "description": "React, TypeScript, CSS expertise"
        },
        {
          "name": "Backend Skills",
          "description": "Node.js, APIs, Database design"
        }
      ]
    },
    {
      "name": "Problem Solving",
      "category": "ABILITY",
      "description": "Analytical thinking and creative solution development",
      "icon": "Lightbulb",
      "color": "#F59E0B",
      "weight": 25
    }
  ]
}

CRITICAL REQUIREMENTS:
1. Every attribute MUST have a "category" field with one of these exact values: "KNOWLEDGE", "SKILL", "ABILITY"${
      hasCompanyValues ? "" : ', "VALUE"'
    }
2. Weights must sum to EXACTLY 100%
${
  hasCompanyValues
    ? `3. Do NOT include any VALUE category attributes - company values will be added separately`
    : ""
}

Return ONLY the JSON object, no markdown formatting.
    `.trim();

    const response = await openai.chat.completions.create({
      model: AI_MODELS.GPT_4_1,
      messages: [
        {
          role: "system",
          content: hasCompanyValues
            ? "You are an expert talent acquisition consultant specializing in the KSA (Knowledge-Skills-Abilities) framework for structured hiring. Generate ONLY KNOWLEDGE, SKILL, and ABILITY attributes. Do NOT create VALUE attributes as these will be added separately from company values. Ensure attribute weights sum to exactly 100%."
            : "You are an expert talent acquisition consultant specializing in the KSAV (Knowledge-Skills-Abilities-Values) framework for structured hiring. You ensure: 1) All four categories (KNOWLEDGE, SKILL, ABILITY, VALUE) are represented, 2) Attribute weights sum to exactly 100%, 3) Each attribute has a clear category classification.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    const parsed = JSON.parse(content);
    let attributes = parsed.attributes as GeneratedAttribute[];

    // Add company values as VALUE attributes if provided
    if (hasCompanyValues && valueNames.length > 0) {
      logger.api.info("Adding company values as VALUE attributes", {
        valueCount: valueNames.length,
        values: valueNames,
      });

      // Calculate weight per value (distribute 15-25% across all values)
      const valueWeightTotal = Math.min(
        25,
        Math.max(15, valueNames.length * 4)
      );
      const weightPerValue =
        Math.round((valueWeightTotal / valueNames.length) * 10) / 10;

      // Adjust existing attributes' weights to make room for values
      const currentTotal = attributes.reduce(
        (sum, attr) => sum + attr.weight,
        0
      );
      const targetKSATotal = 100 - valueWeightTotal;
      const adjustmentFactor = targetKSATotal / currentTotal;

      attributes = attributes.map((attr) => ({
        ...attr,
        weight: Math.round(attr.weight * adjustmentFactor * 10) / 10,
      }));

      // Color palette for values
      const valueColors = [
        "#10B981",
        "#3B82F6",
        "#8B5CF6",
        "#F59E0B",
        "#EC4899",
        "#14B8A6",
        "#F97316",
        "#6366F1",
      ];
      const valueIcons = [
        "Heart",
        "Sparkles",
        "Users",
        "Target",
        "Award",
        "Gem",
        "Star",
        "Shield",
      ];

      // Add VALUE attributes
      const valueAttributes: GeneratedAttribute[] = valueNames.map(
        (valueName, index) => ({
          id: `value-${index}`,
          name: valueName,
          description: `Demonstrates commitment to ${valueName.toLowerCase()} in daily work and decision-making`,
          category: "VALUE" as const,
          icon: valueIcons[index % valueIcons.length],
          color: valueColors[index % valueColors.length],
          weight: weightPerValue,
          subAttributes: [],
        })
      );

      attributes.push(...valueAttributes);

      logger.api.info("VALUE attributes added", {
        totalAttributes: attributes.length,
        valueAttributes: valueAttributes.map((v) => v.name),
      });
    }

    // Validate all attributes have categories
    const missingCategory = attributes.find((attr) => !attr.category);
    if (missingCategory) {
      throw new Error(
        `Attribute "${missingCategory.name}" is missing a category field`
      );
    }

    // Validate categories are valid
    const validCategories = ["KNOWLEDGE", "SKILL", "ABILITY", "VALUE"];
    const invalidCategory = attributes.find(
      (attr) => !validCategories.includes(attr.category)
    );
    if (invalidCategory) {
      throw new Error(
        `Attribute "${invalidCategory.name}" has invalid category: ${invalidCategory.category}`
      );
    }

    // Validate weights sum to 100
    const totalWeight = attributes.reduce((sum, attr) => sum + attr.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.1) {
      logger.api.warn("Attribute weights do not sum to 100, normalizing", {
        originalTotal: totalWeight,
      });

      // Normalize weights
      const factor = 100 / totalWeight;
      attributes.forEach((attr) => {
        attr.weight = Math.round(attr.weight * factor * 10) / 10;
      });

      // Fix rounding errors by adjusting largest weight
      const newTotal = attributes.reduce((sum, attr) => sum + attr.weight, 0);
      if (Math.abs(newTotal - 100) > 0.01) {
        const largest = attributes.reduce((max, attr) =>
          attr.weight > max.weight ? attr : max
        );
        largest.weight =
          Math.round((largest.weight + (100 - newTotal)) * 10) / 10;
      }
    }

    const generationTime = Date.now() - startTime;

    // Calculate category distribution
    const categoryDistribution = attributes.reduce((acc, attr) => {
      acc[attr.category] = (acc[attr.category] || 0) + attr.weight;
      return acc;
    }, {} as Record<string, number>);

    logger.api.info("Attribute generation complete", {
      count: attributes.length,
      totalWeight: attributes.reduce((sum, attr) => sum + attr.weight, 0),
      categoryDistribution,
      generationTime,
    });

    return {
      success: true,
      data: attributes,
      metadata: {
        model: AI_MODELS.GPT_4_1,
        tokensUsed: response.usage?.total_tokens,
        generationTime,
      },
    };
  } catch (error) {
    const generationTime = Date.now() - startTime;
    logger.api.error("Failed to generate attributes", {
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
