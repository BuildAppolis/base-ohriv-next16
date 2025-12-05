import { generateObject, tool } from "ai";
import { z } from "zod";
import { WebSearchSchema } from "./schema";
import type { CompanyContextInput } from "@/types/ai/company";

const extractMeta = (html: string) => {
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const descMatch =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i);

  return {
    title: titleMatch?.[1]?.trim(),
    description: descMatch?.[1]?.trim(),
  };
};

/**
 * Company Analyzer Tool (POC)
 * - Accepts a URL and returns a placeholder company profile using web info.
 * - In the future, this should call the web_search tool and build a rich profile.
 */
export const companyAnalyzerTool = tool({
  description:
    "Analyze a company from a URL. Uses web search + page metadata to build a CompanyContextInput and sources.",
  inputSchema: z.object({
    url: z.string().url("Provide a valid URL"),
  }),
  async execute({ url }) {
    const hostname = (() => {
      try {
        return new URL(url).hostname;
      } catch {
        return url;
      }
    })();

    const buildContextFrom = (name: string, industry: string, description: string): CompanyContextInput => {
      const mission_statement =
        description || `Mission statement inferred from ${name}.`;

      const core_values = [
        { name: "Innovation", description: "Embrace new ideas and continuous improvement." },
        { name: "Excellence", description: "Deliver high-quality outcomes." },
        { name: "Collaboration", description: "Work together effectively across teams." },
        { name: "Growth", description: "Invest in learning and scaling impact." },
      ];

      const interview_steps = {
        total_steps: 3,
        steps: [
          {
            name: "Screening",
            order: 1,
            type: "screening",
            generates_questions: true,
            description: "Initial qualification based on profile and mission alignment.",
          },
          {
            name: "Technical/Functional",
            order: 2,
            type: "technical",
            generates_questions: true,
            description: "Evaluate skills, abilities, and problem-solving.",
          },
          {
            name: "Final Culture/Values",
            order: 3,
            type: "final",
            generates_questions: true,
            description: "Assess culture fit and core values alignment.",
          },
        ],
      };

      const technologies = {
        languages: [],
        frameworks: [],
        databases: [],
        infrastructure: [],
        tools: [],
      };

      const role_requirements = {
        core_responsibilities: [
          "Contribute to product and feature delivery.",
          "Collaborate with cross-functional teams.",
          "Maintain quality and reliability standards.",
        ],
        key_objectives: [
          "Deliver impact aligned to company mission and customer needs.",
        ],
        impact_areas: ["Product delivery", "Quality", "Collaboration"],
        scope: "team",
        reach: "internal",
        complexity: "tactical",
      };

      const positions = [
        {
          title: "Software Engineer",
          category: "engineering",
          seniority_level: 5,
          total_levels: 3,
          role_requirements,
          extended_descriptions: [
            "General engineering role inferred from public web presence. Refine as needed.",
          ],
          position_tools: [],
        },
      ];

      const company_profile = {
        name,
        industry: industry || "unknown",
        sub_industry: "unspecified",
        size: "unspecified",
        location: "unspecified",
        stage: { name: "unspecified", phase: "unspecified" },
      };

      const mission_and_culture = {
        mission_statement,
        core_values,
      };

      return {
        company_profile,
        mission_and_culture,
        interview_steps,
        technologies,
        positions,
      };
    };

    try {
      const { object } = await generateObject({
        model: "perplexity/sonar",
        schema: WebSearchSchema,
        system:
          "You are a company analysis assistant. Search the web and return structured results (title, url, snippet, source).",
        prompt: `Find recent information about ${hostname}. Return up to 5 high-quality results.`,
      });

      let results = object.results ?? [];

      // Fallback: fetch the page directly to extract title/description if search returned nothing
      if (results.length === 0) {
        try {
          const res = await fetch(url, { method: "GET" });
          const html = await res.text();
          const meta = extractMeta(html);
          if (meta.title || meta.description) {
            results = [
              {
                title: meta.title || hostname,
                url,
                snippet: meta.description || "No description found.",
                source: hostname,
              },
            ];
          }
        } catch (err) {
          console.warn("company_analyzer direct fetch fallback failed:", err);
        }
      }

      const first = results[0];
      const name = first?.title || hostname;
      const industry = first?.source || "unknown";
      const description = first?.snippet || "No description found.";

      return {
        ...buildContextFrom(name, industry, description),
        sources:
          results.length > 0
            ? results.map((r) => ({
                title: r.title || r.source || "Source",
                url: r.url || url,
              }))
            : [{ title: "Source URL", url }],
      };
    } catch (error) {
      console.error("company_analyzer search failed", error);
      return {
        ...buildContextFrom(
          hostname,
          "unknown",
          "Search failed; showing fallback profile."
        ),
        sources: [{ title: "Source URL", url }],
      };
    }
  },
});

export type CompanyAnalyzerInvocation = {
  company_profile: CompanyContextInput["company_profile"];
  mission_and_culture: CompanyContextInput["mission_and_culture"];
  interview_steps: CompanyContextInput["interview_steps"];
  technologies: CompanyContextInput["technologies"];
  positions: CompanyContextInput["positions"];
  sources: { title: string; url: string }[];
};
