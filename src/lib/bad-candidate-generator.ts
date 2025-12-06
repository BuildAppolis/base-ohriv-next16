/**
 * Bad Candidate Generation System
 *
 * Creates realistic poor-quality candidates with various types of issues and red flags.
 * Essential for testing evaluation systems and creating realistic demo scenarios.
 */

import { faker } from '@faker-js/faker'
import { nanoid } from 'nanoid'
import {
  Candidate,
  PersonalityTraits,
  WorkBehaviorPatterns,
  CognitiveProfile,
  CandidateGenerationParams
} from '@/types/candidate'
import { generateCandidate } from './candidate-generator'

/**
 * Types of candidate quality issues
 */
export type CandidateFlawType =
  | 'skill_exaggeration'      // Inflated skills and experience
  | 'poor_communication'     // Bad communication patterns
  | 'toxic_personality'       // Problematic personality traits
  | 'job_hopper'             // Frequent job changes
  | 'skill_gaps'             // Missing essential skills
  | 'cultural_misfit'        // Poor cultural alignment
  | 'lazy_worker'            // Low motivation and work ethic
  | 'arrogant_attitude'      // Overconfidence and arrogance
  | 'unreliable'             // Attendance and reliability issues
  | 'resistant_to_feedback'  // Cannot accept criticism
  | 'poor_problem_solving'   // Weak analytical skills
  | 'attention_issues'       // Poor attention to detail

/**
 * Flaw generation configurations
 */
interface FlawConfiguration {
  type: CandidateFlawType
  severity: 'mild' | 'moderate' | 'severe'
  description: string
  impactOnScores: {
    technical?: number // 0-10 reduction
    behavioral?: number // 0-10 reduction
    cultural?: number // 0-10 reduction
  }
}

/**
 * Personality archetype configurations for bad candidates
 */
const problematicPersonalityArchetypes = {
  arrogant: {
    name: 'Arrogant Expert',
    traits: {
      openness: 85,
      conscientiousness: 60,
      extraversion: 90,
      agreeableness: 25,
      neuroticism: 30
    },
    description: 'Thinks they know everything, dismisses others, overconfident'
  },
  lazy: {
    name: 'Coasting Employee',
    traits: {
      openness: 40,
      conscientiousness: 20,
      extraversion: 50,
      agreeableness: 70,
      neuroticism: 60
    },
    description: 'Minimal effort, avoids responsibility, poor work ethic'
  },
  toxic: {
    name: 'Toxic Teammate',
    traits: {
      openness: 45,
      conscientiousness: 50,
      extraversion: 75,
      agreeableness: 15,
      neuroticism: 80
    },
    description: 'Creates conflict, blames others, poor team player'
  },
  job_hopper: {
    name: 'Job Hopper',
    traits: {
      openness: 70,
      conscientiousness: 35,
      extraversion: 65,
      agreeableness: 50,
      neuroticism: 65
    },
    description: 'Frequently changes jobs, lacks commitment, inconsistent'
  },
  inexperienced: {
    name: 'Inexperienced Pretender',
    traits: {
      openness: 60,
      conscientiousness: 40,
      extraversion: 45,
      agreeableness: 65,
      neuroticism: 75
    },
    description: 'Claims experience they don\'t have, struggles with basic tasks'
  }
}

/**
 * Bad candidate flaws library
 */
const flawLibrary: FlawConfiguration[] = [
  {
    type: 'skill_exaggeration',
    severity: 'moderate',
    description: 'Claims 5+ years of experience but struggles with basic concepts',
    impactOnScores: { technical: 3, behavioral: 2 }
  },
  {
    type: 'poor_communication',
    severity: 'severe',
    description: 'Cannot articulate thoughts clearly, gives vague answers',
    impactOnScores: { behavioral: 4, cultural: 3 }
  },
  {
    type: 'toxic_personality',
    severity: 'severe',
    description: 'Arrogant, dismissive of teammates, creates conflict',
    impactOnScores: { cultural: 5, behavioral: 4 }
  },
  {
    type: 'job_hopper',
    severity: 'moderate',
    description: 'Multiple jobs in past year, no clear career progression',
    impactOnScores: { behavioral: 3, cultural: 2 }
  },
  {
    type: 'skill_gaps',
    severity: 'moderate',
    description: 'Missing fundamental skills for the role',
    impactOnScores: { technical: 4 }
  },
  {
    type: 'cultural_misfit',
    severity: 'moderate',
    description: 'Values misaligned with company culture, resistant to change',
    impactOnScores: { cultural: 4, behavioral: 2 }
  },
  {
    type: 'lazy_worker',
    severity: 'severe',
    description: 'Minimal effort, avoids responsibility, poor attention to detail',
    impactOnScores: { behavioral: 4, technical: 2 }
  },
  {
    type: 'arrogant_attitude',
    severity: 'moderate',
    description: 'Overconfident, dismisses feedback, difficult to manage',
    impactOnScores: { behavioral: 3, cultural: 3 }
  },
  {
    type: 'unreliable',
    severity: 'severe',
    description: 'Poor attendance history, misses deadlines, inconsistent work',
    impactOnScores: { behavioral: 5, cultural: 3 }
  },
  {
    type: 'resistant_to_feedback',
    severity: 'moderate',
    description: 'Defensive when criticized, refuses to acknowledge mistakes',
    impactOnScores: { behavioral: 3, cultural: 2 }
  },
  {
    type: 'poor_problem_solving',
    severity: 'moderate',
    description: 'Cannot break down complex problems, gives up easily',
    impactOnScores: { technical: 3, behavioral: 2 }
  },
  {
    type: 'attention_issues',
    severity: 'moderate',
    description: 'Makes careless mistakes, misses important details',
    impactOnScores: { technical: 3, behavioral: 2 }
  }
]

/**
 * Bad Candidate Generation Engine
 */
export class BadCandidateGenerator {
  /**
   * Generate a candidate with specific flaws and red flags
   */
  generateBadCandidate(
    params: CandidateGenerationParams,
    flaws: CandidateFlawType[] = []
  ): Candidate {
    const baseCandidate = generateCandidate(params)

    // Apply quality level degradation
    const qualityLevel = params.qualityLevel || 'poor'
    const candidate = this.applyQualityLevel(baseCandidate, qualityLevel)

    // Apply specific flaws if provided
    if (flaws.length > 0) {
      return this.applyFlaws(candidate, flaws)
    }

    // Auto-generate flaws based on quality level
    return this.generateFlaws(candidate, qualityLevel, params.includeRedFlags || false)
  }

  /**
   * Apply quality level degradations to a candidate
   */
  private applyQualityLevel(candidate: Candidate, qualityLevel: string): Candidate {
    const qualityMultiplier = {
      excellent: 1.0,
      good: 0.85,
      average: 0.65,
      poor: 0.4,
      terrible: 0.2
    }[qualityLevel] || 0.4

    // Degrade interview scores
    candidate.interviewPerformance.simulatedInterviewScores.behavioral.overall =
      Math.max(1, Math.floor(candidate.interviewPerformance.simulatedInterviewScores.behavioral.overall * qualityMultiplier))

    candidate.interviewPerformance.simulatedInterviewScores.technical.overall =
      Math.max(1, Math.floor(candidate.interviewPerformance.simulatedInterviewScores.technical.overall * qualityMultiplier))

    candidate.interviewPerformance.simulatedInterviewScores.cultural.companyFit =
      Math.max(1, Math.floor(candidate.interviewPerformance.simulatedInterviewScores.cultural.companyFit * qualityMultiplier))

    // Adjust personality based on quality
    if (qualityLevel === 'poor' || qualityLevel === 'terrible') {
      const archetype = this.selectProblematicArchetype()
      candidate.personality = this.personalityArchetypeToTraits(archetype)

      // Add problematic work behaviors
      candidate.workBehavior = this.generateProblematicWorkBehavior(archetype)
    }

    return candidate
  }

  /**
   * Apply specific flaws to a candidate
   */
  private applyFlaws(candidate: Candidate, flaws: CandidateFlawType[]): Candidate {
    flaws.forEach(flawType => {
      candidate = this.applySpecificFlaw(candidate, flawType)
    })

    // Update metadata to reflect flaws
    candidate.metadata.tags.push('has-red-flags', ...flaws)
    candidate.metadata.notes = `Candidate has concerning traits: ${flaws.join(', ')}`

    return candidate
  }

  /**
   * Generate flaws automatically based on quality level
   */
  private generateFlaws(candidate: Candidate, qualityLevel: string, includeRedFlags: boolean): Candidate {
    const numFlaws = {
      excellent: 0,
      good: 0,
      average: 1,
      poor: 2,
      terrible: 4
    }[qualityLevel] || 2

    if (numFlaws === 0) return candidate

    const availableFlaws = [...flawLibrary]
    const selectedFlaws: CandidateFlawType[] = []

    for (let i = 0; i < numFlaws && availableFlaws.length > 0; i++) {
      const randomIndex = faker.number.int({ min: 0, max: availableFlaws.length - 1 })
      const flaw = availableFlaws[randomIndex]
      selectedFlaws.push(flaw.type)
      availableFlaws.splice(randomIndex, 1)
    }

    return this.applyFlaws(candidate, selectedFlaws)
  }

  /**
   * Apply a specific flaw to a candidate
   */
  private applySpecificFlaw(candidate: Candidate, flawType: CandidateFlawType): Candidate {
    switch (flawType) {
      case 'skill_exaggeration':
        return this.applySkillExaggeration(candidate)

      case 'poor_communication':
        return this.applyPoorCommunication(candidate)

      case 'toxic_personality':
        return this.applyToxicPersonality(candidate)

      case 'job_hopper':
        return this.applyJobHopper(candidate)

      case 'skill_gaps':
        return this.applySkillGaps(candidate)

      case 'cultural_misfit':
        return this.applyCulturalMisfit(candidate)

      case 'lazy_worker':
        return this.applyLazyWorker(candidate)

      case 'arrogant_attitude':
        return this.applyArrogantAttitude(candidate)

      case 'unreliable':
        return this.applyUnreliability(candidate)

      case 'resistant_to_feedback':
        return this.applyFeedbackResistance(candidate)

      case 'poor_problem_solving':
        return this.applyPoorProblemSolving(candidate)

      case 'attention_issues':
        return this.applyAttentionIssues(candidate)

      default:
        return candidate
    }
  }

  // Specific flaw application methods

  private applySkillExaggeration(candidate: Candidate): Candidate {
    // Inflated years of experience but low proficiency
    candidate.technicalSkills.programmingLanguages.forEach(lang => {
      lang.yearsExperience = faker.number.int({ min: 5, max: 12 })
      lang.proficiency = faker.helpers.arrayElement(['beginner', 'intermediate'])
    })

    // Add red flag indicators
    candidate.interviewPerformance.potentialRedFlags.push(
      'Claims extensive experience but demonstrates junior-level skills',
      'Unable to explain concepts that should be familiar',
      'Resume doesn\'t match demonstrated abilities'
    )

    return candidate
  }

  private applyPoorCommunication(candidate: Candidate): Candidate {
    candidate.workBehavior.communicationStyle = 'direct' // Too direct/poor communication
    candidate.cognitiveProfile.verbalCommunication = faker.number.int({ min: 1, max: 4 })
    candidate.cognitiveProfile.socialIntelligence = faker.number.int({ min: 1, max: 4 })

    candidate.interviewPerformance.responsePatterns.answerStructure = 'concise' // Too brief
    candidate.interviewPerformance.potentialRedFlags.push(
      'Gives very brief, unclear answers',
      'Struggles to articulate complex thoughts',
      'Poor at explaining technical concepts'
    )

    return candidate
  }

  private applyToxicPersonality(candidate: Candidate): Candidate {
    candidate.personality.agreeableness = faker.number.int({ min: 10, max: 30 })
    candidate.personality.neuroticism = faker.number.int({ min: 70, max: 90 })

    candidate.workBehavior.conflictResolutionStyle = 'competing'
    candidate.workBehavior.teamPlayerType = 'contributor' // Poor team player

    candidate.interviewPerformance.potentialRedFlags.push(
      'Speaks negatively about previous coworkers',
      'Shows inability to work in teams',
      'Defensive when questioned'
    )

    return candidate
  }

  private applyJobHopper(candidate: Candidate): Candidate {
    // Create many short-term positions
    const shortTermPositions = Array.from({ length: faker.number.int({ min: 3, max: 6 }) }, (_, i) => ({
      title: faker.person.jobTitle(),
      company: faker.company.name(),
      industry: faker.helpers.arrayElement(['Technology', 'Finance', 'Healthcare']),
      location: `${faker.location.city()}, ${faker.location.state({ abbreviated: true })}`,
      startDate: faker.date.past({ years: 1 + i * 0.5 }).toISOString().split('T')[0],
      endDate: faker.date.recent({ years: 1 - i * 0.15 }).toISOString().split('T')[0],
      description: 'Brief contract role',
      keyAchievements: ['Completed assigned tasks'],
      teamSize: undefined,
      technologiesUsed: ['JavaScript', 'React']
    }))

    candidate.experience.previousPositions = shortTermPositions
    candidate.experience.currentPosition.endDate = faker.date.recent({ months: 3 }).toISOString().split('T')[0]
    candidate.experience.currentPosition.isCurrentRole = false

    candidate.interviewPerformance.potentialRedFlags.push(
      'History of frequent job changes',
      'No clear career progression',
      'Short tenure at multiple positions'
    )

    return candidate
  }

  private applySkillGaps(candidate: Candidate): Candidate {
    // Remove essential skills
    candidate.technicalSkills.programmingLanguages = candidate.technicalSkills.programmingLanguages.slice(0, 1)
    candidate.technicalSkills.frameworksAndTools = []

    // Low system design scores
    candidate.technicalSkills.systemDesign = {
      microservices: faker.number.int({ min: 1, max: 3 }),
      monolithic: faker.number.int({ min: 2, max: 4 }),
      cloudNative: faker.number.int({ min: 1, max: 2 }),
      database: faker.number.int({ min: 2, max: 4 }),
      security: faker.number.int({ min: 1, max: 3 })
    }

    candidate.interviewPerformance.potentialRedFlags.push(
      'Missing critical skills for the position',
      'Limited technical knowledge depth',
      'Struggles with system design questions'
    )

    return candidate
  }

  private applyCulturalMisfit(candidate: Candidate): Candidate {
    candidate.personality.openness = faker.number.int({ min: 20, max: 40 }) // Resistant to change
    candidate.personality.agreeableness = faker.number.int({ min: 25, max: 45 }) // Poor team fit

    candidate.workBehavior.decisionMakingStyle = 'decisive' // Doesn't collaborate
    candidate.workBehavior.conflictResolutionStyle = 'avoiding' // Avoids difficult conversations

    candidate.interviewPerformance.potentialRedFlags.push(
      'Appears resistant to new ideas',
      'Prefers working alone',
      'Struggles with collaborative environments'
    )

    return candidate
  }

  private applyLazyWorker(candidate: Candidate): Candidate {
    candidate.personality.conscientiousness = faker.number.int({ min: 10, max: 30 })
    candidate.workBehavior.workStyle = 'rapid' // Rushes through work

    // Low methodology scores
    candidate.technicalSkills.methodologies = {
      agile: faker.number.int({ min: 1, max: 3 }),
      waterfall: faker.number.int({ min: 2, max: 4 }),
      devops: faker.number.int({ min: 1, max: 3 }),
      testing: faker.number.int({ min: 1, max: 2 }),
      documentation: faker.number.int({ min: 1, max: 2 })
    }

    // Minimal achievements
    candidate.experience.currentPosition.keyAchievements = ['Completed assigned tasks']

    candidate.interviewPerformance.potentialRedFlags.push(
      'Shows limited initiative',
      'Minimal attention to detail',
      'Focuses on minimum requirements'
    )

    return candidate
  }

  private applyArrogantAttitude(candidate: Candidate): Candidate {
    candidate.personality.extraversion = faker.number.int({ min: 80, max: 95 })
    candidate.personality.agreeableness = faker.number.int({ min: 20, max: 40 })

    candidate.workBehavior.communicationStyle = 'direct'
    candidate.workBehavior.conflictResolutionStyle = 'competing'

    candidate.interviewPerformance.responsePatterns.enthusiasmLevel = faker.number.int({ min: 8, max: 10 })
    candidate.interviewPerformance.potentialRedFlags.push(
      'Appears overconfident in abilities',
      'Dismissive of others\' contributions',
      'Difficulty accepting constructive feedback'
    )

    return candidate
  }

  private applyUnreliability(candidate: Candidate): Candidate {
    candidate.personality.conscientiousness = faker.number.int({ min: 15, max: 35 })
    candidate.personality.neuroticism = faker.number.int({ min: 60, max: 80 })

    // Create gap in employment history
    if (candidate.experience.previousPositions.length > 1) {
      const gap = faker.number.int({ min: 6, max: 18 }) // months
      const gapStart = new Date(candidate.experience.previousPositions[1].endDate)
      gapStart.setMonth(gapStart.getMonth() - gap)

      candidate.experience.previousPositions.push({
        title: 'Gap in Employment',
        company: 'Unemployed',
        industry: 'Personal',
        location: candidate.personalInfo.location.city,
        startDate: gapStart.toISOString().split('T')[0],
        endDate: candidate.experience.previousPositions[1].endDate,
        description: 'Period of unemployment',
        keyAchievements: [],
        technologiesUsed: []
      })
    }

    candidate.interviewPerformance.potentialRedFlags.push(
      'Unexplained gaps in employment',
      'History of leaving positions without notice',
      'Inconsistent work history'
    )

    return candidate
  }

  private applyFeedbackResistance(candidate: Candidate): Candidate {
    candidate.personality.neuroticism = faker.number.int({ min: 70, max: 90 })
    candidate.personality.agreeableness = faker.number.int({ min: 20, max: 40 })

    candidate.interviewPerformance.potentialRedFlags.push(
      'Becomes defensive when questioned',
      'Unable to acknowledge areas for improvement',
      'Blames others for past failures'
    )

    return candidate
  }

  private applyPoorProblemSolving(candidate: Candidate): Candidate {
    candidate.cognitiveProfile.logicalReasoning = faker.number.int({ min: 1, max: 4 })
    candidate.cognitiveProfile.abstractReasoning = faker.number.int({ min: 1, max: 4 })
    candidate.cognitiveProfile.creativeThinking = faker.number.int({ min: 1, max: 4 })

    candidate.interviewPerformance.simulatedInterviewScores.technical.troubleshooting = faker.number.int({ min: 1, max: 3 })

    candidate.interviewPerformance.potentialRedFlags.push(
      'Struggles with analytical problems',
      'Unable to break down complex issues',
      'Gives up easily on challenging problems'
    )

    return candidate
  }

  private applyAttentionIssues(candidate: Candidate): Candidate {
    candidate.cognitiveProfile.logicalReasoning = faker.number.int({ min: 2, max: 4 })
    candidate.personality.conscientiousness = faker.number.int({ min: 20, max: 40 })

    candidate.technicalSkills.methodologies.testing = faker.number.int({ min: 1, max: 3 })
    candidate.technicalSkills.methodologies.documentation = faker.number.int({ min: 1, max: 2 })

    candidate.interviewPerformance.potentialRedFlags.push(
      'Makes careless errors in responses',
      'Misses important details in questions',
      'Poor attention to detail in work samples'
    )

    return candidate
  }

  // Helper methods

  private selectProblematicArchetype(): keyof typeof problematicPersonalityArchetypes {
    return faker.helpers.arrayElement(Object.keys(problematicPersonalityArchetypes) as Array<keyof typeof problematicPersonalityArchetypes>)
  }

  private personalityArchetypeToTraits(archetype: keyof typeof problematicPersonalityArchetypes): PersonalityTraits {
    return problematicPersonalityArchetypes[archetype].traits
  }

  private generateProblematicWorkBehavior(archetype: keyof typeof problematicPersonalityArchetypes): WorkBehaviorPatterns {
    const behaviors = {
      arrogant: {
        communicationStyle: 'direct' as const,
        conflictResolutionStyle: 'competing' as const,
        teamPlayerType: 'leader' as const, // But negative kind
        workStyle: 'rapid' as const,
        decisionMakingStyle: 'decisive' as const
      },
      lazy: {
        communicationStyle: 'diplomatic' as const,
        conflictResolutionStyle: 'avoiding' as const,
        teamPlayerType: 'contributor' as const,
        workStyle: 'rapid' as const,
        decisionMakingStyle: 'intuitive' as const
      },
      toxic: {
        communicationStyle: 'direct' as const,
        conflictResolutionStyle: 'competing' as const,
        teamPlayerType: 'specialist' as const,
        workStyle: 'iterative' as const,
        decisionMakingStyle: 'decisive' as const
      },
      job_hopper: {
        communicationStyle: 'diplomatic' as const,
        conflictResolutionStyle: 'avoiding' as const,
        teamPlayerType: 'contributor' as const,
        workStyle: 'rapid' as const,
        decisionMakingStyle: 'intuitive' as const
      },
      inexperienced: {
        communicationStyle: 'diplomatic' as const,
        conflictResolutionStyle: 'accommodating' as const,
        teamPlayerType: 'contributor' as const,
        workStyle: 'methodical' as const,
        decisionMakingStyle: 'collaborative' as const
      }
    }

    return behaviors[archetype]
  }
}

/**
 * Convenience function to generate bad candidates
 */
export function generateBadCandidate(
  params: CandidateGenerationParams,
  flaws: CandidateFlawType[] = []
): Candidate {
  const generator = new BadCandidateGenerator()
  return generator.generateBadCandidate(params, flaws)
}

/**
 * Generate multiple bad candidates with varied flaws
 */
export function generateMultipleBadCandidates(
  params: CandidateGenerationParams
): Candidate[] {
  const { count = 1 } = params
  const generator = new BadCandidateGenerator()

  const flawsList: CandidateFlawType[] = [
    'skill_exaggeration', 'poor_communication', 'toxic_personality',
    'job_hopper', 'skill_gaps', 'cultural_misfit', 'lazy_worker',
    'arrogant_attitude', 'unreliable', 'resistant_to_feedback',
    'poor_problem_solving', 'attention_issues'
  ]

  return Array.from({ length: count }, (_, index) => {
    const numFlaws = params.qualityLevel === 'terrible' ? 3 :
                    params.qualityLevel === 'poor' ? 2 : 1

    const selectedFlaws = faker.helpers.arrayElements(flawsList, { count: numFlaws })

    return generator.generateBadCandidate({
      ...params,
      customRequirements: [
        ...(params.customRequirements || []),
        `bad-candidate-${index + 1}`
      ]
    }, selectedFlaws)
  })
}

/**
 * Generate mixed-quality candidates (good and bad) for realistic testing
 */
export function generateMixedQualityCandidates(
  params: CandidateGenerationParams
): Candidate[] {
  const { count = 1 } = params
  const generator = new BadCandidateGenerator()

  // 60% good, 30% average, 10% bad for realistic distribution
  const goodCount = Math.floor(count * 0.6)
  const averageCount = Math.floor(count * 0.3)
  const badCount = count - goodCount - averageCount

  const candidates: Candidate[] = []

  // Generate good candidates
  for (let i = 0; i < goodCount; i++) {
    candidates.push(generateCandidate({
      ...params,
      customRequirements: [...(params.customRequirements || []), `good-${i + 1}`]
    }))
  }

  // Generate average candidates
  for (let i = 0; i < averageCount; i++) {
    candidates.push(generator.generateBadCandidate({
      ...params,
      qualityLevel: 'average',
      customRequirements: [...(params.customRequirements || []), `average-${i + 1}`]
    }, ['attention_issues']))
  }

  // Generate bad candidates
  for (let i = 0; i < badCount; i++) {
    candidates.push(generateBadCandidate({
      ...params,
      qualityLevel: 'poor',
      customRequirements: [...(params.customRequirements || []), `bad-${i + 1}`]
    }, ['skill_exaggeration', 'poor_communication']))
  }

  return candidates.sort(() => Math.random() - 0.5) // Shuffle for realistic mix
}