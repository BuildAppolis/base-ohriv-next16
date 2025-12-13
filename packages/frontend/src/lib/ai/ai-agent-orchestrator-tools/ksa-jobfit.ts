import { tool } from "ai";
import { z } from "zod";

/**
 * KSA Job Fit Tool
 * - Accepts company/position context and returns a scaffold marker for the agent
 */
export const ksaJobFitTool = tool({
  description:
    "Generate KSA_JobFit JSON (Knowledge, Skills, Abilities) using the provided company context.",
  inputSchema: z.object({
    context: z.string().describe("Full company context JSON as string"),
  }),
  async execute({ context }) {
    // The model should return the generated KSA_JobFit JSON in the final assistant message.
    // Tool output is a simple echo to surface that the call completed.
    return { note: "KSA_JobFit generated; see final response", context };
  },
});

export type KsaJobFitInvocation = {
  note: string;
  context: string;
};
