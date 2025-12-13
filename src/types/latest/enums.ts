export enum Industries {
  Technology = "technology",
  Healthcare = "healthcare",
  Finance = "finance",
  Ecommerce = "ecommerce",
  Education = "education",
  Manufacturing = "manufacturing",
  Retail = "retail",
  RealEstate = "real_estate",
  Media = "media",
  Travel = "travel",
  Food = "food",
  Energy = "energy",
  Logistics = "logistics",
  Telecommunications = "telecommunications",
  Automotive = "automotive",
  Agriculture = "agriculture",
  Construction = "construction",
  Government = "government",
  Nonprofit = "nonprofit",
  Other = "other",
}

export enum CompanySize {
  Small = "small",
  Medium = "medium",
  Large = "large",
  Enterprise = "enterprise",
}

export enum CompanyStage {
  Startup = "startup",
  Growth = "growth",
  Established = "established",
  Enterprise = "enterprise",
}

export enum BusinessModel {
  B2B = "b2b",
  B2C = "b2c",
  C2C = "c2c",
  SaaS = "saas",
  Marketplace = "marketplace",
  Subscription = "subscription",
  Freemium = "freemium",
  Other = "other",
}

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
