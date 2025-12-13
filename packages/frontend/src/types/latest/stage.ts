import z from "zod";

export const stageSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  color: z.string(),
  icon: z.string(),
  order: z.number(),
  isSystem: z.boolean().optional(),
  canReorder: z.boolean().optional(),
  questionsEnabled: z.boolean().optional(),
});

export type Stage = z.infer<typeof stageSchema>;
