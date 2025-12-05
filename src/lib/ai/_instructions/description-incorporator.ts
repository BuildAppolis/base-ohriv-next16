/**
 * Company Description Incorporator
 * Takes existing description + specific additions and weaves them in naturally
 */

import { openai, AI_MODELS } from "@/lib/open_ai/client";
import { serverLogger as logger } from "@/lib/logger";

export interface DescriptionIncorporation {
  original: string;
  enhanced: string;
  changes: string[];
}

export interface AdditionContext {
  techStack?: string[];
  additionalInfo?: Record<string, string>; // key: field name, value: content to add
}

export async function incorporateAdditions(
  originalDescription: string,
  additions: AdditionContext
): Promise<DescriptionIncorporation> {
  const startTime = Date.now();

  try {
    logger.api.info("Incorporating additions into description", {
      originalLength: originalDescription.length,
      hasTechStack: !!additions.techStack,
      additionalInfoCount: Object.keys(additions.additionalInfo || {}).length,
    });

    // Build additions list
    const additionsList: string[] = [];

    if (additions.techStack && additions.techStack.length > 0) {
      additionsList.push(`- Tech Stack: ${additions.techStack.join(", ")}`);
    }

    if (additions.additionalInfo) {
      Object.entries(additions.additionalInfo).forEach(([key, value]) => {
        if (value.trim()) {
          additionsList.push(`- ${key}: ${value}`);
        }
      });
    }

    if (additionsList.length === 0) {
      // Nothing to add, return original
      return {
        original: originalDescription,
        enhanced: originalDescription,
        changes: [],
      };
    }

    const prompt = `
You are helping improve a company description by incorporating additional information.

ORIGINAL DESCRIPTION:
"${originalDescription}"

NEW INFORMATION TO ADD:
${additionsList.join("\n")}

TASK:
Rewrite the description to naturally incorporate the new information above. Follow these rules:

1. PRESERVE the existing structure and format (🎯 Company Mission, 💎 Company Values, 🏢 Company Overview sections)
2. DO NOT change or remove existing information - only ADD the new information
3. Weave the new information naturally into the appropriate sections:
   - Tech Stack → Goes in 🏢 Company Overview section
   - Company size, stage, team info → Goes in 🏢 Company Overview
   - Values → Goes in 💎 Company Values section
   - Mission-related info → Goes in 🎯 Company Mission section
4. Keep the same tone and style as the original
5. Make it flow naturally - don't just append at the end

IMPORTANT: Return the complete enhanced description with the same section structure.

Return JSON with this structure:
{
  "enhanced": "The improved description with new information incorporated...",
  "changes": ["Added tech stack: React, Node.js", "Added team size information"]
}

Return ONLY the JSON object, no markdown formatting.
    `.trim();

    const response = await openai.chat.completions.create({
      model: AI_MODELS.GPT_4_1,
      messages: [
        {
          role: "system",
          content:
            "You are an expert at incorporating new information into text while maintaining style and structure.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower for consistency
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    const result = JSON.parse(content) as {
      enhanced: string;
      changes: string[];
    };
    const generationTime = Date.now() - startTime;

    logger.api.info("Description incorporation complete", {
      originalLength: originalDescription.length,
      enhancedLength: result.enhanced.length,
      changesCount: result.changes.length,
      generationTime,
    });

    return {
      original: originalDescription,
      enhanced: result.enhanced,
      changes: result.changes,
    };
  } catch (error) {
    const generationTime = Date.now() - startTime;
    logger.api.error("Failed to incorporate additions", {
      error,
      generationTime,
    });
    throw error;
  }
}
