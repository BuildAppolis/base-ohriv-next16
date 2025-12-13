export type QuestionType =
  | ""
  | "situational"
  | "technical"
  | "practical"
  | "screening"
  | "values"
  | "process"
  | "other";

export type QuestionDifficulty =
  | "basic"
  | "intermediate"
  | "advanced"
  | "expert";

export interface BaseQuestion {
  id: number;
  category?: string;
  type: QuestionType;
  questionText?: string;
  question_text?: string;
  followUpProbes?: string[];
  follow_up_probes?: string[];
}

export interface CompanyFitQuestion extends BaseQuestion {
  sampleIndicators: {
    strongResponse: string;
    weakResponse: string;
  };
}

export interface JobFitQuestion extends BaseQuestion {
  difficulty: QuestionDifficulty;
  difficultyLevel?: QuestionDifficulty;
  evaluationCriteria?: string;
  evaluation_criteria?: string;
  expectedAnswers?: string;
  expected_answers?: string;
  redFlagIndicators?: string[];
  red_flag_indicators?: string[];
}

export interface KSAAttribute {
  definition: string;
  evaluationScale?: Record<string, string>;
  evaluation_scale?: Record<string, string>;
  weighting: number;
  redFlags: string[];
}

export interface JobFitKSACategory {
  attribute: KSAAttribute;
  questions: JobFitQuestion[];
}

export interface CompanyFitKSACategory {
  questions: CompanyFitQuestion[];
}

export interface KSAJobFit {
  Knowledge: JobFitKSACategory;
  Skills: JobFitKSACategory;
  Ability: JobFitKSACategory;
}

export interface KSACoreValuesCompanyFit {
  [coreValue: string]: CompanyFitKSACategory;
}

export interface KSAFramework {
  KSAs: {
    Knowledge: KSAAttribute;
    Skills: KSAAttribute;
    Ability: KSAAttribute;
  };
  weightingDistribution: {
    Knowledge: number;
    Skills: number;
    Ability: number;
  };
}

export interface KSAInterviewError {
  error: {
    message: string;
    type: "generation_error" | "parse_error" | "validation_error";
    timestamp: string;
    details?: string;
  };
}

export interface KSARawOutput {
  raw: string;
  parseError?: string;
}

export interface KSAInterviewOutput {
  KSA_Framework?: KSAFramework;
  KSAs?: KSAFramework["KSAs"];
  KSA_JobFit?: KSAJobFit;
  CoreValues_CompanyFit?: KSACoreValuesCompanyFit;
  positions?: PositionBasedOutput[];
  Positions?: PositionBasedOutput[];
  ai_model?: string;
  model_parameters?: {
    model: string;
    temperature: number;
    max_tokens: number;
    optimization?: "standard" | "premium" | "cost_efficient";
  };
  generated_at?: string;
  processing_method?: "real_ai" | "template";
}

export interface PositionBasedOutput {
  position?: string;
  title?: string;
  KSA_Framework?: KSAFramework;
  KSAs?: KSAFramework["KSAs"];
  KSA_JobFit?: KSAJobFit;
  CoreValues_CompanyFit?: KSACoreValuesCompanyFit;
}

export interface CompanyData {
  company_profile: {
    name: string;
    industry: string;
    description?: string;
    size?: string;
    stage?: string;
    location?: string;
    website?: string;
  };
  mission_and_culture: {
    mission_statement: string;
    coreValues: string[];
    vision_statement?: string;
    work_environment: string;
    team_culture?: string;
    company_values?: string[];
  };
  positions: Array<{
    title: string;
    type: string;
    level: string;
    department: string;
    description?: string;
    requirements?: string[];
    responsibilities?: string[];
    qualifications?: string[];
  }>;
}

export interface KSAGenerationParams {
  companyData: CompanyData;
  positionTitle?: string;
  ksaFramework?: KSAFramework;
  coreValues?: string[];
  customInstructions?: string;
}

export type EvaluationScaleLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type EvaluationScale = Record<EvaluationScaleLevel, string>;

export type JobFitCategory = "Knowledge" | "Skills" | "Ability";

export type KSACategoryKey = keyof KSAJobFit;

export type CompanyValueKey = string;

export type QuestionWithCategory<T extends BaseQuestion = BaseQuestion> = T & {
  category: string;
};

export function isJobFitQuestion(
  question: BaseQuestion
): question is JobFitQuestion {
  return (
    "evaluationCriteria" in question ||
    "evaluation_criteria" in question ||
    "expectedAnswers" in question ||
    "expected_answers" in question
  );
}

export function isCompanyFitQuestion(
  question: BaseQuestion
): question is CompanyFitQuestion {
  return "sampleIndicators" in question;
}

export function getJobFitCategories(): JobFitCategory[] {
  return ["Knowledge", "Skills", "Ability"];
}

export function createKSAAttribute(
  definition: string,
  weighting: number,
  redFlags: string[] = []
): KSAAttribute {
  return {
    definition,
    weighting,
    redFlags,
    evaluationScale: {
      "1": "Cannot perform job duty",
      "2": "Cannot perform job duty",
      "3": "Requires significant training/guidance to perform job duty",
      "4": "Requires significant training/guidance to perform job duty",
      "5": "Able to perform job duties with minimal guidance",
      "6": "Able to perform job duties with minimal guidance",
      "7": "Able to perform job duties and positively impact performance of peers",
      "8": "Able to perform job duties and positively impact performance of peers",
      "9": "Transforms the way the team delivers",
      "10": "Transforms the way the team delivers",
    },
  };
}
