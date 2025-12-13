/**
 * Company Description Enhancer
 * Takes original description + analysis feedback and generates improved version
 */

import { openai, AI_MODELS } from "@/lib/open_ai/client";
import { serverLogger as logger } from "@/lib/logger";
import type { DescriptionAnalysis } from "./description-analyzer";

export interface EnhancedDescription {
  original: string;
  enhanced: string;
  changes: string[];
}

export async function enhanceCompanyDescription(
  originalDescription: string,
  analysis: DescriptionAnalysis
): Promise<EnhancedDescription> {
  const startTime = Date.now();

  try {
    logger.api.info("Enhancing company description", {
      originalLength: originalDescription.length,
      issuesCount: analysis.issues.length,
    });

    // Build enhancement instructions from analysis
    const suggestedTechStack = analysis.suggestions.techStack?.join(", ") || "";
    const missingDetails = analysis.suggestions.missingDetails || [];
    const warnings = analysis.issues.filter(
      (i) => i.severity === "warning" || i.severity === "suggestion"
    );

    const prompt = `
You are a hiring expert helping improve a company description for AI context generation.

ORIGINAL DESCRIPTION:
"${originalDescription}"

ANALYSIS FEEDBACK:
${
  warnings.length > 0
    ? `Recommendations to address:\n${warnings
        .map((w) => `- ${w.message}: ${w.recommendation}`)
        .join("\n")}`
    : ""
}

${suggestedTechStack ? `\nSuggested Tech Stack: ${suggestedTechStack}` : ""}

${
  missingDetails.length > 0
    ? `\nMissing Details to Add:\n${missingDetails
        .map((d) => `- ${d}`)
        .join("\n")}`
    : ""
}

TASK:
Rewrite the company description to address the feedback above. Follow these rules:

1. **PRESERVE the structured format** - The description uses this format:
   🎯 Company Mission
   [Mission statement here]

   💎 Company Values
   [Values here]

   🏢 Company Overview
   [Overview here]

2. **Keep or add all three sections** - If any section is missing, add it
3. **Incorporate improvements naturally**:
   - Tech Stack → Add to 🏢 Company Overview (e.g., "We use React, Node.js, PostgreSQL")
   - Company size/stage → Add to 🏢 Company Overview
   - Values → Add to 💎 Company Values section
   - Mission details → Enhance 🎯 Company Mission section
4. **Expand vague statements with specifics** while maintaining authenticity
5. **Use first person** ("We're", "Our") to match typical style
6. **Keep the SAME company identity** - don't make up facts, enhance what's there

IMPORTANT:
- Each section should be 1-3 sentences
- Be specific, not generic
- Include the emoji headers exactly as shown above
- Maintain line breaks between sections

Return JSON with this structure:
{
  "enhanced": "🎯 Company Mission\\n[Mission text]\\n\\n💎 Company Values\\n[Values text]\\n\\n🏢 Company Overview\\n[Overview text]",
  "changes": ["Added tech stack: React, Node.js, PostgreSQL", "Specified company size: 30-person team", "Added company values: sustainability, transparency"]
}

Return ONLY the JSON object, no markdown formatting.
    `.trim();

    const response = await openai.chat.completions.create({
      model: AI_MODELS.GPT_4_1,
      messages: [
        {
          role: "system",
          content:
            "You are an expert at improving business descriptions. You enhance clarity and add missing details while maintaining authenticity and tone.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
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

    logger.api.info("Description enhancement complete", {
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
    logger.api.error("Failed to enhance description", {
      error,
      generationTime,
    });
    throw error;
  }
}
