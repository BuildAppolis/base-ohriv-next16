/**
 * Simple KSA Evaluation State Atoms
 * Basic storage for manual KSA scoring
 */

import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// Simple KSA score type for manual input
export interface SimpleKSAScore {
  id: string
  candidateId: string
  jobTitle: string
  evaluationDate: string

  // Basic scores (manually inputted)
  knowledge: number // 1-10
  skills: number // 1-10
  abilities: number // 1-10
  overall: number // 1-10

  // Simple recommendation
  recommendation: 'strong-recommend' | 'recommend' | 'consider' | 'reject'
}

// Atom to store all KSA scores
export const ksaScoresAtom = atomWithStorage<Record<string, SimpleKSAScore>>('ksaScores', {})

// Atom to get scores for a specific candidate
export const candidateKSAScoresAtom = atom(
  (get) => (candidateId: string) => {
    const scores = get(ksaScoresAtom)
    return Object.values(scores).filter(score => score.candidateId === candidateId)
  }
)

// Atom to get scores for a specific job
export const jobKSAScoresAtom = atom(
  (get) => (jobTitle: string) => {
    const scores = get(ksaScoresAtom)
    return Object.values(scores).filter(score => score.jobTitle === jobTitle)
  }
)

// Simple action to add/update a KSA score
export const addKSAScoreAtom = atom(
  null,
  (get, set, score: SimpleKSAScore) => {
    const scores = get(ksaScoresAtom)
    set(ksaScoresAtom, {
      ...scores,
      [score.id]: score
    })
  }
)

// Simple action to delete a KSA score
export const deleteKSAScoreAtom = atom(
  null,
  (get, set, scoreId: string) => {
    const scores = get(ksaScoresAtom)
    const newScores = { ...scores }
    delete newScores[scoreId]
    set(ksaScoresAtom, newScores)
  }
)