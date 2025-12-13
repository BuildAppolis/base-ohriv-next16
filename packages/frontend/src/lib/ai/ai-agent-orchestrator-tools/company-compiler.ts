import { tool } from "ai";
import { z } from "zod";

export const StackShape = z.object({
  frameworks: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  hosting: z.array(z.string()).default([]),
  cms: z.array(z.string()).default([]),
  analytics: z.array(z.string()).default([]),
  ecommerce: z.array(z.string()).default([]),
  styling: z.array(z.string()).default([]),
  other: z.array(z.string()).default([]),
});

/**
 * Compiler Tool
 * - Normalizes scrape + stack data into a compact blob the analyzer can consume.
 */
export const companyCompilerTool = tool({
  description:
    "Compile scraped metadata, text preview, and inferred stack into a compact object for further analysis.",
  inputSchema: z.object({
    url: z.string().url(),
    title: z.string().optional(),
    description: z.string().optional(),
    textPreview: z.string().optional(),
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
  }),
  async *execute({
    url,
    title,
    description,
    textPreview,
    stack,
    signals,
    links,
  }) {
    yield { state: "loading" as const };

    const contentPreview = textPreview?.slice(0, 1200) ?? "";
    const compiled = {
      url,
      title: title || "Untitled site",
      description: description || "",
      contentPreview,
      contentSize: contentPreview.length,
      stack: stack || StackShape.parse({}),
      signals: signals ?? [],
      links: links?.slice(0, 8) ?? [],
      timestamp: new Date().toISOString(),
    };

    yield {
      state: "ready" as const,
      compiled,
      hints: [
        compiled.description && `Positioning: ${compiled.description}`,
        compiled.stack.frameworks.length &&
          `Frameworks: ${compiled.stack.frameworks.join(", ")}`,
        compiled.stack.hosting.length &&
          `Infra: ${compiled.stack.hosting.join(", ")}`,
        compiled.contentPreview &&
          `Content snippet: ${compiled.contentPreview.slice(0, 160)}...`,
      ].filter(Boolean),
    };
  },
});

export type CompanyCompilerOutput = {
  state: "loading" | "ready";
  compiled: {
    url: string;
    title: string;
    description: string;
    contentPreview: string;
    contentSize: number;
    stack: z.infer<typeof StackShape>;
    signals: Array<{
      technology: string;
      category: string;
      evidence: string;
    }>;
    links: string[];
    timestamp: string;
  };
  hints?: (string | false | null | undefined)[];
};
