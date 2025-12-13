const COMPANY_STAGES = [
  { id: "pre_seed", label: "Pre-Seed", shortDescription: "Idea / MVP stage" },
  { id: "seed", label: "Seed", shortDescription: "Initial funding round" },
  {
    id: "series_a",
    label: "Series A",
    shortDescription: "Proven product-market fit",
  },
  { id: "series_b", label: "Series B", shortDescription: "Building scale" },
  {
    id: "series_c_plus",
    label: "Series C+",
    shortDescription: "Late-stage growth",
  },
  { id: "growth", label: "Growth Stage", shortDescription: "Rapid expansion" },
  {
    id: "mature",
    label: "Mature",
    shortDescription: "Established & profitable",
  },
  {
    id: "enterprise",
    label: "Enterprise",
    shortDescription: "Large enterprise focus",
  },
  { id: "public", label: "Public", shortDescription: "Publicly traded" },
] as const;
export type CompanyStage = (typeof COMPANY_STAGES)[number]["id"];

const COMPANY_SIZES = [
  { id: "1_10", label: "1–10" },
  { id: "11_50", label: "11–50" },
  { id: "51_200", label: "51–200" },
  { id: "201_500", label: "201–500" },
  {
    id: "501_1000",
    label: "501–1,000",
    shortDescription: "Large organization",
  },
  {
    id: "1001_5000",
    label: "1,001–5,000",
    shortDescription: "Very large company",
  },
  { id: "5001_plus", label: "5,001+", shortDescription: "Enterprise giant" },
] as const;

export type CompanySize = (typeof COMPANY_SIZES)[number]["id"];

export const DEFAULT_COMPANY_STEPS: CompanyStep[] = [
  {
    id: "recruiter_screening",
    name: "Recruiter Screening",
    description:
      "Initial review of resume, cover letter, and application materials to assess basic qualifications",
    color: "#FFB800",
    icon: "🕵️‍♂️",
    order: 1,
    canDelete: false,
    canReorder: false,
  },
  {
    id: "manager_interview",
    name: "Manager Interview",
    description:
      "In-depth technical and behavioral interview with the hiring manager to evaluate skills, experience, and cultural fit",
    color: "#00BFFF",
    icon: "👔",
    order: 2,
    canDelete: false,
    canReorder: true,
  },
  {
    id: "panel_interview",
    name: "Panel Interview",
    description:
      "Interview with a panel of team members to assess collaboration skills and technical expertise",
    color: "#FF69B4",
    icon: "👥",
    order: 3,
    canDelete: false,
    canReorder: true,
  },
];

export const INDUSTRIES = [
  {
    id: "technology",
    label: "Technology",
    description: "Software, hardware, IT services",
  },
  {
    id: "healthcare",
    label: "Healthcare",
    description: "Medical, health tech, pharma",
  },
  {
    id: "finance",
    label: "Finance",
    description: "Banking, fintech, insurance",
  },
  {
    id: "ecommerce",
    label: "E-commerce",
    description: "Online retail and marketplaces",
  },
  {
    id: "education",
    label: "Education",
    description: "EdTech, learning platforms",
  },
  {
    id: "manufacturing",
    label: "Manufacturing",
    description: "Production, industrial",
  },
  { id: "retail", label: "Retail", description: "Physical and digital retail" },
  {
    id: "real_estate",
    label: "Real Estate",
    description: "Property, PropTech",
  },
  {
    id: "media",
    label: "Media & Entertainment",
    description: "Content, streaming, publishing",
  },
  {
    id: "travel",
    label: "Travel & Hospitality",
    description: "Tourism, hotels, transportation",
  },
  {
    id: "food",
    label: "Food & Beverage",
    description: "Restaurants, food tech, delivery",
  },
  { id: "energy", label: "Energy", description: "Power, utilities, cleantech" },
  {
    id: "logistics",
    label: "Logistics",
    description: "Supply chain, delivery, warehousing",
  },
  {
    id: "telecommunications",
    label: "Telecommunications",
    description: "Telecom, connectivity",
  },
  {
    id: "automotive",
    label: "Automotive",
    description: "Vehicles, mobility, transportation",
  },
  {
    id: "agriculture",
    label: "Agriculture",
    description: "Farming, AgTech, food production",
  },
  {
    id: "construction",
    label: "Construction",
    description: "Building, infrastructure, ConTech",
  },
  {
    id: "government",
    label: "Government & Public Sector",
    description: "Public services, GovTech",
  },
  {
    id: "nonprofit",
    label: "Non-Profit",
    description: "Social impact, charitable organizations",
  },
  { id: "other", label: "Other", description: "Other industry" },
] as const;
export type Industry = (typeof INDUSTRIES)[number]["id"];

export interface CompanyContext {
  industry: Industry;
  subIndustry?: string;
  size: CompanySize;
  location: string;
  stage?: CompanyStage;
  missionStatement: string;
  values: string;
  overview: string;
}

export const TechCategory = [
  {
    id: "languages",
    label: "Languages",
    description: "Programming languages",
    icon: "🔤",
  },
  {
    id: "frontend",
    label: "Frontend",
    description: "Frameworks, libraries, and tools for the front-end",
    icon: "🖥️",
  },
  {
    id: "backend",
    label: "Backend",
    description: "Backend frameworks, APIs, servers, and runtime",
    icon: "⚙️",
  },
  {
    id: "databases",
    label: "Databases & Storage",
    description: "SQL, NoSQL, caching, file storage, etc.",
    icon: "💾",
  },
  {
    id: "cloud_devops",
    label: "Cloud, DevOps & Infra",
    description: "Cloud platforms, CI/CD, containers, monitoring, logging",
    icon: "☁️",
  },
  {
    id: "tools",
    label: "Tools & Utilities",
    description: "Testing, collaboration, design, analytics, etc.",
    icon: "🔧",
  },
];
export type TechCategory = (typeof TechCategory)[number];

// later make this so its a pool of tech stack items that any user can use, not tied to a specific company so finding tech stack items is easier
export interface TechStackItem {
  id: string;
  name: string;
  category: TechCategory["id"];
  description: string;
}

// Enhanced tech stack item with company/position-specific usage context
export interface TechStackItemWithUsage extends TechStackItem {
  usageDescription?: string; // How this tool is specifically used in this context
  companySpecific?: boolean; // Indicates if this includes company-specific usage info
}

export interface CompanyValue {
  name: string;
  description: string;
  color: string;
  icon: string; // emoji
}

export interface CompanyStep {
  id?: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  order: number;
  canDelete?: boolean;
  canReorder?: boolean;
  questionsEnabled?: boolean; // Whether to generate questions for this stage (default: true)
}

export const POSITION_LEVELS = [
  {
    id: "entry_level",
    label: "Entry Level",
    description: "Fresh graduates and career starters",
    experience: "0-2 years",
  },
  {
    id: "junior",
    label: "Junior",
    description: "Early career professionals",
    experience: "2-4 years",
  },
  {
    id: "mid_level",
    label: "Mid-Level",
    description: "Experienced professionals",
    experience: "4-7 years",
  },
  {
    id: "senior",
    label: "Senior",
    description: "Seasoned professionals",
    experience: "7+ years",
  },
  {
    id: "lead",
    label: "Lead",
    description:
      "Team leaders and technical leads with mentoring responsibilities",
    experience: "-",
  },
  {
    id: "manager",
    label: "Manager",
    description: "People managers responsible for team performance and growth",
    experience: "-",
  },
  {
    id: "senior_manager",
    label: "Senior Manager",
    description: "Experienced managers overseeing multiple teams or projects",
    experience: "-",
  },
  {
    id: "director",
    label: "Director",
    description: "Strategic leaders responsible for department-level decisions",
    experience: "-",
  },
  {
    id: "senior_director",
    label: "Senior Director",
    description:
      "Senior strategic leaders with cross-functional responsibilities",
    experience: "-",
  },
  {
    id: "vice_president",
    label: "Vice President",
    description: "Executive leaders driving organizational strategy",
    experience: "-",
  },
  {
    id: "senior_vice_president",
    label: "Senior Vice President",
    description: "Top-tier executives with company-wide impact",
    experience: "-",
  },
  {
    id: "executive",
    label: "Executive",
    description: "C-suite and top executive positions",
    experience: "-",
  },
] as const;
export type PositionLevel = (typeof POSITION_LEVELS)[number]["id"];

export interface JobPositionDetails {
  impact: string;
  scope: string;
  responsibilities: string[];
}

export interface JobPosition {
  id: string;
  level: PositionLevel;
  description: string;
  extended_description?: string; // Additional detailed information about the position
  specificDetails: JobPositionDetails;
  specificTools?: TechStackItemWithUsage[];
  status: "draft" | "generated" | "archived";
}

export interface Postion {
  id: string;
  title: string;
  baseDetails: JobPositionDetails;
  baseTools?: TechStackItemWithUsage[];
  pool: JobPosition[];
}

export interface Company {
  id: string;
  name: string;
  context?: CompanyContext;
  techStack?: TechStackItemWithUsage[];
  values?: CompanyValue[];
  steps?: CompanyStep[];
  positions?: Postion[];
}
