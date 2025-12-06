/**
 * Comprehensive Candidate Management System
 *
 * This file contains the core data structures and interfaces for managing candidates
 * with personality systems, evaluation capabilities, and AI generation support.
 */

import { KSAInterviewOutput } from '@/types/company_old/ksa'

/**
 * Core personality traits that define a candidate's behavioral patterns
 * These traits influence their responses, working style, and team interactions
 */
export interface PersonalityTraits {
  /* Openness to new experiences, ideas, and change (1-100) */
  openness: number

  /* Tendency toward organization, responsibility, and detail-orientation (1-100) */
  conscientiousness: number

  /* Sociability, assertiveness, and emotional expressiveness (1-100) */
  extraversion: number

  /* Cooperative, trusting, and compassionate nature (1-100) */
  agreeableness: number

  /* Emotional stability and stress tolerance (1-100) */
  neuroticism: number
}

/**
 * Work-related behavioral patterns and preferences
 * These patterns influence how candidates approach tasks and interact with colleagues
 */
export interface WorkBehaviorPatterns {
  /* Preferred communication style in professional settings */
  communicationStyle: 'direct' | 'collaborative' | 'diplomatic' | 'analytical'

  /* How they approach and handle conflicts or disagreements */
  conflictResolutionStyle: 'collaborative' | 'competing' | 'accommodating' | 'avoiding'

  /* Their natural tendency in group settings and team projects */
  teamPlayerType: 'leader' | 'collaborator' | 'specialist' | 'contributor'

  /* Preferred pace and style of completing work */
  workStyle: 'methodical' | 'rapid' | 'iterative' | 'comprehensive'

  /** Decision-making approach under pressure or uncertainty */
  decisionMakingStyle: 'analytical' | 'intuitive' | 'collaborative' | 'decisive'
}

/**
 * Cognitive and reasoning abilities assessment
 * These indicate how candidates process information and solve problems
 */
export interface CognitiveProfile {
  /* Ability to think logically and systematically through problems */
  logicalReasoning: number // 1-10

  /* Capacity to think creatively and generate novel solutions */
  creativeThinking: number // 1-10

  /** Understanding of social situations and interpersonal dynamics */
  socialIntelligence: number // 1-10

  /** Ability to understand and work with abstract concepts and patterns */
  abstractReasoning: number // 1-10

  /** Skill in communicating complex ideas clearly and effectively */
  verbalCommunication: number // 1-10

  /** Aptitude for numerical analysis and quantitative reasoning */
  quantitativeAbility: number // 1-10
}

/**
 * Technical skills and competencies evaluation
 * Maps directly to KSA requirements for job compatibility assessment
 */
export interface TechnicalSkills {
  /** Programming languages and development technologies */
  programmingLanguages: Array<{
    language: string
    proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    yearsExperience: number
  }>

  /** Frameworks, libraries, and development tools */
  frameworksAndTools: Array<{
    name: string
    proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    yearsExperience: number
  }>

  /** System architecture and software design capabilities */
  systemDesign: {
    microservices: number // 1-10
    monolithic: number // 1-10
    cloudNative: number // 1-10
    database: number // 1-10
    security: number // 1-10
  }

  /** Development methodologies and practices */
  methodologies: {
    agile: number // 1-10
    waterfall: number // 1-10
    devops: number // 1-10
    testing: number // 1-10
    documentation: number // 1-10
  }
}

/**
 * Professional background and experience history
 * Comprehensive record of career progression and achievements
 */
export interface ProfessionalExperience {
  /* Current or most recent role */
  currentPosition: {
    title: string
    company: string
    industry: string
    location: string
    startDate: string
    endDate?: string
    isCurrentRole: boolean
    description: string
    keyAchievements: string[]
    teamSize?: number
    directReports?: number
  }

  /** Complete career history in reverse chronological order */
  previousPositions: Array<{
    title: string
    company: string
    industry: string
    location: string
    startDate: string
    endDate: string
    description: string
    keyAchievements: string[]
    teamSize?: number
    technologiesUsed: string[]
  }>

  /** Educational background and qualifications */
  education: Array<{
    degree: string
    field: string
    institution: string
    location: string
    graduationYear: number
    gpa?: number
    honors?: string[]
  }>

  /** Professional certifications and ongoing learning */
  certificationsAndTraining: Array<{
    name: string
    issuer: string
    issueDate: string
    expiryDate?: string
    credentialId?: string
  }>
}

/**
 * Interview performance simulation data
 * Predicts how candidates might perform in various interview scenarios
 */
export interface InterviewPerformance {
  /** Predicted performance in different interview formats */
  simulatedInterviewScores: {
    behavioral: {
      overall: number // 1-10
      communication: number // 1-10
      problemSolving: number // 1-10
      leadership: number // 1-10
      teamwork: number // 1-10
    }
    technical: {
      coding: number // 1-10
      systemDesign: number // 1-10
      troubleshooting: number // 1-10
      bestPractices: number // 1-10
    }
    cultural: {
      companyFit: number // 1-10
      valuesAlignment: number // 1-10
      collaboration: number // 1-10
      innovation: number // 1-10
    }
  }

  /** Behavioral interview response patterns based on personality */
  responsePatterns: {
    /* Tendency to provide structured, comprehensive answers */
    answerStructure: 'concise' | 'detailed' | 'comprehensive' | 'storytelling'

    /** Preferred framework for answering behavioral questions */
    storytellingStyle: 'STAR' | 'CAR' | 'PAR' | 'narrative'

    /** Emotional expression and enthusiasm in responses */
    enthusiasmLevel: number // 1-10

    /** Self-awareness and ability to discuss growth areas */
    selfAwarenessLevel: number // 1-10
  }

  /** Potential red flags or concerns based on profile analysis */
  potentialRedFlags: string[]

  /** Areas of exceptional strength or unique value */
  keyStrengths: string[]
}

/**
 * Complete candidate profile integrating all aspects
 * This is the main data structure for the candidate management system
 */
export interface Candidate {
  /* Unique identifier for the candidate */
  id: string

  /* Basic personal information */
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    location: {
      city: string
      state: string
      country: string
      timezone: string
    }
    portfolioUrl?: string
    linkedinUrl?: string
    githubUrl?: string
  }

  /** Personality assessment based on Big Five model */
  personality: PersonalityTraits

  /** Work-related behavioral patterns and preferences */
  workBehavior: WorkBehaviorPatterns

  /** Cognitive abilities and reasoning skills assessment */
  cognitiveProfile: CognitiveProfile

  /** Technical skills and competencies evaluation */
  technicalSkills: TechnicalSkills

  /** Professional background and experience history */
  experience: ProfessionalExperience

  /** Interview performance simulation and predictions */
  interviewPerformance: InterviewPerformance

  /** KSA evaluation scores if available */
  ksaScores?: {
    [category: string]: {
      score: number // 1-10
      confidence: number // 0-1
      lastUpdated: string
      evaluator?: string
    }
  }

  /** Metadata and system information */
  metadata: {
    dateCreated: string
    lastUpdated: string
    version: string
    source: 'ai-generated' | 'manual' | 'imported'
    generationPrompt?: string
    tags: string[]
    notes?: string
  }
}

/**
 * Candidate generation parameters for AI-powered creation
 * Configuration options for generating candidates with specific characteristics
 */
export interface CandidateGenerationParams {
  /* Target role or position for the candidate */
  targetRole?: string

  /** Experience level to generate */
  experienceLevel?: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'principal'

  /** Specific personality archetype or combination */
  personalityArchetype?: 'balanced' | 'innovator' | 'specialist' | 'leader' | 'collaborator'

  /** Technical expertise focus areas */
  technicalFocus?: string[]

  /** Industry background for the candidate */
  industryBackground?: string

  /** Geographic location preference */
  locationPreference?: string

  /** Additional custom requirements or constraints */
  customRequirements?: string[]

  /** Number of candidates to generate with these parameters */
  count?: number

  /** Quality level for generated candidates */
  qualityLevel?: 'excellent' | 'good' | 'average' | 'poor' | 'terrible'

  /** Include realistic flaws and red flags */
  includeRedFlags?: boolean
}

/**
 * Candidate evaluation result for KSA compatibility
 * Links candidate profiles to specific job requirements and KSA frameworks
 */
export interface CandidateEvaluation {
  /* Candidate being evaluated */
  candidateId: string

  /* Job position or KSA framework used for evaluation */
  evaluationContext: {
    jobTitle?: string
    ksaFramework?: KSAInterviewOutput
    evaluationDate: string
    evaluator: string
  }

  /** Detailed evaluation scores by category */
  scores: {
    knowledge: {
      overall: number // 1-10
      breakdown: Record<string, number>
      confidence: number
      notes: string
    }
    skills: {
      overall: number // 1-10
      breakdown: Record<string, number>
      confidence: number
      notes: string
    }
    abilities: {
      overall: number // 1-10
      breakdown: Record<string, number>
      confidence: number
      notes: string
    }
  }

  /** Overall compatibility assessment */
  overallCompatibility: {
    score: number // 1-10
    recommendation: 'strong-reject' | 'reject' | 'consider' | 'recommend' | 'strong-recommend'
    strengths: string[]
    concerns: string[]
    interviewFocus: string[]
  }

  /** Predicted interview performance */
  predictedPerformance: {
    behavioral: number // 1-10
    technical: number // 1-10
    cultural: number // 1-10
    overall: number // 1-10
  }
}

/**
 * Candidate comparison result for multiple candidates
 * Enables side-by-side analysis and ranking
 */
export interface CandidateComparison {
  /* Candidates being compared */
  candidateIds: string[]

  /** Comparison criteria and weights */
  comparisonCriteria: {
    technicalSkills: number // weight 0-1
    experience: number // weight 0-1
    culturalFit: number // weight 0-1
    personality: number // weight 0-1
    growthPotential: number // weight 0-1
  }

  /** Ranked results with scores */
  results: Array<{
    candidateId: string
    overallScore: number // 0-100
    breakdown: {
      technicalSkills: number
      experience: number
      culturalFit: number
      personality: number
      growthPotential: number
    }
    strengths: string[]
    concerns: string[]
    recommendation: string
  }>

  /** Comparison metadata */
  metadata: {
    comparisonDate: string
    jobContext?: string
    comparisonMethod: 'weighted' | 'equal' | 'custom'
  }
}