// Enum definitions for the recruitment system
// These are now the authoritative type definitions

export enum JobLevel {
  Intern = "intern",
  Entry = "entry",
  Junior = "junior",
  Mid = "mid",
  Senior = "senior",
  Principal = "principal",
  TeamLead = "teamLead",
  Manager = "manager",
  Director = "director",
  VP = "vp",
  CLevel = "cLevel",
}

export const jobLevels: JobLevel[] = [
  JobLevel.Intern,
  JobLevel.Entry,
  JobLevel.Junior,
  JobLevel.Mid,
  JobLevel.Senior,
  JobLevel.Principal,
  JobLevel.TeamLead,
  JobLevel.Manager,
  JobLevel.Director,
  JobLevel.VP,
  JobLevel.CLevel,
];

export enum WorkEnvironment {
  Remote = "remote",
  Hybrid = "hybrid",
  Office = "office",
  Flexible = "flexible",
}

export const jobTypes = ["technical", "non-technical"] as const;

export type JobType = (typeof jobTypes)[number];

export const evaluatorRoles = [
  "sourcer",
  "recruiter",
  "hiring_manager",
  "technical_interviewer",
  "values_interviewer",
  "peer",
  "partner",
] as const;

export type EvaluatorRole = (typeof evaluatorRoles)[number];

export const evaluationSections = ["jobFit", "valuesFit", "custom"] as const;

export type EvaluationSection = (typeof evaluationSections)[number];

export const stageStatuses = [
  "not_started",
  "in_progress",
  "completed",
  "skipped",
] as const;

export type StageStatus = (typeof stageStatuses)[number];

export const applicationStatuses = [
  "applied",
  "in_process",
  "offer",
  "hired",
  "rejected",
  "withdrawn",
] as const;

export type ApplicationStatus = (typeof applicationStatuses)[number];

export const evaluationRecommendations = ["advance", "hold", "reject"] as const;

export type EvaluationRecommendation = (typeof evaluationRecommendations)[number];