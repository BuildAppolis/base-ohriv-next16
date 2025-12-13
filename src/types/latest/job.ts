import { JobLevel, jobLevels, WorkEnvironment } from "./enums";
import { z } from "zod";

export const jobSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  level: z.enum(jobLevels),
  workEnvironment: z.enum(WorkEnvironment).optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  type: z.string().optional(),
  guidelines: z.object(), // the KSA evaluation guidelines associated with the job
});

// the ai will determine the job level if not provided from context
