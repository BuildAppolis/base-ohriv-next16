import { z } from "zod";
import { BusinessModel, CompanySize, CompanyStage, Industries } from "./enums";
import { stageSchema } from "./stage";
import { jobSchema } from "./job";

export const companySchema = z.object({
  id: z.string(),
  tenantId: z.string().optional(), // owning tenant/reseller
  partnerId: z.string().optional(),
  ownerUserId: z.string().optional(),
  name: z.string().optional(),
  website: z.string().url().optional(),
  industry: z.enum(Industries),
  subIndustry: z.string().optional(),
  size: z.enum(CompanySize),
  stage: z.enum(CompanyStage),
  businessModel: z.enum(BusinessModel),
  stages: z.array(stageSchema).optional(),
  jobs: z.array(jobSchema).optional(),
});

export type Company = z.infer<typeof companySchema>;
