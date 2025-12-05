/**
 * Streaming AI Attribute Generator
 * Generates KSA attributes one-by-one for real-time progress updates
 */

import { openai, AI_MODELS } from "@/lib/open_ai/client";
import {
  CompanyContext,
  RoleDetails,
  GeneratedAttribute,
} from "@/types/company";
import { serverLogger as logger } from "@/lib/logger";

export interface AttributeProgress {
  type: "progress";
  current: number;
  total: number;
  category: string;
  attribute: GeneratedAttribute;
}

export interface AttributeComplete {
  type: "complete";
  attributes: GeneratedAttribute[];
  duration: number;
}

export type AttributeStreamEvent = AttributeProgress | AttributeComplete;

/**
 * Generate attributes one-by-one with progress updates
 */
export async function* streamAttributes(
  context: CompanyContext,
  role: RoleDetails,
  services?: string[]
): AsyncGenerator<AttributeStreamEvent> {
  const startTime = Date.now();

  try {
    // Extract company values
    const cultureValues: string[] = Array.isArray(context.culture.values)
      ? context.culture.values.map((v) => (typeof v === "string" ? v : v.name))
      : [];

    const hasCompanyValues = cultureValues.length > 0;

    // Determine target counts per category
    const targetKSA = hasCompanyValues ? 4 : 6; // 4-6 K/S/A attributes
    const totalKSA = targetKSA;

    logger.api.info("Starting streaming attribute generation", {
      hasCompanyValues,
      valueCount: cultureValues.length,
      targetKSA,
    });

    const allAttributes: GeneratedAttribute[] = [];
    let attributeIndex = 0;

    // Generate K/S/A attributes one-by-one
    const categories: Array<"KNOWLEDGE" | "SKILL" | "ABILITY"> = [
      "KNOWLEDGE",
      "SKILL",
      "ABILITY",
    ];
    const attributesPerCategory = Math.ceil(targetKSA / 3);

    for (const category of categories) {
      for (
        let i = 0;
        i < attributesPerCategory && attributeIndex < targetKSA;
        i++
      ) {
        attributeIndex++;

        const attribute = await generateSingleAttribute(
          context,
          role,
          category,
          services,
          attributeIndex
        );

        allAttributes.push(attribute);

        // Yield progress
        yield {
          type: "progress",
          current: attributeIndex,
          total: totalKSA + cultureValues.length,
          category,
          attribute,
        };
      }
    }

    // Programmatically add VALUE attributes from company values
    if (hasCompanyValues && cultureValues.length > 0) {
      logger.api.info("Adding company values as VALUE attributes", {
        valueCount: cultureValues.length,
        values: cultureValues,
      });

      // Calculate weight per value
      const valueWeightTotal = Math.min(
        25,
        Math.max(15, cultureValues.length * 4)
      );
      const weightPerValue =
        Math.round((valueWeightTotal / cultureValues.length) * 10) / 10;

      // Adjust existing K/S/A weights
      const currentTotal = allAttributes.reduce(
        (sum, attr) => sum + attr.weight,
        0
      );
      const targetKSATotal = 100 - valueWeightTotal;
      const adjustmentFactor = targetKSATotal / currentTotal;

      allAttributes.forEach((attr) => {
        attr.weight = Math.round(attr.weight * adjustmentFactor * 10) / 10;
      });

      // Color palette and icons for values
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

      // Create VALUE attributes
      for (let i = 0; i < cultureValues.length; i++) {
        attributeIndex++;
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

        // Yield progress for value
        yield {
          type: "progress",
          current: attributeIndex,
          total: totalKSA + cultureValues.length,
          category: "VALUE",
          attribute: valueAttribute,
        };
      }
    }

    // Final weight normalization
    const finalTotal = allAttributes.reduce(
      (sum, attr) => sum + attr.weight,
      0
    );
    if (Math.abs(finalTotal - 100) > 0.5) {
      const normalizationFactor = 100 / finalTotal;
      allAttributes.forEach((attr) => {
        attr.weight = Math.round(attr.weight * normalizationFactor * 10) / 10;
      });
    }

    const duration = Date.now() - startTime;

    logger.api.info("Streaming attribute generation complete", {
      totalAttributes: allAttributes.length,
      duration,
    });

    // Yield completion
    yield {
      type: "complete",
      attributes: allAttributes,
      duration,
    };
  } catch (error) {
    logger.api.error("Error in streaming attribute generation", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
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
    ? `
KNOWLEDGE attributes are about "what you know" - technical concepts, domain expertise, theoretical understanding.
Examples: Cloud Architecture Patterns, Regulatory Compliance Knowledge, Data Structures & Algorithms
`
    : category === "SKILL"
    ? `
SKILL attributes are about "what you can do" - practical abilities, technical proficiencies, applied competencies.
Examples: Python Programming, API Design, Database Optimization, Code Review
`
    : `
ABILITY attributes are about "how you work" - cognitive capabilities, problem-solving approaches, adaptability.
Examples: Systems Thinking, Quick Learning, Complex Problem Solving, Pattern Recognition
`
}

Generate ONE ${category} attribute that:
1. Is specific to this role and industry
2. Is measurable through interview questions
3. Has clear sub-attributes that break it down
4. Uses appropriate weight (10-25%)

Return JSON in this exact format:
{
  "attribute": {
    "name": "Specific ${category} Name",
    "description": "What this attribute measures and why it matters for this role",
    "category": "${category}",
    "weight": 15,
    "subAttributes": [
      {
        "name": "Sub-attribute 1 name",
        "description": "What this sub-attribute measures"
      },
      {
        "name": "Sub-attribute 2 name",
        "description": "What this sub-attribute measures"
      },
      {
        "name": "Sub-attribute 3 name",
        "description": "What this sub-attribute measures"
      }
    ]
  }
}`;

  const response = await openai.chat.completions.create({
    model: AI_MODELS.GPT_4_1,
    messages: [
      {
        role: "system",
        content:
          "You are an expert at defining candidate evaluation criteria. Create specific, measurable attributes. Always respond with valid JSON only.",
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

  logger.api.debug("Parsing OpenAI attribute response", {
    contentLength: cleanedContent.length,
    preview: cleanedContent.substring(0, 200),
  });

  let parsed;
  try {
    parsed = JSON.parse(cleanedContent);
  } catch (parseError) {
    logger.api.error("Failed to parse OpenAI attribute JSON response", {
      error:
        parseError instanceof Error ? parseError.message : String(parseError),
      content: cleanedContent,
      originalContent: fullContent,
    });
    throw new Error(
      `Failed to parse OpenAI attribute response as JSON: ${
        parseError instanceof Error ? parseError.message : "Unknown parse error"
      }`
    );
  }
  const attr = parsed.attribute;

  // Validate the response structure
  if (!attr || !attr.name || !attr.description || !attr.category) {
    logger.api.error("Invalid attribute structure from OpenAI", {
      parsed,
      attr,
    });
    throw new Error(
      "Invalid attribute structure returned from OpenAI: missing required fields (name, description, category)"
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

  const generatedAttribute: GeneratedAttribute = {
    id: `attr-${Date.now()}-${attributeIndex || Math.random()}`,
    name: attr.name,
    description: attr.description,
    category: category,
    icon: iconMap[category],
    color: colorMap[category],
    weight: attr.weight || 15,
    subAttributes: attr.subAttributes || [],
  };

  return generatedAttribute;
}
