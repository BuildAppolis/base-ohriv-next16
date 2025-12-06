/**
 * Fixed Candidate Pool for Evaluation System
 *
 * Only 10 candidates with basic information: ID, first name, last name, and age (18-50)
 */

import { nanoid } from "nanoid";

export interface SimpleCandidate {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
}

/**
 * Fixed pool of 10 candidates for evaluation
 */
export const FIXED_CANDIDATES: SimpleCandidate[] = [
  {
    id: "candidate-001",
    firstName: "Sarah",
    lastName: "Johnson",
    age: 28,
  },
  {
    id: "candidate-002",
    firstName: "Michael",
    lastName: "Chen",
    age: 35,
  },
  {
    id: "candidate-003",
    firstName: "Emily",
    lastName: "Rodriguez",
    age: 24,
  },
  {
    id: "candidate-004",
    firstName: "James",
    lastName: "Wilson",
    age: 42,
  },
  {
    id: "candidate-005",
    firstName: "Maria",
    lastName: "Garcia",
    age: 31,
  },
  {
    id: "candidate-006",
    firstName: "David",
    lastName: "Taylor",
    age: 19,
  },
  {
    id: "candidate-007",
    firstName: "Jennifer",
    lastName: "Anderson",
    age: 47,
  },
  {
    id: "candidate-008",
    firstName: "Robert",
    lastName: "Martinez",
    age: 36,
  },
  {
    id: "candidate-009",
    firstName: "Lisa",
    lastName: "Thomas",
    age: 22,
  },
  {
    id: "candidate-010",
    firstName: "William",
    lastName: "Brown",
    age: 50,
  },
];

/**
 * Get all fixed candidates
 */
export function getAllCandidates(): SimpleCandidate[] {
  return FIXED_CANDIDATES;
}

/**
 * Generate a simple candidate with basic info and scores
 */
export function generateCandidate(): SimpleCandidate {
  // For compatibility, return a random candidate from the fixed pool
  const randomIndex = Math.floor(Math.random() * FIXED_CANDIDATES.length);
  return { ...FIXED_CANDIDATES[randomIndex], id: nanoid() };
}

/**
 * Get candidate by ID
 */
export function getCandidateById(id: string): SimpleCandidate | null {
  return FIXED_CANDIDATES.find((candidate) => candidate.id === id) || null;
}
