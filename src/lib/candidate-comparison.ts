/**
 * Candidate Comparison System
 *
 * Advanced comparison engine for analyzing multiple candidates side-by-side,
 * providing detailed insights and recommendations for hiring decisions.
 */

import { Candidate } from '@/types/candidate'
import { CandidateComparison, CandidateEvaluation } from '@/types/candidate'
import { nanoid } from 'nanoid'

/**
 * Comparison criteria configuration
 */
export interface ComparisonCriteria {
  /** Technical skills and knowledge weight */
  technicalSkills: number // 0-1

  /** Professional experience weight */
  experience: number // 0-1

  /** Cultural fit and personality alignment */
  culturalFit: number // 0-1

  /** Personality traits and behavioral patterns */
  personality: number // 0-1

  /** Growth potential and learning ability */
  growthPotential: number // 0-1
}

/**
 * Default comparison criteria (balanced approach)
 */
export const defaultComparisonCriteria: ComparisonCriteria = {
  technicalSkills: 0.30,
  experience: 0.25,
  culturalFit: 0.20,
  personality: 0.15,
  growthPotential: 0.10
}

/**
 * Comparison metrics for individual candidates
 */
interface CandidateComparisonMetrics {
  /** Technical proficiency score */
  technicalScore: number

  /** Experience relevance score */
  experienceScore: number

  /** Cultural compatibility score */
  culturalFitScore: number

  /** Personality alignment score */
  personalityScore: number

  /** Growth potential score */
  growthPotentialScore: number

  /** Overall weighted score */
  overallScore: number

  /** Ranking position */
  rank: number

  /** Key strengths for this comparison */
  strengths: string[]

  /** Potential concerns for this comparison */
  concerns: string[]

  /** Specific recommendation */
  recommendation: string
}

/**
 * Candidate Comparison Engine
 */
export class CandidateComparisonEngine {
  private criteria: ComparisonCriteria

  constructor(criteria: ComparisonCriteria = defaultComparisonCriteria) {
    this.criteria = criteria
  }

  /**
   * Compare multiple candidates and return comprehensive analysis
   */
  async compareCandidates(
    candidates: Candidate[],
    jobContext?: string,
    customWeights?: Partial<ComparisonCriteria>
  ): Promise<CandidateComparison> {
    const comparisonCriteria = { ...this.criteria, ...customWeights }

    // Calculate metrics for each candidate
    const candidateMetrics = candidates.map(candidate => ({
      candidate,
      metrics: this.calculateCandidateMetrics(candidate, comparisonCriteria)
    }))

    // Rank candidates based on overall scores
    const rankedCandidates = this.rankCandidates(candidateMetrics)

    // Generate detailed comparison results
    const results = rankedCandidates.map(({ candidate, metrics }) => ({
      candidateId: candidate.id,
      overallScore: metrics.overallScore,
      breakdown: {
        technicalSkills: metrics.technicalScore,
        experience: metrics.experienceScore,
        culturalFit: metrics.culturalFitScore,
        personality: metrics.personalityScore,
        growthPotential: metrics.growthPotentialScore
      },
      strengths: metrics.strengths,
      concerns: metrics.concerns,
      recommendation: metrics.recommendation
    }))

    // Generate comparison insights
    const insights = this.generateComparisonInsights(rankedCandidates, comparisonCriteria)

    return {
      candidateIds: candidates.map(c => c.id),
      comparisonCriteria: comparisonCriteria,
      results: results,
      metadata: {
        comparisonDate: new Date().toISOString(),
        jobContext: jobContext || 'General Comparison',
        comparisonMethod: 'weighted'
      }
    }
  }

  /**
   * Calculate comprehensive metrics for a single candidate
   */
  private calculateCandidateMetrics(
    candidate: Candidate,
    criteria: ComparisonCriteria
  ): CandidateComparisonMetrics {
    // Calculate individual scores
    const technicalScore = this.calculateTechnicalScore(candidate)
    const experienceScore = this.calculateExperienceScore(candidate)
    const culturalFitScore = this.calculateCulturalFitScore(candidate)
    const personalityScore = this.calculatePersonalityScore(candidate)
    const growthPotentialScore = this.calculateGrowthPotentialScore(candidate)

    // Calculate weighted overall score
    const overallScore = Math.round(
      (technicalScore * criteria.technicalSkills +
       experienceScore * criteria.experience +
       culturalFitScore * criteria.culturalFit +
       personalityScore * criteria.personality +
       growthPotentialScore * criteria.growthPotential) * 100
    ) / 100

    // Generate strengths and concerns
    const strengths = this.generateComparisonStrengths(candidate, {
      technicalScore,
      experienceScore,
      culturalFitScore,
      personalityScore,
      growthPotentialScore
    })

    const concerns = this.generateComparisonConcerns(candidate, {
      technicalScore,
      experienceScore,
      culturalFitScore,
      personalityScore,
      growthPotentialScore
    })

    // Generate recommendation
    const recommendation = this.generateRecommendation(overallScore, strengths, concerns)

    return {
      technicalScore,
      experienceScore,
      culturalFitScore,
      personalityScore,
      growthPotentialScore,
      overallScore,
      rank: 0, // Will be set during ranking
      strengths,
      concerns,
      recommendation
    }
  }

  /**
   * Calculate technical skills score
   */
  private calculateTechnicalScore(candidate: Candidate): number {
    const programming = candidate.technicalSkills.programmingLanguages
    const frameworks = candidate.technicalSkills.frameworksAndTools
    const systemDesign = candidate.technicalSkills.systemDesign

    // Calculate programming proficiency score
    const proficiencyScores = { beginner: 0.3, intermediate: 0.5, advanced: 0.8, expert: 1.0 }
    const programmingScore = programming.reduce((sum, lang) => {
      const proficiencyWeight = proficiencyScores[lang.proficiency]
      const yearsWeight = Math.min(lang.yearsExperience / 5, 1.0)
      return sum + (proficiencyWeight * yearsWeight * 10)
    }, 0) / Math.max(programming.length, 1)

    // Calculate framework proficiency
    const frameworksScore = frameworks.reduce((sum, framework) => {
      const proficiencyWeight = proficiencyScores[framework.proficiency]
      const yearsWeight = Math.min(framework.yearsExperience / 3, 1.0)
      return sum + (proficiencyWeight * yearsWeight * 10)
    }, 0) / Math.max(frameworks.length, 1)

    // Calculate system design score
    const systemDesignScore = Object.values(systemDesign).reduce((sum, score) => sum + score, 0) / Object.keys(systemDesign).length

    // Calculate methodologies score
    const methodologiesScore = Object.values(candidate.technicalSkills.methodologies)
      .reduce((sum, score) => sum + score, 0) / Object.keys(candidate.technicalSkills.methodologies).length

    // Weighted average
    return Math.round(
      (programmingScore * 0.35 +
       frameworksScore * 0.25 +
       systemDesignScore * 0.25 +
       methodologiesScore * 0.15) * 10
    ) / 10
  }

  /**
   * Calculate experience relevance score
   */
  private calculateExperienceScore(candidate: Candidate): number {
    const current = candidate.experience.currentPosition
    const previous = candidate.experience.previousPositions

    // Calculate total years of experience
    const totalYears = this.calculateTotalExperience(candidate)

    // Calculate role progression
    const roleProgressionScore = this.calculateRoleProgression(candidate)

    // Calculate industry relevance
    const industryRelevanceScore = this.calculateIndustryRelevance(candidate)

    // Calculate leadership experience
    const leadershipScore = this.calculateLeadershipExperience(candidate)

    // Calculate project complexity
    const projectComplexityScore = this.calculateProjectComplexity(candidate)

    // Weighted average
    return Math.round(
      (Math.min(totalYears / 10, 1.0) * 10 * 0.3 +
       roleProgressionScore * 0.25 +
       industryRelevanceScore * 0.2 +
       leadershipScore * 0.15 +
       projectComplexityScore * 0.1) * 10
    ) / 10
  }

  /**
   * Calculate cultural fit score based on personality and work behavior
   */
  private calculateCulturalFitScore(candidate: Candidate): number {
    const personality = candidate.personality
    const workBehavior = candidate.workBehavior

    // Team collaboration score
    const collaborationScore = (personality.agreeableness + personality.extraversion) / 20

    // Adaptability score
    const adaptabilityScore = personality.openness / 10

    // Reliability score
    const reliabilityScore = personality.conscientiousness / 10

    // Emotional stability score
    const stabilityScore = (100 - personality.neuroticism) / 10

    // Communication style score
    const communicationScore = workBehavior.communicationStyle === 'collaborative' ? 1.5 :
                              workBehavior.communicationStyle === 'diplomatic' ? 1.2 :
                              workBehavior.communicationStyle === 'direct' ? 1.0 : 0.8

    // Work style score
    const workStyleScore = workBehavior.workStyle === 'methodical' ? 1.5 :
                          workBehavior.workStyle === 'comprehensive' ? 1.3 :
                          workBehavior.workStyle === 'iterative' ? 1.1 : 1.0

    // Weighted average
    return Math.round(
      (collaborationScore * 0.25 +
       adaptabilityScore * 0.2 +
       reliabilityScore * 0.2 +
       stabilityScore * 0.15 +
       communicationScore * 0.1 +
       workStyleScore * 0.1) * 10
    ) / 10
  }

  /**
   * Calculate personality alignment score
   */
  private calculatePersonalityScore(candidate: Candidate): number {
    const personality = candidate.personality

    // Ideal personality ranges (adjustable based on role requirements)
    const idealRanges = {
      openness: { min: 60, max: 90 },
      conscientiousness: { min: 70, max: 95 },
      extraversion: { min: 40, max: 80 },
      agreeableness: { min: 50, max: 85 },
      neuroticism: { min: 20, max: 60 }
    }

    // Calculate how well personality matches ideal ranges
    let totalScore = 0
    let traits = 0

    Object.entries(idealRanges).forEach(([trait, range]) => {
      const value = personality[trait as keyof typeof personality]
      if (value >= range.min && value <= range.max) {
        totalScore += 10
      } else {
        // Calculate distance penalty
        const distance = Math.min(
          Math.abs(value - range.min),
          Math.abs(value - range.max)
        )
        totalScore += Math.max(0, 10 - distance / 10)
      }
      traits++
    })

    return Math.round((totalScore / traits) * 10) / 10
  }

  /**
   * Calculate growth potential score
   */
  private calculateGrowthPotentialScore(candidate: Candidate): number {
    const personality = candidate.personality
    const cognitive = candidate.cognitiveProfile

    // Learning aptitude (based on openness and cognitive scores)
    const learningAptitude = (personality.openness + cognitive.abstractReasoning) / 20

    // Problem-solving potential
    const problemSolvingPotential = (cognitive.logicalReasoning + cognitive.creativeThinking) / 20

    // Adaptability score
    const adaptabilityScore = personality.openness / 10

    // Continuous learning evidence
    const continuousLearningScore = candidate.experience.certificationsAndTraining.length > 0 ? 1.5 : 1.0

    // Career progression velocity
    const careerVelocityScore = this.calculateCareerVelocity(candidate)

    // Weighted average
    return Math.round(
      (learningAptitude * 0.3 +
       problemSolvingPotential * 0.25 +
       adaptabilityScore * 0.2 +
       continuousLearningScore * 0.15 +
       careerVelocityScore * 0.1) * 10
    ) / 10
  }

  /**
   * Rank candidates based on their scores
   */
  private rankCandidates(candidateMetrics: Array<{ candidate: Candidate; metrics: CandidateComparisonMetrics }>): Array<{
    candidate: Candidate
    metrics: CandidateComparisonMetrics
  }> {
    // Sort by overall score (descending)
    const sorted = [...candidateMetrics].sort((a, b) => b.metrics.overallScore - a.metrics.overallScore)

    // Assign ranks
    return sorted.map((item, index) => ({
      ...item,
      metrics: {
        ...item.metrics,
        rank: index + 1
      }
    }))
  }

  /**
   * Generate comparison insights and recommendations
   */
  private generateComparisonInsights(
    rankedCandidates: Array<{ candidate: Candidate; metrics: CandidateComparisonMetrics }>,
    criteria: ComparisonCriteria
  ): any {
    const insights = {
      topCandidate: rankedCandidates[0]?.candidate.id || null,
      scoreDistribution: this.analyzeScoreDistribution(rankedCandidates),
      keyDifferentiators: this.identifyKeyDifferentiators(rankedCandidates),
      recommendations: this.generateComparisonRecommendations(rankedCandidates, criteria),
      riskFactors: this.identifyRiskFactors(rankedCandidates)
    }

    return insights
  }

  /**
   * Generate strengths specific to comparison context
   */
  private generateComparisonStrengths(
    candidate: Candidate,
    scores: Record<string, number>
  ): string[] {
    const strengths = []

    // Identify top-scoring areas
    const sortedScores = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)

    sortedScores.forEach(([area, score]) => {
      if (score > 8) {
        switch (area) {
          case 'technicalScore':
            strengths.push('Exceptional technical skills and expertise')
            break
          case 'experienceScore':
            strengths.push('Strong and relevant professional experience')
            break
          case 'culturalFitScore':
            strengths.push('Excellent cultural alignment and team fit')
            break
          case 'personalityScore':
            strengths.push('Ideal personality traits for the role')
            break
          case 'growthPotentialScore':
            strengths.push('High growth potential and learning aptitude')
            break
        }
      }
    })

    // Add specific candidate strengths
    if (candidate.personality.openness > 80) {
      strengths.push('Highly innovative and adaptable')
    }
    if (candidate.personality.conscientiousness > 80) {
      strengths.push('Exceptional attention to detail and reliability')
    }
    if (candidate.interviewPerformance.keyStrengths.length > 0) {
      strengths.push(...candidate.interviewPerformance.keyStrengths.slice(0, 2))
    }

    return strengths.slice(0, 5) // Limit to top 5 strengths
  }

  /**
   * Generate concerns specific to comparison context
   */
  private generateComparisonConcerns(
    candidate: Candidate,
    scores: Record<string, number>
  ): string[] {
    const concerns = []

    // Identify low-scoring areas
    Object.entries(scores).forEach(([area, score]) => {
      if (score < 5) {
        switch (area) {
          case 'technicalScore':
            concerns.push('Technical skills may need development')
            break
          case 'experienceScore':
            concerns.push('Limited relevant experience')
            break
          case 'culturalFitScore':
            concerns.push('Potential cultural fit challenges')
            break
          case 'personalityScore':
            concerns.push('Personality may not align with ideal profile')
            break
          case 'growthPotentialScore':
            concerns.push('Limited growth potential indicators')
            break
        }
      }
    })

    // Add specific candidate concerns
    if (candidate.personality.neuroticism > 70) {
      concerns.push('May struggle with stress management')
    }
    if (candidate.personality.agreeableness < 30) {
      concerns.push('May have difficulty with team collaboration')
    }
    if (candidate.interviewPerformance.potentialRedFlags.length > 0) {
      concerns.push(...candidate.interviewPerformance.potentialRedFlags.slice(0, 2))
    }

    return concerns.slice(0, 5) // Limit to top 5 concerns
  }

  /**
   * Generate recommendation based on overall score
   */
  private generateRecommendation(overallScore: number, strengths: string[], concerns: string[]): string {
    if (overallScore >= 8.5) {
      return 'Exceptional candidate - strong recommend for immediate hire'
    } else if (overallScore >= 7.5) {
      return 'Strong candidate - recommend for next round'
    } else if (overallScore >= 6.5) {
      return 'Good candidate - consider for interview'
    } else if (overallScore >= 5.5) {
      return 'Potential candidate - consider with reservations'
    } else {
      return 'Not recommended - significant concerns identified'
    }
  }

  // Helper methods for score calculations

  private calculateTotalExperience(candidate: Candidate): number {
    const currentStart = new Date(candidate.experience.currentPosition.startDate)
    const currentEnd = candidate.experience.currentPosition.endDate
      ? new Date(candidate.experience.currentPosition.endDate)
      : new Date()

    let totalYears = (currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24 * 365.25)

    candidate.experience.previousPositions.forEach(pos => {
      const start = new Date(pos.startDate)
      const end = new Date(pos.endDate)
      totalYears += (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    })

    return totalYears
  }

  private calculateRoleProgression(candidate: Candidate): number {
    const positions = [candidate.experience.currentPosition, ...candidate.experience.previousPositions]

    if (positions.length < 2) return 5.0

    // Simple progression check - in reality, this would be more sophisticated
    let progressionScore = 5.0

    const hasLeadership = positions.some(pos => pos.directReports && pos.directReports > 0)
    const hasIncreasingResponsibility = candidate.experience.currentPosition.keyAchievements.length > 2

    if (hasLeadership) progressionScore += 2.0
    if (hasIncreasingResponsibility) progressionScore += 1.5

    return Math.min(10, progressionScore)
  }

  private calculateIndustryRelevance(candidate: Candidate): number {
    // This would be customized based on target industry
    const techKeywords = ['software', 'technology', 'engineering', 'development', 'programming']

    const hasTechBackground = candidate.experience.currentPosition.industry
      .toLowerCase()
      .includes('technology') ||
      candidate.experience.previousPositions.some(pos =>
        techKeywords.some(keyword => pos.description.toLowerCase().includes(keyword))
      )

    return hasTechBackground ? 8.0 : 6.0
  }

  private calculateLeadershipExperience(candidate: Candidate): number {
    const directReports = candidate.experience.currentPosition.directReports || 0
    const teamSize = candidate.experience.currentPosition.teamSize || 0

    const leadershipScore = Math.min((directReports + teamSize / 3) / 5, 10)
    return leadershipScore
  }

  private calculateProjectComplexity(candidate: Candidate): number {
    // Analyze achievements and technologies used for complexity indicators
    const achievementsCount = candidate.experience.currentPosition.keyAchievements.length
    const techDiversity = candidate.technicalSkills.programmingLanguages.length +
                         candidate.technicalSkills.frameworksAndTools.length

    return Math.min((achievementsCount + techDiversity) / 3, 10)
  }

  private calculateCareerVelocity(candidate: Candidate): number {
    // Calculate how quickly the candidate has progressed in their career
    const totalExperience = this.calculateTotalExperience(candidate)
    const currentLevel = this.assessCareerLevel(candidate)

    // Rate of progression based on experience vs. level
    const velocity = currentLevel / Math.max(totalExperience / 5, 1)
    return Math.min(velocity * 2, 10)
  }

  private assessCareerLevel(candidate: Candidate): number {
    const title = candidate.experience.currentPosition.title.toLowerCase()

    if (title.includes('principal') || title.includes('staff')) return 5
    if (title.includes('lead') || title.includes('senior')) return 4
    if (title.includes('mid') || title.includes('level 3')) return 3
    if (title.includes('junior') || title.includes('associate')) return 2
    return 1
  }

  private analyzeScoreDistribution(rankedCandidates: Array<{ candidate: Candidate; metrics: CandidateComparisonMetrics }>): any {
    const scores = rankedCandidates.map(c => c.metrics.overallScore)

    return {
      average: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      median: scores[Math.floor(scores.length / 2)],
      range: { min: Math.min(...scores), max: Math.max(...scores) },
      standardDeviation: this.calculateStandardDeviation(scores)
    }
  }

  private identifyKeyDifferentiators(rankedCandidates: Array<{ candidate: Candidate; metrics: CandidateComparisonMetrics }>): string[] {
    const differentiators = []

    if (rankedCandidates.length >= 2) {
      const top = rankedCandidates[0].metrics
      const second = rankedCandidates[1].metrics

      const differences = [
        { area: 'Technical Skills', diff: top.technicalScore - second.technicalScore },
        { area: 'Experience', diff: top.experienceScore - second.experienceScore },
        { area: 'Cultural Fit', diff: top.culturalFitScore - second.culturalFitScore },
        { area: 'Personality', diff: top.personalityScore - second.personalityScore },
        { area: 'Growth Potential', diff: top.growthPotentialScore - second.growthPotentialScore }
      ]

      const significantDiffs = differences
        .filter(d => d.diff > 1.0)
        .sort((a, b) => b.diff - a.diff)
        .slice(0, 3)

      differentiators.push(...significantDiffs.map(d =>
        `${d.area}: +${d.diff.toFixed(1)} points difference`
      ))
    }

    return differentiators
  }

  private generateComparisonRecommendations(
    rankedCandidates: Array<{ candidate: Candidate; metrics: CandidateComparisonMetrics }>,
    criteria: ComparisonCriteria
  ): string[] {
    const recommendations = []

    if (rankedCandidates.length > 0) {
      const topCandidate = rankedCandidates[0]

      if (topCandidate.metrics.overallScore > 8.0) {
        recommendations.push(`Strong recommendation for ${topCandidate.candidate.personalInfo.firstName} ${topCandidate.candidate.personalInfo.lastName}`)
      }

      if (rankedCandidates.length > 1) {
        const topTwo = rankedCandidates.slice(0, 2)
        const scoreGap = topTwo[0].metrics.overallScore - topTwo[1].metrics.overallScore

        if (scoreGap < 1.0) {
          recommendations.push('Top candidates are very close - consider interviewing both')
        }
      }

      // Check for red flags in top candidates
      const topConcerns = rankedCandidates
        .slice(0, 2)
        .flatMap(c => c.metrics.concerns)
        .filter(concern =>
          concern.includes('stress') ||
          concern.includes('collaboration') ||
          concern.includes('cultural')
        )

      if (topConcerns.length > 0) {
        recommendations.push('Additional reference checks recommended for top candidates')
      }
    }

    return recommendations
  }

  private identifyRiskFactors(rankedCandidates: Array<{ candidate: Candidate; metrics: CandidateComparisonMetrics }>): string[] {
    const risks = []

    rankedCandidates.forEach(({ candidate, metrics }) => {
      if (metrics.personalityScore < 5) {
        risks.push(`${candidate.personalInfo.firstName}: Personality misalignment risks`)
      }
      if (metrics.culturalFitScore < 5) {
        risks.push(`${candidate.personalInfo.firstName}: Cultural fit concerns`)
      }
      if (candidate.personality.neuroticism > 75) {
        risks.push(`${candidate.personalInfo.firstName}: High stress sensitivity`)
      }
    })

    return risks
  }

  private calculateStandardDeviation(scores: number[]): number {
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const squaredDiffs = scores.map(score => Math.pow(score - mean, 2))
    const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / scores.length
    return Math.sqrt(avgSquaredDiff)
  }
}

/**
 * Convenience function for quick candidate comparison
 */
export async function compareCandidates(
  candidates: Candidate[],
  options: {
    jobContext?: string
    customWeights?: Partial<ComparisonCriteria>
  } = {}
): Promise<CandidateComparison> {
  const engine = new CandidateComparisonEngine()
  return await engine.compareCandidates(
    candidates,
    options.jobContext,
    options.customWeights
  )
}