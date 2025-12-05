import { tool } from "ai";
import { z } from "zod";

type Signal = {
  technology: string;
  category: keyof StackBreakdown;
  evidence: string;
};

type StackBreakdown = {
  frameworks: string[];
  languages: string[];
  hosting: string[];
  cms: string[];
  analytics: string[];
  ecommerce: string[];
  styling: string[];
  other: string[];
};

const detectorConfig: Array<{
  name: string;
  category: keyof StackBreakdown;
  patterns: RegExp[];
  evidence: string;
}> = [
  {
    name: "Next.js",
    category: "frameworks",
    patterns: [/__NEXT_DATA__/, /next\/static/, /next\.js/i],
    evidence: "Found Next.js runtime markers like __NEXT_DATA__.",
  },
  {
    name: "React",
    category: "frameworks",
    patterns: [/reactDom/i, /react/i],
    evidence: "React identifiers present in bundled script.",
  },
  {
    name: "Vue",
    category: "frameworks",
    patterns: [/vuex/i, /vue-router/i, /vue\.js/i],
    evidence: "Vue-related globals found in source.",
  },
  {
    name: "Angular",
    category: "frameworks",
    patterns: [/ng-version/i, /angular/i],
    evidence: "Angular markers such as ng-version detected.",
  },
  {
    name: "Svelte",
    category: "frameworks",
    patterns: [/svelte\./i, /sveltekit/i],
    evidence: "Svelte bundle signatures detected.",
  },
  {
    name: "Tailwind CSS",
    category: "styling",
    patterns: [/tailwindcss/i, /data-theme=/i],
    evidence: "Tailwind utility classes or config hints present.",
  },
  {
    name: "Shopify",
    category: "ecommerce",
    patterns: [/cdn\.shopify\.com/i, /shopify/i],
    evidence: "Shopify CDN assets referenced.",
  },
  {
    name: "WordPress",
    category: "cms",
    patterns: [/wp-content/i, /wordpress/i],
    evidence: "WordPress wp-content assets referenced.",
  },
  {
    name: "Contentful",
    category: "cms",
    patterns: [/contentful/i],
    evidence: "Contentful SDK references detected.",
  },
  {
    name: "Vercel",
    category: "hosting",
    patterns: [/vercel\.app/i, /x-vercel-id/i],
    evidence: "Vercel deployment identifiers found.",
  },
  {
    name: "Cloudflare",
    category: "hosting",
    patterns: [/cf-ray/i, /cloudflare/i],
    evidence: "Cloudflare edge markers detected.",
  },
  {
    name: "Firebase",
    category: "hosting",
    patterns: [/firebaseio\.com/i, /firebase/i],
    evidence: "Firebase configuration detected.",
  },
  {
    name: "TypeScript",
    category: "languages",
    patterns: [/typescript/i, /\.ts\b/],
    evidence: "TypeScript references found in bundle.",
  },
  {
    name: "GraphQL",
    category: "other",
    patterns: [/graphql/i, /apollo/i],
    evidence: "GraphQL or Apollo client references detected.",
  },
  {
    name: "Segment",
    category: "analytics",
    patterns: [/cdn\.segment\.com/i, /analytics\.load/i],
    evidence: "Segment analytics script present.",
  },
  {
    name: "Google Analytics",
    category: "analytics",
    patterns: [/gtag\(/i, /google-analytics\.com/i, /gtm\.js/i],
    evidence: "Google Analytics / Tag Manager snippet detected.",
  },
];

const detectTechnologies = (html: string): { stack: StackBreakdown; signals: Signal[] } => {
  const stack: StackBreakdown = {
    frameworks: [],
    languages: [],
    hosting: [],
    cms: [],
    analytics: [],
    ecommerce: [],
    styling: [],
    other: [],
  };
  const signals: Signal[] = [];

  const normalized = html || "";

  detectorConfig.forEach((detector) => {
    if (detector.patterns.some((pattern) => pattern.test(normalized))) {
      if (!stack[detector.category].includes(detector.name)) {
        stack[detector.category].push(detector.name);
      }
      signals.push({
        technology: detector.name,
        category: detector.category,
        evidence: detector.evidence,
      });
    }
  });

  return { stack, signals };
};

/**
 * Stack Finder Tool
 * - Uses lightweight heuristics on the source to infer technologies in use.
 * - Accepts optional HTML to avoid double-fetching.
 */
export const stackFinderTool = tool({
  description:
    "Infer a website's tech stack by inspecting HTML and bundled assets. Accepts a URL and optional HTML.",
  inputSchema: z.object({
    url: z.string().url("Provide a valid URL to inspect"),
    html: z
      .string()
      .describe("Pre-fetched HTML to analyze; if omitted the tool will fetch.")
      .optional(),
  }),
  async *execute({ url, html }) {
    yield { state: "loading" as const };

    try {
      let markup = html;

      if (!markup) {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "CompanyAnalysisBot/1.0 (+https://buildappolis.com)",
          },
        });
        const raw = await response.text();
        markup = raw.slice(0, 80_000);
      }

      const { stack, signals } = detectTechnologies(markup || "");

      yield {
        state: "ready" as const,
        url,
        stack,
        signals,
        summary: [
          stack.frameworks.length ? `Frameworks: ${stack.frameworks.join(", ")}` : null,
          stack.cms.length ? `CMS: ${stack.cms.join(", ")}` : null,
          stack.hosting.length ? `Hosting: ${stack.hosting.join(", ")}` : null,
        ]
          .filter(Boolean)
          .join(" • "),
      };
    } catch (error) {
      console.error("stack_finder error", error);
      yield {
        state: "output-error" as const,
        errorText:
          error instanceof Error
            ? error.message
            : "Unknown error while inferring stack",
      };
    }
  },
});

export type StackFinderOutput = {
  state: "loading" | "ready" | "output-error";
  url?: string;
  stack?: StackBreakdown;
  signals?: Signal[];
  summary?: string;
  errorText?: string;
};
