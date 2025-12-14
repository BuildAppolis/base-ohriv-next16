/**
 * User-related enums and constants
 */

/**
 * User account status
 */
export enum UserStatus {
  Active = "active",
  Invited = "invited",
  Disabled = "disabled",
  Suspended = "suspended",
}

/**
 * User roles within organization
 */
export enum UserRole {
  Owner = "owner",
  Admin = "admin",
  Recruiter = "recruiter",
  Interviewer = "interviewer",
  Viewer = "viewer",
  PartnerManager = "partner_manager",
}

/**
 * User permissions
 */
export const permissions = [
  // Tenant permissions
  "tenant.manage",
  "tenant.view",
  "tenant.billing",

  // Company permissions
  "company.create",
  "company.edit",
  "company.delete",
  "company.view",

  // Job permissions
  "job.create",
  "job.edit",
  "job.delete",
  "job.publish",
  "job.view",

  // Candidate permissions
  "candidate.create",
  "candidate.edit",
  "candidate.delete",
  "candidate.view",
  "candidate.search",

  // Evaluation permissions
  "evaluation.create",
  "evaluation.edit",
  "evaluation.delete",
  "evaluation.view",
  "evaluation.score",
  "evaluation.advanced_scoring",

  // Analytics permissions
  "analytics.view",
  "analytics.advanced",
  "analytics.export",

  // User management
  "user.invite",
  "user.edit",
  "user.delete",
  "user.manage_permissions",

  // System permissions
  "system.configure",
  "system.integrations",
  "system.export_data",
] as const;

export type Permission = (typeof permissions)[number];

/**
 * User preferences
 */
export enum Theme {
  Light = "light",
  Dark = "dark",
  System = "system",
}

/**
 * Time format preferences
 */
export enum TimeFormat {
  Hour12 = "12h",
  Hour24 = "24h",
}

/**
 * Communication preferences
 */
export enum NotificationChannel {
  Email = "email",
  Push = "push",
  SMS = "sms",
  InApp = "in_app",
}