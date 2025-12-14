/**
 * Job-related enums and constants
 */

/**
 * Job seniority levels
 */
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

/**
 * Work environment types
 */
export enum WorkEnvironment {
  Remote = "remote",
  Hybrid = "hybrid",
  Office = "office",
  Flexible = "flexible",
}

/**
 * Job types - technical vs non-technical
 */
export const jobTypes = ["technical", "non-technical"] as const;
export type JobType = (typeof jobTypes)[number];

/**
 * Employment types
 */
export enum EmploymentType {
  FullTime = "full_time",
  PartTime = "part_time",
  Contract = "contract",
  Temporary = "temporary",
  Internship = "internship",
  Fellowship = "fellowship",
}

/**
 * Company size categories
 */
export enum CompanySize {
  Startup = "startup",
  Small = "small",
  Medium = "medium",
  Large = "large",
  Enterprise = "enterprise",
}

/**
 * Company growth stage
 */
export enum CompanyStage {
  Seed = "seed",
  Early = "early",
  Growth = "growth",
  Mature = "mature",
  Declining = "declining",
}

/**
 * Business model types
 */
export enum BusinessModel {
  B2B = "b2b",
  B2C = "b2c",
  B2B2C = "b2b2c",
  Marketplace = "marketplace",
  SaaS = "saas",
  Other = "other",
}

/**
 * Remote policy types
 */
export enum RemotePolicy {
  FullyRemote = "fully_remote",
  Hybrid = "hybrid",
  Onsite = "onsite",
  Flexible = "flexible",
}

/**
 * Work culture types
 */
export enum WorkCulture {
  Casual = "casual",
  Business = "business",
  Creative = "creative",
  Technical = "technical",
}

/**
 * Department types
 */
export const departments = [
  "engineering",
  "product",
  "design",
  "sales",
  "marketing",
  "operations",
  "finance",
  "hr",
  "legal",
  "support",
  "customer_success",
  "data_science",
  "research",
  "infrastructure",
  "security",
  "compliance",
] as const;

export type Department = (typeof departments)[number];