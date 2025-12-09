/**
 * Universal KSA (Knowledge, Skills, Abilities) Type Definitions
 * Based on expected output structures for interview question generation
 *
 * @example
 * // Example usage:
 * const output: KSAInterviewOutput = {
 *   KSA_Framework: {
 *     KSAs: {
 *       Knowledge: {
 *         definition: "Understanding of enterprise software development principles",
 *         evaluationScale: { "1": "Cannot perform", "5": "Able to perform", "10": "Transforms team delivery" },
 *         weighting: 40,
 *         redFlags: ["Low understanding of software development lifecycle"]
 *       }
 *     },
 *     weightingDistribution: { Knowledge: 40, Skills: 35, Ability: 25 }
 *   },
 *   KSA_JobFit: {
 *     Knowledge: {
 *       attribute: { definition: "...", evaluationScale: {}, weighting: 40, redFlags: [] },
 *       questions: [{
 *         id: 1,
 *         category: "Knowledge",
 *         type: "behavioral",
 *         questionText: "Describe a recent major trend in enterprise software development...",
 *         difficulty: "intermediate",
 *         evaluationCriteria: "Depth of understanding of current trends",
 *         expectedAnswers: "Insight into the trend, its implications, and examples",
 *         followUpProbes: ["How have you implemented a similar trend?"],
 *         redFlagIndicators: ["Vague explanation of trends"]
 *       }]
 *     }
 *   },
 *   CoreValues_CompanyFit: {
 *     Innovation: {
 *       questions: [{
 *         id: 2,
 *         category: "Innovation",
 *         type: "behavioral",
 *         questionText: "Describe an innovative idea you proposed...",
 *         sampleIndicators: {
 *           strongResponse: "Clearly articulates a novel idea and quantifies impact",
 *           weakResponse: "Struggles to describe the idea or its outcomes"
 *         },
 *         followUpProbes: ["What challenges did you face?"]
 *       }]
 *     }
 *   }
 * };
 */

/**
 * Supported question types (broad enough for most companies)
 */
export type QuestionType =
  | "behavioral"
  | "situational"
  | "technical"
  | "practical"
  | "screening"
  | "values"
  | "process"
  | "other";

/**
 * Difficulty levels (expanded for flexibility)
 */
export type QuestionDifficulty = "basic" | "intermediate" | "advanced" | "expert";

/**
 * Base interface for all interview questions
 * Contains common properties shared across all question types
 */
export interface BaseQuestion {
  /** Unique identifier for the question */
  id: number;

  /** Question category (e.g., "Knowledge", "Innovation", "Skills"). Optional when derived from the parent key */
  category?: string;

  /** Type of question */
  type: QuestionType;

  /** The main question text to ask the candidate */
  questionText?: string;
  /** Snake-case alternative supported by some generators */
  question_text?: string;

  /** Array of follow-up probe questions to dig deeper */
  followUpProbes?: string[];
  follow_up_probes?: string[];
}

/**
 * Company-specific interview question
 * Evaluates how well a candidate aligns with company values and culture
 *
 * @example
 * const companyQuestion: CompanyFitQuestion = {
 *   id: 5,
 *   category: "Innovation",
 *   type: "behavioral",
 *   questionText: "Describe an innovative idea you proposed in a previous role",
 *   followUpProbes: ["What challenges did you face when implementing?"],
 *   sampleIndicators: {
 *     strongResponse: "Clearly articulates a novel idea and quantifies positive impact",
 *     weakResponse: "Struggles to describe the idea or its outcomes"
 *   }
 * }
 */
export interface CompanyFitQuestion extends BaseQuestion {
  /** Sample responses indicating strong and weak answers for evaluation guidance */
  sampleIndicators: {
    /** Description of what constitutes a strong, effective response */
    strongResponse: string;
    /** Description of what constitutes a weak or inadequate response */
    weakResponse: string;
  };
}

/**
 * Job-specific interview question
 * Evaluates a candidate's qualifications for a specific role or skill area
 *
 * @example
 * const jobQuestion: JobFitQuestion = {
 *   id: 1,
 *   category: "Knowledge",
 *   type: "behavioral",
 *   questionText: "Can you describe a recent major trend in enterprise software development?",
 *   difficulty: "intermediate",
 *   evaluationCriteria: "Depth of understanding of current trends and business relevance",
 *   expectedAnswers: "Insight into the trend, implications, and practical applications",
 *   followUpProbes: ["How have you implemented a similar trend in previous work?"],
 *   redFlagIndicators: ["Vague or unconvincing explanation", "Lack of practical examples"]
 * }
 */
export interface JobFitQuestion extends BaseQuestion {
  /** Difficulty level of the question for candidate assessment */
  difficulty: QuestionDifficulty;
  difficultyLevel?: QuestionDifficulty;

  /** Criteria used to evaluate the quality of the candidate's response */
  evaluationCriteria?: string;
  evaluation_criteria?: string;

  /** Expected elements that should be included in a good response */
  expectedAnswers?: string;
  expected_answers?: string;

  /** Warning signs that indicate a weak response or candidate mismatch */
  redFlagIndicators?: string[];
  red_flag_indicators?: string[];
}

/**
 * KSA (Knowledge, Skills, Abilities) attribute definition
 * Defines how a specific KSA area should be evaluated and weighted
 *
 * @example
 * const knowledgeAttribute: KSAAttribute = {
 *   definition: "Understanding of enterprise software development principles and industry trends",
 *   evaluationScale: {
 *     "1": "Cannot perform job duty",
 *     "5": "Able to perform job duties with minimal guidance",
 *     "10": "Transforms the way the team delivers"
 *   },
 *   weighting: 40,
 *   redFlags: [
 *     "Low understanding of software development lifecycle",
 *     "Not aware of industry trends",
 *     "Struggles to connect business needs with software solutions"
 *   ]
 * }
 */
export interface KSAAttribute {
  /** Clear definition of what this KSA area encompasses */
  definition: string;

  /** 1-10 scale describing performance levels for this KSA area */
  evaluationScale?: Record<string, string>;
  evaluation_scale?: Record<string, string>;

  /** Percentage weight this KSA area carries in overall evaluation */
  weighting: number;

  /** Warning signs that indicate a deficiency in this KSA area */
  redFlags: string[];
}

/**
 * Job Fit KSA category containing attribute definition and questions
 * Groups questions and evaluation criteria for a specific KSA area
 *
 * @example
 * const knowledgeCategory: JobFitKSACategory = {
 *   attribute: {
 *     definition: "Understanding of enterprise software development principles",
 *     evaluationScale: { "1": "Cannot perform", "10": "Transforms team delivery" },
 *     weighting: 40,
 *     redFlags: ["Low understanding of software development lifecycle"]
 *   },
 *   questions: [{
 *     id: 1,
 *     category: "Knowledge",
 *     type: "behavioral",
 *     questionText: "Describe a recent major trend in enterprise software development...",
 *     difficulty: "intermediate",
 *     evaluationCriteria: "Depth of understanding of current trends",
 *     expectedAnswers: "Insight into the trend, its implications, and examples",
 *     followUpProbes: ["How have you implemented a similar trend?"],
 *     redFlagIndicators: ["Vague explanation of trends"]
 *   }]
 * }
 */
export interface JobFitKSACategory {
  /** Definition and evaluation criteria for this KSA category */
  attribute: KSAAttribute;

  /** Array of questions designed to assess this KSA category */
  questions: JobFitQuestion[];
}

/**
 * Company Fit KSA category for a specific company value
 * Contains questions that assess alignment with a particular company value
 *
 * @example
 * const innovationCategory: CompanyFitKSACategory = {
 *   questions: [{
 *     id: 1,
 *     category: "Innovation",
 *     type: "behavioral",
 *     questionText: "Describe an innovative idea you proposed in a previous role",
 *     followUpProbes: ["What challenges did you face when implementing?"],
 *     sampleIndicators: {
 *       strongResponse: "Clearly articulates a novel idea and quantifies positive impact",
 *       weakResponse: "Struggles to describe the idea or its outcomes"
 *     }
 *   }]
 * }
 */
export interface CompanyFitKSACategory {
  /** Array of questions assessing alignment with this company value */
  questions: CompanyFitQuestion[];
}

/**
 * Complete KSA Job Fit structure
 * Contains all job-related assessment categories and their questions
 *
 * @example
 * const jobFit: KSAJobFit = {
 *   Knowledge: {
 *     attribute: {
 *       definition: "Understanding of enterprise software development principles",
 *       evaluationScale: { "1": "Cannot perform", "10": "Transforms team delivery" },
 *       weighting: 40,
 *       redFlags: ["Low understanding of software development lifecycle"]
 *     },
 *     questions: [// Knowledge question examples]
 *   },
 *   Skills: {
 *     attribute: { // Skills attribute object },
 *     questions: [// Skills question examples]
 *   },
 *   Ability: {
 *     attribute: { // Ability attribute object },
 *     questions: [// Ability question examples]
 *   }
 * }
 */
export interface KSAJobFit {
  /** Knowledge category - what the candidate knows and understands */
  Knowledge: JobFitKSACategory;

  /** Skills category - what the candidate can do and apply */
  Skills: JobFitKSACategory;

  /** Ability category - how the candidate performs and leads */
  Ability: JobFitKSACategory;
}

/**
 * Company Fit structure indexed by core values
 * Dynamically creates categories based on the company's core values
 *
 * @example
 * const companyFit: KSACoreValuesCompanyFit = {
 *   Innovation: {
 *     questions: [{
 *       id: 1,
 *       category: "Innovation",
 *       type: "behavioral",
 *       questionText: "Describe an innovative idea you proposed...",
 *       followUpProbes: ["What challenges did you face?"],
 *       sampleIndicators: {
 *         strongResponse: "Clearly articulates a novel idea and quantifies impact",
 *         weakResponse: "Struggles to describe the idea or its outcomes"
 *       }
 *     }]
 *   },
 *   Excellence: {
 *     questions: [// Excellence questions array]
 *   },
 *   Collaboration: {
 *     questions: [// Collaboration questions array]
 *   }
 * }
 */
export interface KSACoreValuesCompanyFit {
  /** Dynamic key-value pairs where keys are company core values */
  [coreValue: string]: CompanyFitKSACategory;
}

/**
 * Complete KSA Framework definition
 * Defines the evaluation framework with attributes and weightings
 *
 * @example
 * const framework: KSAFramework = {
 *   KSAs: {
 *     Knowledge: {
 *       definition: "Understanding of enterprise software development principles",
 *       evaluationScale: {
 *         "1": "Cannot perform job duty",
 *         "5": "Able to perform job duties with minimal guidance",
 *         "10": "Transforms the way the team delivers"
 *       },
 *       weighting: 40,
 *       redFlags: ["Low understanding of software development lifecycle"]
 *     },
 *     Skills: { // Skills attribute definition },
 *     Ability: { // Ability attribute object }
 *   },
 *   weightingDistribution: {
 *     Knowledge: 40,
 *     Skills: 35,
 *     Ability: 25
 *   }
 * }
 */
export interface KSAFramework {
  /** Individual KSA attribute definitions */
  KSAs: {
    Knowledge: KSAAttribute;
    Skills: KSAAttribute;
    Ability: KSAAttribute;
  };

  /** Weight distribution across KSA categories (should sum to 100) */
  weightingDistribution: {
    Knowledge: number;
    Skills: number;
    Ability: number;
  };
}

/**
 * Error output structure for failed AI generation
 * Contains detailed error information for debugging and user feedback
 *
 * @example
 * const error: KSAInterviewError = {
 *   error: {
 *     message: "No result received from AI generation",
 *     type: "generation_error",
 *     timestamp: "2023-12-02T16:45:30.000Z",
 *     details: "The AI stream completed without sending a completion event"
 *   }
 * }
 */
export interface KSAInterviewError {
  /** Error object containing all error details */
  error: {
    /** Human-readable error message for users */
    message: string;

    /** Categorized error type for programmatic handling */
    type: 'generation_error' | 'parse_error' | 'validation_error';

    /** ISO timestamp when the error occurred */
    timestamp: string;

    /** Optional additional error details for debugging */
    details?: string;
  };
}

/**
 * Raw content output structure for parsing failures
 * Used when AI response cannot be parsed as structured JSON
 *
 * @example
 * const rawOutput: KSARawOutput = {
 *   raw: "Here are some interview questions I generated:\n\n1. Tell me about a time...",
 *   parseError: "No valid JSON found in response"
 * }
 */
export interface KSARawOutput {
  /** The raw text response from the AI */
  raw: string;

  /** Description of why parsing failed, if available */
  parseError?: string;
}

/**
 * Complete AI Generation Output Structure
 * Main output type for successful KSA interview question generation
 *
 * @example
 * const fullOutput: KSAInterviewOutput = {
 *   KSA_Framework: {
 *     KSAs: {
 *       Knowledge: {
 *         definition: "Understanding of enterprise software development principles",
 *         evaluationScale: { "1": "Cannot perform", "10": "Transforms team delivery" },
 *         weighting: 40,
 *         redFlags: ["Low understanding of software development lifecycle"]
 *       },
 *       Skills: { // Skills attribute object },
 *       Ability: { // Ability attribute object }
 *     },
 *     weightingDistribution: { Knowledge: 40, Skills: 35, Ability: 25 }
 *   },
 *   KSA_JobFit: {
 *     Knowledge: { // Knowledge category },
 *     Skills: { // Skills category },
 *     Ability: { // Ability category }
 *   },
 *   CoreValues_CompanyFit: {
 *     Innovation: { // Innovation category },
 *     Excellence: { // Excellence category }
 *   },
 *   ai_model: "gpt-4",
 *   model_parameters: {
 *     model: "gpt-4",
 *     temperature: 0.7,
 *     max_tokens: 4000,
 *     optimization: "standard"
 *   },
 *   generated_at: "2023-12-02T16:45:30.000Z",
 *   processing_method: "real_ai"
 * }
 */
export interface KSAInterviewOutput {
  /** Framework definition - Alternative structure with complete framework */
  KSA_Framework?: KSAFramework;

  /** Framework definition - Alternative structure with just KSAs */
  KSAs?: KSAFramework['KSAs'];

  /** Job fit questions organized by KSA category */
  KSA_JobFit?: KSAJobFit;

  /** Company fit questions organized by core values */
  CoreValues_CompanyFit?: KSACoreValuesCompanyFit;

  /** Position-based output structure for multiple positions */
  positions?: PositionBasedOutput[];

  /** Alternative naming for position-based output */
  Positions?: PositionBasedOutput[];

  /** AI model used for generation */
  ai_model?: string;

  /** Model parameters and settings used */
  model_parameters?: {
    /** Specific model version/name */
    model: string;

    /** Temperature setting for creativity (0.0-1.0) */
    temperature: number;

    /** Maximum tokens allowed in response */
    max_tokens: number;

    /** Optimization strategy used */
    optimization?: "standard" | "premium" | "cost_efficient";
  };

  /** When the questions were generated */
  generated_at?: string;

  /** How the content was generated */
  processing_method?: "real_ai" | "template";
}

/**
 * Position-based output structure
 * Contains KSA questions and framework for a specific job position
 *
 * @example
 * const positionOutput: PositionBasedOutput = {
 *   title: "Senior Software Engineer",
 *   KSA_Framework: {
 *     KSAs: {
 *       Knowledge: { // Knowledge attribute object },
 *       Skills: { // Skills attribute object },
 *       Ability: { // Ability attribute object }
 *     },
 *     weightingDistribution: { Knowledge: 40, Skills: 35, Ability: 25 }
 *   },
 *   KSA_JobFit: {
 *     Knowledge: { // Knowledge questions },
 *     Skills: { // Skills questions },
 *     Ability: { // Ability questions }
 *   },
 *   CoreValues_CompanyFit: {
 *     Innovation: { // Innovation questions }
 *   }
 * }
 */
export interface PositionBasedOutput {
  /** Position title (alternative to 'position' field) */
  position?: string;

  /** Position title (preferred field name) */
  title?: string;

  /** KSA Framework definition specific to this position */
  KSA_Framework?: KSAFramework;

  /** Alternative structure for KSA attributes */
  KSAs?: KSAFramework['KSAs'];

  /** Job fit questions tailored to this position */
  KSA_JobFit?: KSAJobFit;

  /** Company fit questions contextualized for this position */
  CoreValues_CompanyFit?: KSACoreValuesCompanyFit;
}

/**
 * Company input data structure for AI generation
 * Contains all company information needed to generate tailored interview questions
 *
 * @example
 * const companyData: CompanyData = {
 *   company_profile: {
 *     name: "TechCorp Solutions",
 *     industry: "Enterprise Software",
 *     description: "Leading provider of enterprise software solutions",
 *     size: "500-1000 employees",
 *     location: "San Francisco, CA"
 *   },
 *   mission_and_culture: {
 *     mission_statement: "To empower businesses through innovative technology solutions",
 *     coreValues: ["Innovation", "Excellence", "Collaboration", "Growth"],
 *     work_environment: "Collaborative, fast-paced, innovation-focused"
 *   },
 *   positions: [{
 *     title: "Senior Software Engineer",
 *     type: "technical",
 *     level: "senior",
 *     department: "Engineering",
 *     description: "Lead development of enterprise software solutions"
 *   }]
 * }
 */
export interface CompanyData {
  /** Basic company information and profile */
  company_profile: {
    /** Legal company name */
    name: string;

    /** Industry sector or domain */
    industry: string;

    /** Brief company description */
    description?: string;

    /** Company size (employee count, revenue, etc.) */
    size?: string;

    /** Current business stage (startup, growth, mature, etc.) */
    stage?: string;

    /** Physical location or headquarters */
    location?: string;

    /** Company website URL */
    website?: string;
  };

  /** Company mission, values, and cultural information */
  mission_and_culture: {
    /** Official mission statement */
    mission_statement: string;

    /** Core values that guide company decisions and behavior */
    coreValues: string[];

    /** Vision for the company's future */
    vision_statement?: string;

    /** Description of the work environment and atmosphere */
    work_environment: string;

    /** Specific cultural aspects of the team */
    team_culture?: string;

    /** Additional company values (alternative to coreValues) */
    company_values?: string[];
  };

  /** Array of job positions for which to generate questions */
  positions: Array<{
    /** Job title */
    title: string;

    /** Type of role (technical, business, creative, etc.) */
    type: string;

    /** Experience level (junior, mid, senior, lead, etc.) */
    level: string;

    /** Department or functional area */
    department: string;

    /** Detailed job description */
    description?: string;

    /** Required qualifications and skills */
    requirements?: string[];

    /** Key responsibilities and duties */
    responsibilities?: string[];

    /** Preferred qualifications and nice-to-haves */
    qualifications?: string[];
  }>;
}

/**
 * Parameters for KSA-based interview question generation
 * Combines company data with generation options and customizations
 *
 * @example
 * const params: KSAGenerationParams = {
 *   companyData: { // Company information object },
 *   positionTitle: "Senior Software Engineer",
 *   coreValues: ["Innovation", "Excellence", "Collaboration"],
 *   customInstructions: "Focus on technical leadership and cloud architecture experience"
 * }
 */
export interface KSAGenerationParams {
  /** Complete company information for context */
  companyData: CompanyData;

  /** Specific position title to focus on (optional) */
  positionTitle?: string;

  /** Custom KSA framework to use (optional, defaults to standard) */
  ksaFramework?: KSAFramework;

  /** Company values to emphasize (optional, uses companyData.coreValues if not provided) */
  coreValues?: string[];

  /** Additional custom instructions for the AI */
  customInstructions?: string;
}

/**
 * Available levels for the 1-10 KSA evaluation scale
 */
export type EvaluationScaleLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * Evaluation scale mapping performance levels to descriptions
 */
export type EvaluationScale = Record<EvaluationScaleLevel, string>;

/**
 * Standard job fit KSA categories
 * These are the three core areas evaluated for job fit assessment
 */
export type JobFitCategory = "Knowledge" | "Skills" | "Ability";

/**
 * Question difficulty levels for job fit assessment
 */
// (Moved above) See QuestionDifficulty union near the top

/**
 * Dynamic key type for KSA job fit categories
 * Enables type-safe access to KSAJobFit properties
 */
export type KSACategoryKey = keyof KSAJobFit;

/**
 * Dynamic key type for company values
 * Since company values are strings, this allows type-safe indexing
 */
export type CompanyValueKey = string;

/**
 * Generic question type with guaranteed category
 * Ensures questions always have category information for proper display
 */
export type QuestionWithCategory<T extends BaseQuestion = BaseQuestion> = T & {
  category: string;
};

/**
 * Type guard to check if a question is a Job Fit question
 * Uses structural typing to identify JobFitQuestion instances
 *
 * @example
 * const question: BaseQuestion = getQuestion();
 * if (isJobFitQuestion(question)) {
 *   // question is now typed as JobFitQuestion
 *   console.log(question.difficulty); // TypeScript knows this exists
 *   console.log(question.redFlagIndicators); // And this
 * }
 */
export function isJobFitQuestion(question: BaseQuestion): question is JobFitQuestion {
  return (
    'evaluationCriteria' in question ||
    'evaluation_criteria' in question ||
    'expectedAnswers' in question ||
    'expected_answers' in question
  );
}

/**
 * Type guard to check if a question is a Company Fit question
 * Uses structural typing to identify CompanyFitQuestion instances
 *
 * @example
 * const question: BaseQuestion = getQuestion();
 * if (isCompanyFitQuestion(question)) {
 *   // question is now typed as CompanyFitQuestion
 *   console.log(question.sampleIndicators); // TypeScript knows this exists
 * }
 */
export function isCompanyFitQuestion(question: BaseQuestion): question is CompanyFitQuestion {
  return 'sampleIndicators' in question;
}

/**
 * Returns the standard job fit categories
 * Provides a centralized list of valid KSA categories
 *
 * @example
 * const categories = getJobFitCategories();
 * // Returns: ["Knowledge", "Skills", "Ability"]
 */
export function getJobFitCategories(): JobFitCategory[] {
  return ["Knowledge", "Skills", "Ability"];
}

/**
 * Creates a KSA attribute with standard evaluation scale
 * Helper function for creating consistent KSA attribute definitions
 *
 * @param definition - Clear description of what this KSA area encompasses
 * @param weighting - Percentage weight in overall evaluation (0-100)
 * @param redFlags - Array of warning signs for this KSA area
 * @returns Complete KSAAttribute object with standard evaluation scale
 *
 * @example
 * const knowledgeKSA = createKSAAttribute(
 *   "Understanding of enterprise software development principles",
 *   40,
 *   ["Low understanding of software development lifecycle", "Not aware of industry trends"]
 * );
 */
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
      "10": "Transforms the way the team delivers"
    }
  };
}
