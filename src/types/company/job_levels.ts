/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Job Level Configuration System
 * Maps job seniority levels to question difficulty categories
 * Based on client requirements for question generation
 */

export type JobSeniorityLevel =
  | "Entry Level"
  | "Junior"
  | "Mid-Level"
  | "Senior"
  | "Lead"
  | "Manager"
  | "Senior Manager"
  | "Director"
  | "Senior Director"
  | "Vice President"
  | "Senior Vice President"
  | "Executive";

export type QuestionDifficulty =
  | "Basic"
  | "Intermediate"
  | "Advanced"
  | "Expert";

export interface JobLevelConfig {
  level: JobSeniorityLevel;
  description: string;
  experienceRange: string;
  primaryDifficulties: QuestionDifficulty[];
  secondaryDifficulties: QuestionDifficulty[];
  difficultyFocus: string; // Human-readable description
  excludedDifficulties: QuestionDifficulty[];
  weight: number; // For sorting and priority (1-12)
}

/**
 * Client-defined mapping for question generation:
 * - Basic Questions: Entry & JR
 * - Intermediate Questions: Jr & Mid
 * - Advanced Questions: Mid & Sr
 * - Expert Questions: Sr & Staff/Principal
 */
export const JOB_LEVEL_CONFIGS: Record<JobSeniorityLevel, JobLevelConfig> = {
  "Entry Level": {
    level: "Entry Level",
    description:
      "Fresh graduates and career starters with 0-2 years of experience",
    experienceRange: "0-2 years",
    primaryDifficulties: ["Basic"],
    secondaryDifficulties: ["Intermediate"],
    difficultyFocus: "Basic and Intermediate questions",
    excludedDifficulties: ["Advanced", "Expert"],
    weight: 1,
  },
  Junior: {
    level: "Junior",
    description: "Early career professionals with 2-4 years of experience",
    experienceRange: "2-4 years",
    primaryDifficulties: ["Basic", "Intermediate"],
    secondaryDifficulties: ["Advanced"],
    difficultyFocus: "Basic to Intermediate questions with some Advanced",
    excludedDifficulties: ["Expert"],
    weight: 2,
  },
  "Mid-Level": {
    level: "Mid-Level",
    description: "Experienced professionals with 4-7 years of experience",
    experienceRange: "4-7 years",
    primaryDifficulties: ["Intermediate", "Advanced"],
    secondaryDifficulties: ["Basic"],
    difficultyFocus: "Intermediate and Advanced questions",
    excludedDifficulties: ["Expert"],
    weight: 3,
  },
  Senior: {
    level: "Senior",
    description: "Seasoned professionals with 7+ years of experience",
    experienceRange: "7+ years",
    primaryDifficulties: ["Advanced", "Expert"],
    secondaryDifficulties: ["Intermediate"],
    difficultyFocus: "Advanced and Expert questions",
    excludedDifficulties: ["Basic"],
    weight: 4,
  },
  Lead: {
    level: "Lead",
    description:
      "Team leaders and technical leads with mentoring responsibilities",
    experienceRange: "8+ years",
    primaryDifficulties: ["Advanced", "Expert"],
    secondaryDifficulties: ["Intermediate"],
    difficultyFocus: "Advanced and Expert questions with leadership focus",
    excludedDifficulties: ["Basic"],
    weight: 5,
  },
  Manager: {
    level: "Manager",
    description: "People managers responsible for team performance and growth",
    experienceRange: "8+ years",
    primaryDifficulties: ["Advanced"],
    secondaryDifficulties: ["Expert", "Intermediate"],
    difficultyFocus: "Advanced questions with leadership and management focus",
    excludedDifficulties: ["Basic"],
    weight: 6,
  },
  "Senior Manager": {
    level: "Senior Manager",
    description: "Experienced managers overseeing multiple teams or projects",
    experienceRange: "10+ years",
    primaryDifficulties: ["Advanced", "Expert"],
    secondaryDifficulties: [],
    difficultyFocus: "Advanced and Expert strategic questions",
    excludedDifficulties: ["Basic", "Intermediate"],
    weight: 7,
  },
  Director: {
    level: "Director",
    description: "Strategic leaders responsible for department-level decisions",
    experienceRange: "12+ years",
    primaryDifficulties: ["Advanced", "Expert"],
    secondaryDifficulties: [],
    difficultyFocus: "Expert-level strategic and leadership questions",
    excludedDifficulties: ["Basic", "Intermediate"],
    weight: 8,
  },
  "Senior Director": {
    level: "Senior Director",
    description:
      "Senior strategic leaders with cross-functional responsibilities",
    experienceRange: "15+ years",
    primaryDifficulties: ["Expert"],
    secondaryDifficulties: ["Advanced"],
    difficultyFocus: "Expert-level questions with cross-functional impact",
    excludedDifficulties: ["Basic", "Intermediate"],
    weight: 9,
  },
  "Vice President": {
    level: "Vice President",
    description: "Executive leaders driving organizational strategy",
    experienceRange: "15+ years",
    primaryDifficulties: ["Expert"],
    secondaryDifficulties: [],
    difficultyFocus: "Expert-level executive and strategic questions",
    excludedDifficulties: ["Basic", "Intermediate", "Advanced"],
    weight: 10,
  },
  "Senior Vice President": {
    level: "Senior Vice President",
    description: "Top-tier executives with company-wide impact",
    experienceRange: "18+ years",
    primaryDifficulties: ["Expert"],
    secondaryDifficulties: [],
    difficultyFocus: "Expert-level questions with organization-wide impact",
    excludedDifficulties: ["Basic", "Intermediate", "Advanced"],
    weight: 11,
  },
  Executive: {
    level: "Executive",
    description: "C-suite and top executive positions",
    experienceRange: "20+ years",
    primaryDifficulties: ["Expert"],
    secondaryDifficulties: [],
    difficultyFocus:
      "Expert-level questions with industry and strategic impact",
    excludedDifficulties: ["Basic", "Intermediate", "Advanced"],
    weight: 12,
  },
};

/**
 * Difficulty level to job level mapping based on client requirements
 */
export const DIFFICULTY_TO_JOB_LEVELS: Record<
  QuestionDifficulty,
  JobSeniorityLevel[]
> = {
  Basic: ["Entry Level", "Junior"],
  Intermediate: ["Junior", "Mid-Level"],
  Advanced: ["Mid-Level", "Senior"],
  Expert: [
    "Senior",
    "Lead",
    "Manager",
    "Senior Manager",
    "Director",
    "Senior Director",
    "Vice President",
    "Senior Vice President",
    "Executive",
  ],
};

/**
 * Get job level configuration for a given job level
 */
export function getJobLevelConfig(jobLevel: string): JobLevelConfig | null {
  return JOB_LEVEL_CONFIGS[jobLevel as JobSeniorityLevel] || null;
}

/**
 * Get appropriate difficulty levels for a given job level
 */
export function getDifficultyLevelsForJobLevel(
  jobLevel: string
): QuestionDifficulty[] {
  const config = getJobLevelConfig(jobLevel);
  if (!config) return ["Intermediate", "Advanced"]; // Default fallback

  return [...config.primaryDifficulties, ...config.secondaryDifficulties];
}

/**
 * Get primary difficulty levels for a given job level (most important)
 */
export function getPrimaryDifficultyLevels(
  jobLevel: string
): QuestionDifficulty[] {
  const config = getJobLevelConfig(jobLevel);
  if (!config) return ["Intermediate"]; // Default fallback

  return config.primaryDifficulties;
}

/**
 * Check if a difficulty level is appropriate for a job level
 */
export function isDifficultyAppropriateForJobLevel(
  difficulty: QuestionDifficulty,
  jobLevel: string
): boolean {
  const config = getJobLevelConfig(jobLevel);
  if (!config) return true; // Default to true if no config found

  return !config.excludedDifficulties.includes(difficulty);
}

/**
 * Get job levels that should receive questions of a specific difficulty
 */
export function getJobLevelsForDifficulty(
  difficulty: QuestionDifficulty
): JobSeniorityLevel[] {
  return DIFFICULTY_TO_JOB_LEVELS[difficulty] || [];
}

/**
 * Get difficulty distribution percentages for a job level
 */
export function getDifficultyDistribution(
  jobLevel: string
): Record<QuestionDifficulty, number> {
  const config = getJobLevelConfig(jobLevel);
  if (!config) {
    return { Basic: 25, Intermediate: 25, Advanced: 25, Expert: 25 };
  }

  const allDifficulties: QuestionDifficulty[] = [
    "Basic",
    "Intermediate",
    "Advanced",
    "Expert",
  ];
  const distribution: Record<QuestionDifficulty, number> = {} as any;

  allDifficulties.forEach((difficulty) => {
    if (config.excludedDifficulties.includes(difficulty)) {
      distribution[difficulty] = 0;
    } else if (config.primaryDifficulties.includes(difficulty)) {
      distribution[difficulty] = 40; // 40% for primary difficulties
    } else if (config.secondaryDifficulties.includes(difficulty)) {
      distribution[difficulty] = 20; // 20% for secondary difficulties
    } else {
      distribution[difficulty] = 0;
    }
  });

  // Normalize to 100%
  const total = Object.values(distribution).reduce((sum, val) => sum + val, 0);
  if (total > 0) {
    Object.keys(distribution).forEach((key) => {
      distribution[key as QuestionDifficulty] = Math.round(
        (distribution[key as QuestionDifficulty] / total) * 100
      );
    });
  }

  return distribution;
}

/**
 * Get difficulty focus description for AI prompts
 */
export function getDifficultyFocusDescription(jobLevel: string): string {
  const config = getJobLevelConfig(jobLevel);
  if (!config) return "Intermediate and Advanced questions";

  return config.difficultyFocus;
}

/**
 * Sort job levels by seniority (ascending)
 */
export function sortJobLevelsBySeniority(levels: string[]): string[] {
  return levels.sort((a, b) => {
    const configA = getJobLevelConfig(a);
    const configB = getJobLevelConfig(b);

    if (!configA || !configB) return 0;
    return configA.weight - configB.weight;
  });
}

/**
 * Group job levels by difficulty categories for bulk operations
 */
export function groupJobLevelsByDifficulty(): Record<
  QuestionDifficulty,
  JobSeniorityLevel[]
> {
  return DIFFICULTY_TO_JOB_LEVELS;
}
