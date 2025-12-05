/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Company, CompanyStep } from "../_types/company";
import type {
  OptimizedCompany,
  OptimizedCompanyProfile,
  OptimizedMissionCulture,
  OptimizedInterviewSteps,
  OptimizedTechnologies,
  OptimizedPosition,
  OptimizationResult,
} from "../_types/optimized";

// Helper functions for data categorization
function categorizeCompanySize(size: string): {
  range: string;
  category: "startup" | "small" | "medium" | "large" | "enterprise";
  level: number;
} {
  const sizeMap: Record<
    string,
    {
      range: string;
      category: "startup" | "small" | "medium" | "large" | "enterprise";
      level: number;
    }
  > = {
    "1_10": { range: "1-10", category: "startup", level: 2 },
    "11_50": { range: "11-50", category: "small", level: 3 },
    "51_200": { range: "51-200", category: "small", level: 4 },
    "201_500": { range: "201-500", category: "medium", level: 6 },
    "501_1000": { range: "501-1,000", category: "medium", level: 7 },
    "1001_5000": { range: "1,001-5,000", category: "large", level: 8 },
    "5001_plus": { range: "5,001+", category: "enterprise", level: 10 },
  };
  return sizeMap[size] || { range: "Unknown", category: "startup", level: 1 };
}

function categorizeCompanyStage(stage: string | undefined): {
  name: string;
  phase: "early" | "growth" | "mature" | "enterprise";
  description: string;
  characteristics: string[];
} {
  const stageMap: Record<
    string,
    {
      name: string;
      phase: "early" | "growth" | "mature" | "enterprise";
      description: string;
      characteristics: string[];
    }
  > = {
    pre_seed: {
      name: "Pre-Seed",
      phase: "early",
      description:
        "Idea/MVP stage with minimal funding, focused on product validation",
      characteristics: [
        "founder-led hiring",
        "limited structure",
        "high risk tolerance",
        "culture-driven questions",
        "focus on potential and vision",
      ],
    },
    seed: {
      name: "Seed",
      phase: "early",
      description:
        "Initial funding round, building initial team and product-market fit",
      characteristics: [
        "early team building",
        "role flexibility",
        "culture fit critical",
        "focus on adaptability and growth mindset",
      ],
    },
    series_a: {
      name: "Series A",
      phase: "growth",
      description: "Proven product-market fit, scaling team and processes",
      characteristics: [
        "structured hiring",
        "process development",
        "balance of culture and skills",
        "focus on scalability experience",
      ],
    },
    series_b: {
      name: "Series B",
      phase: "growth",
      description:
        "Rapid expansion, building specialized teams and departments",
      characteristics: [
        "specialized roles",
        "middle management",
        "technical and leadership assessment",
        "focus on domain expertise",
      ],
    },
    series_c_plus: {
      name: "Series C+",
      phase: "mature",
      description:
        "Late-stage growth, optimizing processes and preparing for scale",
      characteristics: [
        "senior leadership",
        "cross-functional collaboration",
        "strategic thinking",
        "focus on leadership and mentorship",
      ],
    },
    growth: {
      name: "Growth Stage",
      phase: "growth",
      description: "Rapid business expansion with significant team scaling",
      characteristics: [
        "fast-paced environment",
        "high autonomy",
        "impact-oriented questions",
        "focus on execution and results",
      ],
    },
    mature: {
      name: "Mature",
      phase: "mature",
      description: "Established business with stable processes and large teams",
      characteristics: [
        "structured interviews",
        "process optimization",
        "collaboration skills",
        "focus on process improvement and mentorship",
      ],
    },
    enterprise: {
      name: "Enterprise",
      phase: "enterprise",
      description:
        "Large organization with complex hierarchies and established protocols",
      characteristics: [
        "formal assessment centers",
        "enterprise experience",
        "stakeholder management",
        "focus on large-scale impact and enterprise systems",
      ],
    },
    public: {
      name: "Public",
      phase: "enterprise",
      description:
        "Publicly traded company with regulatory requirements and shareholder expectations",
      characteristics: [
        "compliance awareness",
        "public company experience",
        "board-level communication",
        "focus on governance and public accountability",
      ],
    },
  };
  return (
    stageMap[stage || ""] || {
      name: "Unknown",
      phase: "early",
      description: "Stage not specified - assume early-stage characteristics",
      characteristics: [
        "general assessment",
        "potential-focused",
        "adaptability key",
        "focus on core skills and culture fit",
      ],
    }
  );
}

function categorizeInterviewStage(
  step: CompanyStep,
  order: number
): { type: "screening" | "technical" | "behavioral" | "cultural" | "final" } {
  const stageType =
    order === 1
      ? "screening"
      : step.name.toLowerCase().includes("technical") ||
        step.name.toLowerCase().includes("coding")
      ? "technical"
      : step.name.toLowerCase().includes("behavioral") ||
        step.name.toLowerCase().includes("cultural")
      ? "cultural"
      : order > 3
      ? "final"
      : "behavioral";

  return { type: stageType };
}

// Enhanced scope detection that analyzes actual impact and scope descriptions
function determineEnhancedScope(
  impact: string,
  scopeDescription: string,
  seniorityLevel: number
): {
  scope:
    | "individual"
    | "team"
    | "cross_functional"
    | "product"
    | "company"
    | "market";
  reach: "internal" | "customer_facing" | "industry_wide";
  complexity: "simple" | "moderate" | "complex" | "strategic";
} {
  const impactLower = impact.toLowerCase();
  const scopeLower = scopeDescription.toLowerCase();

  // Determine scope level based on keywords and seniority
  let scope:
    | "individual"
    | "team"
    | "cross_functional"
    | "product"
    | "company"
    | "market" = "team";

  if (seniorityLevel >= 9) {
    scope = "company";
  } else if (
    impactLower.includes("market") ||
    impactLower.includes("industry") ||
    impactLower.includes("competitor")
  ) {
    scope = "market";
  } else if (
    impactLower.includes("company") ||
    impactLower.includes("organization") ||
    impactLower.includes("business")
  ) {
    scope = "company";
  } else if (
    impactLower.includes("product") ||
    impactLower.includes("customer") ||
    impactLower.includes("user")
  ) {
    scope = "product";
  } else if (
    impactLower.includes("cross") ||
    impactLower.includes("multiple") ||
    impactLower.includes("collaborat")
  ) {
    scope = "cross_functional";
  } else if (
    impactLower.includes("individual") ||
    impactLower.includes("personal") ||
    scopeLower.includes("individual")
  ) {
    scope = "individual";
  } else if (seniorityLevel <= 3) {
    scope = "individual";
  } else if (seniorityLevel >= 7) {
    scope = "cross_functional";
  }

  // Determine reach (internal vs external facing)
  let reach: "internal" | "customer_facing" | "industry_wide" = "internal";

  if (
    impactLower.includes("customer") ||
    impactLower.includes("user") ||
    impactLower.includes("client") ||
    impactLower.includes("external") ||
    impactLower.includes("public") ||
    impactLower.includes("market")
  ) {
    reach = "customer_facing";
  }

  if (
    seniorityLevel >= 9 ||
    impactLower.includes("industry") ||
    impactLower.includes("market leader") ||
    impactLower.includes("competitor") ||
    impactLower.includes("ecosystem")
  ) {
    reach = "industry_wide";
  }

  // Determine complexity based on scope and seniority
  let complexity: "simple" | "moderate" | "complex" | "strategic" = "moderate";

  if (scope === "individual" && seniorityLevel <= 4) {
    complexity = "simple";
  } else if (scope === "company" || scope === "market" || seniorityLevel >= 9) {
    complexity = "strategic";
  } else if (
    scope === "cross_functional" ||
    scope === "product" ||
    seniorityLevel >= 7
  ) {
    complexity = "complex";
  }

  // Adjust complexity based on keywords
  if (
    impactLower.includes("strategic") ||
    impactLower.includes("leadership") ||
    impactLower.includes("vision")
  ) {
    complexity = "strategic";
  } else if (
    impactLower.includes("complex") ||
    impactLower.includes("multiple") ||
    impactLower.includes("coordinate")
  ) {
    complexity = "complex";
  } else if (
    impactLower.includes("simple") ||
    impactLower.includes("routine") ||
    impactLower.includes("basic")
  ) {
    complexity = "simple";
  }

  return { scope, reach, complexity };
}

// Job-specific tech usage mapping to understand how different roles use tools
function getJobSpecificTechUsage(
  toolName: string,
  positionCategory: string,
  seniorityLevel: number
): string {
  const toolLower = toolName.toLowerCase();

  const usageMap: Record<string, Record<string, string>> = {
    // React/Vue/etc usage by role
    react: {
      engineering:
        seniorityLevel >= 7
          ? "Architect scalable component systems and mentor junior developers"
          : "Build and maintain user interface components",
      leadership:
        "Guide frontend architecture decisions and ensure consistency across teams",
      product:
        "Understand frontend capabilities to make informed product decisions",
    },
    typescript: {
      engineering:
        seniorityLevel >= 7
          ? "Define type systems and architectural patterns"
          : "Write type-safe code and interfaces",
      leadership: "Establish coding standards and type safety guidelines",
    },
    nodejs: {
      engineering:
        seniorityLevel >= 7
          ? "Design microservices and API architecture"
          : "Build REST APIs and backend services",
      leadership: "Oversee backend infrastructure and technical decisions",
    },
    docker: {
      engineering:
        seniorityLevel >= 7
          ? "Design containerization strategy and CI/CD pipelines"
          : "Containerize applications and manage deployments",
      leadership: "Ensure consistent deployment practices across teams",
    },
    kubernetes: {
      engineering:
        seniorityLevel >= 7
          ? "Manage cluster resources and orchestrate complex deployments"
          : "Deploy applications and manage container workloads",
      leadership: "Guide cloud infrastructure decisions and scaling strategies",
    },
    aws: {
      engineering:
        seniorityLevel >= 7
          ? "Design cloud architecture and manage infrastructure costs"
          : "Deploy applications to AWS services and monitor performance",
      leadership:
        "Make strategic decisions about cloud investments and vendor relationships",
    },
    postgresql: {
      engineering:
        seniorityLevel >= 7
          ? "Design database schemas and optimize performance"
          : "Write queries and manage database operations",
      leadership:
        "Ensure data governance and database strategy aligns with business goals",
    },
    github: {
      engineering:
        seniorityLevel >= 7
          ? "Manage repository strategy and code review processes"
          : "Commit code, manage branches, and participate in code reviews",
      leadership:
        "Establish development workflows and ensure code quality standards",
    },
    jira: {
      engineering:
        seniorityLevel >= 7
          ? "Lead sprint planning and manage technical backlog"
          : "Track tasks, update progress, and participate in sprint ceremonies",
      leadership:
        "Oversee project management processes and resource allocation",
    },
    figma: {
      design:
        seniorityLevel >= 7
          ? "Lead design systems and design collaboration workflows"
          : "Create user interfaces and collaborate with developers",
      engineering: "Review designs and provide implementation feedback",
      product: "Review mockups and ensure design meets product requirements",
    },
  };

  // Default usage based on seniority if no specific mapping exists
  const defaultUsage =
    seniorityLevel >= 7
      ? `Lead ${toolLower} implementation and architectural decisions`
      : `Use ${toolLower} for daily development tasks and collaborate with team members`;

  return usageMap[toolLower]?.[positionCategory] || defaultUsage;
}

function mapTechCategory(originalCategory: string): string {
  const categoryMap: Record<string, string> = {
    programming_languages: "languages",
    frameworks_libraries: "frameworks",
    datastorage: "databases",
    cloud_infrastructure: "infrastructure",
    devops_tools: "infrastructure",
    testing_tools: "tools",
    monitoring_tools: "infrastructure",
    collaboration_tools: "tools",
    specialized_technologies: "tools",
  };
  return categoryMap[originalCategory] || "tools";
}

function determinePositionCategory(
  title: string
): "engineering" | "product" | "design" | "leadership" | "other" {
  const titleLower = title.toLowerCase();
  if (
    titleLower.includes("engineer") ||
    titleLower.includes("developer") ||
    titleLower.includes("technical")
  ) {
    return "engineering";
  }
  if (
    titleLower.includes("manager") ||
    titleLower.includes("director") ||
    titleLower.includes("vp") ||
    titleLower.includes("lead")
  ) {
    return "leadership";
  }
  if (titleLower.includes("designer") || titleLower.includes("design")) {
    return "design";
  }
  if (titleLower.includes("product") || titleLower.includes("pm")) {
    return "product";
  }
  return "other";
}

function calculateSeniorityLevel(level: string): number {
  const levelMap: Record<string, number> = {
    entry_level: 2,
    junior: 3,
    mid_level: 5,
    senior: 7,
    lead: 8,
    manager: 8,
    senior_manager: 9,
    director: 9,
    senior_director: 9,
    vice_president: 10,
    senior_vice_president: 10,
    executive: 10,
  };
  return levelMap[level] || 5;
}

// Main optimizer function
export function optimizeCompanyForAI(company: Company): OptimizationResult {
  const startTime = Date.now();

  // Optimize company profile
  const sizeInfo = categorizeCompanySize(company.context?.size || "");
  const stageInfo = categorizeCompanyStage(company.context?.stage);

  const company_profile: OptimizedCompanyProfile = {
    name: company.name,
    industry: company.context?.industry || "unknown",
    sub_industry: company.context?.subIndustry,
    size: sizeInfo.range, // Just the string range
    location: company.context?.location || "unknown",
    stage: {
      name: stageInfo.name,
      phase: stageInfo.phase,
    },
  };

  // Optimize mission and culture
  const core_values =
    company.values?.map((v) => ({
      name: v.name,
      description: v.description,
    })) || [];

  const mission_and_culture: OptimizedMissionCulture = {
    mission_statement: company.context?.missionStatement || "",
    core_values,
  };

  // Optimize interview process
  const optimized_stages =
    company.steps?.map((step) => {
      const stageInfo = categorizeInterviewStage(step, step.order);
      return {
        name: step.name,
        order: step.order,
        type: stageInfo.type,
        generates_questions: step.questionsEnabled !== false,
        description: step.description || step.name, // Full description instead of keywords
      };
    }) || [];

  const interview_steps: OptimizedInterviewSteps = {
    total_steps: company.steps?.length || 0,
    steps: optimized_stages,
  };

  // Optimize technology stack

  const categorizedTech = {
    languages: [] as any[],
    frameworks: [] as any[],
    databases: [] as any[],
    infrastructure: [] as any[],
    tools: [] as any[],
  };

  company.techStack?.forEach((tech) => {
    const category = mapTechCategory(tech.category);
    const techItem = {
      name: tech.name,
      proficiency_level: tech.companySpecific ? 8 : 6,
      usage_context: tech.usageDescription || tech.description,
      company_specific: tech.companySpecific || false,
    };

    switch (category) {
      case "languages":
        categorizedTech.languages.push(techItem);
        break;
      case "frameworks":
        categorizedTech.frameworks.push({
          ...techItem,
          type: tech.category.includes("frontend")
            ? "frontend"
            : tech.category.includes("backend")
            ? "backend"
            : "fullstack",
          description: tech.description, // Full description instead of keywords
        });
        break;
      case "databases":
        categorizedTech.databases.push({
          ...techItem,
          type: tech.name.toLowerCase().includes("sql")
            ? "sql"
            : tech.name.toLowerCase().includes("redis") ||
              tech.name.toLowerCase().includes("cache")
            ? "cache"
            : "nosql",
          usage_pattern: tech.usageDescription || "standard usage",
          scale:
            company.context?.size === "5001_plus"
              ? "large"
              : company.context?.size === "1001_5000"
              ? "medium"
              : "small",
        });
        break;
      case "infrastructure":
        categorizedTech.infrastructure.push({
          name: tech.name,
          category: tech.category.includes("devops")
            ? "devops"
            : tech.category.includes("monitoring")
            ? "monitoring"
            : "cloud",
          purpose: tech.usageDescription || tech.description,
          company_specific: tech.companySpecific || false,
        });
        break;
      case "tools":
        categorizedTech.tools.push({
          ...techItem,
          category: tech.category.includes("testing")
            ? "testing"
            : tech.category.includes("collaboration")
            ? "collaboration"
            : "other",
          integration_level: tech.companySpecific ? 8 : 5,
        });
        break;
    }
  });

  const technologies: OptimizedTechnologies = {
    languages: categorizedTech.languages.map((lang) => ({
      name: lang.name,
      usage_context: lang.usageContext || lang.description,
      company_specific: lang.companySpecific || false,
    })),
    frameworks: categorizedTech.frameworks.map((fw) => ({
      name: fw.name,
      type: fw.type,
      description: fw.description,
      company_specific: fw.companySpecific || false,
    })),
    databases: categorizedTech.databases.map((db) => ({
      name: db.name,
      type: db.type,
      usage_pattern: db.usage_pattern || "standard usage",
      scale: db.scale || "small",
      company_specific: db.companySpecific || false,
    })),
    infrastructure: categorizedTech.infrastructure.map((infra) => ({
      name: infra.name,
      category: infra.category,
      purpose: infra.purpose || "infrastructure management",
      company_specific: infra.companySpecific || false,
    })),
    tools: categorizedTech.tools.map((tool) => ({
      name: tool.name,
      category: tool.category,
      purpose: tool.purpose || "general purpose tool",
      company_specific: tool.companySpecific || false,
    })),
  };

  // Optimize positions
  const positions: OptimizedPosition[] =
    company.positions?.map((position) => {
      const category = determinePositionCategory(position.title);
      const seniority_levels = position.pool.map((job) =>
        calculateSeniorityLevel(job.level)
      );
      const avg_seniority =
        seniority_levels.reduce((a, b) => a + b, 0) / seniority_levels.length;

      return {
        title: position.title,
        category,
        seniority_level: Math.round(avg_seniority),
        total_levels: position.pool.length,

        role_requirements: {
          // Consolidate responsibilities from base details and all position levels
          core_responsibilities: [
            ...position.baseDetails.responsibilities,
            ...position.pool.flatMap(
              (job) => job.specificDetails.responsibilities
            ),
          ].filter((resp, index, arr) => arr.indexOf(resp) === index), // Remove duplicates
          key_objectives: [position.baseDetails.impact],
          impact_areas: [position.baseDetails.scope],
          ...determineEnhancedScope(
            position.baseDetails.impact,
            position.baseDetails.scope,
            Math.round(avg_seniority)
          ),
        },

        extended_descriptions: position.pool
          .map((job) => job.extended_description)
          .filter((desc): desc is string => typeof desc === "string"),

        position_tools: [
          ...(position.baseTools || []),
          ...position.pool.flatMap((job) => job.specificTools || []),
        ].map((tool) => ({
          name: tool.name,
          category: tool.category,
          usage_frequency: "daily" as const,
          proficiency_required: tool.companySpecific ? 8 : 6,
          company_specific_context: tool.companySpecific
            ? tool.usageDescription
            : undefined,
          job_specific_usage: getJobSpecificTechUsage(
            tool.name,
            category,
            Math.round(avg_seniority)
          ),
        })),
      };
    }) || [];

  const optimized_company: OptimizedCompany = {
    company_profile,
    mission_and_culture,
    interview_steps,
    technologies,
    positions,
  };

  const processing_time = Date.now() - startTime;

  return {
    optimized_company,
    optimization_metadata: {
      processing_time,
    },
  };
}
