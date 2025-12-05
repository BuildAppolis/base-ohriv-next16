/* eslint-disable @typescript-eslint/no-explicit-any */
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
 * ULTRA-OPTIMIZED: Generate multiple attributes in single API calls
 * This version generates all attributes of the same category in one API call
 */
export async function generateAttributesWithProgressOptimized(
  request: AttributeGenerationRequest
): Promise<AttributeGenerationResult> {
  const { context, role, services, currentIndex = 0 } = request;

  try {
    logger.api.info("Starting optimized attribute generation", {
      role: role.title,
      hasServices: !!services?.length,
      currentIndex,
    });

    // Extract company values
    const cultureValues: string[] = Array.isArray(context.culture.values)
      ? context.culture.values.map((v) => (typeof v === "string" ? v : v.name))
      : [];

    const hasCompanyValues = cultureValues.length > 0;
    const MAX_TOTAL_ATTRIBUTES = 10;
    const availableSlotsForKSA = Math.max(
      0,
      MAX_TOTAL_ATTRIBUTES - cultureValues.length
    );
    const targetKSA = Math.min(6, availableSlotsForKSA);

    // Generate all KSA attributes in batch API calls (one per category)
    const allAttributes: GeneratedAttribute[] = [];
    let totalGenerated = 0;

    // Batch generate KNOWLEDGE attributes
    const knowledgeCount = Math.ceil(targetKSA / 3);
    if (knowledgeCount > 0) {
      const knowledgeAttributes = await generateAttributeBatch(
        context,
        role,
        "KNOWLEDGE",
        knowledgeCount,
        services,
        totalGenerated
      );
      allAttributes.push(...knowledgeAttributes);
      totalGenerated += knowledgeAttributes.length;
    }

    // Batch generate SKILL attributes
    const skillCount = Math.ceil(targetKSA / 3);
    if (skillCount > 0) {
      const skillAttributes = await generateAttributeBatch(
        context,
        role,
        "SKILL",
        skillCount,
        services,
        totalGenerated
      );
      allAttributes.push(...skillAttributes);
      totalGenerated += skillAttributes.length;
    }

    // Batch generate ABILITY attributes
    const abilityCount = targetKSA - (knowledgeCount + skillCount);
    if (abilityCount > 0) {
      const abilityAttributes = await generateAttributeBatch(
        context,
        role,
        "ABILITY",
        abilityCount,
        services,
        totalGenerated
      );
      allAttributes.push(...abilityAttributes);
      totalGenerated += abilityAttributes.length;
    }

    // Handle company values (these are deterministic, no API call needed)
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

    logger.api.info("Optimized attribute generation complete", {
      totalAttributes: allAttributes.length,
      apiCalls: 3, // Much fewer API calls!
    });

    // Return progress or completion based on currentIndex
    if (currentIndex < allAttributes.length) {
      // Return single attribute progress for streaming
      const currentAttribute = allAttributes[currentIndex];

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
      return {
        success: true,
        attributes: allAttributes,
      };
    }
  } catch (error) {
    logger.api.error("Error in optimized attribute generation", {
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
 * Generate multiple attributes of the same category in a single API call
 */
async function generateAttributeBatch(
  context: CompanyContext,
  role: RoleDetails,
  category: "KNOWLEDGE" | "SKILL" | "ABILITY",
  count: number,
  services?: string[],
  startIndex: number = 0
): Promise<GeneratedAttribute[]> {
  const prompt = `Generate ${count} ${category.toLowerCase()} attributes for evaluating candidates for this role.

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

Generate ${count} distinct ${category} attributes that are:
1. Specific to this role and industry
2. Measurable through interview questions
3. Have clear sub-attributes for evaluation
4. Unique from each other

IMPORTANT: The descriptions should be concise and direct. Do NOT start with "This attribute measures..." or similar phrases. Just describe the attribute directly.

Return JSON in this exact format:
{
  "attributes": [
    {
      "name": "Specific ${category} Name 1",
      "description": "Direct description without prefixes",
      "weight": 15,
      "subAttributes": [
        {"name": "Sub-attribute 1", "description": "What this sub-attribute assesses"},
        {"name": "Sub-attribute 2", "description": "What this sub-attribute assesses"},
        {"name": "Sub-attribute 3", "description": "What this sub-attribute assesses"}
      ]
    },
    {
      "name": "Specific ${category} Name 2",
      "description": "Direct description without prefixes",
      "weight": 15,
      "subAttributes": [
        {"name": "Sub-attribute 1", "description": "What this sub-attribute assesses"},
        {"name": "Sub-attribute 2", "description": "What this sub-attribute assesses"},
        {"name": "Sub-attribute 3", "description": "What this sub-attribute assesses"}
      ]
    }
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
    max_tokens: 2000, // Increased token limit for batch generation
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
    logger.api.error("Failed to parse OpenAI batch attribute JSON response", {
      error:
        parseError instanceof Error ? parseError.message : String(parseError),
      content: cleanedContent,
    });
    throw new Error(
      `Failed to parse OpenAI batch attribute response as JSON: ${
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

  // Transform the response into GeneratedAttribute objects
  return (parsed.attributes || []).map((attr: any, index: number) => ({
    id: `attr-${Date.now()}-${startIndex + index}`,
    name: attr.name,
    description: attr.description,
    category: category,
    icon: iconMap[category],
    color: colorMap[category],
    weight: attr.weight || 15,
    subAttributes: attr.subAttributes || [],
  }));
}
