/**
 * AI-related Enums and Constants
 * Centralized enums for AI operations, models, and configurations
 */

// AI Model Categories
export enum AIModelCategory {
  REASONING = 'reasoning',
  GENERATION = 'generation',
  MULTIMODAL = 'multimodal',
  LEGACY = 'legacy'
}

// AI Generation Types
export enum AIGenerationType {
  GENERAL = 'general',
  ANALYSIS = 'analysis',
  RECOMMENDATIONS = 'recommendations',
  CUSTOM = 'custom',
  JSON = 'json',
  COMPANY_ANALYSIS = 'company_analysis',
  KSA_GENERATION = 'ksa_generation',
  STREAMING = 'streaming'
}

// AI Response Formats
export enum AIResponseFormat {
  TEXT = 'text',
  JSON = 'json',
  MARKDOWN = 'markdown'
}

// Stream Event Types
export enum AIStreamEventType {
  START = 'start',
  PROGRESS = 'progress',
  CHUNK = 'chunk',
  COMPLETE = 'complete',
  ERROR = 'error'
}

// AI Model IDs
export enum AIModelId {
  // Reasoning Models
  GPT_5_1 = 'gpt-5.1',
  GPT_5 = 'gpt-5',
  GPT_5_MINI = 'gpt-5-mini',
  GPT_5_NANO = 'gpt-5-nano',
  O3_DEEP_RESEARCH = 'o3-deep-research',
  O3 = 'o3',
  O1 = 'o1',
  O4_MINI = 'o4-mini',

  // Generation Models
  GPT_4_1 = 'gpt-4.1',
  GPT_4O = 'gpt-4o',
  GPT_4O_MINI = 'gpt-4o-mini',

  // Legacy Models
  GPT_3_5_TURBO = 'gpt-3.5-turbo',

  // Multimodal Models
  GPT_4_VISION = 'gpt-4-vision',
  CLAUDE_3_OPUS = 'claude-3-opus',
  CLAUDE_3_SONNET = 'claude-3-sonnet'
}

// AI Provider Types
export enum AIProvider {
  OPENAI = 'OpenAI',
  ANTHROPIC = 'Anthropic',
  GOOGLE = 'Google',
  COHERE = 'Cohere'
}

// AI Model Status
export enum AIModelStatus {
  ACTIVE = 'active',
  DEPRECATED = 'deprecated',
  BETA = 'beta',
  EXPERIMENTAL = 'experimental'
}

// Company Analysis Types
export enum CompanyAnalysisType {
  CULTURE_ANALYSIS = 'culture-analysis',
  INTERVIEW_PREPARATION = 'interview-preparation',
  TECHNICAL_ASSESSMENT = 'technical-assessment',
  COMPETITOR_ANALYSIS = 'competitor-analysis',
  GROWTH_ANALYSIS = 'growth-analysis'
}

// Company Size Categories
export enum CompanySize {
  STARTUP = 'startup',
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  ENTERPRISE = 'enterprise'
}

// Position Levels
export enum PositionLevel {
  INTERN = 'intern',
  JUNIOR = 'junior',
  MID = 'mid',
  SENIOR = 'senior',
  LEAD = 'lead',
  MANAGER = 'manager',
  DIRECTOR = 'director',
  VP = 'vp',
  C_LEVEL = 'c-level'
}

// Position Types
export enum PositionType {
  FULL_TIME = 'full-time',
  PART_TIME = 'part-time',
  CONTRACT = 'contract',
  FREELANCE = 'freelance',
  INTERNSHIP = 'internship'
}

// Remote Work Types
export enum RemoteType {
  FULLY_REMOTE = 'fully-remote',
  HYBRID = 'hybrid',
  ON_SITE = 'on-site',
  FLEXIBLE = 'flexible'
}

// Interview Step Types
export enum InterviewStepType {
  SCREENING = 'screening',
  TECHNICAL = 'technical',
  BEHAVIORAL = 'behavioral',
  SYSTEM_DESIGN = 'system-design',
  CULTURE_FIT = 'culture-fit',
  FINAL_INTERVIEW = 'final-interview',
  TEAM_MEET = 'team-meet'
}

// Interview Formats
export enum InterviewFormat {
  PHONE = 'phone',
  VIDEO = 'video',
  IN_PERSON = 'in-person',
  TAKE_HOME = 'take-home',
  PANEL = 'panel'
}

// KSA Categories
export enum KSACategory {
  KNOWLEDGE = 'knowledge',
  SKILLS = 'skills',
  ABILITIES = 'abilities',
  BEHAVIORS = 'behaviors',
  EXPERIENCE = 'experience'
}

// KSA Difficulty Levels
export enum KSADifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

// KSA Importance Levels
export enum KSAImportance {
  CRITICAL = 'critical',
  IMPORTANT = 'important',
  NICE_TO_HAVE = 'nice-to-have',
  OPTIONAL = 'optional'
}

// Question Types
export enum QuestionType {
  BEHAVIORAL = 'behavioral',
  SITUATIONAL = 'situational',
  TECHNICAL = 'technical',
  PROBLEM_SOLVING = 'problem-solving',
  LEADERSHIP = 'leadership',
  COMMUNICATION = 'communication',
  TEAMWORK = 'teamwork',
  ADAPTABILITY = 'adaptability'
}

// Application Constants
export const AI_CONSTANTS = {
  // Model Limits
  MAX_TOKENS_GPT4: 128000,
  MAX_TOKENS_GPT35: 4096,
  MAX_TOKENS_GPT5: 200000,

  // Temperature Ranges
  MIN_TEMPERATURE: 0,
  MAX_TEMPERATURE: 2,
  DEFAULT_TEMPERATURE: 0.7,

  // Rate Limiting
  DEFAULT_RATE_LIMIT: 100, // requests per minute
  MAX_CONCURRENT_REQUESTS: 10,

  // Stream Settings
  DEFAULT_CHUNK_SIZE: 100,
  MAX_CHUNK_SIZE: 1000,
  STREAM_TIMEOUT: 300000, // 5 minutes

  // Retry Settings
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_BASE: 1000, // 1 second
  RETRY_DELAY_MAX: 10000, // 10 seconds

  // Processing Limits
  MAX_PROMPT_LENGTH: 100000,
  MAX_RESPONSE_LENGTH: 200000,
  MAX_CONTEXT_SIZE: 1000000
} as const;

// Error Codes
export const AI_ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MODEL_NOT_FOUND: 'MODEL_NOT_FOUND',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  TOKEN_LIMIT_EXCEEDED: 'TOKEN_LIMIT_EXCEEDED',
  API_KEY_INVALID: 'API_KEY_INVALID',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  GENERATION_ERROR: 'GENERATION_ERROR',
  STREAM_ERROR: 'STREAM_ERROR',
  PARSING_ERROR: 'PARSING_ERROR',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR'
} as const;

export type AIErrorCode = typeof AI_ERROR_CODES[keyof typeof AI_ERROR_CODES];