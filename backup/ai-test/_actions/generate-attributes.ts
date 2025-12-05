"use server";

import { openai } from "@/lib/open_ai/client";
import type {
  CompanyContext,
  RoleDetails,
  GeneratedAttribute,
} from "../_types";
import { serverLogger as logger } from "@/lib/logger";

export interface AttributeGenerationRequest {
  context: CompanyContext;
  role: RoleDetails;
  services?: string[];
  currentIndex?: number; // Track current position in generation
}

export interface AttributeGenerationResult {
  success: boolean;
  attributes?: GeneratedAttribute[];
  error?: string;
  progress?: {
    current: number;
    total: number;
    category: string;
    attribute: GeneratedAttribute;
  };
}

/**
 * Generate attributes one by one for real-time progress updates
 * This is the server action that client components can call
 * Each call returns either progress (single item) or completion (all items)
 */
export async function generateAttributesWithProgress(
  request: AttributeGenerationRequest
): Promise<AttributeGenerationResult> {
  const { context, role, services, currentIndex = 0 } = request;

  try {
    logger.api.info("Starting attribute generation with progress", {
      role: role.title,
      hasServices: !!services?.length,
      currentIndex,
    });

    // Extract company values
    const cultureValues: string[] = Array.isArray(context.culture.values)
      ? context.culture.values.map((v) => (typeof v === "string" ? v : v.name))
      : [];

    const hasCompanyValues = cultureValues.length > 0;
    const MAX_TOTAL_ATTRIBUTES = 10; // Maximum total attributes per job
    const availableSlotsForKSA = Math.max(
      0,
      MAX_TOTAL_ATTRIBUTES - cultureValues.length
    );
    const targetKSA = Math.min(6, availableSlotsForKSA); // Cap KSA attributes based on remaining slots

    // Generate ALL attributes at once in parallel batches
    const allAttributes: GeneratedAttribute[] = [];
    let attributeIndex = 0;

    // Generate K/S/A attributes in batches (parallel within categories)
    const categories: Array<"KNOWLEDGE" | "SKILL" | "ABILITY"> = [
      "KNOWLEDGE",
      "SKILL",
      "ABILITY",
    ];
    const attributesPerCategory = Math.ceil(targetKSA / 3);

    for (const category of categories) {
      const categoryPromises: Promise<GeneratedAttribute>[] = [];

      for (
        let i = 0;
        i < attributesPerCategory && attributeIndex < targetKSA;
        i++
      ) {
        attributeIndex++;
        categoryPromises.push(
          generateSingleAttribute(
            context,
            role,
            category,
            services,
            attributeIndex
          )
        );
      }

      // Wait for all attributes in this category to complete in parallel
      const categoryAttributes = await Promise.all(categoryPromises);
      allAttributes.push(...categoryAttributes);
    }

    // Handle company values
    if (hasCompanyValues && cultureValues.length > 0) {
      const valueWeightTotal = Math.min(
        25,
        Math.max(15, cultureValues.length * 4)
      );
      const weightPerValue =
        Math.round((valueWeightTotal / cultureValues.length) * 10) / 10;

      const currentTotal = allAttributes.reduce(
        (sum, attr) => sum + attr.weight,
        0
      );
      const targetKSATotal = 100 - valueWeightTotal;
      const adjustmentFactor = targetKSATotal / currentTotal;

      allAttributes.forEach((attr) => {
        attr.weight = Math.round(attr.weight * adjustmentFactor * 10) / 10;
      });

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

      for (let i = 0; i < cultureValues.length; i++) {
        const valueName = cultureValues[i];

        const valueAttribute: GeneratedAttribute = {
          id: `value-${i}`,
          name: valueName,
          description: `Demonstrates commitment to ${valueName.toLowerCase()} in daily work and decision-making`,
          category: "VALUE" as const,
          icon: valueIcons[i % valueIcons.length],
          color: valueColors[i % valueColors.length],
          weight: weightPerValue,
          subAttributes: [],
        };

        allAttributes.push(valueAttribute);
      }
    }

    // Return progress or completion based on currentIndex
    if (currentIndex < allAttributes.length) {
      // Return single attribute progress
      const currentAttribute = allAttributes[currentIndex];

      logger.api.info("Attribute generation progress", {
        current: currentIndex + 1,
        total: allAttributes.length,
        attributeName: currentAttribute.name,
      });

      return {
        success: true,
        progress: {
          current: currentIndex + 1,
          total: allAttributes.length,
          category: currentAttribute.category,
          attribute: currentAttribute,
        },
      };
    } else {
      // All attributes completed
      logger.api.info("Attribute generation complete", {
        totalAttributes: allAttributes.length,
      });

      return {
        success: true,
        attributes: allAttributes,
      };
    }
  } catch (error) {
    logger.api.error("Error in attribute generation", {
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
 * Generate a single attribute
 */
async function generateSingleAttribute(
  context: CompanyContext,
  role: RoleDetails,
  category: "KNOWLEDGE" | "SKILL" | "ABILITY",
  services?: string[],
  attributeIndex?: number
): Promise<GeneratedAttribute> {
  const prompt = `Generate a single ${category} attribute for evaluating candidates for this role.

COMPANY CONTEXT:
- Industry: ${context.industry}
- Size: ${context.size}
- Stage: ${context.stage}
- Business Model: ${context.businessModel}
- Tech Stack: ${context.techStack.join(", ")}

ROLE DETAILS:
- Title: ${role.title}
- Level: ${role.jobLevel || role.seniorityLevel || "Not specified"}
- Responsibilities: ${role.responsibilities?.join(", ") || "Not specified"}
- Required Skills: ${role.technicalSkills?.join(", ") || "Not specified"}
${
  services && services.length > 0
    ? `- Tools/Services: ${services.join(", ")}`
    : ""
}

CATEGORY: ${category}

${
  category === "KNOWLEDGE"
    ? `KNOWLEDGE attributes are about "what you know" - technical concepts, domain expertise, theoretical understanding.`
    : category === "SKILL"
    ? `SKILL attributes are about "what you can do" - practical abilities, technical proficiencies, applied competencies.`
    : `ABILITY attributes are about "how you work" - cognitive capabilities, problem-solving approaches, adaptability.`
}

Generate ONE ${category} attribute that is specific to this role and industry, measurable through interview questions, and has clear sub-attributes.

IMPORTANT: The description should be concise and direct. Do NOT start with "This attribute measures..." or similar phrases. Just describe the attribute directly.

Return JSON in this exact format:
{
  "name": "Specific ${category} Name",
  "description": "Direct description of the attribute without prefixes like 'This attribute measures'",
  "weight": 15,
  "subAttributes": [
    {"name": "Sub-attribute 1", "description": "Direct description of what this sub-attribute assesses"},
    {"name": "Sub-attribute 2", "description": "Direct description of what this sub-attribute assesses"},
    {"name": "Sub-attribute 3", "description": "Direct description of what this sub-attribute assesses"}
  ]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an expert at defining candidate evaluation criteria. Create specific, measurable attributes. Write descriptions directly without prefixes like 'This attribute measures...' or similar verbose phrases. Always respond with valid JSON only.",
      },
      {
        role: "user",
        content:
          prompt +
          "\n\nIMPORTANT: Respond with valid JSON only. No markdown formatting, no code blocks, just raw JSON.",
      },
    ],
    temperature: 0.7,
    max_tokens: 500,
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
    logger.api.error("Failed to parse OpenAI attribute JSON response", {
      error:
        parseError instanceof Error ? parseError.message : String(parseError),
      content: cleanedContent,
    });
    throw new Error(
      `Failed to parse OpenAI attribute response as JSON: ${
        parseError instanceof Error ? parseError.message : "Unknown parse error"
      }`
    );
  }

  // Icon and color assignment
  const iconMap = {
    KNOWLEDGE: "BookOpen",
    SKILL: "Wrench",
    ABILITY: "Zap",
  };

  const colorMap = {
    KNOWLEDGE: "#3B82F6",
    SKILL: "#10B981",
    ABILITY: "#8B5CF6",
  };

  return {
    id: `attr-${Date.now()}-${attributeIndex || Math.random()}`,
    name: parsed.name,
    description: parsed.description,
    category: category,
    icon: iconMap[category],
    color: colorMap[category],
    weight: parsed.weight || 15,
    subAttributes: parsed.subAttributes || [],
  };
}
