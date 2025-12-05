import type { Company } from "./company";

// Optimized company profile for AI consumption
export interface OptimizedCompanyProfile {
  name: string;
  industry: string;
  sub_industry?: string;
  size: string; // Just the range, e.g., "1-10", "11-50"
  location: string;
  stage: {
    name: string;
    phase: "early" | "growth" | "mature" | "enterprise";
  };
}

// Optimized mission and culture
export interface OptimizedMissionCulture {
  mission_statement: string;
  core_values: Array<{
    name: string;
    description: string;
  }>;
}

// Optimized interview process
export interface OptimizedInterviewSteps {
  total_steps: number;
  steps: Array<{
    name: string;
    order: number;
    type: "screening" | "technical" | "behavioral" | "cultural" | "final";
    generates_questions: boolean;
    description: string; // Full description for AI context
  }>;
}

// Optimized technologies
export interface OptimizedTechnologies {
  languages: Array<{
    name: string;
    usage_context: string;
    company_specific: boolean;
  }>;
  frameworks: Array<{
    name: string;
    type: "frontend" | "backend" | "mobile" | "fullstack";
    description: string;
    company_specific: boolean;
  }>;
  databases: Array<{
    name: string;
    type: "sql" | "nosql" | "cache" | "search";
    usage_pattern: string;
    scale: string;
    company_specific: boolean;
  }>;
  infrastructure: Array<{
    name: string;
    category: "cloud" | "devops" | "monitoring" | "deployment";
    purpose: string;
    company_specific: boolean;
  }>;
  tools: Array<{
    name: string;
    category: "testing" | "collaboration" | "design" | "analytics";
    purpose: string;
    company_specific: boolean;
  }>;
}

// Optimized position information
export interface OptimizedPosition {
  title: string;
  category: "engineering" | "product" | "design" | "leadership" | "other";
  seniority_level: number; // 1-10 scale
  total_levels: number;

  // Role requirements and context
  role_requirements: {
    core_responsibilities: string[];
    key_objectives: string[];
    impact_areas: string[];
    scope: "individual" | "team" | "cross_functional" | "product" | "company" | "market";
    reach: "internal" | "customer_facing" | "industry_wide";
    complexity: "simple" | "moderate" | "complex" | "strategic";
  };

  // Position-specific work environment
  work_environment?: {
    remote_friendly: boolean;
    collaboration_style: string;
    pace: string;
    autonomy_level: number; // 1-10 scale based on seniority
    meeting_frequency: string;
  };

  // Extended job descriptions from the position pool
  extended_descriptions: string[];

  // Tools and technologies specific to this position
  position_tools: Array<{
    name: string;
    category: string;
    usage_frequency: "daily" | "weekly" | "occasional";
    proficiency_required: number; // 1-10 scale
    company_specific_context?: string;
    job_specific_usage: string; // How this specific role uses the tool
  }>;
}


// Main optimized company interface
export interface OptimizedCompany {
  company_profile: OptimizedCompanyProfile;
  mission_and_culture: OptimizedMissionCulture;
  interview_steps: OptimizedInterviewSteps;
  technologies: OptimizedTechnologies;
  positions: OptimizedPosition[];
}

// Optimizer function type
export type CompanyOptimizer = (company: Company) => OptimizedCompany;

// Helper type for optimization result
export interface OptimizationResult {
  optimized_company: OptimizedCompany;
  optimization_metadata: {
    processing_time: number;
  };
}