import type {
  Company,
  TechStackItem,
  TechStackItemWithUsage,
  CompanyValue,
  CompanyStep,
  Postion,
} from "../_types/company";
import { getAllTechItems } from "../_types/tech";

// Helper function to get curated tech stack for different company types
function getTechStackForCompany(
  industry: string,
  size: string
): TechStackItem[] {
  const allTechItems = getAllTechItems();

  // Select relevant tech items based on company profile
  const coreTech = [
    // Always include these
    "react",
    "typescript",
    "nodejs",
    "postgresql",
    "aws",
    "docker",
  ];

  const industrySpecific = {
    technology: [
      "python",
      "django",
      "fastapi",
      "redis",
      "kubernetes",
      "github",
      "jira",
    ],
    healthcare: ["python", "django", "tableau", "powerbi"],
    ecommerce: ["python", "django", "kubernetes", "new_relic", "datadog"],
  };

  const sizeSpecific = {
    small: ["github", "slack", "notion"],
    medium: ["github", "slack", "jira", "confluence", "notion"],
    large: [
      "github",
      "gitlab",
      "jira",
      "confluence",
      "notion",
      "slack",
      "datadog",
      "new_relic",
      "kubernetes",
    ],
  };

  // Combine all relevant tech IDs
  const relevantIds = [
    ...coreTech,
    ...(industrySpecific[industry as keyof typeof industrySpecific] || []),
    ...(sizeSpecific[size as keyof typeof sizeSpecific] || []),
  ];

  // Remove duplicates and convert to TechStackItems
  const uniqueIds = Array.from(new Set(relevantIds));

  return allTechItems.filter((item) => uniqueIds.includes(item.id));
}

// Helper function to get tech stack with company-specific usage descriptions
function getTechStackWithUsageForCompany(
  industry: string,
  size: string
): TechStackItemWithUsage[] {
  const baseTechStack = getTechStackForCompany(industry, size);

  // Define company-specific usage descriptions
  const industryUsage = {
    technology: {
      aws: "Enterprise cloud infrastructure with managed services and multi-account setup",
      jira: "Agile project management with custom workflows for software development",
      confluence:
        "Technical documentation and knowledge base for engineering teams",
      slack: "Engineering team coordination with DevOps and CI/CD integrations",
      notion: "Product specifications and engineering documentation",
      datadog: "Full-stack monitoring for SaaS applications and infrastructure",
      new_relic: "APM and performance monitoring for enterprise applications",
    },
    healthcare: {
      aws: "HIPAA-compliant cloud infrastructure with enhanced security controls",
      jira: "Healthcare project management with compliance and validation workflows",
      confluence: "Medical documentation and standard operating procedures",
      slack: "Clinical team coordination with HIPAA-compliant channels",
      notion: "Patient care protocols and medical staff documentation",
      datadog: "Healthcare application monitoring with patient data privacy",
      new_relic: "HIPAA-compliant application performance monitoring",
    },
    ecommerce: {
      aws: "High-availability e-commerce infrastructure with auto-scaling for traffic spikes",
      jira: "E-commerce project management with inventory and promotion workflows",
      confluence: "Product catalog management and e-commerce documentation",
      slack: "Retail team coordination with customer service integrations",
      notion: "Product descriptions and marketing campaign planning",
      datadog:
        "E-commerce monitoring with conversion tracking and payment processing",
      new_relic: "Shopping cart and checkout flow performance monitoring",
    },
  };

  const usageMap = industryUsage[industry as keyof typeof industryUsage] || {};

  return baseTechStack.map((item) => {
    const usageDescription = usageMap[item.id as keyof typeof usageMap];
    return {
      ...item,
      usageDescription: usageDescription || item.description, // Only add usage if it exists
      companySpecific: !!usageDescription, // Only mark as company-specific if we added custom usage
    };
  });
}

// Helper function to get tools for different position levels
function getToolsForPosition(positionTitle: string, level: string): string[] {
  const allTechItems = getAllTechItems();
  const levelMapping = {
    entry_level: {
      software_engineer: [
        "vs code",
        "git",
        "chrome_devtools",
        "postman",
        "slack",
        "linear",
      ],
      product_manager: [
        "jira",
        "confluence",
        "figma",
        "mixpanel",
        "google_analytics",
        "slack",
      ],
      healthcare_analyst: [
        "excel",
        "sql",
        "tableau",
        "python",
        "r",
        "power_bi",
        "spss",
        "jira",
      ],
      clinical_specialist: [
        "epic systems",
        "cerner",
        "microsoft_office",
        "project management software",
        "training platforms",
      ],
      marketing_director: [
        "slack",
        "notion",
        "google_analytics",
        "mailchimp",
        "hubspot",
        "figma",
      ],
      operations_manager: [
        "slack",
        "notion",
        "microsoft_office",
        "project management software",
        "aws console",
      ],
    },
    mid_level: {
      software_engineer: [
        "vs code",
        "git",
        "docker",
        "kubernetes",
        "jira",
        "datadog",
        "postman",
        "aws_cli",
        "slack",
      ],
      product_manager: [
        "jira",
        "confluence",
        "figma",
        "mixpanel",
        "amplitude",
        "notion",
        "linear",
        "slack",
      ],
      healthcare_analyst: [
        "python",
        "r",
        "sql",
        "tableau",
        "power_bi",
        "jupyter notebook",
        "tensorflow",
        "pytorch",
      ],
      clinical_specialist: [
        "epic systems",
        "cerner",
        "microsoft_office",
        "project management software",
        "training creation tools",
      ],
      marketing_director: [
        "slack",
        "notion",
        "google_analytics",
        "salesforce",
        "mailchimp",
        "hubspot",
        "adobe creative suite",
      ],
      operations_manager: [
        "slack",
        "notion",
        "microsoft_office",
        "aws console",
        "kubernetes",
        "monitoring tools",
      ],
    },
    senior: {
      software_engineer: [
        "vs code",
        "git",
        "docker",
        "kubernetes",
        "terraform",
        "datadog",
        "prometheus",
        "aws console",
        "slack",
      ],
      product_manager: [
        "jira",
        "confluence",
        "figma",
        "mixpanel",
        "amplitude",
        "notion",
        "linear",
        "slack",
        "power_bi",
      ],
      healthcare_analyst: [
        "python",
        "r",
        "sql",
        "tableau",
        "power_bi",
        "jupyter notebook",
        "tensorflow",
        "pytorch",
        "aws_sagemaker",
      ],
      clinical_specialist: [
        "epic systems",
        "cerner",
        "allscripts",
        "microsoft_office",
        "project management software",
        "training platforms",
      ],
      marketing_director: [
        "slack",
        "notion",
        "google_analytics",
        "salesforce",
        "adobe creative suite",
        "marketing automation",
      ],
      operations_manager: [
        "slack",
        "notion",
        "microsoft_office",
        "aws console",
        "terraform",
        "monitoring tools",
        "financial_systems",
      ],
    },
    executive: {
      president: [
        "microsoft_office",
        "notion",
        "slack",
        "zoom",
        "financial_systems",
        "board_management_tools",
        "strategic_planning_software",
      ],
    },
  };

  const levelConfig = levelMapping[level as keyof typeof levelMapping];
  if (!levelConfig) return [];

  const tools =
    (levelConfig[positionTitle as keyof typeof levelConfig] as string[]) || [];
  return tools.map((toolId) => {
    const techItem = allTechItems.find((item) => item.id === toolId);
    return techItem ? techItem.id : toolId.toLowerCase();
  });
}

// Helper function to get tools with position-specific usage descriptions
function getToolsWithUsageForPosition(
  positionTitle: string,
  level: string
): TechStackItemWithUsage[] {
  const allTechItems = getAllTechItems();
  const tools = getToolsForPosition(positionTitle, level);

  // Define position-specific usage descriptions
  const positionUsage = {
    software_engineer: {
      entry_level: {
        jira: "Learning issue tracking and agile workflows",
        slack: "Team communication and code reviews",
        notion: "Documentation and learning notes",
      },
      mid_level: {
        jira: "Code review participation and sprint planning",
        slack: "DevOps coordination and deployment discussions",
        notion: "Technical documentation and architecture notes",
      },
      senior: {
        jira: "Technical leadership and code review oversight",
        slack: "Architecture discussions and team leadership",
        notion: "System design documentation and best practices",
      },
    },
    product_manager: {
      mid_level: {
        jira: "Product backlog management and sprint planning",
        confluence: "Documentation and team knowledge base",
        figma: "Design collaboration and wireframing",
        mixpanel: "User analytics and product insights",
        notion: "Product planning and team organization",
      },
    },
    healthcare_analyst: {
      entry_level: {
        excel: "Basic data analysis and reporting",
        sql: "Database queries and data extraction",
        tableau: "Data visualization and dashboard creation",
        spss: "Statistical analysis and research",
      },
      senior: {
        python: "Advanced analytics and machine learning",
        tensorflow: "Predictive modeling and AI/ML development",
        aws_sagemaker: "Cloud machine learning and model deployment",
      },
    },
    implementation_specialist: {
      mid_level: {
        microsoft_office: "Documentation and training materials",
        jira: "Project management and issue tracking",
        confluence: "Knowledge base and documentation",
        slack: "Team coordination and communication",
        zoom: "Training sessions and demos",
        vs_code: "Configuration and scripting tasks",
      },
      senior: {
        microsoft_office: "Advanced documentation and template creation",
        jira: "Project leadership and cross-functional coordination",
        confluence: "Knowledge management architecture",
        slack: "Team leadership and stakeholder communication",
        zoom: "Executive presentations and training programs",
        vs_code: "Advanced scripting and automation workflows",
      },
    },
    president: {
      executive: {
        notion: "Strategic planning and board documentation",
        zoom: "Executive meetings and presentations",
        financial_systems: "Budget oversight and financial planning",
      },
    },
  };

  const positionUsageMap =
    positionUsage[positionTitle as keyof typeof positionUsage];
  const usageMap = positionUsageMap
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (positionUsageMap as any)[level] || {}
    : {};

  const result = tools
    .map((toolId) => {
      const techItem = allTechItems.find((item) => item.id === toolId);
      if (!techItem) {
        return null;
      }

      const usageDescription = usageMap[toolId as keyof typeof usageMap];
      return {
        ...techItem,
        usageDescription: usageDescription || techItem.description,
        companySpecific: !!usageDescription,
      };
    })
    .filter(Boolean) as TechStackItemWithUsage[];

  return result;
}

// Get tech stack items for each company
const techCompanyTechStack = getTechStackWithUsageForCompany(
  "technology",
  "201_500"
);
const healthcareTechStack = getTechStackWithUsageForCompany(
  "healthcare",
  "51_200"
);
const ecommerceTechStack = getTechStackWithUsageForCompany(
  "ecommerce",
  "1001_5000"
);

// Demo company values
const techCompanyValues: CompanyValue[] = [
  {
    name: "Innovation",
    description: "Pushing boundaries and exploring new possibilities",
    color: "#3B82F6",
    icon: "🚀",
  },
  {
    name: "Excellence",
    description: "Delivering high-quality solutions and exceeding expectations",
    color: "#10B981",
    icon: "⭐",
  },
  {
    name: "Collaboration",
    description: "Working together to achieve common goals",
    color: "#8B5CF6",
    icon: "🤝",
  },
  {
    name: "Growth",
    description: "Continuous learning and personal development",
    color: "#F59E0B",
    icon: "📚",
  },
];

const healthcareValues: CompanyValue[] = [
  {
    name: "Patient Care",
    description: "Putting patients first in everything we do",
    color: "#EF4444",
    icon: "❤️",
  },
  {
    name: "Innovation",
    description: "Advancing healthcare through technology and research",
    color: "#3B82F6",
    icon: "💡",
  },
  {
    name: "Integrity",
    description: "Operating with honesty and transparency",
    color: "#059669",
    icon: "🛡️",
  },
  {
    name: "Compassion",
    description: "Showing empathy and understanding in patient care",
    color: "#F59E0B",
    icon: "🤲",
  },
];

// Demo interview steps
const defaultSteps: CompanyStep[] = [
  {
    id: "screening",
    name: "Screening",
    description: "Initial resume and application review",
    color: "#3B82F6",
    icon: "📋",
    order: 1,
    canDelete: false,
    canReorder: false,
    questionsEnabled: true,
  },
  {
    id: "technical",
    name: "Technical Assessment",
    description: "Skills and technical evaluation",
    color: "#10B981",
    icon: "💻",
    order: 2,
    canDelete: false,
    canReorder: true,
    questionsEnabled: true,
  },
  {
    id: "behavioral",
    name: "Behavioral Interview",
    description: "Cultural fit and behavioral assessment",
    color: "#F59E0B",
    icon: "🗣️",
    order: 3,
    canDelete: false,
    canReorder: true,
    questionsEnabled: true,
  },
  {
    id: "final",
    name: "Final Interview",
    description: "Final decision-making interview",
    color: "#8B5CF6",
    icon: "🎯",
    order: 4,
    canDelete: false,
    canReorder: true,
    questionsEnabled: true,
  },
];

// Company-specific stages for TechCorp (tech company) - 2 additional steps
const techCorpStages: CompanyStep[] = [
  ...defaultSteps,
  {
    id: "system_design",
    name: "System Design Interview",
    description: "Architecture and system design evaluation for senior roles",
    color: "#059669",
    icon: "🏗️",
    order: 5,
    canDelete: true,
    canReorder: true,
    questionsEnabled: true,
  },
  {
    id: "culture_fit",
    name: "Culture Fit Assessment",
    description: "Team culture and collaboration evaluation",
    color: "#F59E0B",
    icon: "🤝",
    order: 6,
    canDelete: true,
    canReorder: true,
    questionsEnabled: false, // No questions - just evaluation
  },
];

// Company-specific stages for HealthInnovate (healthcare company) - 1 additional step
const healthInnovateStages: CompanyStep[] = [
  ...defaultSteps,
  {
    id: "compliance_review",
    name: "Compliance Review",
    description: "HIPAA compliance and healthcare regulation assessment",
    color: "#DC2626",
    icon: "🔒",
    order: 5,
    canDelete: false,
    canReorder: false,
    questionsEnabled: false, // No questions - regulatory review only
  },
];

// Company-specific stages for ECommerce Platform (ecommerce company) - 4 additional steps
const ecommerceStages: CompanyStep[] = [
  ...defaultSteps,
  {
    id: "business_case",
    name: "Business Case Interview",
    description: "E-commerce business acumen evaluation",
    color: "#EA580C",
    icon: "📊",
    order: 5,
    canDelete: true,
    canReorder: true,
    questionsEnabled: true,
  },
  {
    id: "product_strategy",
    name: "Product Strategy Session",
    description: "Product thinking and strategy assessment",
    color: "#0891B2",
    icon: "🚀",
    order: 6,
    canDelete: true,
    canReorder: true,
    questionsEnabled: true,
  },
  {
    id: "metrics_review",
    name: "Metrics Review",
    description: "Analytics and KPIs evaluation",
    color: "#10B981",
    icon: "📈",
    order: 7,
    canDelete: true,
    canReorder: true,
    questionsEnabled: false, // No questions - data review
  },
  {
    id: "team_lead_interview",
    name: "Team Lead Interview",
    description: "Leadership and team management assessment",
    color: "#6366F1",
    icon: "👨‍💼",
    order: 8,
    canDelete: true,
    canReorder: true,
    questionsEnabled: true,
  },
];

// Demo job positions for tech company
const techPositions: Postion[] = [
  {
    id: "software_engineer",
    title: "Software Engineer",
    baseDetails: {
      impact:
        "Transform business requirements into scalable software solutions that drive digital transformation",
      scope:
        "End-to-end software development from concept to deployment in agile teams",
      responsibilities: [
        "Design and develop robust software architecture",
        "Write clean, maintainable, and testable code",
        "Collaborate with product managers and designers",
        "Participate in code reviews and architectural discussions",
        "Optimize application performance and scalability",
      ],
    },
    baseTools: getToolsWithUsageForPosition("software_engineer", "senior"),
    pool: [
      {
        id: "se_entry",
        level: "entry_level",
        description: "Entry-level software engineer for our core platform team",
        extended_description:
          "This role is ideal for recent graduates or developers with 0-2 years of experience looking to grow their skills in a fast-paced environment. You'll work closely with senior engineers, participate in code reviews, and have opportunities to contribute to production features while learning modern development practices. The team follows agile methodologies with 2-week sprints and emphasizes mentorship and skill development. You'll have access to learning resources, conference opportunities, and a clear growth path within the engineering organization.",
        specificDetails: {
          impact:
            "Contributing to feature development while learning modern software engineering practices",
          scope:
            "Implementing well-defined features with mentorship from senior engineers",
          responsibilities: [
            "Develop and test features in React and Node.js",
            "Participate in daily standups and sprint planning",
            "Learn and apply company coding standards",
            "Collaborate with QA team to ensure quality deliverables",
            "Debug and resolve technical issues with guidance",
          ],
        },
        specificTools: getToolsWithUsageForPosition(
          "software_engineer",
          "entry_level"
        ),
        status: "draft",
      },
      {
        id: "se_mid",
        level: "mid_level",
        description:
          "Mid-level software engineer for our enterprise solutions team",
        specificDetails: {
          impact:
            "Leading feature development and mentoring junior engineers on complex projects",
          scope:
            "Owning major feature development from design through deployment",
          responsibilities: [
            "Design and implement complex system features",
            "Mentor junior engineers in best practices",
            "Lead technical discussions and architecture reviews",
            "Collaborate with cross-functional teams on integrations",
            "Optimize application performance and security",
          ],
        },
        specificTools: getToolsWithUsageForPosition(
          "software_engineer",
          "mid_level"
        ),
        status: "draft",
      },
      {
        id: "se_senior",
        level: "senior",
        description:
          "Senior software engineer for our platform architecture team",
        specificDetails: {
          impact:
            "Driving technical strategy and leading complex engineering initiatives across product lines",
          scope:
            "Technical leadership, architecture decisions, and mentorship of engineering teams",
          responsibilities: [
            "Lead system architecture and design decisions",
            "Mentor and develop engineering talent",
            "Drive engineering best practices and innovation",
            "Collaborate with CTO and product leadership on roadmap",
            "Evaluate and introduce new technologies",
          ],
        },
        specificTools: getToolsWithUsageForPosition(
          "software_engineer",
          "senior"
        ),
        status: "draft",
      },
    ],
  },
  {
    id: "product_manager",
    title: "Product Manager",
    baseDetails: {
      impact:
        "Shape product vision and roadmap to solve customer problems and drive business growth",
      scope:
        "End-to-end product management from market research to product launch",
      responsibilities: [
        "Define product strategy and roadmap",
        "Conduct market research and customer interviews",
        "Work with engineering teams on feature development",
        "Analyze product metrics and user feedback",
        "Collaborate with sales and marketing teams",
      ],
    },
    baseTools: getToolsWithUsageForPosition("product_manager", "mid_level"),
    pool: [
      {
        id: "pm_mid",
        level: "mid_level",
        description: "Product Manager for our core enterprise platform",
        extended_description:
          "This is a high-impact product management role requiring strong technical understanding and business acumen. You'll be the voice of the customer, working closely with engineering, design, and business stakeholders to deliver enterprise-grade solutions. The role involves significant stakeholder management, including C-level executives, and requires excellent communication and presentation skills. You'll have autonomy over product decisions while working within a collaborative environment. Success in this role typically leads to Senior Product Manager or Product Lead positions within 2-3 years, with opportunities to mentor junior PMs and lead larger product initiatives.",
        specificDetails: {
          impact:
            "Leading product development for key enterprise features that drive customer retention",
          scope:
            "Managing product backlog, user stories, and sprint planning with agile teams",
          responsibilities: [
            "Define and prioritize product features",
            "Write detailed user stories and acceptance criteria",
            "Work closely with engineering teams on development",
            "Analyze user feedback and product analytics",
            "Present product roadmap to stakeholders",
          ],
        },
        specificTools: getToolsWithUsageForPosition(
          "product_manager",
          "mid_level"
        ),
        status: "draft",
      },
    ],
  },
];

// Demo job positions for healthcare company
const healthcarePositions: Postion[] = [
  {
    id: "healthcare_analyst",
    title: "Healthcare Data Analyst",
    baseDetails: {
      impact:
        "Transform healthcare data into actionable insights that improve patient outcomes and reduce costs",
      scope:
        "Statistical analysis, dashboard creation, and reporting on healthcare metrics",
      responsibilities: [
        "Collect, clean, and analyze healthcare datasets",
        "Create statistical models and predictive analytics",
        "Develop dashboards and reports for clinical staff",
        "Ensure HIPAA compliance and data security",
        "Collaborate with clinical and administrative teams",
      ],
    },
    baseTools: getToolsWithUsageForPosition("healthcare_analyst", "mid_level"),
    pool: [
      {
        id: "ha_entry",
        level: "entry_level",
        description:
          "Healthcare Data Analyst focusing on patient outcomes analysis",
        extended_description:
          "This healthcare analyst position offers an opportunity to make a real impact on patient care while developing expertise in healthcare analytics and data science. You'll work with sensitive patient data requiring strict HIPAA compliance and attention to detail. The role provides exposure to various healthcare systems, including electronic health records and clinical databases. You'll collaborate with medical professionals, learning to translate clinical questions into data analysis projects. This position serves as an excellent foundation for a career in health informatics, with potential advancement to senior analyst, healthcare data scientist, or health informatics specialist roles. We provide comprehensive training in healthcare data systems and statistical analysis methods.",
        specificDetails: {
          impact:
            "Supporting clinical quality improvement initiatives through data analysis and reporting",
          scope:
            "Analyzing patient data trends and creating basic visualizations for medical staff",
          responsibilities: [
            "Clean and validate healthcare datasets",
            "Create basic statistical reports on patient outcomes",
            "Learn healthcare data systems and HIPAA requirements",
            "Assist senior analysts with research projects",
            "Maintain data dictionaries and documentation",
          ],
        },
        specificTools: getToolsWithUsageForPosition(
          "healthcare_analyst",
          "entry_level"
        ),
        status: "draft",
      },
      {
        id: "ha_senior",
        level: "senior",
        description:
          "Senior Healthcare Data Analyst specializing in predictive analytics",
        extended_description:
          "This senior healthcare analyst role focuses on advanced analytics and predictive modeling to improve patient outcomes and operational efficiency. You'll lead complex data analysis projects, working with cutting-edge healthcare data sets and emerging technologies like machine learning for healthcare applications. The position involves mentoring junior analysts and serving as a subject matter expert for healthcare data initiatives. You'll present findings to clinical leadership and executive stakeholders, influencing data-driven decision-making across the organization. This role requires deep understanding of healthcare systems, statistical analysis, and data visualization best practices. Opportunities exist to shape our healthcare analytics strategy and potentially transition into healthcare data science or health informatics leadership roles.",
        specificDetails: {
          impact:
            "Leading advanced analytics projects that predict patient outcomes and optimize treatment protocols",
          scope:
            "Designing analytical approaches, building predictive models, and presenting insights to executive leadership",
          responsibilities: [
            "Design and lead complex healthcare analytics studies",
            "Build predictive models for patient risk stratification",
            "Ensure compliance with healthcare data regulations",
            "Present findings to clinical leadership and board members",
            "Mentor junior analysts and establish best practices",
          ],
        },
        specificTools: getToolsWithUsageForPosition(
          "healthcare_analyst",
          "senior"
        ),
        status: "draft",
      },
    ],
  },
  {
    id: "clinical_specialist",
    title: "Clinical Implementation Specialist",
    baseDetails: {
      impact:
        "Enable successful adoption of healthcare technology through clinical expertise and training",
      scope:
        "Implementation support, training, and optimization of healthcare software systems",
      responsibilities: [
        "Train clinical staff on new software systems",
        "Gather feedback from healthcare providers",
        "Optimize workflows and system configurations",
        "Ensure clinical requirements are met in software design",
        "Support change management initiatives",
      ],
    },
    baseTools: getToolsWithUsageForPosition(
      "implementation_specialist",
      "mid_level"
    ),
    pool: [
      {
        id: "cs_mid",
        level: "mid_level",
        description:
          "Clinical Implementation Specialist for electronic health records",
        extended_description:
          "This clinical implementation specialist role combines healthcare knowledge with technical expertise to ensure successful EHR adoption. You'll work directly with physicians, nurses, and administrative staff to understand clinical workflows and translate them into system configurations. The position requires strong interpersonal skills as you'll be the primary point of contact for clinical users during implementations. You'll gain deep expertise in multiple EHR systems (Epic, Cerner, Allscripts) and healthcare IT standards. This role offers significant travel opportunities to client sites and the chance to see your direct impact on healthcare delivery. Success leads to senior implementation roles, project management positions, or healthcare IT consulting opportunities. We provide comprehensive EHR certification training and support for healthcare IT certifications.",
        specificDetails: {
          impact:
            "Ensuring successful EHR adoption that improves clinical efficiency and patient care",
          scope:
            "Managing implementation projects, training clinical staff, and optimizing system workflows",
          responsibilities: [
            "Conduct workflow analysis and optimization",
            "Train physicians, nurses, and administrative staff",
            "Configure system settings to match clinical workflows",
            "Provide go-live support and troubleshooting",
            "Collect and document user feedback",
          ],
        },
        specificTools: getToolsWithUsageForPosition(
          "implementation_specialist",
          "senior"
        ),
        status: "draft",
      },
    ],
  },
];

// Demo companies
export const demoCompanies: Company[] = [
  {
    id: "techcorp",
    name: "TechCorp Solutions",
    context: {
      industry: "technology",
      subIndustry: "Enterprise Software",
      size: "201_500",
      location: "San Francisco, CA",
      stage: "series_b",
      missionStatement:
        "We're dedicated to transforming businesses through innovative enterprise software that combines cutting-edge technology with practical business solutions. Our mission is to accelerate digital transformation and empower organizations to reach their full potential.",
      values:
        "We stand for innovation in technology, excellence in execution, customer-centricity in our approach, integrity in our relationships, and collaborative problem-solving. Our team puts passion into every solution, ensuring our clients achieve meaningful business outcomes.",
      overview:
        "TechCorp Solutions is a leading enterprise software company with 350 employees, specializing in cloud-based solutions, data analytics, and digital transformation tools for modern businesses. We operate primarily on a B2B model, serving Fortune 500 companies and growing enterprises.",
    },
    techStack: techCompanyTechStack,
    values: techCompanyValues,
    steps: techCorpStages,
    positions: techPositions,
  },
  {
    id: "healthinnovate",
    name: "HealthInnovate Systems",
    context: {
      industry: "healthcare",
      subIndustry: "Health Tech",
      size: "51_200",
      location: "Boston, MA",
      stage: "series_a",
      missionStatement:
        "At HealthInnovate Systems, we're dedicated to revolutionizing healthcare through innovative technology that improves patient outcomes and streamlines clinical workflows. Our mission is to empower healthcare providers with tools that transform how care is delivered.",
      values:
        "We stand for patient-centered care, innovation in health technology, integrity in data handling, collaboration among healthcare professionals, and excellence in clinical outcomes. Our team puts compassion into every solution, ensuring that patients receive the best possible care through technology.",
      overview:
        "HealthInnovate Systems is a health technology company with 120 employees, established in the digital health industry. We operate on a B2B model, partnering with hospitals, clinics, and healthcare systems to bring cutting-edge software solutions to medical professionals.",
    },
    techStack: healthcareTechStack.slice(0, 6), // Smaller tech stack for healthcare company
    values: healthcareValues,
    steps: healthInnovateStages,
    positions: healthcarePositions,
  },
  {
    id: "ecomm_platform",
    name: "Global Marketplace Pro",
    context: {
      industry: "ecommerce",
      subIndustry: "Online Marketplace",
      size: "1001_5000",
      location: "Seattle, WA",
      stage: "growth",
      missionStatement:
        "At Global Marketplace Pro, we're dedicated to connecting millions of buyers and sellers worldwide through a seamless, secure, and innovative online marketplace experience. Our mission is to democratize e-commerce and enable businesses of all sizes to thrive in the digital economy.",
      values:
        "We stand for customer obsession, innovation in marketplace technology, operational excellence in logistics, trust in every transaction, and sustainability in business practices. Our team puts dedication into every feature, ensuring that both buyers and sellers have exceptional experiences on our platform.",
      overview:
        "Global Marketplace Pro is a leading online marketplace company with 2,500 employees, established in the e-commerce industry. We operate on a B2B2C model, serving both business sellers and individual buyers across multiple product categories and geographic regions.",
    },
    techStack: ecommerceTechStack.concat([
      {
        id: "kubernetes",
        name: "Kubernetes",
        category: "cloud_infrastructure",
        description: "Container orchestration platform",
      },
      {
        id: "redis",
        name: "Redis",
        category: "datastorage",
        description: "In-memory data structure store",
      },
    ]),
    values: [
      {
        name: "Customer Focus",
        description: "Putting customers first in every decision",
        color: "#EF4444",
        icon: "🛍️",
      },
      {
        name: "Innovation",
        description: "Continuously improving and innovating",
        color: "#3B82F6",
        icon: "💡",
      },
      {
        name: "Speed",
        description: "Moving fast and iterating quickly",
        color: "#F59E0B",
        icon: "⚡",
      },
      {
        name: "Data-Driven",
        description: "Making decisions based on data and analytics",
        color: "#10B981",
        icon: "📊",
      },
    ],
    steps: ecommerceStages,
    positions: [
      {
        id: "president",
        title: "President",
        baseDetails: {
          impact:
            "Set company vision and strategic direction to achieve market leadership and sustainable growth",
          scope:
            "Overall company leadership, P&L responsibility, and organizational development",
          responsibilities: [
            "Set company vision and strategic direction",
            "Oversee all business operations and P&L",
            "Lead executive team and organizational development",
            "Make major capital allocation decisions",
            "Represent company to investors, partners, and public",
          ],
        },
        pool: [
          {
            id: "president_exec",
            level: "executive",
            description: "President and Chief Executive Officer",
            extended_description:
              "This is the ultimate leadership role responsible for transforming Global Marketplace Pro into a category-defining e-commerce platform. You'll lead a diverse organization of thousands of employees across technology, operations, marketing, and business development. The position requires exceptional strategic thinking, operational excellence, and the ability to inspire teams at scale. You'll work closely with the board of directors, major investors, and industry partners while serving as the public face of the company. The role demands deep understanding of e-commerce, technology trends, and global markets. This position offers significant equity compensation and the opportunity to build lasting impact on millions of users worldwide. The ideal candidate has proven experience scaling companies through major growth phases and managing complex stakeholder relationships.",
            specificDetails: {
              impact:
                "Driving transformational growth that will establish the company as the market leader in e-commerce innovation",
              scope:
                "Complete organizational leadership, strategic decision-making, and stakeholder management",
              responsibilities: [
                "Develop and execute long-term strategic vision",
                "Lead senior executive team in achieving strategic goals",
                "Manage relationships with board, investors, and key partners",
                "Oversee $500M+ P&L and capital allocation decisions",
                "Drive company culture and talent development initiatives",
                "Lead mergers, acquisitions, and strategic partnerships",
                "Represent company at industry conferences and public events",
              ],
            },
            specificTools: getToolsWithUsageForPosition(
              "president",
              "executive"
            ),
            status: "draft",
          },
        ],
      },
      {
        id: "marketing_director",
        title: "Marketing Director",
        baseDetails: {
          impact:
            "Build brand awareness and drive customer acquisition through multi-channel marketing campaigns",
          scope:
            "Strategic marketing planning, team leadership, and campaign management across all channels",
          responsibilities: [
            "Develop comprehensive marketing strategy",
            "Lead marketing team and external agencies",
            "Manage marketing budget and ROI optimization",
            "Oversee brand management and positioning",
            "Drive digital marketing and customer acquisition",
          ],
        },
        pool: [
          {
            id: "md_director",
            level: "director",
            description:
              "Marketing Director leading customer acquisition and brand development",
            extended_description:
              "This marketing director role is instrumental in scaling our user base from millions to hundreds of millions while building a premium brand that stands out in a crowded market. You'll lead a diverse marketing team across performance marketing, brand marketing, content, creative, and analytics. The position requires a unique blend of analytical rigor and creative thinking, with deep expertise in digital marketing channels and brand strategy. You'll manage significant budgets and be responsible for hitting aggressive growth metrics while maintaining brand integrity. This role offers the opportunity to shape how millions of users discover and engage with our platform. Success in this position typically leads to VP Marketing or CMO roles, with potential to influence company strategy at the highest levels.",
            specificDetails: {
              impact:
                "Scaling customer acquisition to support 100M+ user growth while building a premium brand identity",
              scope:
                "Strategic marketing leadership across digital, brand, and performance marketing channels",
              responsibilities: [
                "Develop and execute annual marketing strategy",
                "Lead team of 15+ marketing professionals",
                "Manage $10M+ marketing budget and ROI optimization",
                "Oversee customer acquisition across all digital channels",
                "Drive brand positioning and market differentiation",
                "Lead marketing technology stack and analytics implementation",
              ],
            },
            specificTools: getToolsWithUsageForPosition(
              "marketing_director",
              "senior"
            ),
            status: "draft",
          },
        ],
      },
      {
        id: "operations_manager",
        title: "Operations Manager",
        baseDetails: {
          impact:
            "Ensure seamless order fulfillment and customer satisfaction through operational excellence",
          scope:
            "Supply chain management, warehouse operations, and fulfillment process optimization",
          responsibilities: [
            "Manage supply chain and vendor relationships",
            "Optimize warehouse and fulfillment operations",
            "Implement process improvements and automation",
            "Manage inventory and logistics operations",
            "Ensure quality control and customer satisfaction",
          ],
        },
        pool: [
          {
            id: "om_senior",
            level: "senior",
            description:
              "Senior Operations Manager for fulfillment and supply chain",
            extended_description:
              "This senior operations role is critical for scaling our fulfillment infrastructure to support explosive growth while maintaining exceptional customer experience. You'll oversee a complex network of fulfillment centers, shipping partners, and last-mile delivery operations across multiple regions. The position combines strategic thinking with hands-on operational leadership, requiring deep understanding of logistics technology, supply chain optimization, and workforce management. You'll lead a large team of operations professionals and be responsible for multi-million dollar operational budgets. This role offers the opportunity to build systems that directly impact millions of customers' experience with our platform. Success leads to Director of Operations or VP Operations roles, with potential to shape the future of e-commerce logistics innovation.",
            specificDetails: {
              impact:
                "Scaling fulfillment operations to handle 10M+ packages annually while maintaining 99%+ on-time delivery",
              scope:
                "Strategic operations leadership across multiple fulfillment centers and logistics networks",
              responsibilities: [
                "Lead operations across 5+ fulfillment centers",
                "Manage relationships with key shipping carriers",
                "Implement automation and process improvements",
                "Optimize inventory management and forecasting",
                "Lead team of 50+ operations supervisors",
                "Drive KPI improvement and cost reduction initiatives",
              ],
            },
            specificTools: getToolsWithUsageForPosition(
              "operations_manager",
              "senior"
            ),
            status: "draft",
          },
        ],
      },
    ],
  },
];

export const getCompanyById = (id: string): Company | undefined => {
  return demoCompanies.find((company) => company.id === id);
};
