import { z } from 'zod'
import { AIRequestSchema, AIResponseSchema } from '../core/request'

/**
 * Company Analysis Operation Schemas
 * Specialized schemas for company analysis AI operations
 */

// Company Profile Information
export const CompanyProfileSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  industry: z.string(),
  sector: z.string().optional(),
  size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']),
  founded: z.string().optional(),
  location: z.object({
    headquarters: z.string(),
    remoteFriendly: z.boolean().optional(),
    offices: z.array(z.string()).optional()
  }).optional(),
  website: z.string().url().optional(),
  description: z.string().optional()
})

export type CompanyProfile = z.infer<typeof CompanyProfileSchema>

// Mission and Culture Information
export const MissionAndCultureSchema = z.object({
  missionStatement: z.string().optional(),
  visionStatement: z.string().optional(),
  coreValues: z.array(z.string()).optional(),
  culture: z.object({
    workStyle: z.enum(['remote', 'hybrid', 'in-office', 'flexible']).optional(),
    pace: z.enum(['fast-paced', 'balanced', 'relaxed']).optional(),
    collaboration: z.enum(['highly-collaborative', 'independent', 'mixed']).optional(),
    innovation: z.enum(['innovative', 'traditional', 'adaptive']).optional()
  }).optional(),
  benefits: z.array(z.string()).optional(),
  workLifeBalance: z.enum(['excellent', 'good', 'average', 'poor']).optional()
})

export type MissionAndCulture = z.infer<typeof MissionAndCultureSchema>

// Technologies and Stack
export const TechnologiesSchema = z.object({
  frontend: z.array(z.string()).optional(),
  backend: z.array(z.string()).optional(),
  database: z.array(z.string()).optional(),
  cloud: z.array(z.string()).optional(),
  devops: z.array(z.string()).optional(),
  mobile: z.array(z.string()).optional(),
  ai_ml: z.array(z.string()).optional(),
  other: z.array(z.string()).optional()
})

export type Technologies = z.infer<typeof TechnologiesSchema>

// Position Information
export const PositionSchema = z.object({
  title: z.string().min(1, 'Position title is required'),
  department: z.string().optional(),
  level: z.enum(['intern', 'junior', 'mid', 'senior', 'lead', 'manager', 'director', 'vp', 'c-level']),
  type: z.enum(['full-time', 'part-time', 'contract', 'freelance', 'internship']),
  remote: z.enum(['fully-remote', 'hybrid', 'on-site', 'flexible']),
  responsibilities: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  niceToHave: z.array(z.string()).optional(),
  salary: z.object({
    range: z.string().optional(),
    currency: z.string().optional(),
    equity: z.boolean().optional()
  }).optional()
})

export type Position = z.infer<typeof PositionSchema>

// Interview Steps Configuration
export const InterviewStepSchema = z.object({
  name: z.string().min(1, 'Step name is required'),
  type: z.enum([
    'screening',
    'technical',
    'behavioral',
    'system-design',
    'culture-fit',
    'final-interview',
    'team-meet'
  ]),
  duration: z.number().positive().optional(), // minutes
  format: z.enum(['phone', 'video', 'in-person', 'take-home', 'panel']),
  description: z.string().optional(),
  focus: z.array(z.string()).optional(),
  interviewer: z.string().optional()
})

export const InterviewStepsSchema = z.object({
  steps: z.array(InterviewStepSchema).min(1, 'At least one interview step is required'),
  totalDuration: z.number().positive().optional(),
  note: z.string().optional()
})

export type InterviewStep = z.infer<typeof InterviewStepSchema>
export type InterviewSteps = z.infer<typeof InterviewStepsSchema>

// Complete Company Context
export const CompanyContextSchema = z.object({
  companyProfile: CompanyProfileSchema,
  missionAndCulture: MissionAndCultureSchema.optional(),
  technologies: TechnologiesSchema.optional(),
  positions: z.array(PositionSchema).optional(),
  interviewSteps: InterviewStepsSchema.optional()
})

export type CompanyContext = z.infer<typeof CompanyContextSchema>

// Company Analysis Request
export const CompanyAnalysisRequestSchema = AIRequestSchema.extend({
  // Override type to be specific
  type: z.literal('company_analysis'),

  // Required company context
  companyContext: CompanyContextSchema,

  // Analysis configuration
  analysisType: z.enum([
    'culture-analysis',
    'interview-preparation',
    'technical-assessment',
    'competitor-analysis',
    'growth-analysis'
  ]),

  // Specific focus areas
  focusAreas: z.array(z.string()).optional(),

  // Output preferences
  includeRecommendations: z.boolean().default(true),
  includeStrengths: z.boolean().default(true),
  includeChallenges: z.boolean().default(true),
  includeQuestions: z.boolean().default(false)
})

export type CompanyAnalysisRequest = z.infer<typeof CompanyAnalysisRequestSchema>

// Company Analysis Response
export const CompanyAnalysisResponseSchema = AIResponseSchema.extend({
  // Analysis-specific data structure
  data: z.object({
    summary: z.string(),
    culture: z.object({
      strengths: z.array(z.string()),
      challenges: z.array(z.string()),
      recommendations: z.array(z.string())
    }).optional(),
    interview: z.object({
      preparation: z.array(z.string()),
      recommendedQuestions: z.array(z.string()),
      redFlags: z.array(z.string()),
      positiveIndicators: z.array(z.string())
    }).optional(),
    technical: z.object({
      stackAssessment: z.string(),
      suggestedProjects: z.array(z.string()),
      knowledgeAreas: z.array(z.string())
    }).optional(),

    // Additional analysis results
    insights: z.array(z.string()).optional(),
    recommendations: z.array(z.string()).optional(),
    nextSteps: z.array(z.string()).optional(),

    // Scoring
    cultureFitScore: z.number().min(0).max(100).optional(),
    technicalMatchScore: z.number().min(0).max(100).optional(),
    overallScore: z.number().min(0).max(100).optional()
  }).optional()
})

export type CompanyAnalysisResponse = z.infer<typeof CompanyAnalysisResponseSchema>