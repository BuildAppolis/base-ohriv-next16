/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Simplified Candidate Management State Atoms
 *
 * Jotai-based state management for the fixed candidate pool system.
 * Only manages 10 candidates with basic information and evaluations.
 */

import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { FIXED_CANDIDATES, SimpleCandidate } from "@/lib/candidate-generator";
import { CandidateEvaluation } from "@/types/candidate";

/**
 * Primary candidate storage atom
 * Fixed pool of 10 candidates - no generation or removal
 */
export const candidatesAtom = atom<Record<string, SimpleCandidate>>(
  FIXED_CANDIDATES.reduce((acc, candidate) => {
    acc[candidate.id] = candidate;
    return acc;
  }, {} as Record<string, SimpleCandidate>)
);

/**
 * Candidate evaluations storage atom
 * Stores all evaluation results linked to specific candidates
 */
export const candidateEvaluationsAtom = atomWithStorage<
  Record<string, CandidateEvaluation[]>
>("candidateEvaluations", {});

/**
 * Candidate job evaluations tracking atom
 * Tracks which jobs each candidate has been evaluated for
 */
export const candidateJobEvaluationsAtom = atomWithStorage<
  Record<string, string[]>
>("candidateJobEvaluations", {});

/**
 * Current selection atoms
 * Track currently selected candidates and UI state
 */
export const selectedCandidateIdsAtom = atom<string[]>([]);

export const currentCandidateIdAtom = atom<string | null>(null);

export const selectedEvaluationIdAtom = atom<string | null>(null);

/**
 * UI state atoms
 * Manage interface state and view preferences
 */
export const candidateViewModeAtom = atom<"grid" | "list">("grid");

export const candidateFiltersAtom = atom<{
  searchTerm: string;
  ageRange: [number, number];
}>({
  searchTerm: "",
  ageRange: [18, 50],
});

export const sortByAtom = atom<{
  field: "firstName" | "lastName" | "age";
  direction: "asc" | "desc";
}>({
  field: "firstName",
  direction: "asc",
});

/**
 * Get current candidate object from ID
 */
export const currentCandidateAtom = atom((get) => {
  const candidateId = get(currentCandidateIdAtom);
  const candidates = get(candidatesAtom);
  return candidateId ? candidates[candidateId] : null;
});

/**
 * Get filtered candidates based on current filters
 */
export const filteredCandidatesAtom = atom((get) => {
  const candidates = get(candidatesAtom);
  const filters = get(candidateFiltersAtom);
  const sortBy = get(sortByAtom);

  let candidateList = Object.values(candidates);

  // Apply search term filter
  if (filters.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase();
    candidateList = candidateList.filter(
      (candidate) =>
        candidate.firstName.toLowerCase().includes(searchLower) ||
        candidate.lastName.toLowerCase().includes(searchLower)
    );
  }

  // Apply age range filter
  candidateList = candidateList.filter(
    (candidate) =>
      candidate.age >= filters.ageRange[0] &&
      candidate.age <= filters.ageRange[1]
  );

  // Apply sorting
  candidateList.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy.field) {
      case "firstName":
        aValue = a.firstName;
        bValue = b.firstName;
        break;
      case "lastName":
        aValue = a.lastName;
        bValue = b.lastName;
        break;
      case "age":
        aValue = a.age;
        bValue = b.age;
        break;
    }

    if (aValue < bValue) return sortBy.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortBy.direction === "asc" ? 1 : -1;
    return 0;
  });

  return candidateList;
});

/**
 * Get candidate count (always 10)
 */
export const candidateCountAtom = atom(() => 10);

/**
 * Get selected candidates objects
 */
export const selectedCandidatesAtom = atom((get) => {
  const selectedIds = get(selectedCandidateIdsAtom);
  const candidates = get(candidatesAtom);
  return selectedIds.map((id) => candidates[id]).filter(Boolean);
});

/**
 * Get evaluations for current candidate
 */
export const currentCandidateEvaluationsAtom = atom((get) => {
  const candidateId = get(currentCandidateIdAtom);
  const evaluations = get(candidateEvaluationsAtom);
  return candidateId ? evaluations[candidateId] || [] : [];
});

/**
 * Get job evaluations for current candidate
 */
export const currentCandidateJobEvaluationsAtom = atom((get) => {
  const candidateId = get(currentCandidateIdAtom);
  const jobEvaluations = get(candidateJobEvaluationsAtom);
  return candidateId ? jobEvaluations[candidateId] || [] : [];
});

/**
 * Action atoms - state manipulation functions
 */

/**
 * Add evaluation for a candidate
 */
export const addCandidateEvaluationAtom = atom(
  null,
  (
    get,
    set,
    {
      candidateId,
      evaluation,
    }: { candidateId: string; evaluation: CandidateEvaluation }
  ) => {
    const evaluations = get(candidateEvaluationsAtom);
    const candidateEvals = evaluations[candidateId] || [];
    set(candidateEvaluationsAtom, {
      ...evaluations,
      [candidateId]: [...candidateEvals, evaluation],
    });
  }
);

/**
 * Track job evaluation for a candidate
 */
export const trackCandidateJobEvaluationAtom = atom(
  null,
  (
    get,
    set,
    { candidateId, jobTitle }: { candidateId: string; jobTitle: string }
  ) => {
    const jobEvaluations = get(candidateJobEvaluationsAtom);
    const candidateJobs = jobEvaluations[candidateId] || [];

    // Add job if not already tracked
    if (!candidateJobs.includes(jobTitle)) {
      set(candidateJobEvaluationsAtom, {
        ...jobEvaluations,
        [candidateId]: [...candidateJobs, jobTitle],
      });
    }
  }
);

/**
 * Clear all evaluations for a candidate
 */
export const clearCandidateEvaluationsAtom = atom(
  null,
  (get, set, candidateId: string) => {
    const evaluations = get(candidateEvaluationsAtom);
    const newEvaluations = { ...evaluations };
    delete newEvaluations[candidateId];
    set(candidateEvaluationsAtom, newEvaluations);
  }
);

/**
 * Reset all filters
 */
export const resetFiltersAtom = atom(null, (get, set) => {
  set(candidateFiltersAtom, {
    searchTerm: "",
    ageRange: [18, 50],
  });
});
