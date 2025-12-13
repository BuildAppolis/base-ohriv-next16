import { generateObject, tool, type UIToolInvocation } from "ai";
import { z } from "zod";

import { type WebSearchResult, WebSearchSchema } from "./schema";

export const webSearchTool = tool({
  description:
    "Search the web using Perplexity Sonar via Vercel AI SDK. Requires Perplexity API key. See Vercel docs.",
  inputSchema: z.object({
    query: z.string().min(1),
    limit: z.number().min(1).max(20).default(5),
  }),
  async *execute({ query, limit }: { query: string; limit: number }) {
    yield { state: "loading" as const };

    try {
      // Use Sonar (or Sonar Pro) for search-grounded results
      const { object } = await generateObject({
        model: "perplexity/sonar",
        schema: WebSearchSchema,
        system:
          "You are a search assistant. Return strictly the JSON schema provided. For each result include title, url, a short snippet, and a source hostname.",
        prompt: `Search the web for: ${query}. Return up to ${limit} high-quality, diverse results with proper URLs.`,
      });

      console.log("[webSearchTool]- object", object);

      // Ensure limit is respected in case the model over-returns
      const normalized: WebSearchResult = {
        query,
        results: (object.results || []).slice(0, limit).map((r) => {
          let source = r.source;
          if (!source) {
            try {
              source = new URL(r.url).hostname;
            } catch {
              source = undefined;
            }
          }
          return { title: r.title, url: r.url, snippet: r.snippet, source };
        }),
      };

      yield {
        state: "ready" as const,
        ...normalized,
      };
    } catch (error) {
      console.error("Perplexity web search error:", error);
      yield {
        state: "ready" as const,
        query,
        results: [
          {
            title: "Search failed",
            url: "https://perplexity.ai",
            snippet: "Unable to perform web search at this time",
            source: "Error",
          },
        ],
      };
    }
  },
});

export type WebSearchUIToolInvocation = UIToolInvocation<typeof webSearchTool>;

export default webSearchTool;
