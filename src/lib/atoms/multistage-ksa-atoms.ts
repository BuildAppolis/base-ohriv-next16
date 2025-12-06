/**
 * Multi-Stage KSA Evaluation State Atoms
 *
 * Integrates KSA evaluation with the existing multi-stage scoring system.
 * Provides atomic state management for stage-based KSA evaluations.
 */

import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { KSAInterviewOutput } from '@/types/company_old/ksa'

// Types for multi-stage KSA evaluation
export interface StageKSAScore {
  id: string
  candidateId: string
  stageId: string // 'stage-1', 'stage-2', 'stage-3'
  evaluatorId?: string
  evaluatorName: string
  evaluationDate: string

  // KSA framework used
  ksaFrameworkId: string
  jobCategory: string

  // Overall scores
  overallScore: number // 1-10
  overallRecommendation: 'strong-recommend' | 'recommend' | 'consider' | 'reject'

  // Detailed KSA scores
  ksaScores: {
    knowledge: {
      overall: number // 1-10
      breakdown: Record<string, number> // individual K item scores
    }
    skills: {
      overall: number // 1-10
      breakdown: Record<string, number> // individual S item scores
    }
    abilities: {
      overall: number // 1-10
      breakdown: Record<string, number> // individual A item scores
    }
  }

  // Stage-specific attribute scores (integrates with existing scoring system)
  attributeScores: {
    technicalSkills: number // 1-10
    communication: number // 1-10
    problemSolving: number // 1-10
    leadership: number // 1-10
    adaptability: number // 1-10
  }

  // Evaluation metadata
  notes?: string
  questionsAsked?: string[]
  strengths: string[]
  weaknesses: string[]
  redFlags?: string[]

  // Status tracking
  status: 'draft' | 'completed' | 'reviewed'
  completionPercentage: number // 0-100
}

export interface StageEvaluationSession {
  id: string
  candidateId: string
  stageId: string
  evaluatorName: string
  startTime: string
  lastUpdated: string
  status: 'active' | 'paused' | 'completed'

  // KSA framework being used
  ksaFramework: KSAInterviewOutput | null
  jobCategory: string

  // Progress tracking
  currentAttribute?: string
  completedAttributes: string[]
  scores: Record<string, number> // attribute_id -> score
  notes: Record<string, string> // attribute_id -> notes

  // Auto-save data
  draftData: Partial<StageKSAScore>
}

export interface MultiStageEvaluationReport {
  id: string
  candidateId: string
  candidateName: string
  jobCategory: string

  // Summary across all stages
  finalRecommendation: 'strong-recommend' | 'recommend' | 'consider' | 'reject'
  finalScore: number // 1-10 weighted average

  // Stage-wise breakdown
  stageScores: {
    'stage-1': StageKSAScore | null
    'stage-2': StageKSAScore | null
    'stage-3': StageKSAScore | null
  }

  // KSA progression
  ksaProgression: {
    knowledge: { 'stage-1': number; 'stage-2': number; 'stage-3': number; trend: 'improving' | 'stable' | 'declining' }
    skills: { 'stage-1': number; 'stage-2': number; 'stage-3': number; trend: 'improving' | 'stable' | 'declining' }
    abilities: { 'stage-1': number; 'stage-2': number; 'stage-3': number; trend: 'improving' | 'stable' | 'declining' }
  }

  // Attribute progression
  attributeProgression: {
    technicalSkills: { 'stage-1': number; 'stage-2': number; 'stage-3': number; trend: 'improving' | 'stable' | 'declining' }
    communication: { 'stage-1': number; 'stage-2': number; 'stage-3': number; trend: 'improving' | 'stable' | 'declining' }
    problemSolving: { 'stage-1': number; 'stage-2': number; 'stage-3': number; trend: 'improving' | 'stable' | 'declining' }
    leadership: { 'stage-1': number; 'stage-2': number; 'stage-3': number; trend: 'improving' | 'stable' | 'declining' }
    adaptability: { 'stage-1': number; 'stage-2': number; 'stage-3': number; trend: 'improving' | 'stable' | 'declining' }
  }

  // Final insights
  keyStrengths: string[]
  keyConcerns: string[]
  consensusScores: Record<string, number>
  discrepancies: string[]

  generatedOn: string
}

// Stage definitions matching the existing scoring system
export const EVALUATION_STAGES = [
  {
    id: 'stage-1',
    name: 'Phone Screen',
    description: 'Initial screening call',
    color: 'blue',
    evaluatorRole: 'Recruiter',
    focusAreas: ['communication', 'adaptability', 'basic_technical']
  },
  {
    id: 'stage-2',
    name: 'Technical Interview',
    description: 'In-depth technical assessment',
    color: 'purple',
    evaluatorRole: 'Technical Lead',
    focusAreas: ['technicalSkills', 'problemSolving', 'communication']
  },
  {
    id: 'stage-3',
    name: 'Final Interview',
    description: 'Culture fit and leadership assessment',
    color: 'green',
    evaluatorRole: 'Hiring Manager',
    focusAreas: ['leadership', 'communication', 'problemSolving', 'adaptability']
  }
] as const

export const EVALUATION_ATTRIBUTES = [
  {
    id: 'technicalSkills',
    name: 'Technical Skills',
    icon: '💻',
    color: 'blue',
    description: 'Technical proficiency and problem-solving ability'
  },
  {
    id: 'communication',
    name: 'Communication',
    icon: '💬',
    color: 'green',
    description: 'Clarity, articulation, and active listening'
  },
  {
    id: 'problemSolving',
    name: 'Problem Solving',
    icon: '🧩',
    color: 'purple',
    description: 'Analytical thinking and creative solutions'
  },
  {
    id: 'leadership',
    name: 'Leadership',
    icon: '👥',
    color: 'amber',
    description: 'Team leadership and mentorship capabilities'
  },
  {
    id: 'adaptability',
    name: 'Adaptability',
    icon: '🔄',
    color: 'pink',
    description: 'Flexibility and learning agility'
  }
] as const

/**
 * Primary storage atoms for multi-stage KSA evaluations
 */
export const stageKSAScoresAtom = atomWithStorage<Record<string, StageKSAScore>>('stageKSAScores', {})

export const evaluationSessionsAtom = atomWithStorage<Record<string, StageEvaluationSession>>('evaluationSessions', {})

export const evaluationReportsAtom = atomWithStorage<Record<string, MultiStageEvaluationReport>>('evaluationReports', {})

/**
 * Current evaluation session state
 */
export const currentSessionIdAtom = atom<string | null>(null)

export const currentStageIdAtom = atom<string>('stage-1') // Default to Phone Screen

export const currentEvaluatorNameAtom = atom<string>('Demo Evaluator')

/**
 * UI state for KSA evaluation
 */
export const ksaEvaluationModalAtom = atom<boolean>(false)

export const selectedKSAFrameworkAtom = atom<KSAInterviewOutput | null>(null)

export const selectedJobCategoryAtom = atom<string>('')

export const evaluationProgressAtom = atom<{
  stageId: string
  attributeId: string | null
  score: number
  notes: string
  isComplete: boolean
}>({
  stageId: 'stage-1',
  attributeId: null,
  score: 5,
  notes: '',
  isComplete: false
})

/**
 * Computed atoms
 */

// Get current session object
export const currentSessionAtom = atom(
  (get) => {
    const sessionId = get(currentSessionIdAtom)
    const sessions = get(evaluationSessionsAtom)
    return sessionId ? sessions[sessionId] : null
  }
)

// Get scores for current candidate and stage
export const currentStageScoresAtom = atom(
  (get) => {
    const currentSession = get(currentSessionAtom)
    const scores = get(stageKSAScoresAtom)

    if (!currentSession) return []

    return Object.values(scores).filter(score =>
      score.candidateId === currentSession.candidateId &&
      score.stageId === currentSession.stageId
    )
  }
)

// Get completed evaluation report for candidate
export const candidateEvaluationReportAtom = atom(
  (get) => (candidateId: string) => {
    const reports = get(evaluationReportsAtom)
    return Object.values(reports).find(report => report.candidateId === candidateId) || null
  }
)

// Check if stage is completed for candidate
export const isStageCompletedAtom = atom(
  (get) => (candidateId: string, stageId: string) => {
    const scores = get(stageKSAScoresAtom)
    return Object.values(scores).some(score =>
      score.candidateId === candidateId &&
      score.stageId === stageId &&
      score.status === 'completed'
    )
  }
)

// Get completion status across all stages for candidate
export const getCandidateCompletionStatusAtom = atom(
  (get) => (candidateId: string) => {
    const scores = get(stageKSAScoresAtom)
    const candidateScores = Object.values(scores).filter(score => score.candidateId === candidateId)

    const completion = {
      'stage-1': false,
      'stage-2': false,
      'stage-3': false,
      overall: false,
      totalCompleted: 0
    }

    candidateScores.forEach(score => {
      if (score.status === 'completed') {
        completion[score.stageId as keyof typeof completion] = true
        completion.totalCompleted++
      }
    })

    completion.overall = completion.totalCompleted === 3
    return completion
  }
)

/**
 * Action atoms
 */

// Start new evaluation session
export const startEvaluationSessionAtom = atom(
  null,
  (get, set, { candidateId, stageId, evaluatorName, ksaFramework, jobCategory }: {
    candidateId: string
    stageId: string
    evaluatorName: string
    ksaFramework: KSAInterviewOutput
    jobCategory: string
  }) => {
    const sessionId = `${candidateId}-${stageId}-${Date.now()}`
    const session: StageEvaluationSession = {
      id: sessionId,
      candidateId,
      stageId,
      evaluatorName,
      startTime: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      status: 'active',
      ksaFramework,
      jobCategory,
      completedAttributes: [],
      scores: {},
      notes: {},
      draftData: {}
    }

    const sessions = get(evaluationSessionsAtom)
    set(evaluationSessionsAtom, {
      ...sessions,
      [sessionId]: session
    })

    set(currentSessionIdAtom, sessionId)
    set(currentStageIdAtom, stageId)
    set(currentEvaluatorNameAtom, evaluatorName)
    set(selectedKSAFrameworkAtom, ksaFramework)
    set(selectedJobCategoryAtom, jobCategory)

    return sessionId
  }
)

// Save attribute score in current session
export const saveAttributeScoreAtom = atom(
  null,
  (get, set, { attributeId, score, notes }: {
    attributeId: string
    score: number
    notes: string
  }) => {
    const sessionId = get(currentSessionIdAtom)
    const sessions = get(evaluationSessionsAtom)

    if (!sessionId || !sessions[sessionId]) return

    const session = sessions[sessionId]
    const updatedSession = {
      ...session,
      lastUpdated: new Date().toISOString(),
      scores: {
        ...session.scores,
        [attributeId]: score
      },
      notes: {
        ...session.notes,
        [attributeId]: notes
      }
    }

    // Update completed attributes
    if (!session.completedAttributes.includes(attributeId)) {
      updatedSession.completedAttributes = [...session.completedAttributes, attributeId]
    }

    set(evaluationSessionsAtom, {
      ...sessions,
      [sessionId]: updatedSession
    })
  }
)

// Complete stage evaluation
export const completeStageEvaluationAtom = atom(
  null,
  (get, set, {
    candidateId,
    stageId,
    evaluatorName,
    ksaFramework,
    jobCategory,
    attributeScores,
    ksaScores,
    notes,
    strengths,
    weaknesses
  }: {
    candidateId: string
    stageId: string
    evaluatorName: string
    ksaFramework: KSAInterviewOutput
    jobCategory: string
    attributeScores: Record<string, number>
    ksaScores: StageKSAScore['ksaScores']
    notes?: string
    strengths: string[]
    weaknesses: string[]
  }) => {
    const scoreId = `${candidateId}-${stageId}-${Date.now()}`

    // Calculate overall score and recommendation
    const overallScore = Object.values(attributeScores).reduce((sum, score) => sum + score, 0) / Object.values(attributeScores).length

    const getRecommendation = (score: number): StageKSAScore['overallRecommendation'] => {
      if (score >= 8.5) return 'strong-recommend'
      if (score >= 7) return 'recommend'
      if (score >= 5) return 'consider'
      return 'reject'
    }

    const stageScore: StageKSAScore = {
      id: scoreId,
      candidateId,
      stageId,
      evaluatorName,
      evaluationDate: new Date().toISOString(),
      ksaFrameworkId: ksaFramework.Metadata?.JobID || 'unknown',
      jobCategory,
      overallScore,
      overallRecommendation: getRecommendation(overallScore),
      ksaScores,
      attributeScores: {
        technicalSkills: attributeScores.technicalSkills || 5,
        communication: attributeScores.communication || 5,
        problemSolving: attributeScores.problemSolving || 5,
        leadership: attributeScores.leadership || 5,
        adaptability: attributeScores.adaptability || 5
      },
      notes,
      strengths,
      weaknesses,
      status: 'completed',
      completionPercentage: 100
    }

    // Save the stage score
    const scores = get(stageKSAScoresAtom)
    set(stageKSAScoresAtom, {
      ...scores,
      [scoreId]: stageScore
    })

    // Update session status
    const sessionId = get(currentSessionIdAtom)
    const sessions = get(evaluationSessionsAtom)
    if (sessionId && sessions[sessionId]) {
      set(evaluationSessionsAtom, {
        ...sessions,
        [sessionId]: {
          ...sessions[sessionId],
          status: 'completed',
          lastUpdated: new Date().toISOString()
        }
      })
    }

    // Check if all stages are completed and generate report
    const completionStatus = get(getCandidateCompletionStatusAtom)(candidateId)
    if (completionStatus.totalCompleted + 1 >= 3) { // Including this one
      set(generateEvaluationReportAtom, { candidateId, ksaFramework, jobCategory })
    }

    return scoreId
  }
)

// Generate comprehensive evaluation report
export const generateEvaluationReportAtom = atom(
  null,
  (get, set, { candidateId, ksaFramework, jobCategory }: {
    candidateId: string
    ksaFramework: KSAInterviewOutput
    jobCategory: string
  }) => {
    const scores = get(stageKSAScoresAtom)
    const candidateScores = Object.values(scores).filter(score => score.candidateId === candidateId)

    if (candidateScores.length === 0) return

    // Group scores by stage
    const stageScores: MultiStageEvaluationReport['stageScores'] = {
      'stage-1': null,
      'stage-2': null,
      'stage-3': null
    }

    candidateScores.forEach(score => {
      stageScores[score.stageId as keyof typeof stageScores] = score
    })

    // Calculate final weighted score (Technical Interview weighted more heavily)
    const weights = { 'stage-1': 0.2, 'stage-2': 0.5, 'stage-3': 0.3 }
    let weightedSum = 0
    let totalWeight = 0

    Object.entries(stageScores).forEach(([stageId, score]) => {
      if (score) {
        weightedSum += score.overallScore * weights[stageId as keyof typeof weights]
        totalWeight += weights[stageId as keyof typeof weights]
      }
    })

    const finalScore = totalWeight > 0 ? weightedSum / totalWeight : 0

    // Calculate KSA progression
    const ksaProgression = {
      knowledge: calculateProgression(candidateScores, 'knowledge'),
      skills: calculateProgression(candidateScores, 'skills'),
      abilities: calculateProgression(candidateScores, 'abilities')
    }

    // Calculate attribute progression
    const attributeProgression = {
      technicalSkills: calculateAttributeProgression(candidateScores, 'technicalSkills'),
      communication: calculateAttributeProgression(candidateScores, 'communication'),
      problemSolving: calculateAttributeProgression(candidateScores, 'problemSolving'),
      leadership: calculateAttributeProgression(candidateScores, 'leadership'),
      adaptability: calculateAttributeProgression(candidateScores, 'adaptability')
    }

    // Aggregate strengths and concerns
    const allStrengths = candidateScores.flatMap(score => score.strengths)
    const allWeaknesses = candidateScores.flatMap(score => score.weaknesses)
    const allRedFlags = candidateScores.flatMap(score => score.redFlags || [])

    const keyStrengths = getTopItems(allStrengths, 5)
    const keyConcerns = [...getTopItems(allWeaknesses, 3), ...getTopItems(allRedFlags, 2)]

    // Get recommendation from highest-weighted stage or calculate consensus
    const getFinalRecommendation = (): MultiStageEvaluationReport['finalRecommendation'] => {
      if (stageScores['stage-2']?.overallRecommendation) {
        return stageScores['stage-2']!.overallRecommendation
      }

      // Simple majority vote
      const recommendations = candidateScores.map(s => s.overallRecommendation)
      const counts = recommendations.reduce((acc, rec) => {
        acc[rec] = (acc[rec] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return Object.entries(counts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'consider'
    }

    const report: MultiStageEvaluationReport = {
      id: `${candidateId}-report-${Date.now()}`,
      candidateId,
      candidateName: `Candidate ${candidateId.slice(-6)}`, // Would get from candidate atoms
      jobCategory,
      finalRecommendation: getFinalRecommendation(),
      finalScore,
      stageScores,
      ksaProgression,
      attributeProgression,
      keyStrengths,
      keyConcerns,
      consensusScores: calculateConsensusScores(candidateScores),
      discrepancies: findDiscrepancies(candidateScores),
      generatedOn: new Date().toISOString()
    }

    // Save report
    const reports = get(evaluationReportsAtom)
    set(evaluationReportsAtom, {
      ...reports,
      [report.id]: report
    })

    return report.id
  }
)

// Helper functions
function calculateProgression(scores: StageKSAScore[], ksaType: 'knowledge' | 'skills' | 'abilities') {
  const stageValues = { 'stage-1': 0, 'stage-2': 0, 'stage-3': 0 }

  scores.forEach(score => {
    stageValues[score.stageId as keyof typeof stageValues] = score.ksaScores[ksaType].overall
  })

  const trend = determineTrend(stageValues['stage-1'], stageValues['stage-2'], stageValues['stage-3'])

  return { ...stageValues, trend }
}

function calculateAttributeProgression(scores: StageKSAScore[], attribute: keyof StageKSAScore['attributeScores']) {
  const stageValues = { 'stage-1': 0, 'stage-2': 0, 'stage-3': 0 }

  scores.forEach(score => {
    stageValues[score.stageId as keyof typeof stageValues] = score.attributeScores[attribute]
  })

  const trend = determineTrend(stageValues['stage-1'], stageValues['stage-2'], stageValues['stage-3'])

  return { ...stageValues, trend }
}

function determineTrend(stage1: number, stage2: number, stage3: number): 'improving' | 'stable' | 'declining' {
  const diff1 = stage2 - stage1
  const diff2 = stage3 - stage2
  const totalDiff = stage3 - stage1

  if (totalDiff > 1.5) return 'improving'
  if (totalDiff < -1.5) return 'declining'
  return 'stable'
}

function getTopItems(items: string[], limit: number): string[] {
  // Simple frequency-based selection
  const counts = items.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(counts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([item]) => item)
}

function calculateConsensusScores(scores: StageKSAScore[]): Record<string, number> {
  const consensus: Record<string, number> = {}

  // Average each attribute across stages
  const attributes: (keyof StageKSAScore['attributeScores'])[] = ['technicalSkills', 'communication', 'problemSolving', 'leadership', 'adaptability']

  attributes.forEach(attr => {
    const values = scores.map(score => score.attributeScores[attr]).filter(Boolean)
    consensus[attr] = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0
  })

  return consensus
}

function findDiscrepancies(scores: StageKSAScore[]): string[] {
  const discrepancies: string[] = []

  // Look for large score differences between stages
  const attributes: (keyof StageKSAScore['attributeScores'])[] = ['technicalSkills', 'communication', 'problemSolving', 'leadership', 'adaptability']

  attributes.forEach(attr => {
    const values = scores.map(score => ({ stage: score.stageId, score: score.attributeScores[attr] }))
    if (values.length >= 2) {
      const max = Math.max(...values.map(v => v.score))
      const min = Math.min(...values.map(v => v.score))

      if (max - min > 4) { // More than 40% difference
        discrepancies.push(`${attr} scores vary significantly between stages (${min.toFixed(1)} - ${max.toFixed(1)})`)
      }
    }
  })

  return discrepancies
}