/**
 * AI Job Template Generator
 * Creates complete job templates with descriptions and requirements
 */

import { openai, AI_MODELS } from "@/lib/open_ai/client";
import {
  CompanyContext,
  RoleDetails,
  GeneratedAttribute,
  GeneratedJobTemplate,
  GenerationResult,
} from "@/types/company_old";
import { serverLogger as logger } from "@/lib/logger";

export interface LevelAssignment {
  id: string;
  level: string;
  positionCount: number;
}

export async function generateJobTemplate(
  context: CompanyContext,
  role: RoleDetails,
  attributes: GeneratedAttribute[],
  services?: string[],
  levelAssignments?: LevelAssignment[]
): Promise<GenerationResult<GeneratedJobTemplate>> {
  const startTime = Date.now();

  try {
    logger.api.info("Generating job template", {
      industry: context.industry,
      role: role.title,
      servicesCount: services?.length || 0,
      levelsCount: levelAssignments?.length || 0,
    });

    const prompt = `
Create a complete job template for ${role.title} at ${
      context.name
        ? `${context.name}, a ${context.industry} company`
        : `a ${context.industry} company`
    }.

Company Context:
${context.name ? `- Company Name: ${context.name}` : ""}
- Industry: ${context.industry}
- Company Size: ${context.size}
- Stage: ${context.stage}
- Culture: ${JSON.stringify(context.culture)}
- Tech Stack: ${context.techStack.join(", ")}
- Business Model: ${context.businessModel}
${
  context.originalDescription
    ? `- Original Company Description: "${context.originalDescription}"`
    : ""
}
${
  context.customContext
    ? `- Additional Context: "${context.customContext}"`
    : ""
}

Role: ${role.title}
${role.additionalDetails ? `Additional Details: ${role.additionalDetails}` : ""}
${
  services && services.length > 0
    ? `\nSpecified Tools/Services: ${services.join(", ")}`
    : ""
}

${
  levelAssignments && levelAssignments.length > 0
    ? `\nLevel Assignments (${levelAssignments.length} levels to customize):
${levelAssignments
  .map((la) => `- ${la.level}: ${la.positionCount} position(s)`)
  .join("\n")}`
    : ""
}

Evaluation Attributes:
${attributes.map((a) => `- ${a.name}: ${a.weight}%`).join("\n")}

Generate a job template with:

1. BASE DESCRIPTION (2-3 paragraphs):
   - Role overview (level-agnostic)
   - Impact and responsibilities (general)
   - Team context
   - Growth opportunities

2. BASE REQUIREMENTS (bullet points):
   - Essential qualifications shared across all levels
   - Core technical skills
   - Core soft skills
   - Keep level-agnostic (no specific years of experience)

3. NICE-TO-HAVES (bullet points):
   - Preferred but not required skills (level-agnostic)
   - Bonus qualifications

4. TAGS:
   - Department
   - Location type (Remote/Hybrid/Onsite)
   - Job family
   - Other relevant tags

5. SERVICES/TOOLS (3-8 specific tools/services):
   ${
     services && services.length > 0
       ? `- MUST include these specified tools/services: ${services.join(", ")}`
       : ""
   }
   ${
     services && services.length > 0
       ? `- You may add ${Math.max(0, 3 - services.length)} to ${Math.max(
           0,
           8 - services.length
         )} additional relevant tools if needed`
       : "- Based on the company's industry and tech stack"
   }
   - Specific tools, platforms, or services this role will use
   - Examples: Figma, Jira, Slack, AWS, Stripe, Salesforce, etc.
   - Make them relevant to the ${context.industry} industry and ${
      role.title
    } role

6. POSITION-SPECIFIC CULTURE (CRITICAL - Different from company culture):
   These are specific to THIS ROLE, not company-wide:

   Work Environment Options:
   - "remote": Fully remote work
   - "hybrid": Mix of remote and office
   - "office": Primarily office-based
   - "flexible": Team decides

   Work Pace Options:
   - "fast": Rapid iteration, move quickly, high urgency
   - "moderate": Balanced speed and quality
   - "measured": Thoughtful, deliberate, quality-focused

   Collaboration Style Options:
   - "highly_collaborative": Constant teamwork, pair programming, frequent meetings
   - "balanced": Mix of collaboration and independent work
   - "independent": Primarily solo work with periodic sync

   Choose based on THIS SPECIFIC ROLE'S nature:
   - Sales roles might be "fast" pace, "highly_collaborative"
   - Research roles might be "measured" pace, "independent"
   - Product roles might be "moderate" pace, "balanced"
   - Engineering roles vary based on team structure

${
  levelAssignments && levelAssignments.length > 0
    ? `
7. LEVEL CUSTOMIZATIONS (CRITICAL - Generate one for each level):
   For each level (${levelAssignments
     .map((la) => la.level)
     .join(", ")}), create tailored expectations:

   LEVEL PROGRESSION GUIDELINES:
   - Entry Level (0-2 years): Learning, executing tasks, close mentorship
   - Mid-Level (2-5 years): Independent execution, feature ownership, some mentoring
   - Senior (5-8 years): Project leadership, architectural input, mentoring others
   - Lead (8-12 years): Technical leadership, team influence, cross-team collaboration
   - Principal/Staff (12+ years): Organizational impact, strategic decisions, company-wide influence

   For each level, provide:
   - level: Exact level name from assignments
   - experienceRange: Years of experience expected (e.g., "0-2 years", "5-8 years")
   - customTitle: Optional specific title override (e.g., "Senior Full-Stack Developer")
   - keyResponsibilities: 4-6 bullet points of what they'll do day-to-day at this level
   - technicalExpectations: 3-5 bullet points of technical capabilities required
   - leadershipExpectations: 2-4 bullet points of leadership/mentoring responsibilities (empty array for entry)
   - additionalRequirements: 2-4 must-haves beyond base (e.g., specific years, technologies)
   - additionalNiceToHaves: 1-3 level-specific nice-to-haves
   - autonomyLevel: "close_mentorship" | "guided" | "independent" | "leadership"
   - scopeOfImpact: "task" | "feature" | "project" | "product" | "team" | "organization"
   - decisionMakingAuthority: 1-2 sentence description of what decisions they make
`
    : ""
}

Return JSON in this format:
{
  "title": "Full-Stack Developer",
  "baseDescription": "We're looking for a skilled Full-Stack Developer to join our growing engineering team. In this role, you'll work on building and scaling our healthcare platform that serves thousands of patients daily. You'll collaborate closely with product managers, designers, and other engineers to deliver high-quality features that make a real impact on patient care.\\n\\nAs part of our team, you'll have the opportunity to work with modern technologies, contribute to architectural decisions, and help shape our engineering culture. We value continuous learning and provide opportunities for professional growth through mentorship, conferences, and education budgets.",
  "baseRequirements": [
    "Strong proficiency in React and Node.js",
    "Experience with modern web technologies and best practices",
    "Excellent problem-solving and communication skills"
  ],
  "niceToHaves": [
    "Experience in healthcare or regulated industries",
    "Familiarity with DevOps practices and CI/CD",
    "Open source contributions"
  ],
  "tags": ["Engineering", "Remote-Friendly", "Full-Stack", "Healthcare"],
  "services": ["GitHub", "Vercel", "PostgreSQL", "Stripe", "Slack", "Linear"],
  "positionCulture": {
    "workEnvironment": "hybrid",
    "workPace": "moderate",
    "collaborationStyle": "balanced"
  }${
    levelAssignments && levelAssignments.length > 0
      ? `,
  "levelCustomizations": [
    {
      "level": "Entry Level",
      "experienceRange": "0-2 years",
      "customTitle": "Junior Full-Stack Developer",
      "keyResponsibilities": [
        "Build and maintain features under guidance of senior engineers",
        "Write clean, well-tested code following team standards",
        "Participate in code reviews and learn from feedback",
        "Debug and fix issues in existing codebase"
      ],
      "technicalExpectations": [
        "Solid understanding of JavaScript/TypeScript fundamentals",
        "Basic React experience with hooks and component patterns",
        "Familiarity with RESTful APIs and basic backend concepts",
        "Comfortable with Git and version control"
      ],
      "leadershipExpectations": [],
      "additionalRequirements": [
        "0-2 years of professional software development experience",
        "Bachelor's degree in Computer Science or related field, or equivalent bootcamp/self-taught experience",
        "Eagerness to learn and grow in a fast-paced environment"
      ],
      "additionalNiceToHaves": [
        "Internship or personal project experience",
        "Contributions to open source projects"
      ],
      "autonomyLevel": "close_mentorship",
      "scopeOfImpact": "task",
      "decisionMakingAuthority": "Makes decisions on implementation details for assigned tasks with guidance from senior engineers"
    },
    {
      "level": "Senior",
      "experienceRange": "5-8 years",
      "customTitle": "Senior Full-Stack Developer",
      "keyResponsibilities": [
        "Lead design and implementation of major features and systems",
        "Provide technical direction and architectural guidance",
        "Mentor junior and mid-level engineers",
        "Drive technical excellence through code reviews and best practices"
      ],
      "technicalExpectations": [
        "Expert-level proficiency in React, Node.js, and modern web architecture",
        "Strong understanding of system design, scalability, and performance",
        "Experience with cloud infrastructure and DevOps practices",
        "Ability to debug complex issues across the full stack"
      ],
      "leadershipExpectations": [
        "Mentor 2-3 junior/mid-level engineers",
        "Lead technical discussions and RFC processes",
        "Influence team technical decisions and standards"
      ],
      "additionalRequirements": [
        "5-8 years of professional software development experience",
        "Proven track record of shipping complex features to production",
        "Experience with healthcare or regulated industries strongly preferred"
      ],
      "additionalNiceToHaves": [
        "Experience leading cross-functional projects",
        "Public speaking or technical writing experience"
      ],
      "autonomyLevel": "independent",
      "scopeOfImpact": "project",
      "decisionMakingAuthority": "Makes architectural decisions for projects, influences team-wide technical direction, and has authority over implementation approaches"
    }
  ]`
      : ""
  }
}

Return ONLY the JSON object, no markdown formatting.
    `.trim();

    const response = await openai.chat.completions.create({
      model: AI_MODELS.GPT_4_1,
      messages: [
        {
          role: "system",
          content:
            "You are an expert recruiter who writes compelling, accurate job descriptions that attract top talent while being honest about role requirements.",
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

    const jobTemplate = JSON.parse(content) as GeneratedJobTemplate;
    const generationTime = Date.now() - startTime;

    logger.api.info("Job template generation complete", {
      title: jobTemplate.title,
      requirementsCount: jobTemplate.baseRequirements.length,
      tagsCount: jobTemplate.tags.length,
      servicesCount: jobTemplate.services?.length || 0,
      levelCustomizationsCount: jobTemplate.levelCustomizations?.length || 0,
      generationTime,
    });

    return {
      success: true,
      data: jobTemplate,
      metadata: {
        model: AI_MODELS.GPT_4_1,
        tokensUsed: response.usage?.total_tokens,
        generationTime,
      },
    };
  } catch (error) {
    const generationTime = Date.now() - startTime;
    logger.api.error("Failed to generate job template", {
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
