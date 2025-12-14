/**
 * System-level enums and constants
 */

/**
 * Application statuses
 */
export const applicationStatuses = [
  "applied",
  "in_process",
  "screening",
  "interviewing",
  "offer",
  "hired",
  "rejected",
  "withdrawn",
] as const;

export type ApplicationStatus = (typeof applicationStatuses)[number];

/**
 * Tenant subscription plans
 */
export enum TenantPlan {
  Free = "free",
  Standard = "standard",
  Enterprise = "enterprise",
}

/**
 * Tenant status
 */
export enum TenantStatus {
  Active = "active",
  Suspended = "suspended",
  Trial = "trial",
}

/**
 * Billing cycles
 */
export enum BillingCycle {
  Monthly = "monthly",
  Yearly = "yearly",
}

/**
 * Payment methods
 */
export enum PaymentMethod {
  Card = "card",
  Invoice = "invoice",
  PurchaseOrder = "po",
}

/**
 * Partner business types
 */
export enum PartnerBusinessType {
  Reseller = "reseller",
  Consultant = "consultant",
  ImplementationPartner = "implementation_partner",
}

/**
 * Collection names in database
 */
export const collections = {
  // Core collections
  tenants: "tenants",
  users: "users",
  companies: "companies",

  // Recruitment collections
  jobs: "jobs",
  candidates: "candidates",
  applications: "applications",

  // Evaluation collections
  evaluationGuidelines: "evaluation-guidelines",
  stageEvaluations: "stage-evaluations",
  evaluationTemplates: "evaluation-templates",
  skillAssessments: "skill-assessments",

  // KSA collections
  ksaGuidelines: "ksa-guidelines",
  ksaGuidelineTemplates: "ksa-guideline-templates",
  companyValues: "company-values",
  ksaEvaluationMappings: "ksa-evaluation-mappings",
  candidateKsaEvaluations: "candidate-ksa-evaluations",
  ksaResponseTemplates: "ksa-response-templates",
  ksaBenchmarks: "ksa-benchmarks",

  // Analytics collections
  analyticsReports: "analytics-reports",
  pipelineAnalytics: "pipeline-analytics",
  sourceAnalytics: "source-analytics",
  evaluatorAnalytics: "evaluator-analytics",
  candidateAnalytics: "candidate-analytics",
  trendAnalytics: "trend-analytics",
  dashboardWidgets: "dashboard-widgets",

  // Configuration collections
  tenantConfigs: "tenant-configs",
  partners: "partners",
} as const;

export type CollectionName = keyof typeof collections;

/**
 * Analytics report types
 */
export enum AnalyticsReportType {
  HiringPipeline = "hiring_pipeline",
  RecruitmentMetrics = "recruitment_metrics",
  Diversity = "diversity",
  Performance = "performance",
  Custom = "custom",
}

/**
 * Chart types for analytics
 */
export enum ChartType {
  Line = "line",
  Bar = "bar",
  Pie = "pie",
  Table = "table",
  Scatter = "scatter",
}

/**
 * Widget types for dashboards
 */
export enum WidgetType {
  Chart = "chart",
  Metric = "metric",
  Table = "table",
  List = "list",
  Custom = "custom",
}

/**
 * Integration types
 */
export enum IntegrationType {
  ATS = "ats",
  JobBoard = "job_board",
  HRIS = "hris",
  Calendar = "calendar",
  Slack = "slack",
}

/**
 * Communication types
 */
export enum CommunicationType {
  Email = "email",
  SMS = "sms",
  InApp = "in_app",
  Push = "push",
}

/**
 * File attachment types
 */
export enum AttachmentType {
  Resume = "resume",
  CoverLetter = "cover_letter",
  Portfolio = "portfolio",
  Transcript = "transcript",
  Certificate = "certificate",
  Assignment = "assignment",
  Other = "other",
}