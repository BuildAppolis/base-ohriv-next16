import z from "zod";

export const tenantPlans = ["free", "standard", "enterprise"] as const;
export const tenantStatuses = ["active", "suspended"] as const;
export const partnerStatuses = ["active", "suspended"] as const;
export const userStatuses = ["active", "invited", "disabled"] as const;
export const tenantMembershipRoles = [
  "owner",
  "admin",
  "recruiter",
  "interviewer",
  "viewer",
  "partner_manager",
] as const;

export const tenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  plan: z.enum(tenantPlans),
  status: z.enum(tenantStatuses),
  ownerUserId: z.string(),
  settings: z
    .object({
      branding: z.object({ logoUrl: z.string().url().optional() }).optional(),
      sso: z.object({ enabled: z.boolean() }).optional(),
    })
    .optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export const partnerSchema = z.object({
  id: z.string(),
  name: z.string(),
  tenantId: z.string(), // their own tenant
  customerTenantIds: z.array(z.string()).default([]),
  status: z.enum(partnerStatuses),
  revSharePercent: z.number().min(0).max(100).optional(),
  branding: z.object({ logoUrl: z.string().url().optional() }).optional(),
});

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  primaryTenantId: z.string().optional(),
  partnerId: z.string().optional(),
  status: z.enum(userStatuses).default("invited"),
});

export const tenantMembershipSchema = z.object({
  userId: z.string(),
  tenantId: z.string(),
  role: z.enum(tenantMembershipRoles),
  scopes: z.array(z.string()).optional(), // fine-grained overrides
  invitedBy: z.string().optional(),
  invitedAt: z.string().optional(),
});

export type TenantPlan = (typeof tenantPlans)[number];
export type TenantStatus = (typeof tenantStatuses)[number];
export type PartnerStatus = (typeof partnerStatuses)[number];
export type UserStatus = (typeof userStatuses)[number];
export type TenantMembershipRole = (typeof tenantMembershipRoles)[number];
export type Tenant = z.infer<typeof tenantSchema>;
export type Partner = z.infer<typeof partnerSchema>;
export type User = z.infer<typeof userSchema>;
export type TenantMembership = z.infer<typeof tenantMembershipSchema>;
