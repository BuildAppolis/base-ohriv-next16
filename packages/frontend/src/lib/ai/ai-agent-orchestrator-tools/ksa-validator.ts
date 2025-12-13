import { tool } from "ai";
import { z } from "zod";

/**
 * KSA Validator Tool
 * - Validates a JSON string for KSA output shape.
 */
export const ksaValidatorTool = tool({
  description: "Validate KSA JSON output shape.",
  inputSchema: z.object({
    json: z.string().describe("The KSA output JSON as string"),
  }),
  async execute({ json }) {
    if (!json || !json.trim()) {
      return {
        valid: false,
        error: "Validator received empty JSON; send the merged KSA payload.",
      };
    }

    try {
      JSON.parse(json);
      return { valid: true };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return {
        valid: false,
        error: error?.message || "Invalid JSON",
      };
    }
  },
});

export type KsaValidatorInvocation = {
  state: "ready" | "output-error";
  valid: boolean;
  error?: string;
};
