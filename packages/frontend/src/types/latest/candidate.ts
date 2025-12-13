import z from "zod";
import {
  applicationStatuses,
  candidateApplicationSchema,
} from "./evaluation";

const candidateSourceSchema = z.object({
  channel: z.string(),
  details: z.string().optional(),
  referrerUserId: z.string().optional(),
});

const candidateAttachmentSchema = z.object({
  type: z.enum(["resume", "portfolio", "cover_letter", "other"]).default("other"),
  url: z.string(),
  title: z.string().optional(),
  uploadedAt: z.string().optional(),
});

export const candidateSchema = z.object({
  id: z.string(),
  tenantId: z.string(), // owning tenant/reseller
  companyId: z.string().optional(), // direct company link when not going through a reseller
  partnerId: z.string().optional(), // reseller/partner id when applicable
  nameFirst: z.string().optional(),
  nameLast: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  portfolioUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  source: candidateSourceSchema.optional(),
  attachments: z.array(candidateAttachmentSchema).default([]),
  applications: z.array(candidateApplicationSchema).default([]),
  primaryApplicationId: z.string().optional(),
  status: z.enum(applicationStatuses).default("applied"),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export type Candidate = z.infer<typeof candidateSchema>;
export type CandidateSource = z.infer<typeof candidateSourceSchema>;
export type CandidateAttachment = z.infer<typeof candidateAttachmentSchema>;
