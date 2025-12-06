/**
 * AI-Powered Candidate Generation System
 *
 * Advanced candidate generation using AI models for enhanced personality
 * creation, realistic background generation, and sophisticated evaluation predictions.
 */

import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { nanoid } from 'nanoid'
import {
  Candidate,
  PersonalityTraits,
  WorkBehaviorPatterns,
  CognitiveProfile,
  CandidateGenerationParams
} from '@/types/candidate'
import { generateCandidate } from './candidate-generator'
import { generateBadCandidate, generateMultipleBadCandidates, generateMixedQualityCandidates } from './bad-candidate-generator'

/**
 * AI-enhanced personality generation prompts
 */
const personalityPrompts = {
  innovator: `Generate a Big Five personality profile for an innovative technology leader who:
  - Thinks outside conventional boundaries
  - Thrives in ambiguous, rapidly changing environments
  - Challenges the status quo and drives transformation
  - Is comfortable with calculated risks and experimentation
  - Inspires others through visionary thinking

  Return as JSON with openness, conscientiousness, extraversion, agreeableness, neuroticism (1-100 scale).`,

  specialist: `Generate a Big Five personality profile for a deep technical specialist who:
  - Has exceptional attention to detail and precision
  - Prefers depth over breadth in knowledge domains
  - Values structured, methodical approaches
  - Is more comfortable with systems than people
  - Demonstrates expertise through careful analysis

  Return as JSON with openness, conscientiousness, extraversion, agreeableness, neuroticism (1-100 scale).`,

  collaborator: `Generate a Big Five personality profile for an exceptional team collaborator who:
  - Builds strong relationships and trust easily
  - Prioritizes team success over individual recognition
  - Excels at communication and conflict resolution
  - Is empathetic and emotionally intelligent
  - Creates inclusive, supportive environments

  Return as JSON with openness, conscientiousness, extraversion, agreeableness, neuroticism (1-100 scale).`,

  leader: `Generate a Big Five personality profile for a natural leader who:
  - Inspires confidence and motivates others
  - Makes decisive, well-reasoned decisions under pressure
  - Takes ownership and accountability
  - Balances strategic thinking with tactical execution
  - Develops and mentors team members effectively

  Return as JSON with openness, conscientiousness, extraversion, agreeableness, neuroticism (1-100 scale).`
}

/**
 * AI-enhanced background generation prompts
 */
const backgroundGenerationPrompt = `
Generate a comprehensive professional background for a {experienceLevel} {role} with the following profile:

Personality Traits:
- Openness: {openness}/100 (how open to new experiences)
- Conscientiousness: {conscientiousness}/100 (how organized and detail-oriented)
- Extraversion: {extraversion}/100 (how outgoing and sociable)
- Agreeableness: {agreeableness}/100 (how cooperative and empathetic)
- Neuroticism: {neuroticism}/100 (how emotionally stable)

Technical Focus: {technicalFocus}
Industry Background: {industryBackground}

Generate realistic details including:
1. Detailed work history with specific achievements
2. Educational background with relevant projects
3. Professional certifications and continuous learning
4. Leadership experience (if applicable)
5. Notable technical contributions or innovations

Return as JSON with structured data for current position, previous positions, education, and certifications.
`

/**
 * AI-powered interview performance prediction
 */
const interviewPerformancePrompt = `
Based on this candidate's profile, predict their interview performance:

Experience Level: {experienceLevel}
Role: {role}

Personality Profile:
- Openness: {openness}/100
- Conscientiousness: {conscientiousness}/100
- Extraversion: {extraversion}/100
- Agreeableness: {agreeableness}/100
- Neuroticism: {neuroticism}/100

Technical Skills: {technicalSkills}

Provide detailed predictions for:
1. Behavioral interview performance (communication, problem-solving, leadership, teamwork)
2. Technical interview performance (coding, system design, troubleshooting)
3. Cultural fit assessment
4. Response patterns and style
5. Potential strengths and concerns

Return as JSON with specific scores (1-10) and detailed explanations.
`

/**
 * Generate AI-enhanced personality traits
 */
export async function generateAIEnhancedPersonality(
  archetype: string = 'balanced',
  customRequirements?: string[]
): Promise<PersonalityTraits> {
  try {
    // If we have a specific archetype, use AI to generate enhanced personality
    if (archetype !== 'balanced' && personalityPrompts[archetype as keyof typeof personalityPrompts]) {
      const prompt = personalityPrompts[archetype as keyof typeof personalityPrompts]

      if (customRequirements?.length) {
        const enhancedPrompt = prompt + `\n\nAdditional requirements:\n${customRequirements.join('\n')}`

        const { text } = await generateText({
          model: openai('gpt-4o-mini'),
          prompt: enhancedPrompt,
          temperature: 0.7,
          
        })

        const aiPersonality = JSON.parse(text)
        return {
          openness: Math.max(1, Math.min(100, aiPersonality.openness || 60)),
          conscientiousness: Math.max(1, Math.min(100, aiPersonality.conscientiousness || 70)),
          extraversion: Math.max(1, Math.min(100, aiPersonality.extraversion || 50)),
          agreeableness: Math.max(1, Math.min(100, aiPersonality.agreeableness || 65)),
          neuroticism: Math.max(1, Math.min(100, aiPersonality.neuroticism || 40))
        }
      }
    }

    // Fallback to standard generation
    return generatePersonalityTraits(archetype)
  } catch (error) {
    console.warn('AI personality generation failed, using fallback:', error)
    return generatePersonalityTraits(archetype)
  }
}

/**
 * Generate AI-enhanced professional background
 */
export async function generateAIEnhancedBackground(
  personality: PersonalityTraits,
  params: CandidateGenerationParams
): Promise<any> {
  try {
    const prompt = backgroundGenerationPrompt
      .replace('{experienceLevel}', params.experienceLevel || 'mid')
      .replace('{role}', params.targetRole || 'Software Engineer')
      .replace('{openness}', personality.openness.toString())
      .replace('{conscientiousness}', personality.conscientiousness.toString())
      .replace('{extraversion}', personality.extraversion.toString())
      .replace('{agreeableness}', personality.agreeableness.toString())
      .replace('{neuroticism}', personality.neuroticism.toString())
      .replace('{technicalFocus}', params.technicalFocus?.join(', ') || 'Full-stack development')
      .replace('{industryBackground}', params.industryBackground || 'Technology')

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt,
      temperature: 0.6,
      
    })

    const aiBackground = JSON.parse(text)
    return aiBackground
  } catch (error) {
    console.warn('AI background generation failed, using fallback:', error)
    return null
  }
}

/**
 * Generate AI-enhanced interview performance predictions
 */
export async function generateAIEnhancedInterviewPerformance(
  personality: PersonalityTraits,
  params: CandidateGenerationParams,
  technicalSkills: any
): Promise<any> {
  try {
    const prompt = interviewPerformancePrompt
      .replace('{experienceLevel}', params.experienceLevel || 'mid')
      .replace('{role}', params.targetRole || 'Software Engineer')
      .replace('{openness}', personality.openness.toString())
      .replace('{conscientiousness}', personality.conscientiousness.toString())
      .replace('{extraversion}', personality.extraversion.toString())
      .replace('{agreeableness}', personality.agreeableness.toString())
      .replace('{neuroticism}', personality.neuroticism.toString())
      .replace('{technicalSkills}', JSON.stringify(technicalSkills))

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt,
      temperature: 0.5,
      
    })

    const aiPerformance = JSON.parse(text)
    return aiPerformance
  } catch (error) {
    console.warn('AI performance prediction failed, using fallback:', error)
    return null
  }
}

/**
 * Enhanced candidate generation with AI augmentation
 */
export async function generateAIEnhancedCandidate(
  params: CandidateGenerationParams
): Promise<Candidate> {
  try {
    // Check if we should generate a bad candidate
    if (params.qualityLevel && ['poor', 'terrible'].includes(params.qualityLevel)) {
      // Generate bad candidate first, then enhance with AI
      const badCandidate = generateBadCandidate(params)

      // Enhance with AI-generated personality (keeping the bad traits)
      const enhancedPersonality = await generateAIEnhancedPersonality(
        params.personalityArchetype,
        params.customRequirements
      )

      // Only enhance certain aspects, keep the problematic traits
      const partiallyEnhancedCandidate = {
        ...badCandidate,
        personality: enhancedPersonality,
        metadata: {
          ...badCandidate.metadata,
          dateCreated: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          version: '2.0.0-ai-enhanced-bad',
          source: 'ai-enhanced-bad',
          generationPrompt: JSON.stringify(params, null, 2),
          tags: [
            ...badCandidate.metadata.tags,
            'ai-enhanced-bad',
            params.qualityLevel
          ]
        }
      }

      return partiallyEnhancedCandidate
    }

    // Generate good candidate
    const baseCandidate = generateCandidate(params)

    // Enhance with AI-generated personality
    const enhancedPersonality = await generateAIEnhancedPersonality(
      params.personalityArchetype,
      params.customRequirements
    )

    // Generate AI-enhanced background
    const enhancedBackground = await generateAIEnhancedBackground(enhancedPersonality, params)

    // Generate AI-enhanced interview performance
    const enhancedPerformance = await generateAIEnhancedInterviewPerformance(
      enhancedPersonality,
      params,
      baseCandidate.technicalSkills
    )

    // Merge AI enhancements with base candidate
    const enhancedCandidate: Candidate = {
      ...baseCandidate,
      id: nanoid(),
      personality: enhancedPersonality,
      experience: enhancedBackground || baseCandidate.experience,
      interviewPerformance: enhancedPerformance || baseCandidate.interviewPerformance,
      metadata: {
        ...baseCandidate.metadata,
        dateCreated: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        version: '2.0.0-ai-enhanced',
        source: 'ai-enhanced',
        generationPrompt: JSON.stringify(params, null, 2),
        tags: [
          ...baseCandidate.metadata.tags,
          'ai-enhanced',
          params.personalityArchetype || 'balanced'
        ]
      }
    }

    return enhancedCandidate
  } catch (error) {
    console.warn('AI enhancement failed, returning base candidate:', error)
    return generateCandidate(params)
  }
}

/**
 * Generate multiple AI-enhanced candidates
 */
export async function generateMultipleAIEnhancedCandidates(
  params: CandidateGenerationParams
): Promise<Candidate[]> {
  const { count = 1 } = params

  const candidates = await Promise.all(
    Array.from({ length: count }, async (_, index) => {
      const specificParams = {
        ...params,
        customRequirements: [
          ...(params.customRequirements || []),
          `candidate-${index + 1}`
        ]
      }

      return await generateAIEnhancedCandidate(specificParams)
    })
  )

  return candidates
}

/**
 * Generate mixed-quality AI-enhanced candidates (realistic mix)
 */
export async function generateMixedQualityAIEnhancedCandidates(
  params: CandidateGenerationParams
): Promise<Candidate[]> {
  const { count = 1 } = params

  // Use the non-AI mixed quality generator first, then enhance good/average candidates
  const mixedCandidates = generateMixedQualityCandidates({
    ...params,
    count: Math.floor(count * 0.7) // Generate fewer since AI enhancement takes time
  })

  // Enhance only the good and average candidates with AI
  const enhancedCandidates = await Promise.all(
    mixedCandidates.map(async (candidate, index) => {
      const isGood = candidate.metadata.tags.includes('good') || !candidate.metadata.tags.some(tag =>
        ['bad', 'average', 'has-red-flags'].includes(tag)
      )

      if (isGood) {
        // Enhance good candidates with AI
        return await generateAIEnhancedCandidate({
          ...params,
          qualityLevel: undefined,
          customRequirements: [
            ...(params.customRequirements || []),
            `mixed-enhanced-${index + 1}`
          ]
        })
      } else {
        // Keep bad/average candidates as-is (they're already realistic)
        return {
          ...candidate,
          id: nanoid(), // Generate new ID for consistency
          metadata: {
            ...candidate.metadata,
            dateCreated: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            tags: [...candidate.metadata.tags, 'mixed-batch']
          }
        }
      }
    })
  )

  // Add some pure bad candidates if we need more total count
  const remainingCount = count - enhancedCandidates.length
  if (remainingCount > 0) {
    const badCandidates = generateMultipleBadCandidates({
      ...params,
      count: remainingCount,
      qualityLevel: 'poor'
    })

    enhancedCandidates.push(...badCandidates)
  }

  return enhancedCandidates.slice(0, count)
}

/**
 * Batch generation with progress tracking
 */
export async function batchGenerateCandidatesWithProgress(
  params: CandidateGenerationParams,
  onProgress?: (progress: number, current: number, total: number, message: string) => void
): Promise<Candidate[]> {
  const { count = 1 } = params
  const candidates: Candidate[] = []

  // Use mixed quality generation for realistic demo scenarios
  const useMixedQuality = params.includeRedFlags || params.qualityLevel === undefined

  for (let i = 0; i < count; i++) {
    try {
      onProgress?.(
        (i / count) * 100,
        i + 1,
        count,
        `Generating candidate ${i + 1} of ${count}`
      )

      let candidate: Candidate

      if (useMixedQuality && faker.datatype.boolean({ probability: 0.3 })) {
        // 30% chance of bad candidate for realism
        candidate = generateBadCandidate({
          ...params,
          customRequirements: [
            ...(params.customRequirements || []),
            `batch-${i + 1}-bad`
          ]
        })
      } else {
        candidate = await generateAIEnhancedCandidate({
          ...params,
          customRequirements: [
            ...(params.customRequirements || []),
            `batch-${i + 1}`
          ]
        })
      }

      candidates.push(candidate)
    } catch (error) {
      console.error(`Failed to generate candidate ${i + 1}:`, error)
      // Continue with next candidate
    }
  }

  onProgress?.(100, count, count, `Completed generating ${candidates.length} candidates`)
  return candidates
}

/**
 * Generate realistic candidate pool for demos (mix of good and bad)
 */
export async function generateRealisticCandidatePool(
  params: CandidateGenerationParams
): Promise<Candidate[]> {
  const { count = 10 } = params

  // For realistic demos, create a mix:
  // - 40% excellent candidates
  // - 30% good candidates
  // - 20% poor candidates
  // - 10% terrible candidates

  const excellentCount = Math.floor(count * 0.4)
  const goodCount = Math.floor(count * 0.3)
  const poorCount = Math.floor(count * 0.2)
  const terribleCount = count - excellentCount - goodCount - poorCount

  const candidates: Candidate[] = []

  // Generate excellent candidates
  for (let i = 0; i < excellentCount; i++) {
    candidates.push(await generateAIEnhancedCandidate({
      ...params,
      qualityLevel: 'excellent',
      customRequirements: [
        ...(params.customRequirements || []),
        `excellent-${i + 1}`
      ]
    }))
  }

  // Generate good candidates
  for (let i = 0; i < goodCount; i++) {
    candidates.push(await generateAIEnhancedCandidate({
      ...params,
      qualityLevel: 'good',
      customRequirements: [
        ...(params.customRequirements || []),
        `good-${i + 1}`
      ]
    }))
  }

  // Generate poor candidates
  for (let i = 0; i < poorCount; i++) {
    candidates.push(generateBadCandidate({
      ...params,
      qualityLevel: 'poor',
      customRequirements: [
        ...(params.customRequirements || []),
        `poor-${i + 1}`
      ]
    }))
  }

  // Generate terrible candidates
  for (let i = 0; i < terribleCount; i++) {
    candidates.push(generateBadCandidate({
      ...params,
      qualityLevel: 'terrible',
      customRequirements: [
        ...(params.customRequirements || []),
        `terrible-${i + 1}`
      ]
    }))
  }

  // Shuffle for realistic ordering
  return candidates.sort(() => Math.random() - 0.5)
}

/**
 * Personality trait analysis and recommendations
 */
export async function analyzePersonalityFit(
  candidate: Candidate,
  jobRequirements: {
    requiredPersonalityTraits?: Partial<PersonalityTraits>
    workEnvironment?: string
    teamDynamics?: string
  }
): Promise<{
  fitScore: number // 1-10
  analysis: string
  recommendations: string[]
  potentialConcerns: string[]
}> {
  try {
    const prompt = `
    Analyze the personality fit for this candidate:

    Candidate Personality:
    - Openness: ${candidate.personality.openness}/100
    - Conscientiousness: ${candidate.personality.conscientiousness}/100
    - Extraversion: ${candidate.personality.extraversion}/100
    - Agreeableness: ${candidate.personality.agreeableness}/100
    - Neuroticism: ${candidate.personality.neuroticism}/100

    Job Requirements:
    ${JSON.stringify(jobRequirements, null, 2)}

    Provide:
    1. Overall personality fit score (1-10)
    2. Detailed analysis of compatibility
    3. Specific recommendations for integration
    4. Potential concerns or areas to monitor

    Return as JSON with fitScore, analysis, recommendations, and potentialConcerns arrays.
    `

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt,
      temperature: 0.5,
      
    })

    const analysis = JSON.parse(text)
    return {
      fitScore: Math.max(1, Math.min(10, analysis.fitScore || 7)),
      analysis: analysis.analysis || '',
      recommendations: analysis.recommendations || [],
      potentialConcerns: analysis.potentialConcerns || []
    }
  } catch (error) {
    console.warn('Personality fit analysis failed:', error)
    return {
      fitScore: 7,
      analysis: 'Analysis unavailable',
      recommendations: [],
      potentialConcerns: []
    }
  }
}

// Helper function from faker generation
function generatePersonalityTraits(archetype?: string): PersonalityTraits {
  // Import the base function or implement fallback
  return {
    openness: 60,
    conscientiousness: 70,
    extraversion: 50,
    agreeableness: 65,
    neuroticism: 40
  }
}