import { z } from 'zod'
import { AIRequestSchema, AIResponseSchema } from '../core/request'

/**
 * KSA (Knowledge, Skills, Abilities) Generation Schemas
 * Specialized schemas for KSA-based interview question generation
 */

// KSA Categories
export const KSACategorySchema = z.enum([
  'knowledge',
  'skills',
  'abilities',
  'behaviors',
  'experience'
])

export type KSACategory = z.infer<typeof KSACategorySchema>

// Individual KSA Item
export const KSAItemSchema = z.object({
  category: KSACategorySchema,
  title: z.string().min(1, 'KSA title is required'),
  description: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  importance: z.enum(['critical', 'important', 'nice-to-have', 'optional']),
  related: z.array(z.string()).optional() // Related KSAs
})

export type KSAItem = z.infer<typeof KSAItemSchema>

// KSA Framework Configuration
export const KSAFrameworkSchema = z.object({
  role: z.string().min(1, 'Role is required'),
  level: z.enum(['junior', 'mid', 'senior', 'lead', 'manager']),
  industry: z.string().optional(),
  company: z.string().optional(),

  // KSA categories and their items
  ksaItems: z.array(KSAItemSchema).min(1, 'At least one KSA item is required'),

  // Question generation preferences
  questionTypes: z.array(z.enum([
    'behavioral',
    'situational',
    'technical',
    'problem-solving',
    'leadership',
    'communication',
    'teamwork',
    'adaptability'
  ])).optional(),

  // Difficulty and complexity
  difficulty: z.enum(['basic', 'intermediate', 'advanced', 'expert']).optional(),
  complexity: z.number().min(1).max(10).optional(),

  // Output preferences
  includeAnswers: z.boolean().default(false),
  includeRubric: z.boolean().default(false),
  includeFollowUp: z.boolean().default(true),
  maxQuestionsPerKSA: z.number().min(1).max(10).default(3)
})

export type KSAFramework = z.infer<typeof KSAFrameworkSchema>

// Generated Question Structure
export const KSAQuestionSchema = z.object({
  id: z.string().optional(),
  ksaId: z.string(), // Reference to KSA item
  category: KSACategorySchema,
  type: z.enum([
    'behavioral',
    'situational',
    'technical',
    'problem-solving',
    'leadership',
    'communication',
    'teamwork',
    'adaptability'
  ]),
  question: z.string().min(1, 'Question text is required'),
  followUp: z.array(z.string()).optional(),
  whatToLookFor: z.array(z.string()).optional(),
  redFlags: z.array(z.string()).optional(),
  exampleAnswer: z.string().optional(),
  difficulty: z.enum(['basic', 'intermediate', 'advanced', 'expert']),
  estimatedTime: z.number().positive().optional(), // minutes

  // Evaluation criteria
  criteria: z.array(z.object({
    name: z.string(),
    description: z.string(),
    weight: z.number().min(0).max(1).optional()
  })).optional()
})

export type KSAQuestion = z.infer<typeof KSAQuestionSchema>

// KSA Generation Request
export const KSAGenerationRequestSchema = AIRequestSchema.extend({
  // Override type to be specific
  type: z.literal('ksa_generation'),

  // Required KSA framework
  ksaFramework: KSAFrameworkSchema,

  // Generation options
  generationMode: z.enum([
    'comprehensive', // Generate questions for all KSAs
    'targeted',     // Generate for specific KSAs only
    'adaptive',     // Generate based on interview progress
    'custom'        // Custom generation criteria
  ]).default('comprehensive'),

  // Target specific KSAs (for targeted mode)
  targetKSAs: z.array(z.string()).optional(),

  // Context and constraints
  interviewContext: z.object({
    stage: z.enum(['screening', 'technical', 'behavioral', 'final']),
    duration: z.number().positive().optional(), // minutes
    format: z.enum(['phone', 'video', 'in-person']),
    interviewerRole: z.string().optional()
  }).optional(),

  // Advanced options
  adaptiveDifficulty: z.boolean().default(false),
  personalization: z.object({
    candidateLevel: z.enum(['junior', 'mid', 'senior', 'lead', 'manager']).optional(),
    candidateBackground: z.string().optional(),
    previousAnswers: z.array(z.string()).optional()
  }).optional()
})

export type KSAGenerationRequest = z.infer<typeof KSAGenerationRequestSchema>

// KSA Generation Response
export const KSAGenerationResponseSchema = AIResponseSchema.extend({
  // KSA-specific data structure
  data: z.object({
    framework: KSAFrameworkSchema.optional(),
    questions: z.array(KSAQuestionSchema),

    // Generation metadata
    generationStats: z.object({
      totalQuestions: z.number().int(),
      questionsByCategory: z.record(z.number().int()),
      questionsByType: z.record(z.number().int()),
      averageDifficulty: z.number().optional(),
      estimatedDuration: z.number().positive() // minutes
    }).optional(),

    // Interview flow suggestions
    interviewFlow: z.object({
      recommendedOrder: z.array(z.string()).optional(),
      timing: z.array(z.object({
        ksaId: z.string(),
        estimatedTime: z.number(),
        priority: z.enum(['high', 'medium', 'low'])
      })).optional()
    }).optional(),

    // Evaluation framework
    rubric: z.object({
      scoringCriteria: z.array(z.object({
        name: z.string(),
        description: z.string(),
        levels: z.array(z.object({
          level: z.string(),
          description: z.string(),
          score: z.number()
        }))
      }))
    }).optional()
  }).optional()
})

export type KSAGenerationResponse = z.infer<typeof KSAGenerationResponseSchema>