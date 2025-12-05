import { tool } from "ai";
import { z } from "zod";

/**
 * Orchestrator Tool (KSA planning)
 * - Plans how to generate KSA_JobFit and CoreValues_CompanyFit.
 */
export const orchestratorTool = tool({
  description: "Plan KSA generation steps.",
  inputSchema: z.object({
    request: z.string().describe("User request for KSA generation"),
    context: z
      .string()
      .describe("Company context JSON as string")
      .optional()
      .default(""),
  }),
  async *execute({ request }) {
    yield {
      state: "ready" as const,
      plan: {
        request,
        contextSummary:
          "Parse company context, extract values, tech, roles; generate KSA_JobFit and CoreValues_CompanyFit; validate JSON.",
        steps: [
          "Generate KSA_JobFit (Knowledge, Skills, Abilities, 1-3 questions each)",
          "Generate CoreValues_CompanyFit (exact value names, 2 questions each)",
          "Validate and output pure JSON",
        ],
      },
    };
  },
});

export type OrchestratorUIToolInvocation = {
  state: "ready";
  plan: {
    request: string;
    contextSummary: string;
    steps: string[];
  };
};
