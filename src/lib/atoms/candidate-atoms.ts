/**
 * Candidate Management State Atoms
 *
 * Jotai-based state management for the comprehensive candidate system.
 * Provides atomic state management for candidates, evaluations, and comparisons.
 */

import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import {
  Candidate,
  CandidateEvaluation,
  CandidateComparison,
  CandidateGenerationParams
} from '@/types/candidate'

/**
 * Primary candidate storage atom
 * Persists all candidates to localStorage for data persistence across sessions
 */
export const candidatesAtom = atomWithStorage<Record<string, Candidate>>('candidates', {})

/**
 * Candidate evaluations storage atom
 * Stores all evaluation results linked to specific candidates
 */
export const candidateEvaluationsAtom = atomWithStorage<Record<string, CandidateEvaluation[]>>(
  'candidateEvaluations',
  {}
)

/**
 * Candidate comparisons storage atom
 * Stores comparison results for analyzing multiple candidates
 */
export const candidateComparisonsAtom = atomWithStorage<Record<string, CandidateComparison>>(
  'candidateComparisons',
  {}
)

/**
 * Generation parameters atom
 * Stores the current configuration for AI-powered candidate generation
 */
export const generationParamsAtom = atom<CandidateGenerationParams>({
  count: 1,
  experienceLevel: 'mid'
})

/**
 * Current selection atoms
 * Track currently selected candidates, evaluations, and UI state
 */
export const selectedCandidateIdsAtom = atom<string[]>([])

export const currentCandidateIdAtom = atom<string | null>(null)

export const selectedEvaluationIdAtom = atom<string | null>(null)

export const selectedComparisonIdAtom = atom<string | null>(null)

/**
 * UI state atoms
 * Manage interface state, filters, and view preferences
 */
export const candidateViewModeAtom = atom<'grid' | 'list' | 'table'>('grid')

export const candidateFiltersAtom = atom<{
  searchTerm: string
  experienceLevel: string[]
  technicalSkills: string[]
  location: string[]
  personalityType: string[]
  tags: string[]
}>({
  searchTerm: '',
  experienceLevel: [],
  technicalSkills: [],
  location: [],
  personalityType: [],
  tags: []
})

export const sortByAtom = atom<{
  field: keyof Candidate | 'created' | 'updated' | 'name'
  direction: 'asc' | 'desc'
}>({
  field: 'created',
  direction: 'desc'
})

/**
 * Generation state atoms
 * Track AI generation progress and status
 */
export const isGeneratingCandidatesAtom = atom(false)

export const generationProgressAtom = atom<{
  stage: 'idle' | 'preparing' | 'generating' | 'processing' | 'completed' | 'error'
  progress: number // 0-100
  currentCandidate?: number
  totalCandidates?: number
  message?: string
  error?: string
}>({
  stage: 'idle',
  progress: 0
})

/**
 * Derived atoms - computed values based on other atoms
 */

/**
 * Get current candidate object from ID
 */
export const currentCandidateAtom = atom(
  (get) => {
    const candidateId = get(currentCandidateIdAtom)
    const candidates = get(candidatesAtom)
    return candidateId ? candidates[candidateId] : null
  }
)

/**
 * Get filtered candidates based on current filters
 */
export const filteredCandidatesAtom = atom(
  (get) => {
    const candidates = get(candidatesAtom)
    const filters = get(candidateFiltersAtom)
    const sortBy = get(sortByAtom)

    let candidateList = Object.values(candidates)

    // Apply search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      candidateList = candidateList.filter(candidate =>
        candidate.personalInfo.firstName.toLowerCase().includes(searchLower) ||
        candidate.personalInfo.lastName.toLowerCase().includes(searchLower) ||
        candidate.personalInfo.email.toLowerCase().includes(searchLower) ||
        candidate.experience.currentPosition.title.toLowerCase().includes(searchLower) ||
        candidate.experience.currentPosition.company.toLowerCase().includes(searchLower) ||
        candidate.metadata.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Apply experience level filter
    if (filters.experienceLevel.length > 0) {
      candidateList = candidateList.filter(candidate => {
        const experience = getExperienceLevel(candidate)
        return filters.experienceLevel.includes(experience)
      })
    }

    // Apply technical skills filter
    if (filters.technicalSkills.length > 0) {
      candidateList = candidateList.filter(candidate =>
        candidate.technicalSkills.programmingLanguages.some(lang =>
          filters.technicalSkills.includes(lang.language)
        ) ||
        candidate.technicalSkills.frameworksAndTools.some(tool =>
          filters.technicalSkills.includes(tool.name)
        )
      )
    }

    // Apply location filter
    if (filters.location.length > 0) {
      candidateList = candidateList.filter(candidate =>
        filters.location.includes(
          `${candidate.personalInfo.location.city}, ${candidate.personalInfo.location.state}`
        )
      )
    }

    // Apply tags filter
    if (filters.tags.length > 0) {
      candidateList = candidateList.filter(candidate =>
        filters.tags.some(tag => candidate.metadata.tags.includes(tag))
      )
    }

    // Apply sorting
    candidateList.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy.field) {
        case 'name':
          aValue = `${a.personalInfo.firstName} ${a.personalInfo.lastName}`
          bValue = `${b.personalInfo.firstName} ${b.personalInfo.lastName}`
          break
        case 'created':
          aValue = new Date(a.metadata.dateCreated)
          bValue = new Date(b.metadata.dateCreated)
          break
        case 'updated':
          aValue = new Date(a.metadata.lastUpdated)
          bValue = new Date(b.metadata.lastUpdated)
          break
        default:
          aValue = a[sortBy.field]
          bValue = b[sortBy.field]
      }

      if (aValue < bValue) return sortBy.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortBy.direction === 'asc' ? 1 : -1
      return 0
    })

    return candidateList
  }
)

/**
 * Get candidate count
 */
export const candidateCountAtom = atom(
  (get) => Object.keys(get(candidatesAtom)).length
)

/**
 * Get selected candidates objects
 */
export const selectedCandidatesAtom = atom(
  (get) => {
    const selectedIds = get(selectedCandidateIdsAtom)
    const candidates = get(candidatesAtom)
    return selectedIds.map(id => candidates[id]).filter(Boolean)
  }
)

/**
 * Get evaluations for current candidate
 */
export const currentCandidateEvaluationsAtom = atom(
  (get) => {
    const candidateId = get(currentCandidateIdAtom)
    const evaluations = get(candidateEvaluationsAtom)
    return candidateId ? (evaluations[candidateId] || []) : []
  }
)

/**
 * Get all available technical skills from all candidates
 */
export const allTechnicalSkillsAtom = atom(
  (get) => {
    const candidates = get(candidatesAtom)
    const skills = new Set<string>()

    Object.values(candidates).forEach(candidate => {
      candidate.technicalSkills.programmingLanguages.forEach(lang =>
        skills.add(lang.language)
      )
      candidate.technicalSkills.frameworksAndTools.forEach(tool =>
        skills.add(tool.name)
      )
    })

    return Array.from(skills).sort()
  }
)

/**
 * Get all available locations from all candidates
 */
export const allLocationsAtom = atom(
  (get) => {
    const candidates = get(candidatesAtom)
    const locations = new Set<string>()

    Object.values(candidates).forEach(candidate => {
      locations.add(`${candidate.personalInfo.location.city}, ${candidate.personalInfo.location.state}`)
    })

    return Array.from(locations).sort()
  }
)

/**
 * Get all available tags from all candidates
 */
export const allTagsAtom = atom(
  (get) => {
    const candidates = get(candidatesAtom)
    const tags = new Set<string>()

    Object.values(candidates).forEach(candidate => {
      candidate.metadata.tags.forEach(tag => tags.add(tag))
    })

    return Array.from(tags).sort()
  }
)

/**
 * Action atoms - state manipulation functions
 */

/**
 * Add or update a candidate
 */
export const upsertCandidateAtom = atom(
  null,
  (get, set, candidate: Candidate) => {
    const candidates = get(candidatesAtom)
    set(candidatesAtom, {
      ...candidates,
      [candidate.id]: {
        ...candidate,
        metadata: {
          ...candidate.metadata,
          lastUpdated: new Date().toISOString()
        }
      }
    })
  }
)

/**
 * Delete a candidate and related data
 */
export const deleteCandidateAtom = atom(
  null,
  (get, set, candidateId: string) => {
    const candidates = get(candidatesAtom)
    const evaluations = get(candidateEvaluationsAtom)
    const comparisons = get(candidateComparisonsAtom)

    // Remove candidate
    const newCandidates = { ...candidates }
    delete newCandidates[candidateId]
    set(candidatesAtom, newCandidates)

    // Remove related evaluations
    const newEvaluations = { ...evaluations }
    delete newEvaluations[candidateId]
    set(candidateEvaluationsAtom, newEvaluations)

    // Remove from comparisons (filter out comparisons involving this candidate)
    const newComparisons = { ...comparisons }
    Object.keys(newComparisons).forEach(compId => {
      if (newComparisons[compId].candidateIds.includes(candidateId)) {
        delete newComparisons[compId]
      }
    })
    set(candidateComparisonsAtom, newComparisons)

    // Remove from selection
    const selectedIds = get(selectedCandidateIdsAtom)
    set(selectedCandidateIdsAtom, selectedIds.filter(id => id !== candidateId))

    // Clear current candidate if it was deleted
    const currentId = get(currentCandidateIdAtom)
    if (currentId === candidateId) {
      set(currentCandidateIdAtom, null)
    }
  }
)

/**
 * Add evaluation for a candidate
 */
export const addCandidateEvaluationAtom = atom(
  null,
  (get, set, { candidateId, evaluation }: { candidateId: string; evaluation: CandidateEvaluation }) => {
    const evaluations = get(candidateEvaluationsAtom)
    const candidateEvals = evaluations[candidateId] || []
    set(candidateEvaluationsAtom, {
      ...evaluations,
      [candidateId]: [...candidateEvals, evaluation]
    })
  }
)

/**
 * Store comparison result
 */
export const storeComparisonAtom = atom(
  null,
  (get, set, { id, comparison }: { id: string; comparison: CandidateComparison }) => {
    const comparisons = get(candidateComparisonsAtom)
    set(candidateComparisonsAtom, {
      ...comparisons,
      [id]: comparison
    })
    set(selectedComparisonIdAtom, id)
  }
)

/**
 * Reset all filters
 */
export const resetFiltersAtom = atom(
  null,
  (get, set) => {
    set(candidateFiltersAtom, {
      searchTerm: '',
      experienceLevel: [],
      technicalSkills: [],
      location: [],
      personalityType: [],
      tags: []
    })
  }
)

/**
 * Helper function to determine experience level from candidate data
 */
function getExperienceLevel(candidate: Candidate): string {
  const totalExperience = calculateTotalExperience(candidate)

  if (totalExperience < 2) return 'entry'
  if (totalExperience < 4) return 'junior'
  if (totalExperience < 7) return 'mid'
  if (totalExperience < 12) return 'senior'
  if (totalExperience < 20) return 'lead'
  return 'principal'
}

/**
 * Calculate total years of experience from candidate's work history
 */
function calculateTotalExperience(candidate: Candidate): number {
  let totalExperience = 0

  // Add current position experience
  const currentPos = candidate.experience.currentPosition
  const currentStart = new Date(currentPos.startDate)
  const currentEnd = currentPos.endDate ? new Date(currentPos.endDate) : new Date()
  totalExperience += calculateYearsBetween(currentStart, currentEnd)

  // Add previous positions
  candidate.experience.previousPositions.forEach(pos => {
    const start = new Date(pos.startDate)
    const end = new Date(pos.endDate)
    totalExperience += calculateYearsBetween(start, end)
  })

  return totalExperience
}

/**
 * Calculate years between two dates
 */
function calculateYearsBetween(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25)
  return Math.round(diffYears * 10) / 10 // Round to 1 decimal place
}