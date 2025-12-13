import z from "zod";

export const candidateSchema = z.object({
  id: z.string(),
  nameFirst: z.string().optional(),
  nameLast: z.string().optional(),
  email: z.string().email().optional(),
});
