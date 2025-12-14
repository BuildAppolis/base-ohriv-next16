// RavenDB Document Models for Analytics and Reporting
// These models define the structure of analytics documents stored in tenant databases

import { RavenDocument } from './tenant-models';

/**
 * Analytics Report Document - Generated analytics reports
 */
export interface AnalyticsReportDocument extends RavenDocument {
  collection: "analytics-reports";

  // Report information
  reportId: string;
  tenantId: string;
  reportType: "hiring_pipeline" | "recruitment_metrics" | "diversity" | "performance" | "custom";
  title: string;
  description?: string;

  // Report configuration
  config: {
    dateRange: {
      startDate: string;
      endDate: string;
    };
    filters: Record<string, any>; // Dynamic filters based on report type
    groupBy?: string[];        // Fields to group by
    metrics: string[];         // Metrics to calculate
  };

  // Report data
  data: {
    summary: Record<string, number>;
    details: Array<Record<string, any>>;
    charts: Array<{
      type: "line" | "bar" | "pie" | "table" | "scatter";
      title: string;
      data: any;
      config?: Record<string, any>;
    }>;
    insights?: Array<{
      type: "trend" | "anomaly" | "recommendation";
      description: string;
      impact: string;
      confidence: number;
    }>;
  };

  // Metadata
  createdAt: string;
  generatedBy: string;
  lastCalculated: string;
  status: "generating" | "completed" | "failed";
  error?: string;
}

/**
 * Hiring Pipeline Analytics Document - Tracks recruitment funnel metrics
 */
export interface PipelineAnalyticsDocument extends RavenDocument {
  collection: "pipeline-analytics";

  // Analytics information
  analyticsId: string;
  tenantId: string;
  date: string;             // YYYY-MM-DD format
  week?: number;            // Week of year
  month?: number;           // Month of year
  quarter?: number;          // Quarter of year
  year?: number;            // Calendar year

  // Pipeline metrics
  metrics: {
    // Funnel metrics
    jobPostings: number;
    totalApplications: number;
    screenedApplications: number;
    interviews: number;
    offers: number;
    hires: number;

    // Conversion rates
    applicationToScreenRate: number;    // % screened
    screenToInterviewRate: number;    // % interviewed
    interviewToOfferRate: number;     // % offered
    offerToHireRate: number;          // % hired
    applicationToHireRate: number;     // Overall conversion

    // Time metrics
    averageTimeToHire: number;        // Days
    averageTimeToScreen: number;      // Hours
    averageTimeToInterview: number;   // Days
    averageTimeToOffer: number;       // Days

    // Cost metrics
    costPerHire: number;
    totalRecruitmentCost: number;
    sourceCosts: Record<string, number>;

    // Quality metrics
    retentionRate30Days: number;      // % hires still employed after 30 days
    satisfactionScore: number;       // Manager satisfaction with hires
    performanceScore: number;       // Hire performance ratings

    // Diversity metrics
    diversityMetrics: {
      gender: Record<string, number>;
      ethnicity: Record<string, number>;
      veterans: number;
      disabilities: number;
    };
  };

  // Breakdown by dimension
  breakdowns: {
    byCompany: Array<{
      companyId: string;
      companyName: string;
      metrics: any; // Same structure as metrics above
    }>;
    byDepartment: Array<{
      department: string;
      metrics: any;
    }>;
    byLevel: Array<{
      level: string;
      metrics: any;
    }>;
    bySource: Array<{
      source: string;
      metrics: any;
    }>;
    byEvaluator: Array<{
      evaluatorId: string;
      evaluatorName: string;
      metrics: any;
    }>;
  };

  // Metadata
  createdAt: string;
  updatedAt: string;
  generatedAt: string;
}

/**
 * Source Analytics Document - Tracks recruitment source effectiveness
 */
export interface SourceAnalyticsDocument extends RavenDocument {
  collection: "source-analytics";

  // Analytics information
  analyticsId: string;
  tenantId: string;
  date: string;
  source: string;             // e.g., "LinkedIn", "Indeed", "Employee Referral"

  // Source metrics
  metrics: {
    applications: number;
    screenedApplications: number;
    interviews: number;
    offers: number;
    hires: number;

    // Quality metrics
    conversionRate: number;       // Applications to hires
    averageScore: number;        // Average evaluation score
    retentionRate: number;       // 30-day retention
    timeToHire: number;          // Average time to hire

    // Cost metrics
    costPerApplication: number;
    costPerHire: number;
    totalInvestment: number;
    roi: number;                 // Return on investment

    // Candidate quality
    averageExperience: number;    // Years
    relevantSkills: number;       // % with relevant skills
    culturalFit: number;          // Cultural fit score

    // Demographics
    demographics: {
      location: Record<string, number>;
      experience: Record<string, number>;
      education: Record<string, number>;
    };
  };

  // Campaign tracking
  campaigns?: Array<{
    campaignId: string;
    campaignName: string;
    metrics: any; // Same structure as above
    budget: number;
    spent: number;
  }>;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

/**
 * Evaluator Analytics Document - Tracks evaluator performance
 */
export interface EvaluatorAnalyticsDocument extends RavenDocument {
  collection: "evaluator-analytics";

  // Analytics information
  analyticsId: string;
  tenantId: string;
  evaluatorId: string;
  evaluatorName: string;
  date: string;

  // Performance metrics
  metrics: {
    evaluations: {
      completed: number;
      pending: number;
      total: number;
    };

    // Quality metrics
    averageScore: number;        // Average score given
    scoreDistribution: Record<string, number>; // A, B, C, D, F distribution
    passRate: number;            // % of candidates passed
    accuracyRate?: number;       // How often evaluations predict actual performance

    // Time metrics
    averageDuration: number;     // Minutes per evaluation
    totalTime: number;          // Total time spent
    efficiencyScore: number;     // Score vs time ratio

    // Consistency metrics
    scoreConsistency: number;    // Score variance for similar candidates
    recommendationAccuracy: number; // How often recommendations are correct

    // Bias metrics
    genderBias?: number;         // Statistical gender bias
    otherBiases?: Record<string, number>;
  };

  // Breakdown by evaluation type
  breakdown: {
    byRole: Record<string, any>;    // Performance by different roles
    byStage: Record<string, any>;  // Performance by different stages
    byJobLevel: Record<string, any>; // Performance by job levels
  };

  // Training and development
  training: {
    completedModules: string[];
    certifications: string[];
    skillGaps: string[];
    lastTraining?: string;
  };

  // Feedback and improvement
  feedback: {
    selfAssessment: number;
    managerAssessment: number;
    peerAssessment: number;
    improvementAreas: string[];
    strengths: string[];
  };

  // Metadata
  createdAt: string;
  updatedAt: string;
  generatedAt: string;
}

/**
 * Candidate Analytics Document - Individual candidate performance analytics
 */
export interface CandidateAnalyticsDocument extends RavenDocument {
  collection: "candidate-analytics";

  // Analytics information
  analyticsId: string;
  tenantId: string;
  candidateId: string;
  candidateName: string;
  date: string;

  // Performance metrics
  metrics: {
    applications: {
      total: number;
      active: number;
      interviewed: number;
      offers: number;
      hires: number;
    };

    // Success metrics
    offerRate: number;           // % of applications resulting in offers
    hireRate: number;            // % of applications resulting in hires
    averageScore: number;        // Average evaluation score
    bestScore: number;           // Highest score achieved
    timeToFirstInterview: number; // Days
    timeToOffer: number;          // Days
    timeToHire: number;           // Days

    // Profile metrics
    skillsMatch: number;         // % of job requirements matched
    culturalFit: number;         // Cultural fit score
    experienceLevel: number;      // Years of experience
    educationLevel: number;       // Educational attainment score
    certifications: number;       // Number of relevant certifications

    // Engagement metrics
    responseRate: number;        // % of messages responded to
    attendanceRate: number;      // % of interviews attended
    completionRate: number;      // % of evaluations completed
  };

  // Application history
  applicationHistory: Array<{
    applicationId: string;
    companyId: string;
    companyName: string;
    jobTitle: string;
    appliedAt: string;
    status: string;
    finalScore?: number;
    stages: Array<{
      stageId: string;
      stageName: string;
      completedAt: string;
      score?: number;
      recommendation?: string;
    }>;
  }>;

  // Skill analytics
  skills: {
    strengths: Array<{
      skill: string;
      level: number;
      evidence: string[];
    }>;
    gaps: Array<{
      skill: string;
      requiredLevel: number;
      currentLevel: number;
      training?: string[];
    }>;
    trends: {
      improvement: string[];
      decline: string[];
    };
  };

  // Recommendations
  recommendations: {
    jobMatches: Array<{
      jobTitle: string;
      company: string;
      matchScore: number;
      reasons: string[];
    }>;
    skillImprovement: string[];
    careerPaths: string[];
  };

  // Metadata
  createdAt: string;
  updatedAt: string;
  generatedAt: string;
}

/**
 * Trend Analytics Document - Tracks trends over time
 */
export interface TrendAnalyticsDocument extends RavenDocument {
  collection: "trend-analytics";

  // Analytics information
  analyticsId: string;
  tenantId: string;
  trendType: "hiring_volume" | "time_to_hire" | "cost_per_hire" | "source_effectiveness" | "quality_metrics";
  title: string;

  // Trend data
  data: Array<{
    date: string;
    value: number;
    changeFromPrevious?: number;
    percentChange?: number;
    metadata?: Record<string, any>;
  }>;

  // Analysis
  analysis: {
    trend: "increasing" | "decreasing" | "stable" | "volatile";
    growthRate?: number;         // Compound annual growth rate
    seasonality?: Array<{
      period: string;
      multiplier: number;
      description: string;
    }>;
    correlations?: Array<{
      factor: string;
      correlation: number;
      strength: "weak" | "moderate" | "strong";
    }>;
    insights: Array<{
      type: string;
      description: string;
      impact: string;
      confidence: number;
    }>;
  };

  // Predictions
  predictions?: {
    shortTerm: Array<{
      date: string;
      predictedValue: number;
      confidence: number;
      range: {
        min: number;
        max: number;
      };
    }>;
    longTerm: Array<{
      period: string;
      predictedTrend: string;
      confidence: number;
      factors: string[];
    }>;
  };

  // Metadata
  createdAt: string;
  updatedAt: string;
  lastCalculated: string;
}

/**
 * Dashboard Widget Document - Pre-configured dashboard widgets
 */
export interface DashboardWidgetDocument extends RavenDocument {
  collection: "dashboard-widgets";

  // Widget information
  widgetId: string;
  tenantId: string;
  name: string;
  type: "chart" | "metric" | "table" | "list" | "custom";

  // Widget configuration
  config: {
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    refreshInterval: number;     // Seconds
    dataSource: string;         // Which analytics collection to use
    filters?: Record<string, any>;
    visualization: {
      type: string;
      options?: Record<string, any>;
    };
  };

  // Widget data (cached)
  data: any;

  // Metadata
  createdAt: string;
  updatedAt: string;
  lastRefresh: string;
  isPublic: boolean;          // Available to all tenant users
  permissions: string[];       // User roles that can view this widget
}