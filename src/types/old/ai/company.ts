/**
 * Company Context Input Types
 * Based on the CompanyContextInput JSON structure for interview question generation
 */

export interface CompanyProfile {
  /** Legal company name */
  name: string;

  /** Industry sector or domain */
  industry: string;

  /** Specific industry sub-category */
  sub_industry: string;

  /** Company size (employee count, revenue, etc.) */
  size: string;

  /** Physical location or headquarters */
  location: string;

  /** Current business stage information */
  stage: {
    /** Stage name (e.g., "Series B", "Seed", etc.) */
    name: string;
    /** Current business phase */
    phase: string;
  };
}

export interface CoreValue {
  /** Name of the core value */
  name: string;
  /** Description of what the core value means */
  description: string;
}

export interface MissionAndCulture {
  /** Official mission statement */
  mission_statement: string;

  /** Core values that guide company decisions and behavior */
  core_values: CoreValue[];
}

export interface InterviewStep {
  /** Name of the interview step */
  name: string;

  /** Order in which this step occurs */
  order: number;

  /** Type of interview (screening, technical, cultural, final) */
  type: string;

  /** Whether this step generates questions */
  generates_questions: boolean;

  /** Description of what happens in this step */
  description: string;
}

export interface InterviewSteps {
  /** Total number of interview steps */
  total_steps: number;

  /** Array of interview steps in order */
  steps: InterviewStep[];
}

export interface Language {
  /** Name of the programming language */
  name: string;

  /** Whether this is a company-specific language */
  company_specific: boolean;
}

export interface Framework {
  /** Name of the framework */
  name: string;

  /** Type of framework (fullstack, frontend, backend) */
  type: string;

  /** Description of the framework and its purpose */
  description: string;

  /** Whether this is a company-specific framework */
  company_specific: boolean;
}

export interface Database {
  /** Name of the database */
  name: string;

  /** Type of database (sql, nosql, cache, etc.) */
  type: string;

  /** How the database is typically used */
  usage_pattern: string;

  /** Scale of the database (small, medium, large) */
  scale: string;

  /** Whether this is a company-specific database */
  company_specific: boolean;
}

export interface Infrastructure {
  /** Name of the infrastructure tool */
  name: string;

  /** Category of infrastructure (cloud, on-premise, etc.) */
  category: string;

  /** Purpose and use case */
  purpose: string;

  /** Whether this is a company-specific infrastructure */
  company_specific: boolean;
}

export interface Tool {
  /** Name of the tool */
  name: string;

  /** Category of the tool */
  category: string;

  /** Primary purpose of the tool */
  purpose: string;

  /** Whether this is a company-specific tool */
  company_specific: boolean;
}

export interface Technologies {
  /** Programming languages used */
  languages: Language[];

  /** Frameworks and libraries */
  frameworks: Framework[];

  /** Database systems */
  databases: Database[];

  /** Infrastructure and cloud services */
  infrastructure: Infrastructure[];

  /** Development and collaboration tools */
  tools: Tool[];
}

export interface RoleRequirements {
  /** Main responsibilities and duties */
  core_responsibilities: string[];

  /** Key objectives and goals */
  key_objectives: string[];

  /** Areas where the role has impact */
  impact_areas: string[];

  /** Scope of impact (team, department, company) */
  scope: string;

  /** Reach of influence (internal, customer_facing) */
  reach: string;

  /** Complexity of work (tactical, strategic) */
  complexity: string;
}

export interface PositionTool {
  /** Name of the tool */
  name: string;

  /** Category of the tool */
  category: string;

  /** How often this tool is used */
  usage_frequency: string;

  /** Required proficiency level (1-10) */
  proficiency_required: number;

  /** Company-specific context for tool usage */
  company_specific_context?: string;

  /** How this tool is used specifically for this role */
  job_specific_usage: string;
}

export interface Position {
  /** Job title */
  title: string;

  /** Role category (engineering, leadership, etc.) */
  category: string;

  /** Seniority level (1-10 scale) */
  seniority_level: number;

  /** Total levels in this career path */
  total_levels: number;

  /** Role requirements and responsibilities */
  role_requirements: RoleRequirements;

  /** Extended descriptions of the role */
  extended_descriptions: string[];

  /** Tools specific to this position */
  position_tools: PositionTool[];
}

/**
 * Complete Company Context Input data structure
 * Contains all company information needed for AI-powered interview question generation
 */
export interface CompanyContextInput {
  /** Basic company information and profile */
  company_profile: CompanyProfile;

  /** Company mission, values, and cultural information */
  mission_and_culture: MissionAndCulture;

  /** Interview process structure and steps */
  interview_steps: InterviewSteps;

  /** Technical stack and tools used by the company */
  technologies: Technologies;

  /** Job positions for which to generate interview questions */
  positions: Position[];
}