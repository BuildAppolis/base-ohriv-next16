/**
 * Database Models Barrel Export
 * Provides clean imports for all database models and types
 *
 * This file re-exports all models organized by domain:
 * - Core: Base interfaces and common types
 * - Enums: All enums and constants organized by domain
 * - Tenant: Tenant management, users, and memberships
 * - Recruitment: Companies, jobs, candidates, and applications
 * - Evaluation: Evaluation guidelines, stages, and skills
 * - KSA: Knowledge, Skills, and Abilities evaluation models
 * - Analytics: Reports, metrics, and trends
 */

// Core types and interfaces
export * from './core';

// All enums organized by domain
export * from './enums';

// Domain-specific models
export * from './tenant';
export * from './recruitment';
export * from './evaluation';
export * from './ksa';
export * from './analytics';

// Legacy exports for backward compatibility
// These are kept to avoid breaking existing imports
// TODO: Update all imports to use the new organized structure
export * as LegacyModels from './tenant-models';
export * as LegacyRecruitmentModels from './recruitment-models';
export * as LegacyEvaluationModels from './evaluation-models';
export * as LegacyKSAModels from './ksa-guideline-models';
export * as LegacyCandidateEvaluationModels from './candidate-evaluation-models';
export * as LegacyAnalyticsModels from './analytics-models';