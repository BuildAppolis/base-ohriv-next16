/**
 * AI Company Description Generator
 * Generates realistic company descriptions for testing
 */

import { openai, AI_MODELS } from "@/lib/open_ai/client";
import { GenerationResult } from "@/types/old/company_old";
import { serverLogger as logger } from "@/lib/logger";

export async function generateCompanyDescription(): Promise<
  GenerationResult<{ name: string; description: string }>
> {
  const startTime = Date.now();

  try {
    logger.api.info("Generating realistic company description");

    const prompt = `
You are a company owner/hiring manager creating a profile for your company on a hiring platform.

IMPORTANT: Generate a completely RANDOM company from a DIVERSE range of industries. DO NOT default to tech, sustainability, or eco-friendly companies. Mix it up across all possible industries: finance, retail, manufacturing, hospitality, education, construction, logistics, entertainment, legal, consulting, real estate, agriculture, fashion, automotive, aerospace, pharmaceuticals, etc.

Generate a realistic company with:
1. A creative company name (2-4 words, sounds professional but memorable)
2. A complete company description formatted in sections that includes:
   - Industry and what the company does (VARY THE INDUSTRY - don't always pick tech or eco)
   - Company size (1-10, 11-50, 51-200, 201-500, or 500+)
   - Stage (Startup, Growth, Established, or Enterprise)
   - Business model (B2B, B2C, B2B2C, Marketplace, SaaS, etc.)
   - Tech stack: ALWAYS include a relevant tech stack for the company (even non-tech companies use technology)
   - Culture/values
   - Team structure and work environment

TECH STACK REQUIREMENTS:
- EVERY company must include a tech stack in the Company Overview section
- For tech companies: include development frameworks, databases, cloud services
- For non-tech companies: include their operational technology (CRM systems, inventory management, accounting software, communication tools, industry-specific software, etc.)
- Examples:
  * Restaurant: "Toast POS, Square, OpenTable, Google Workspace, Slack"
  * Manufacturing: "SAP ERP, Oracle SCM, Tableau, Microsoft 365, custom IoT monitoring"
  * Retail: "Shopify, Salesforce Commerce Cloud, Klaviyo, Zendesk, Google Analytics"
  * Construction: "Procore, Autodesk Construction Cloud, QuickBooks, Microsoft Teams, Bluebeam"
  * Education: "Canvas LMS, Google Classroom, Zoom, Microsoft 365, Notion"
  * Logistics: "Flexport, SAP TM, Oracle Transportation Management, Tableau, Slack"
  * Finance: "Plaid, Stripe, AWS, React, PostgreSQL, Kubernetes"
  * Consulting: "Salesforce, HubSpot, Microsoft 365, Asana, PowerBI"

Write the description conversationally, as a real person would describe their company - not overly formal or corporate.

Return JSON with this structure:
{
  "name": "Company Name Here",
  "description": "The company description formatted as: 🎯 Company Mission\\nMission text here.\\n\\n💎 Company Values\\nValues text here.\\n\\n🏢 Company Overview\\nOverview text here including tech stack."
}

Example outputs:

Example 1 (healthcare tech):
{
  "name": "HealthBridge Solutions",
  "description": "🎯 Company Mission\\nWe're on a mission to make healthcare accessible and affordable by building AI-powered patient engagement tools to help hospitals reduce readmission rates by 40%.\\n\\n💎 Company Values\\nWe value transparency, patient-first thinking, and data-driven decisions. Our team believes in continuous learning and innovation.\\n\\n🏢 Company Overview\\nWe're a 50-person team in the Series B stage, building B2B SaaS for healthcare providers. We use React, Node.js, PostgreSQL, AWS, and FHIR for healthcare data integration."
}

Example 2 (restaurant chain):
{
  "name": "The Gathered Table",
  "description": "🎯 Company Mission\\nWe're bringing communities together through farm-to-table dining experiences that celebrate local ingredients and sustainable cooking practices.\\n\\n💎 Company Values\\nWe believe in quality ingredients, exceptional service, environmental responsibility, and creating a welcoming atmosphere for everyone.\\n\\n🏢 Company Overview\\nWe're a 25-person restaurant chain with 3 locations, focused on B2C dining experiences. Our tech stack includes Toast POS, OpenTable for reservations, Square payments, 7shifts for scheduling, and Mailchimp for customer engagement."
}

Return ONLY the JSON object, no markdown formatting.
    `.trim();

    const response = await openai.chat.completions.create({
      model: AI_MODELS.GPT_4_1,
      messages: [
        {
          role: "system",
          content:
            "You are a company owner creating a natural, conversational profile for your company. Always return valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.9, // High for variety
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    const result = JSON.parse(content) as { name: string; description: string };
    const generationTime = Date.now() - startTime;

    logger.api.info("Company description generated", {
      name: result.name,
      descriptionLength: result.description.length,
      generationTime,
    });

    return {
      success: true,
      data: { name: result.name, description: result.description },
      metadata: {
        model: AI_MODELS.GPT_4_1,
        tokensUsed: response.usage?.total_tokens,
        generationTime,
      },
    };
  } catch (error) {
    const generationTime = Date.now() - startTime;
    logger.api.error("Failed to generate company description", {
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
