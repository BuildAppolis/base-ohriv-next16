/**
 * Company Description Analyzer
 * Validates and analyzes company descriptions for completeness and clarity
 * before generating full context
 */

import { openai, AI_MODELS } from "../../../../lib/open_ai/client";
import { serverLogger as logger } from "@/lib/logger";

export interface DescriptionIssue {
  severity: "blocking" | "warning" | "suggestion";
  category: "tech_stack" | "values" | "clarity" | "size" | "industry";
  message: string;
  recommendation: string;
  examples?: string[];
}

export interface MissingDetail {
  question: string;
  rationale: string;
  examples: string[];
}

export interface DescriptionAnalysis {
  isComplete: boolean;
  canProceed: boolean;
  clarity: "clear" | "vague" | "insufficient";
  extractedInfo: {
    industry?: string;
    size?: string;
    hasTechStack: boolean;
    hasValues: boolean;
  };
  issues: DescriptionIssue[];
  suggestions: {
    techStack?: string[];
    missingDetails?: MissingDetail[];
  };
}

export async function analyzeCompanyDescription(
  description: string
): Promise<DescriptionAnalysis> {
  const startTime = Date.now();

  try {
    logger.api.info("Analyzing company description quality", {
      descriptionLength: description.length,
    });

    const prompt = `
You are a hiring expert analyzing a company description for completeness and clarity.

Company Description:
"${description}"

Analyze this description and determine:

1. TECH STACK ASSESSMENT:
   - First, determine if this is a tech/software company or a non-tech company
   - Tech companies: Technology, Software, SaaS, FinTech, HealthTech, EdTech, E-commerce platforms, etc.
   - Non-tech companies: Retail stores, restaurants, hospitality, physical services, traditional manufacturing, etc.

   For ALL COMPANIES:
   - Tech stack information should be identified if mentioned
   - VALID tech stack includes:
     * Development technologies: React, Python, PostgreSQL, AWS, Docker, Node.js, TypeScript
     * Business/operational software: Shopify, HubSpot, Salesforce, Slack, Adobe Creative Suite
     * Industry-specific tools: Toast POS, SAP, Epic Systems, Canvas LMS
   - Examples of INVALID (too vague): "solar technology", "renewable energy systems", "innovative solutions"
   - Look for specific product names, software, platforms, or technical tools

   For TECH COMPANIES:
   - Tech stack is REQUIRED (blocking if missing)
   - Expect to see development frameworks, databases, cloud services

   For NON-TECH COMPANIES:
   - Tech stack is OPTIONAL (warning if missing, not blocking)
   - They might use business software, CRM, POS systems, industry tools
   - Example: A restaurant might use Square, Toast, or OpenTable for POS/operations
   - When suggesting, ALWAYS use specific product names, not categories:
     * Instead of "CRM Software" → "Salesforce", "HubSpot", "Zoho CRM"
     * Instead of "event management platforms" → "Eventbrite", "Cvent", "Ticketmaster"
     * Instead of "accounting software" → "QuickBooks", "Xero", "FreshBooks"
     * Instead of "project management tools" → "Asana", "Trello", "Monday.com"

2. COMPANY VALUES ASSESSMENT:
   - Are specific company values mentioned? (e.g., "sustainability", "transparency", "innovation")
   - OR is it vague/generic? (e.g., "we're passionate", "we care")

3. CLARITY ASSESSMENT:
   - Is the company's actual business model clear?
   - Is their operational structure described?
   - Minimum 200 characters with substantive detail recommended

4. WHAT'S MISSING:
   - What critical information is missing or unclear?
   - What specific questions would help clarify?
   - Prioritize missing: tech stack (for tech companies), company values

5. TECH STACK SUGGESTION GUIDELINES:
   - When suggesting tech stack for non-tech companies, think about what tools they'd actually use
   - E-commerce: "Shopify", "WooCommerce", "Magento", "BigCommerce", "Stripe"
   - Restaurants: "Square", "Toast POS", "OpenTable", "Resy", "SevenRooms"
   - Professional Services: "Salesforce", "HubSpot", "Slack", "Microsoft 365", "Asana"
   - Retail: "Lightspeed", "Shopify POS", "Square", "QuickBooks", "Mailchimp"
   - Healthcare: "Epic Systems", "Cerner", "Athenahealth", "Zocdoc", "WebPT"
   - Education: "Canvas", "Blackboard", "Google Classroom", "Zoom", "Khan Academy"
   - Manufacturing: "SAP", "Oracle", "Salesforce", "Autodesk", "Monday.com"

Return JSON with this EXACT structure:
{
  "isComplete": boolean, // true if description is detailed and clear
  "canProceed": boolean, // false if tech stack is missing or description is too vague
  "clarity": "clear" | "vague" | "insufficient",
  "extractedInfo": {
    "industry": "string or null",
    "size": "string or null",
    "hasTechStack": boolean, // true if any specific tech stack mentioned (development tools OR business software)
    "hasValues": boolean // true if specific values mentioned
  },
  "issues": [
    {
      "severity": "blocking" | "warning" | "suggestion",
      "category": "tech_stack" | "values" | "clarity" | "size" | "industry",
      "message": "Clear description of the issue",
      "recommendation": "Specific actionable recommendation",
      "examples": ["example 1", "example 2"] // optional, helpful examples
    }
  ],
  "suggestions": {
    "techStack": ["suggested", "technologies"], // if can infer from industry
    "missingDetails": [ // if clarity is lacking, provide detailed questions with context
      {
        "question": "What specific question needs to be answered?",
        "rationale": "Why is this information important for understanding the company?",
        "examples": ["Example answer 1", "Example answer 2", "Example answer 3"]
      }
    ]
  }
}

MISSING DETAILS GUIDELINES:
- When generating missingDetails, provide thoughtful, contextual questions
- Each question should include:
  * question: A clear, specific question that helps clarify the company
  * rationale: 1-2 sentences explaining WHY this information matters for hiring/understanding the role
  * examples: 3 concrete example answers that show what a good response looks like
- Make questions relevant to the specific industry and company description
- Focus on company-level details that would matter to candidates (culture, tools, values, impact)
- Examples should be realistic and diverse (not all the same type)

CRITICAL RULES:
- Determine if company is tech-focused or non-tech first
- Tech stack includes both development technologies (React, Python, AWS) AND business software (Shopify, HubSpot, Salesforce)
- Look for specific product names, software platforms, or technical tools mentioned in the description
- For TECH COMPANIES: missing tech stack = BLOCKING issue
- For NON-TECH COMPANIES: missing tech stack = WARNING (suggest if helpful, but don't block)
- If description is under 200 chars or very vague, set clarity="insufficient" and add BLOCKING issue
- If description is vague but has some detail, set clarity="vague" and add WARNING issues
- Be strict: it's better to ask for clarification than to proceed with bad data
- IMPORTANT: ALWAYS suggest specific product names, NOT generic categories:
  * NEVER suggest "CRM Software" → suggest "Salesforce" or "HubSpot"
  * NEVER suggest "project management" → suggest "Asana" or "Monday.com"
  * NEVER suggest "accounting tools" → suggest "QuickBooks" or "Xero"
  * Use real, well-known products and services relevant to the industry

Return ONLY the JSON object, no markdown formatting.
    `.trim();

    const response = await openai.chat.completions.create({
      model: AI_MODELS.GPT_4_1,
      messages: [
        {
          role: "system",
          content:
            "You are an expert at analyzing text for completeness and clarity. You always return valid JSON and are strict about quality requirements.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    const analysis = JSON.parse(content) as DescriptionAnalysis;
    const generationTime = Date.now() - startTime;

    logger.api.info("Description analysis complete", {
      canProceed: analysis.canProceed,
      clarity: analysis.clarity,
      issuesCount: analysis.issues.length,
      blockingIssues: analysis.issues.filter((i) => i.severity === "blocking")
        .length,
      generationTime,
    });

    return analysis;
  } catch (error) {
    const generationTime = Date.now() - startTime;
    logger.api.error("Failed to analyze company description", {
      error,
      generationTime,
    });

    // Return a safe default that blocks generation
    return {
      isComplete: false,
      canProceed: false,
      clarity: "insufficient",
      extractedInfo: {
        hasTechStack: false,
        hasValues: false,
      },
      issues: [
        {
          severity: "blocking",
          category: "clarity",
          message: "Unable to analyze description due to technical error",
          recommendation: "Please try again or contact support",
        },
      ],
      suggestions: {},
    };
  }
}
