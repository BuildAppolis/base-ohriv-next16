import { generateText, tool } from "ai";
import { z } from "zod";
import { StackShape } from "./company-compiler";
import { WebSearchItemSchema } from "./schema";
import { uniqueStrings } from "./site-scrape";

const AnalysisInputSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  description: z.string().optional(),
  content: z
    .object({
      headings: z.array(z.string()).default([]),
      keyPoints: z.array(z.string()).default([]),
      mainText: z.string().default(""),
      summary: z.string().optional(),
    })
    .optional(),
  stack: StackShape.optional(),
  signals: z
    .array(
      z.object({
        technology: z.string(),
        category: z.string(),
        evidence: z.string(),
      })
    )
    .optional(),
  links: z.array(z.string()).optional(),
  searchResults: z.array(WebSearchItemSchema).optional(),
});

const uniqueSources = (urls: string[]) =>
  uniqueStrings(urls.filter(Boolean));

/**
 * Analyzer Tool
 * - Blends scraped content + web search + stack hints into a concise summary with stack highlights.
 */
export const companyAnalysisTool = tool({
  description:
    "Summarize scraped content + web search + stack into a concise company overview with tech highlights.",
  inputSchema: AnalysisInputSchema,
  async *execute({
    url,
    title,
    description,
    content,
    stack,
    signals,
    links,
    searchResults,
  }) {
    yield { state: "loading" as const };

    try {
      const stackBullets = stack
        ? Object.entries(stack)
            .filter(([, values]) => values.length)
            .map(([key, values]) => `${key}: ${values.join(", ")}`)
            .join("\n")
        : "";

      const searchBullets = (searchResults || [])
        .slice(0, 5)
        .map(
          (r) =>
            `- ${r.title || r.source || r.url} (${r.url}): ${
              r.snippet || "no snippet"
            }`
        )
        .join("\n");

      const headings = content?.headings?.slice(0, 6) || [];
      const textPreview =
        content?.summary ||
        content?.mainText?.slice(0, 1200) ||
        content?.keyPoints?.join("\n") ||
        description ||
        "";

      const focusLinks = links?.slice(0, 10) || [];
      const signalLines = (signals || [])
        .map((s) => `- ${s.technology} (${s.category}): ${s.evidence}`)
        .join("\n");

      const { text } = await generateText({
        model: "openai/gpt-4.1-mini",
        system:
          "You are a concise analyst. Blend scraped content, web search, and stack hints into a short briefing. Output 5-7 bullets including: what the company does, who they serve, offerings, proof/signals, and a tech stack line. Cite links when helpful.",
        prompt: [
          `URL: ${url}`,
          title && `Title: ${title}`,
          description && `Description: ${description}`,
          headings.length ? `Headings: ${headings.join(" | ")}` : null,
          textPreview && `Content:\n${textPreview}`,
          stackBullets && `Detected stack:\n${stackBullets}`,
          signalLines && `Signals:\n${signalLines}`,
          searchBullets && `Web search:\n${searchBullets}`,
          focusLinks.length
            ? `Notable links:\n${focusLinks.map((l) => `- ${l}`).join("\n")}`
            : null,
          "Write 5-7 bullet points. Include one bullet called 'Tech stack:' summarizing stack findings.",
        ]
          .filter(Boolean)
          .join("\n\n"),
      });

      yield {
        state: "ready" as const,
        url,
        summary: text.trim(),
        stack,
        links: focusLinks,
        sources: uniqueSources([
          ...(focusLinks || []),
          ...(searchResults?.map((r) => r.url) || []),
        ]),
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("company_analysis error", error);
      yield {
        state: "output-error" as const,
        errorText:
          error instanceof Error
            ? error.message
            : "Failed to generate analysis summary",
      };
    }
  },
});

export type CompanyAnalysisOutput = {
  state: "loading" | "ready" | "output-error";
  url?: string;
  summary?: string;
  stack?: z.infer<typeof StackShape>;
  links?: string[];
  sources?: string[];
  generatedAt?: string;
  errorText?: string;
};
