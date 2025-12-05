import { tool } from "ai";
import { z } from "zod";

/**
 * KSA Company Fit Tool
 * - Accepts company context and returns a scaffold marker for the agent to generate CoreValues_CompanyFit.
 */
export const ksaCompanyFitTool = tool({
  description:
    "Generate CoreValues_CompanyFit JSON using the provided company context.",
  inputSchema: z.object({
    context: z.string().describe("Full company context JSON as string"),
  }),
  async execute({ context }) {
    return {
      note: "CoreValues_CompanyFit generated; see final response",
      context,
    };
  },
});

export type KsaCompanyFitInvocation = {
  note: string;
  context: string;
};
