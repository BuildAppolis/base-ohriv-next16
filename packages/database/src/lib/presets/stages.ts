import { StageDefinitionDocument } from "../../models";

/**
 * Default stages for evaluation pipelines
 * These are the default stages that are available for all tenants
 */
export const defaultStages: Omit<
  StageDefinitionDocument,
  "collection" | "tenantId" | "createdAt" | "updatedAt" | "createdBy"
>[] = [
  {
    id: "recruiter_screen",
    name: "Recruiter Screen",
    description: "Initial screening by a recruiter.",
    color: "#A0AEC0",
    icon: "📞",
    order: 1,
    version: 1,
    isSystem: true,
    canReorder: false,
    questionsEnabled: true,
    requiresApproval: false,
    isOptional: false,
    stageType: "screening",
    defaultSettings: {
      autoAdvance: true,
      notificationSettings: {
        notifyCandidate: false,
        notifyHiringManager: false,
        notifyRecruiter: true,
      },
    },
    ksaIntegration: {
      enabled: false,
      guidelineRequired: false,
    },
    usage: {
      companiesCount: 0,
      jobsCount: 0,
      evaluationsCount: 0,
    },
    tags: ["screening", "initial", "recruiter"],
    isActive: true,
  },
  {
    id: "hiring_manager_interview",
    name: "Hiring Manager Interview",
    description: "Interview with the hiring manager.",
    color: "#F6E05E",
    icon: "👩‍💼",
    order: 2,
    version: 1,
    isSystem: true,
    canReorder: true,
    questionsEnabled: true,
    requiresApproval: false,
    isOptional: false,
    stageType: "interview",
    defaultSettings: {
      duration: 60,
      autoAdvance: false,
      notificationSettings: {
        notifyCandidate: true,
        notifyHiringManager: true,
        notifyRecruiter: true,
      },
    },
    ksaIntegration: {
      enabled: true,
      guidelineRequired: true,
      weightings: {
        knowledge: 30,
        skills: 50,
        ability: 20,
      },
    },
    usage: {
      companiesCount: 0,
      jobsCount: 0,
      evaluationsCount: 0,
    },
    tags: ["interview", "hiring-manager", "technical"],
    isActive: true,
  },
  {
    id: "final_interview",
    name: "Final Interview",
    description: "Final round interview with the team.",
    color: "#68D391",
    icon: "🏁",
    order: 3,
    version: 1,
    isSystem: true,
    canReorder: true,
    questionsEnabled: true,
    requiresApproval: false,
    isOptional: false,
    stageType: "interview",
    defaultSettings: {
      duration: 90,
      autoAdvance: false,
      notificationSettings: {
        notifyCandidate: true,
        notifyHiringManager: true,
        notifyRecruiter: true,
      },
    },
    ksaIntegration: {
      enabled: true,
      guidelineRequired: true,
      weightings: {
        knowledge: 25,
        skills: 35,
        ability: 40,
      },
    },
    usage: {
      companiesCount: 0,
      jobsCount: 0,
      evaluationsCount: 0,
    },
    tags: ["interview", "final", "team-fit"],
    isActive: true,
  },
];
