# Database Models Organization

This directory contains all RavenDB document models and types for the Ohriv platform. The models have been reorganized for better maintainability, reduced coupling, and improved developer experience.

## 📁 Directory Structure

```
models/
├── index.ts                    # Main barrel export
├── README.md                   # This documentation
├── core/                       # Core, reusable types
│   ├── index.ts               # Core exports
│   ├── base.ts                # RavenDocument, base interfaces
│   └── common.ts              # Common utility types
├── enums/                      # All enums organized by domain
│   ├── index.ts               # Enum exports
│   ├── job.ts                 # Job-related enums
│   ├── evaluation.ts          # Evaluation-related enums
│   ├── user.ts                # User-related enums
│   └── system.ts              # System enums
├── tenant/                     # Tenant domain
│   ├── index.ts
│   ├── tenant.ts              # Tenant, Partner, TenantConfig
│   └── membership.ts          # User, UserMembership
├── recruitment/               # Recruitment domain
│   ├── index.ts
│   ├── company.ts             # Company document
│   ├── job.ts                 # Job document
│   ├── candidate.ts           # Candidate document
│   └── application.ts         # Application document
├── evaluation/                # Evaluation domain
│   ├── index.ts
│   ├── guidelines.ts          # EvaluationGuideline, templates
│   ├── stages.ts              # StageEvaluation, scoring
│   └── skills.ts              # SkillAssessment, rubrics
├── ksa/                       # KSA-specific domain
│   ├── index.ts
│   ├── ksa-guidelines.ts      # KSAGuideline, templates
│   ├── ksa-evaluations.ts     # CandidateKSADocument
│   └── ksa-types.ts           # KSAAttribute, Category types
└── analytics/                 # Analytics domain
    ├── index.ts
    ├── reports.ts             # AnalyticsReport, DashboardWidget
    ├── metrics.ts             # PipelineAnalytics, SourceAnalytics
    └── trends.ts              # TrendAnalytics
```

## 🏗️ Architecture Principles

### 1. **Domain-Driven Design**
Models are organized by business domain, not technical layers. Each domain represents a bounded context with its own types and interfaces.

### 2. **Dependency Flow**
Dependencies flow in one direction:
```
Core → Enums → Domain Types → Composite Types
```

### 3. **Single Responsibility**
Each file has a single responsibility:
- Core: Base interfaces and common utilities
- Enums: Constants and enumerations
- Domains: Business logic and data structures

### 4. **Explicit Dependencies**
All imports are explicitly declared at the top of each file. No circular dependencies are allowed.

## 📦 Import Patterns

### Recommended Imports

```typescript
// Import specific types (recommended for large files)
import { CompanyDocument, JobDocument } from '@/packages/database/src/models/recruitment';
import { JobLevel, EmploymentType } from '@/packages/database/src/models/enums/job';

// Import entire domain (small domains)
import * as TenantModels from '@/packages/database/src/models/tenant';

// Import from barrel (convenient for multiple domains)
import {
  CompanyDocument,
  JobDocument,
  CandidateDocument,
  JobLevel,
  EmploymentType,
  UserStatus
} from '@/packages/database/src/models';
```


## 📝 Type Usage Guidelines

### 1. **Use Type Exports**
Always use type exports for interfaces and types:

```typescript
// ✅ Good
export type { CompanyDocument } from './company';
export interface JobDocument extends BaseDocument {}

// ❌ Avoid
export { CompanyDocument, JobDocument } from './models';
```

### 2. **Prefer Composition over Inheritance**
Use composition patterns for complex types:

```typescript
// ✅ Good - Composition
interface JobDocument extends CompanyScopedDocument, AuditableDocument {
  jobId: string;
  jobDetails: JobDetails;
}

// ❌ Avoid - Deep inheritance
interface JobDocument extends BaseJobDocument, DetailedJobDocument, AdvancedJobDocument {}
```

### 3. **Document Complex Types**
Add JSDoc comments for complex interfaces:

```typescript
/**
 * Represents a job posting with all its details, requirements, and evaluation criteria
 *
 * @example
 * const job: JobDocument = {
 *   jobId: "job-123",
 *   title: "Senior Software Engineer",
 *   level: JobLevel.Senior,
 *   // ...
 * };
 */
export interface JobDocument extends CompanyScopedDocument, AuditableDocument {
  // ...
}
```

## 🚀 Best Practices

### 1. **Consistent Naming**
- Document interfaces end with "Document"
- Type exports use PascalCase
- Enums use PascalCase
- Constants use camelCase

### 2. **Version Compatibility**
When modifying existing documents:
- Add optional new fields
- Never remove required fields
- Mark deprecated fields with `@deprecated`

### 3. **Validation**
Use runtime validation for document creation:

```typescript
import { validateDocument } from '../utils/validation';

const job = validateDocument<JobDocument>(jobData);
```

### 4. **Testing**
Each domain should have corresponding tests:
- Unit tests for type validators
- Integration tests for document operations
- Mock factories for test data

## 🔍 Common Patterns

### 1. **Base Documents**
Most documents extend base interfaces:

```typescript
// Tenant-scoped document
interface JobDocument extends CompanyScopedDocument, AuditableDocument {}

// Simple document
interface NoteDocument extends RavenDocument, AuditableDocument {}
```

### 2. **Status Enums**
Status enums follow pattern:
```typescript
export enum DocumentStatus {
  Draft = "draft",
  Active = "active",
  Archived = "archived",
}
```

### 3. **Metadata Objects**
Common metadata patterns:
```typescript
interface Metadata {
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number;
  isActive: boolean;
}
```

### 4. **Collection Names**
Use the `collections` constant for type safety:
```typescript
import { collections } from '../enums/system';
const collectionName = collections.jobs; // Type: "jobs"
```

## 🐛 Troubleshooting

### Common Issues

1. **Import Errors**
   - Check file path is correct
   - Verify export exists in index.ts
   - Ensure TypeScript is restarted

2. **Type Conflicts**
   - Use namespace imports for conflicting names
   - Rename exports with `as` keyword
   - Check for duplicate exports in index.ts

3. **Circular Dependencies**
   - Move shared types to core/ directory
   - Use type-only imports (`import type`)
   - Refactor to reduce coupling

### Getting Help

1. Check this documentation first
2. Look at existing patterns in the codebase
3. Ask in the team chat with specific error messages
4. Create an issue with reproduction steps