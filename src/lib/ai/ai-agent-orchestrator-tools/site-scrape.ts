import { generateText, tool } from "ai";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import { z } from "zod";

const stripScriptsAndStyles = (html: string) =>
  html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<!--([\s\S]*?)-->/g, " ");

const decodeEntities = (text: string) =>
  text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

export const uniqueStrings = (items: string[]) =>
  items.filter((value, index, self) => self.indexOf(value) === index);

const getBodyHtml = (html: string) => {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch?.[1]) return bodyMatch[1];

  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch?.[1]) return mainMatch[1];

  return html;
};

const extractReadable = (html: string, url: string) => {
  try {
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (article?.textContent) {
      return {
        text: decodeEntities(article.textContent.trim()),
        title: article.title?.trim(),
      };
    }
  } catch (error) {
    console.warn("readability parse failed", error);
  }

  return null;
};

const extractText = (html: string) => {
  const cleaned = stripScriptsAndStyles(html);
  const body = getBodyHtml(cleaned);

  const withBreaks = body
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|article|li|h[1-6]|main)>/gi, "\n")
    .replace(/<\/?[^>]+>/g, " ");

  const decoded = decodeEntities(withBreaks);

  const segments = decoded
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[.!?])\s+/))
    .map((part) => part.trim())
    .filter(
      (part) =>
        part.length > 40 &&
        /[a-zA-Z]{3}/.test(part) &&
        !/[{}]{2,}/.test(part) &&
        !/--tw-/.test(part)
    )
    .slice(0, 14);

  const fallback = decoded
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 2_400);

  return segments.length > 0 ? segments.join(" ") : fallback;
};

const extractLinks = (html: string, baseUrl: string) => {
  const base = new URL(baseUrl);

  return Array.from(html.matchAll(/href=["']([^"']+)["']/gi))
    .map((match) => match[1])
    .filter((href) => {
      const trimmed = href.trim();
      return trimmed && !trimmed.startsWith("mailto:") && trimmed !== "#";
    })
    .map((href) => {
      try {
        return new URL(href, base).toString();
      } catch {
        return null;
      }
    })
    .filter((url): url is string => !!url && /^https?:\/\//i.test(url))
    .filter((value, index, self) => self.indexOf(value) === index)
    .slice(0, 20);
};

const extractHeadings = (html: string) =>
  Array.from(html.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi))
    .map((match) => decodeEntities(match[1] ?? "").replace(/<[^>]+>/g, "").trim())
    .filter(Boolean)
    .slice(0, 12);

const toMeaningfulBlob = (textSegments: string[]) => {
  if (!textSegments.length) return "";
  const unique = uniqueStrings(textSegments);
  return unique.join("\n").slice(0, 6_000);
};

const chunkText = (text: string, chunkSize = 1400, overlap = 120) => {
  const chunks: string[] = [];
  let index = 0;

  while (index < text.length) {
    const chunk = text.slice(index, index + chunkSize);
    chunks.push(chunk);
    index += chunkSize - overlap;
  }

  return chunks;
};

const summarizeText = async (text: string) => {
  const cleaned = text.trim();
  if (cleaned.length < 120) return null;

  const trimmed = cleaned.slice(0, 8_000);
  const chunks = chunkText(trimmed);

  try {
    const { text: summary } = await generateText({
      model: "openai/gpt-4.1-mini",
      system:
        "You condense scraped website text for another agent. Produce 4-6 concise bullets capturing what the company does, offerings, and audience. No preamble.",
      prompt: chunks
        .map((chunk, idx) => `Chunk ${idx + 1}:\n${chunk}`)
        .join("\n\n"),
    });

    return summary.trim();
  } catch (error) {
    console.warn("site_scrape summary failed", error);
    return null;
  }
};

const extractMeta = (html: string) => {
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const descMatch =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
    html.match(
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i
    );
  return {
    title: titleMatch?.[1]?.trim(),
    description: descMatch?.[1]?.trim(),
  };
};

/**
 * Site Scrape Tool
 * - Fetches a URL and returns light metadata and a text preview
 * - Keeps payload small to avoid overloading the agent loop
 */
export const siteScrapeTool = tool({
  description:
    "Fetch a public URL, returning metadata, status, and a trimmed text preview for downstream analysis.",
  inputSchema: z.object({
    url: z.string().url("Provide a valid URL to scrape"),
    maxBytes: z
      .number()
      .int()
      .min(2000)
      .max(250_000)
      .default(120_000)
      .describe("Maximum HTML bytes to keep before processing"),
    summarize: z
      .boolean()
      .default(true)
      .describe("When true, returns a short summary of extracted text."),
  }),
  async *execute({ url, maxBytes, summarize }) {
    yield { state: "loading" as const, url };

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "CompanyAnalysisBot/1.0 (+https://buildappolis.com)",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        redirect: "follow",
      });

      const rawHtml = await response.text();
      const html = rawHtml.slice(0, maxBytes);
      const readability = extractReadable(html, url);
      const { title, description } = extractMeta(html);
      const bodyText = readability?.text || extractText(html);
      const textPreview = bodyText.slice(0, 2_400);
      const contentHeadings = uniqueStrings([
        readability?.title || "",
        ...extractHeadings(html),
      ]).filter(Boolean);
      const keyPoints = bodyText
        .split(/(?<=[.!?])\s+/)
        .map((sentence) => sentence.trim())
        .filter((sentence) => sentence.length > 40)
        .slice(0, 12);
      const contentBlob = toMeaningfulBlob(
        keyPoints.length ? keyPoints : [bodyText]
      );
      const links = extractLinks(html, url);
      const summary = summarize ? await summarizeText(contentBlob || bodyText) : null;

      yield {
        state: "ready" as const,
        url,
        status: response.status,
        contentType: response.headers.get("content-type") || "unknown",
        title,
        description,
        textPreview,
        content: {
          headings: contentHeadings,
          keyPoints,
          mainText: contentBlob,
          summary: summary || undefined,
        },
        bytesCaptured: html.length,
        links,
      };
    } catch (error) {
      console.error("site_scrape error", error);
      yield {
        state: "output-error" as const,
        url,
        errorText:
          error instanceof Error ? error.message : "Unknown error during fetch",
      };
    }
  },
});

export type SiteScrapeOutput = {
  state: "loading" | "ready" | "output-error";
  url: string;
  status?: number;
  contentType?: string;
  title?: string;
  description?: string;
  textPreview?: string;
  content?: {
    headings: string[];
    keyPoints: string[];
    mainText: string;
    summary?: string;
  };
  bytesCaptured?: number;
  links?: string[];
  errorText?: string;
};
