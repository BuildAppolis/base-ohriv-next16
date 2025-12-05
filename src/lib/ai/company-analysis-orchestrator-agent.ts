import { Experimental_Agent as Agent, gateway, stepCountIs } from "ai";
import { companyAnalysisTool } from "./ai-agent-orchestrator-tools/company-analysis";
import { siteScrapeTool } from "./ai-agent-orchestrator-tools/site-scrape";
import { stackFinderTool } from "./ai-agent-orchestrator-tools/stack-finder";
import { webSearchTool } from "./ai-agent-orchestrator-tools/web-search";

const systemPrompt = `
You are a Company Analysis Orchestrator. Your job is to take a URL and return a concise, human-friendly snapshot of the company and its technology stack.

Preferred sequence:
- Call site_scrape to fetch metadata, page text, headings, and links (prefer https:// if scheme missing).
- Call stack_finder to infer technologies (pass the scraped HTML/text if available).
- Call web_search to gather 3-5 relevant facts about the company (name + domain as query).
- Call company_analysis with scrape + stack + search findings to produce a concise summary and stack readout.

Rules:
- Keep tool calls lean—avoid redundant requests.
- If the URL looks unsafe or private, ask for clarification instead of scraping.
- Final assistant message: 4-6 bullets covering what the company does, notable signals, and a short tech stack summary. Include links you captured.
`;

export const companyAnalysisOrchestratorAgent = new Agent({
  model: gateway("openai/gpt-4.1-mini"),
  system: systemPrompt.trim(),
  tools: {
    site_scrape: siteScrapeTool,
    stack_finder: stackFinderTool,
    web_search: webSearchTool,
    company_analysis: companyAnalysisTool,
  },
  stopWhen: stepCountIs(8),
});

export type CompanyAnalysisAgentUIMessage =
  typeof companyAnalysisOrchestratorAgent extends Agent<infer T> ? T : never;
