import { Experimental_Agent as Agent, gateway, stepCountIs } from "ai";
import fs from "fs";
import path from "path";
import { ksaCompanyFitTool } from "./ai-agent-orchestrator-tools/ksa-companyfit";
import { ksaJobFitTool } from "./ai-agent-orchestrator-tools/ksa-jobfit";
import { orchestratorTool } from "./ai-agent-orchestrator-tools/orchestrator";

/**
 * Orchestrator-Worker Agent
 *
 * This agent implements the Orchestrator-Worker pattern where:
 * - The orchestrator plans and breaks down complex tasks
 * - Specialized workers execute specific subtasks
 * - The coordinator manages the overall process and dependencies
 */
const promptPath = path.join(
  process.cwd(),
  "docs/AI/INSTRUCTIONS/KSA_ORCHESTRATOR_PROMPT.md"
);
const fallbackPrompt = `You are an Orchestrator-Worker Agent. If you see this fallback prompt, loading the external KSA orchestrator instructions failed. Continue to produce KSA_JobFit and CoreValues_CompanyFit JSON (1-3 questions per section/value), use coordinator mandatory steps, and keep outputs valid JSON.`;

const loadFileSafe = (filePath: string) => {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    console.error(`Failed to load file ${filePath}:`, error);
    return null;
  }
};

const orchestratorSystemPrompt = (() => {
  const base = loadFileSafe(promptPath);
  if (!base) {
    return fallbackPrompt;
  }
  return base.trim();
})();

export const orchestratorAgent = new Agent({
  model: gateway("openai/gpt-4.1-mini"),
  system: orchestratorSystemPrompt,
  tools: {
    orchestrator: orchestratorTool,
    ksa_jobfit: ksaJobFitTool,
    ksa_companyfit: ksaCompanyFitTool,
  },
  stopWhen: stepCountIs(6),
});

export type OrchestratorAgentUIMessage =
  typeof orchestratorAgent extends Agent<infer T> ? T : never;
