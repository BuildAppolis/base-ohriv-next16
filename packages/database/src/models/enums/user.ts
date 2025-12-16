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
 * System-level roles (Platform-wide)
 */
export enum SystemRole {
  PlatformOwner = "platform_owner",
  SuperAdmin = "super_admin",
  PartnerManager = "partner_manager",
  StandardUser = "standard_user",
}

/**
 * Tenant-level roles (Organization-wide)
 */
export enum TenantRole {
  Owner = "owner",
  Admin = "admin",
  User = "user",
  Viewer = "viewer",
}

/**
 * Company-level roles (Location-specific)
 */
export enum CompanyRole {
  Admin = "admin",
  Manager = "manager",
  Member = "member",
  Evaluator = "evaluator",
}

/**
 * @deprecated Use SystemRole, TenantRole, or CompanyRole instead
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
 * User permissions (resource:action:scope format)
 */
export const permissions = [
  // System permissions (Platform-wide)
  "system.*",
  "system.configure",
  "system.monitor",
  "system.tenants.create",
  "system.tenants.view",
  "system.tenants.manage",

  // Tenant permissions (Organization-wide)
  "tenant.*",
  "tenant.create",
  "tenant.view",
  "tenant.edit",
  "tenant.delete",
  "tenant.manage",
  "tenant.billing.view",
  "tenant.billing.manage",
  "tenant.users.invite",
  "tenant.users.manage",
  "tenant.companies.create",
  "tenant.companies.manage",
  "tenant.analytics.view",
  "tenant.analytics.export",

  // Company permissions (Location-specific)
  "company.*",
  "company.all.view",           // View all companies in tenant
  "company.create",
  "company.view:all",           // View all companies
  "company.view:assigned",      // View only assigned companies
  "company.edit:all",
  "company.edit:assigned",
  "company.delete:all",
  "company.delete:assigned",
  "company.manage:all",
  "company.manage:assigned",
  "company.users.invite",
  "company.users.assign",
  "company.teams.manage",

  // Job permissions
  "job.*",
  "job.create:all",
  "job.create:assigned",
  "job.view:all",
  "job.view:assigned",
  "job.view:own",
  "job.edit:all",
  "job.edit:assigned",
  "job.edit:own",
  "job.delete:all",
  "job.delete:assigned",
  "job.delete:own",
  "job.publish:all",
  "job.publish:assigned",
  "job.publish:own",
  "job.archive:all",
  "job.archive:assigned",

  // Candidate permissions
  "candidate.*",
  "candidate.create:all",
  "candidate.create:assigned",
  "candidate.view:all",
  "candidate.view:assigned",
  "candidate.view:own",
  "candidate.edit:all",
  "candidate.edit:assigned",
  "candidate.edit:own",
  "candidate.delete:all",
  "candidate.delete:assigned",
  "candidate.delete:own",
  "candidate.search:all",
  "candidate.search:assigned",
  "candidate.export:all",
  "candidate.export:assigned",
  "candidate.email:all",
  "candidate.email:assigned",

  // Evaluation permissions
  "evaluation.*",
  "evaluation.create:all",
  "evaluation.create:assigned",
  "evaluation.view:all",
  "evaluation.view:assigned",
  "evaluation.view:own",
  "evaluation.edit:all",
  "evaluation.edit:assigned",
  "evaluation.edit:own",
  "evaluation.delete:all",
  "evaluation.delete:assigned",
  "evaluation.delete:own",
  "evaluation.score:all",
  "evaluation.score:assigned",
  "evaluation.score:own",
  "evaluation.advanced_scoring",
  "evaluation.templates.manage",
  "evaluation.assign",
  "evaluation.calibrate",

  // Analytics permissions
  "analytics.*",
  "analytics.view:all",
  "analytics.view:assigned",
  "analytics.view:own",
  "analytics.advanced",
  "analytics.export:all",
  "analytics.export:assigned",
  "analytics.custom",
  "analytics.predictions",

  // User management permissions
  "user.*",
  "user.invite",
  "user.view:all",
  "user.view:assigned",
  "user.edit:all",
  "user.edit:assigned",
  "user.edit:own",
  "user.delete:all",
  "user.delete:assigned",
  "user.permissions.view",
  "user.permissions.manage",
  "user.roles.assign",
  "user.activity.view",

  // Integration permissions
  "integration.*",
  "integration.ats.configure",
  "integration.ats.sync",
  "integration.api.view",
  "integration.api.create",
  "integration.api.manage",
  "integration.webhooks.manage",
  "integration.exports.schedule",

  // Report permissions
  "report.*",
  "report.view:all",
  "report.view:assigned",
  "report.create",
  "report.schedule",
  "report.export:all",
  "report.export:assigned",

  // Communication permissions
  "communication.*",
  "communication.email.send",
  "communication.email.templates",
  "communication.sms.send",
  "communication.notifications.manage",

  // Partner-specific permissions
  "partner.*",
  "partner.tenants.view",
  "partner.clients.manage",
  "partner.candidates.share",
  "partner.jobs.post",
  "partner.analytics.view",
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