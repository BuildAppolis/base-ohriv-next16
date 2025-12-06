/**
 * Candidate KSA Evaluation System
 *
 * Advanced evaluation engine that integrates candidate profiles with KSA frameworks
 * to provide comprehensive scoring and compatibility assessment.
 */

import { SimpleCandidate } from '@/lib/candidate-generator'
import { KSAInterviewOutput, KSAJobFit, KSACoreValuesCompanyFit } from '@/types/company_old/ksa'
import { CandidateEvaluation } from '@/types/candidate'

/**
 * Evaluation configuration options
 */
export interface KSAEvaluationConfig {
  /** Weight distribution for different evaluation aspects */
  weights: {
    /** Technical skills and knowledge assessment */
    technical: number // 0-1

    /** Behavioral and soft skills assessment */
    behavioral: number // 0-1

    /** Cultural fit and personality alignment */
    cultural: number // 0-1

    /** Experience and background relevance */
    experience: number // 0-1

    /** Growth potential and adaptability */
    growth: number // 0-1
  }

  /** Minimum score thresholds for different recommendations */
  thresholds: {
    strongRecommend: number // 0-10
    recommend: number // 0-10
    consider: number // 0-10
    reject: number // 0-10
  }

  /** Enable detailed reasoning and explanations */
  enableDetailedAnalysis: boolean
}

/**
 * Default evaluation configuration
 */
export const defaultKSAEvaluationConfig: KSAEvaluationConfig = {
  weights: {
    technical: 0.35,
    behavioral: 0.25,
    cultural: 0.20,
    experience: 0.15,
    growth: 0.05
  },
  thresholds: {
    strongRecommend: 8.0,
    recommend: 7.0,
    consider: 6.0,
    reject: 4.0
  },
  enableDetailedAnalysis: true
}

/**
 * KSA Category Evaluator
 * Evaluates candidate performance in specific KSA categories
 */
export class KSACategoryEvaluator {
  private config: KSAEvaluationConfig

  constructor(config: KSAEvaluationConfig = defaultKSAEvaluationConfig) {
    this.config = config
  }

  /**
   * Evaluate candidate's Knowledge category
   */
  evaluateKnowledge(candidate: Candidate, ksaFramework: KSAJobFit['Knowledge']): {
    score: number
    confidence: number
    breakdown: Record<string, number>
    analysis: string
  } {
    const breakdown: Record<string, number> = {}

    // Evaluate understanding of software development principles
    breakdown.sdlcKnowledge = this.evaluateSDLCKnowledge(candidate)

    // Evaluate awareness of industry trends
    breakdown.industryTrendAwareness = this.evaluateIndustryTrendAwareness(candidate)

    // Evaluate ability to connect business needs with solutions
    breakdown.businessAcumen = this.evaluateBusinessAcumen(candidate)

    // Evaluate theoretical knowledge vs practical application
    breakdown.theoreticalKnowledge = this.evaluateTheoreticalKnowledge(candidate)

    // Evaluate domain expertise
    breakdown.domainExpertise = this.evaluateDomainExpertise(candidate)

    // Calculate overall knowledge score
    const weights = {
      sdlcKnowledge: 0.25,
      industryTrendAwareness: 0.20,
      businessAcumen: 0.20,
      theoreticalKnowledge: 0.20,
      domainExpertise: 0.15
    }

    const score = Object.entries(breakdown).reduce(
      (sum, [key, value]) => sum + (value * weights[key as keyof typeof weights]),
      0
    )

    // Calculate confidence based on experience level and data completeness
    const confidence = this.calculateKnowledgeConfidence(candidate)

    const analysis = this.generateKnowledgeAnalysis(candidate, breakdown, score)

    return {
      score: Math.round(score * 10) / 10,
      confidence,
      breakdown,
      analysis
    }
  }

  /**
   * Evaluate candidate's Skills category
   */
  evaluateSkills(candidate: Candidate, ksaFramework: KSAJobFit['Skills']): {
    score: number
    confidence: number
    breakdown: Record<string, number>
    analysis: string
  } {
    const breakdown: Record<string, number> = {}

    // Evaluate programming proficiency
    breakdown.programmingProficiency = this.evaluateProgrammingProficiency(candidate)

    // Evaluate collaboration tool usage
    breakdown.collaborationTools = this.evaluateCollaborationTools(candidate)

    // Evaluate technical problem-solving
    breakdown.technicalProblemSolving = this.evaluateTechnicalProblemSolving(candidate)

    // Evaluate system design capabilities
    breakdown.systemDesign = this.evaluateSystemDesign(candidate)

    // Evaluate debugging and troubleshooting
    breakdown.troubleshooting = this.evaluateTroubleshooting(candidate)

    // Calculate weighted score
    const weights = {
      programmingProficiency: 0.35,
      collaborationTools: 0.15,
      technicalProblemSolving: 0.25,
      systemDesign: 0.15,
      troubleshooting: 0.10
    }

    const score = Object.entries(breakdown).reduce(
      (sum, [key, value]) => sum + (value * weights[key as keyof typeof weights]),
      0
    )

    const confidence = this.calculateSkillsConfidence(candidate)

    const analysis = this.generateSkillsAnalysis(candidate, breakdown, score)

    return {
      score: Math.round(score * 10) / 10,
      confidence,
      breakdown,
      analysis
    }
  }

  /**
   * Evaluate candidate's Ability category
   */
  evaluateAbility(candidate: Candidate, ksaFramework: KSAJobFit['Ability']): {
    score: number
    confidence: number
    breakdown: Record<string, number>
    analysis: string
  } {
    const breakdown: Record<string, number> = {}

    // Evaluate leadership capabilities
    breakdown.leadership = this.evaluateLeadership(candidate)

    // Evaluate project management abilities
    breakdown.projectManagement = this.evaluateProjectManagement(candidate)

    // Evaluate initiative and accountability
    breakdown.initiative = this.evaluateInitiative(candidate)

    // Evaluate results delivery
    breakdown.resultsOrientation = this.evaluateResultsOrientation(candidate)

    // Evaluate process improvement capabilities
    breakdown.processImprovement = this.evaluateProcessImprovement(candidate)

    // Calculate weighted score
    const weights = {
      leadership: 0.30,
      projectManagement: 0.25,
      initiative: 0.20,
      resultsOrientation: 0.15,
      processImprovement: 0.10
    }

    const score = Object.entries(breakdown).reduce(
      (sum, [key, value]) => sum + (value * weights[key as keyof typeof weights]),
      0
    )

    const confidence = this.calculateAbilityConfidence(candidate)

    const analysis = this.generateAbilityAnalysis(candidate, breakdown, score)

    return {
      score: Math.round(score * 10) / 10,
      confidence,
      breakdown,
      analysis
    }
  }

  /**
   * Evaluate company fit based on core values
   */
  evaluateCompanyFit(candidate: Candidate, companyFit: KSACoreValuesCompanyFit): {
    score: number
    confidence: number
    breakdown: Record<string, number>
    analysis: string
  } {
    const breakdown: Record<string, number> = {}

    // Evaluate alignment with each company value
    Object.entries(companyFit).forEach(([value, category]) => {
      breakdown[value] = this.evaluateCompanyValueAlignment(candidate, value)
    })

    // Calculate average score across all values
    const score = Object.values(breakdown).reduce((sum, value) => sum + value, 0) / Object.keys(breakdown).length

    const confidence = this.calculateCompanyFitConfidence(candidate)

    const analysis = this.generateCompanyFitAnalysis(candidate, breakdown)

    return {
      score: Math.round(score * 10) / 10,
      confidence,
      breakdown,
      analysis
    }
  }

  // Private evaluation methods

  private evaluateSDLCKnowledge(candidate: Candidate): number {
    const baseScore = 5.0

    // Boost based on experience with different methodologies
    const methodologyBonus = (candidate.technicalSkills.methodologies.agile +
                             candidate.technicalSkills.methodologies.waterfall) / 20

    // Adjust based on years of experience
    const experienceBonus = Math.min(
      candidate.technicalSkills.programmingLanguages.reduce(
        (sum, lang) => sum + lang.yearsExperience, 0
      ) / 20,
      2.0
    )

    return Math.min(10, baseScore + methodologyBonus + experienceBonus)
  }

  private evaluateIndustryTrendAwareness(candidate: Candidate): number {
    const baseScore = candidate.personality.openness / 10

    // Boost for candidates with recent learning/certifications
    const learningBonus = candidate.experience.certificationsAndTraining.length > 0 ? 1.0 : 0

    // Adjust based on technical diversity
    const diversityBonus = Math.min(
      (candidate.technicalSkills.programmingLanguages.length +
       candidate.technicalSkills.frameworksAndTools.length) / 10,
      2.0
    )

    return Math.min(10, baseScore + learningBonus + diversityBonus)
  }

  private evaluateBusinessAcumen(candidate: Candidate): number {
    const baseScore = 5.0

    // Personality influence
    const personalityInfluence = (candidate.personality.conscientiousness +
                                candidate.personality.agreeableness) / 25

    // Experience in different industries
    const industryBonus = new Set([
      candidate.experience.currentPosition.industry,
      ...candidate.experience.previousPositions.map(p => p.industry)
    ]).size > 1 ? 1.0 : 0

    return Math.min(10, baseScore + personalityInfluence + industryBonus)
  }

  private evaluateTheoreticalKnowledge(candidate: Candidate): number {
    const baseScore = candidate.cognitiveProfile.logicalReasoning +
                     candidate.cognitiveProfile.abstractReasoning

    // Education level bonus
    const educationBonus = candidate.experience.education.some(e =>
      e.degree.includes('Master') || e.degree.includes('PhD')
    ) ? 1.0 : 0

    return Math.min(10, baseScore / 2 + educationBonus)
  }

  private evaluateDomainExpertise(candidate: Candidate): number {
    // Calculate expertise based on years of experience in specific technologies
    const totalYears = candidate.technicalSkills.programmingLanguages.reduce(
      (sum, lang) => sum + lang.yearsExperience, 0
    )

    const averageProficiency = candidate.technicalSkills.programmingLanguages.reduce(
      (sum, lang) => {
        const proficiencyScores = { beginner: 3, intermediate: 5, advanced: 8, expert: 10 }
        return sum + proficiencyScores[lang.proficiency]
      }, 0
    ) / candidate.technicalSkills.programmingLanguages.length

    return Math.min(10, (totalYears / 5) + (averageProficiency / 10))
  }

  private evaluateProgrammingProficiency(candidate: Candidate): number {
    const languages = candidate.technicalSkills.programmingLanguages

    if (languages.length === 0) return 2.0

    const proficiencyScores = { beginner: 3, intermediate: 5, advanced: 8, expert: 10 }

    const weightedScore = languages.reduce((sum, lang) => {
      const proficiencyScore = proficiencyScores[lang.proficiency]
      const yearsWeight = Math.min(lang.yearsExperience / 5, 1.0)
      return sum + (proficiencyScore * yearsWeight)
    }, 0)

    return Math.min(10, weightedScore / languages.length + 1)
  }

  private evaluateCollaborationTools(candidate: Candidate): number {
    const baseScore = 6.0

    // Personality influence on collaboration
    const collaborationPersonality = (candidate.personality.agreeableness +
                                     candidate.personality.extraversion) / 20

    // Work behavior influence
    const behaviorBonus = candidate.workBehavior.teamPlayerType === 'collaborator' ? 1.5 :
                         candidate.workBehavior.teamPlayerType === 'leader' ? 1.0 :
                         candidate.workBehavior.communicationStyle === 'collaborative' ? 1.0 : 0

    return Math.min(10, baseScore + collaborationPersonality + behaviorBonus)
  }

  private evaluateTechnicalProblemSolving(candidate: Candidate): number {
    return (candidate.cognitiveProfile.logicalReasoning +
            candidate.cognitiveProfile.creativeThinking +
            candidate.interviewPerformance.simulatedInterviewScores.technical.troubleshooting) / 3
  }

  private evaluateSystemDesign(candidate: Candidate): number {
    const designScores = Object.values(candidate.technicalSkills.systemDesign)
    return designScores.reduce((sum, score) => sum + score, 0) / designScores.length
  }

  private evaluateTroubleshooting(candidate: Candidate): number {
    return candidate.interviewPerformance.simulatedInterviewScores.technical.troubleshooting
  }

  private evaluateLeadership(candidate: Candidate): number {
    const personalityLeadership = (candidate.personality.extraversion +
                                 candidate.personality.conscientiousness) / 20

    const experienceLeadership = candidate.experience.currentPosition.directReports ?
      Math.min(candidate.experience.currentPosition.directReports / 5, 3) : 0

    const interviewLeadership = candidate.interviewPerformance.simulatedInterviewScores.behavioral.leadership

    return Math.min(10, personalityLeadership + experienceLeadership + (interviewLeadership / 2))
  }

  private evaluateProjectManagement(candidate: Candidate): number {
    return (candidate.technicalSkills.methodologies.agile +
            candidate.technicalSkills.methodologies.testing +
            candidate.technicalSkills.methodologies.documentation) / 3
  }

  private evaluateInitiative(candidate: Candidate): number {
    const initiativePersonality = (candidate.personality.openness +
                                 candidate.personality.conscientiousness) / 20

    const experienceInitiative = candidate.experience.currentPosition.keyAchievements.length > 2 ? 1.5 : 0

    return Math.min(10, initiativePersonality + experienceInitiative + 4)
  }

  private evaluateResultsOrientation(candidate: Candidate): number {
    return candidate.interviewPerformance.simulatedInterviewScores.behavioral.problemSolving
  }

  private evaluateProcessImprovement(candidate: Candidate): number {
    const improvementPersonality = candidate.personality.openness / 10
    const analyticalBonus = candidate.cognitiveProfile.logicalReasoning / 10

    return Math.min(10, improvementPersonality + analyticalBonus + 2)
  }

  private evaluateCompanyValueAlignment(candidate: Candidate, value: string): number {
    const personalityMappings: Record<string, keyof typeof candidate.personality> = {
      'Innovation': 'openness',
      'Excellence': 'conscientiousness',
      'Collaboration': 'agreeableness',
      'Growth': 'openness',
      'Leadership': 'extraversion',
      'Quality': 'conscientiousness'
    }

    const relevantTrait = personalityMappings[value] || 'openness'
    const baseScore = candidate.personality[relevantTrait] / 10

    // Adjust based on work behavior patterns
    const behaviorBonus = this.getBehaviorAlignment(candidate, value)

    return Math.min(10, baseScore + behaviorBonus)
  }

  private getBehaviorAlignment(candidate: Candidate, value: string): number {
    const alignments: Record<string, number> = {
      'Innovation': candidate.workBehavior.decisionMakingStyle === 'innovative' ? 1.5 : 0,
      'Collaboration': candidate.workBehavior.teamPlayerType === 'collaborator' ? 1.5 : 0,
      'Leadership': candidate.workBehavior.teamPlayerType === 'leader' ? 1.5 : 0,
      'Excellence': candidate.workBehavior.workStyle === 'comprehensive' ? 1.0 : 0,
      'Growth': candidate.personality.openness > 70 ? 1.0 : 0
    }

    return alignments[value] || 0
  }

  // Confidence calculation methods

  private calculateKnowledgeConfidence(candidate: Candidate): number {
    const experienceFactor = Math.min(
      candidate.technicalSkills.programmingLanguages.reduce(
        (sum, lang) => sum + lang.yearsExperience, 0
      ) / 20,
      1.0
    )

    const educationFactor = candidate.experience.education.length > 0 ? 0.2 : 0

    return Math.min(1.0, experienceFactor + educationFactor + 0.3)
  }

  private calculateSkillsConfidence(candidate: Candidate): number {
    const skillDiversity = (candidate.technicalSkills.programmingLanguages.length +
                          candidate.technicalSkills.frameworksAndTools.length) / 20

    const proficiencyLevel = candidate.technicalSkills.programmingLanguages.reduce(
      (sum, lang) => {
        const scores = { beginner: 0.3, intermediate: 0.5, advanced: 0.8, expert: 1.0 }
        return sum + scores[lang.proficiency]
      }, 0
    ) / candidate.technicalSkills.programmingLanguages.length

    return Math.min(1.0, skillDiversity + proficiencyLevel + 0.2)
  }

  private calculateAbilityConfidence(candidate: Candidate): number {
    const leadershipExperience = candidate.experience.currentPosition.directReports ? 0.3 : 0
    const projectComplexity = candidate.experience.currentPosition.teamSize ?
      Math.min(candidate.experience.currentPosition.teamSize / 20, 0.3) : 0

    return Math.min(1.0, leadershipExperience + projectComplexity + 0.4)
  }

  private calculateCompanyFitConfidence(candidate: Candidate): number {
    const personalityStability = (100 - candidate.personality.neuroticism) / 200
    const workHistoryStability = candidate.experience.previousPositions.length > 0 ? 0.2 : 0

    return Math.min(1.0, personalityStability + workHistoryStability + 0.4)
  }

  // Analysis generation methods

  private generateKnowledgeAnalysis(candidate: Candidate, breakdown: Record<string, number>, score: number): string {
    const insights = []

    if (breakdown.sdlcKnowledge > 7) {
      insights.push('Strong understanding of software development lifecycle and methodologies')
    } else if (breakdown.sdlcKnowledge < 5) {
      insights.push('Limited experience with formal development processes')
    }

    if (breakdown.industryTrendAwareness > 7) {
      insights.push('Well-aware of current industry trends and technologies')
    } else if (breakdown.industryTrendAwareness < 5) {
      insights.push('May need guidance on emerging technologies and practices')
    }

    if (breakdown.businessAcumen > 7) {
      insights.push('Good ability to connect technical solutions with business needs')
    } else if (breakdown.businessAcumen < 5) {
      insights.push('Limited business acumen, may struggle with stakeholder communication')
    }

    return insights.join('. ') || `Overall knowledge assessment score: ${score}/10`
  }

  private generateSkillsAnalysis(candidate: Candidate, breakdown: Record<string, number>, score: number): string {
    const insights = []

    if (breakdown.programmingProficiency > 8) {
      insights.push('Exceptional programming skills with strong proficiency')
    } else if (breakdown.programmingProficiency < 5) {
      insights.push('Programming skills may need development for this role')
    }

    if (breakdown.collaborationTools > 7) {
      insights.push('Excellent collaboration and teamwork capabilities')
    } else if (breakdown.collaborationTools < 5) {
      insights.push('May need support in team collaboration processes')
    }

    if (breakdown.technicalProblemSolving > 7) {
      insights.push('Strong technical problem-solving abilities')
    } else if (breakdown.technicalProblemSolving < 5) {
      insights.push('Technical problem-solving skills require improvement')
    }

    return insights.join('. ') || `Overall skills assessment score: ${score}/10`
  }

  private generateAbilityAnalysis(candidate: Candidate, breakdown: Record<string, number>, score: number): string {
    const insights = []

    if (breakdown.leadership > 7) {
      insights.push('Demonstrates strong leadership potential and capabilities')
    } else if (breakdown.leadership < 5) {
      insights.push('Leadership abilities may need development')
    }

    if (breakdown.projectManagement > 7) {
      insights.push('Good project management and organizational skills')
    } else if (breakdown.projectManagement < 5) {
      insights.push('Project management experience is limited')
    }

    if (breakdown.initiative > 7) {
      insights.push('Shows strong initiative and self-motivation')
    } else if (breakdown.initiative < 5) {
      insights.push('May need encouragement to take initiative')
    }

    return insights.join('. ') || `Overall ability assessment score: ${score}/10`
  }

  private generateCompanyFitAnalysis(candidate: Candidate, breakdown: Record<string, number>): string {
    const insights = []
    const averageScore = Object.values(breakdown).reduce((sum, val) => sum + val, 0) / Object.keys(breakdown).length

    if (averageScore > 7) {
      insights.push('Excellent alignment with company values and culture')
    } else if (averageScore < 5) {
      insights.push('Potential cultural fit concerns that should be explored')
    }

    const highAlignmentValues = Object.entries(breakdown)
      .filter(([_, score]) => score > 7)
      .map(([value, _]) => value)

    if (highAlignmentValues.length > 0) {
      insights.push(`Strong alignment with: ${highAlignmentValues.join(', ')}`)
    }

    return insights.join('. ') || `Company fit assessment completed`
  }
}

/**
 * Simplified KSA Evaluation Function
 */
export async function evaluateCandidateKSA(
  candidate: SimpleCandidate,
  ksaFramework: KSAInterviewOutput,
  config: KSAEvaluationConfig = defaultKSAEvaluationConfig,
  jobContext?: string
): Promise<CandidateEvaluation> {
  // Generate random but realistic scores based on candidate age and ID
  const candidateNumber = parseInt(candidate.id.split('-')[1])
  const baseScore = 5 + (candidateNumber % 3) // Varies between 5-7
  const ageFactor = candidate.age >= 25 && candidate.age <= 45 ? 1 : 0.9 // Age 25-45 gets slight boost

  // Generate evaluation scores
  const knowledgeScore = Math.min(10, Math.round((baseScore + Math.random() * 2) * ageFactor * 10) / 10)
  const skillsScore = Math.min(10, Math.round((baseScore + Math.random() * 1.5) * ageFactor * 10) / 10)
  const abilityScore = Math.min(10, Math.round((baseScore + Math.random() * 1.8) * ageFactor * 10) / 10)

  // Calculate overall score using weights
  const weights = config.weights
  const overallCompatibility = Math.round(
    (knowledgeScore * 0.3 + skillsScore * 0.3 + abilityScore * 0.4) * 10
  ) / 10

  // Generate recommendation
  const recommendation = overallCompatibility >= 8 ? 'Strong Recommend' :
                        overallCompatibility >= 6 ? 'Recommend' :
                        overallCompatibility >= 4 ? 'Consider' : 'Reject'

  // Generate basic strengths
  const strengths = [
    overallCompatibility >= 6 ? 'Good overall compatibility with role requirements' : null,
    skillsScore >= 7 ? 'Strong technical skills and capabilities' : null,
    knowledgeScore >= 7 ? 'Solid domain knowledge and understanding' : null,
    abilityScore >= 7 ? 'Good problem-solving and leadership abilities' : null
  ].filter(Boolean) as string[]

  // Generate basic concerns
  const concerns = [
    knowledgeScore < 5 ? 'May need additional knowledge development' : null,
    skillsScore < 5 ? 'Technical skills may require improvement' : null,
    abilityScore < 5 ? 'Could benefit from mentorship in critical areas' : null,
    candidate.age < 25 ? 'Limited professional experience' : null,
    candidate.age > 45 ? 'May struggle with newer technologies' : null
  ].filter(Boolean) as string[]

  // Generate interview focus areas
  const interviewFocus = [
    'Problem-solving approach and methodology',
    'Team collaboration and communication style',
    'Adaptability to changing requirements',
    'Technical decision-making process'
  ]

  // Predict interview performance based on scores
  const predictedPerformance = {
    behavioral: Math.round((abilityScore + knowledgeScore) / 2 * 10) / 10,
    technical: Math.round((skillsScore + knowledgeScore) / 2 * 10) / 10,
    cultural: Math.round((abilityScore + skillsScore) / 2 * 10) / 10,
    overall: overallCompatibility
  }

  return {
    candidateId: candidate.id,
    evaluationContext: {
      jobTitle: jobContext || 'Unknown Position',
      ksaFramework,
      evaluationDate: new Date().toISOString(),
      evaluator: 'KSA Evaluation System'
    },
    scores: {
      knowledge: {
        overall: knowledgeScore,
        breakdown: {
          theoreticalKnowledge: knowledgeScore * 0.9,
          practicalApplication: knowledgeScore * 0.8,
          industryAwareness: knowledgeScore * 0.85
        },
        confidence: 0.8,
        notes: `Knowledge assessment completed with score ${knowledgeScore}/10`
      },
      skills: {
        overall: skillsScore,
        breakdown: {
          technicalSkills: skillsScore * 0.9,
          problemSolving: skillsScore * 0.85,
          collaboration: skillsScore * 0.8
        },
        confidence: 0.8,
        notes: `Skills assessment completed with score ${skillsScore}/10`
      },
      abilities: {
        overall: abilityScore,
        breakdown: {
          leadership: abilityScore * 0.8,
          communication: abilityScore * 0.9,
          adaptability: abilityScore * 0.85
        },
        confidence: 0.8,
        notes: `Ability assessment completed with score ${abilityScore}/10`
      }
    },
    overallCompatibility: {
      score: overallCompatibility,
      recommendation,
      strengths,
      concerns,
      interviewFocus
    },
    predictedPerformance
  }
}

/**
 * Generate recommendation based on overall score
 */
function generateRecommendation(
  score: number,
  thresholds: KSAEvaluationConfig['thresholds']
): CandidateEvaluation['overallCompatibility']['recommendation'] {
  if (score >= thresholds.strongRecommend) return 'strong-recommend'
  if (score >= thresholds.recommend) return 'recommend'
  if (score >= thresholds.consider) return 'consider'
  if (score >= thresholds.reject) return 'consider' // Give benefit of doubt
  return 'reject'
}

/**
 * Generate key strengths from evaluation results
 */
function generateStrengths(
  candidate: Candidate,
  scores: { knowledgeScore: any; skillsScore: any; abilityScore: any },
  companyFitScore: any
): string[] {
  const strengths = []

  // High-scoring KSA areas
  if (scores.knowledgeScore.score > 7.5) strengths.push('Exceptional knowledge and expertise')
  if (scores.skillsScore.score > 7.5) strengths.push('Strong technical skills and capabilities')
  if (scores.abilityScore.score > 7.5) strengths.push('Outstanding abilities and leadership potential')

  // Personality-based strengths
  if (candidate.personality.openness > 80) strengths.push('Highly innovative and adaptable')
  if (candidate.personality.conscientiousness > 80) strengths.push('Exceptional attention to detail')
  if (candidate.personality.agreeableness > 80) strengths.push('Excellent team collaboration skills')
  if (candidate.personality.extraversion > 80) strengths.push('Strong leadership and communication')

  // Experience-based strengths
  const totalExperience = candidate.technicalSkills.programmingLanguages.reduce(
    (sum, lang) => sum + lang.yearsExperience, 0
  )
  if (totalExperience > 10) strengths.push('Extensive relevant experience')

  // Company fit strengths
  if (companyFitScore && companyFitScore.score > 7.5) {
    strengths.push('Excellent alignment with company values')
  }

  return strengths.slice(0, 6) // Limit to top 6 strengths
}

/**
 * Generate potential concerns from evaluation results
 */
function generateConcerns(
  candidate: Candidate,
  scores: { knowledgeScore: any; skillsScore: any; abilityScore: any },
  companyFitScore: any
): string[] {
  const concerns = []

  // Low-scoring KSA areas
  if (scores.knowledgeScore.score < 5) concerns.push('Knowledge gaps in key areas')
  if (scores.skillsScore.score < 5) concerns.push('Technical skills may need development')
  if (scores.abilityScore.score < 5) concerns.push('Limited leadership or project management experience')

  // Personality-based concerns
  if (candidate.personality.neuroticism > 70) concerns.push('May struggle with stress management')
  if (candidate.personality.agreeableness < 30) concerns.push('May have difficulty with team collaboration')
  if (candidate.personality.conscientiousness < 30) concerns.push('Attention to detail may be inconsistent')

  // Experience-based concerns
  const totalExperience = candidate.technicalSkills.programmingLanguages.reduce(
    (sum, lang) => sum + lang.yearsExperience, 0
  )
  if (totalExperience < 2) concerns.push('Limited professional experience')

  // Company fit concerns
  if (companyFitScore && companyFitScore.score < 5) {
    concerns.push('Potential cultural fit challenges')
  }

  return concerns.slice(0, 6) // Limit to top 6 concerns
}

/**
 * Generate interview focus areas based on evaluation results
 */
function generateInterviewFocus(
  candidate: Candidate,
  scores: { knowledgeScore: any; skillsScore: any; abilityScore: any },
  concerns: string[]
): string[] {
  const focusAreas = []

  // Focus on weak areas
  if (scores.knowledgeScore.score < 6) focusAreas.push('Deep dive into technical knowledge')
  if (scores.skillsScore.score < 6) focusAreas.push('Practical skills assessment and coding exercises')
  if (scores.abilityScore.score < 6) focusAreas.push('Leadership and project management scenarios')

  // Focus on personality concerns
  if (concerns.some(c => c.includes('collaboration'))) {
    focusAreas.push('Team collaboration and conflict resolution')
  }
  if (concerns.some(c => c.includes('stress'))) {
    focusAreas.push('Stress management and pressure handling')
  }

  // Focus on experience validation
  focusAreas.push('Detailed experience verification and achievement discussion')
  focusAreas.push('Problem-solving approach and methodology')

  // Always include cultural fit assessment
  focusAreas.push('Cultural fit and values alignment')

  return focusAreas.slice(0, 5) // Limit to top 5 focus areas
}