# KSA (Knowledge, Skills, Abilities) Model Documentation

This document describes the TypeScript models for the KSA evaluation system, which aligns with the frontend examples and supports multi-tenant architecture.

## Model Overview

The KSA evaluation system consists of several interconnected models:

1. **KSAGuidelineDocument** - Core KSA guideline definition
2. **KSAGuidelineTemplateDocument** - Reusable guideline templates
3. **CompanyValuesDocument** - Company-specific values configuration
4. **KSAEvaluationMappingDocument** - Job-specific customizations
5. **CandidateKSADocument** - Candidate evaluation tracking
6. **KSAResponseTemplateDocument** - Response templates
7. **KSABenchmarkDocument** - Benchmark data for comparisons

## Key Features

### Multi-Tenant Support
- All models include `tenantId` for data isolation
- Guidelines can be shared across companies within a tenant
- Company-specific customizations are supported

### Flexible Weighting System
- Supports both fixed weights and ranges (`WeightingRange`)
- Presets for different job levels (senior, manager, director)
- Per-job customization through `KSAEvaluationMapping`

### KSA Structure
The KSA evaluation follows this structure:

```typescript
{
  jobType: "technical" | "business" | ...,
  jobfit: {
    Knowledge: { attribute, questions },
    Skills: { attribute, questions },
    Ability: { attribute, questions }
  },
  valuesFit: {
    "Innovation": { questions },
    "Excellence": { questions },
    ...
  },
  weightingPresets: {
    "senior": { Knowledge, Skills, Ability },
    "manager": { Knowledge, Skills, Ability },
    ...
  }
}
```

### Question Structure
Each question includes:
- Question text and follow-up probes
- Evaluation criteria and expected answers
- Red flag indicators
- Difficulty level

### Company Values Integration
- Values are defined at company level
- Integrated into evaluations through guidelines
- Support for alignment assessment

## Usage Patterns

### 1. Creating a KSA Guideline
```typescript
const guideline: KSAGuidelineDocument = {
  // ... base fields
  jobType: "technical",
  jobfit: {
    Knowledge: {
      attribute: {
        definition: "...",
        evaluationScale: { "1": "...", "10": "..." },
        weighting: { min: 35, max: 45 },
        redFlags: ["..."]
      },
      questions: [{
        id: 1,
        questionText: "...",
        // ... other fields
      }]
    },
    // ... Skills and Ability
  },
  valuesFit: {
    "Innovation": {
      questions: [{
        id: 1,
        questionText: "...",
        sampleIndicators: {
          strongResponse: "...",
          weakResponse: "..."
        }
      }]
    }
  }
};
```

### 2. Customizing for a Job
```typescript
const mapping: KSAEvaluationMappingDocument = {
  // ... base fields
  jobId: "job-123",
  guidelineId: "guideline-456",
  customizations: {
    weightOverrides: {
      "Knowledge": 40,
      "Skills": 35,
      "Ability": 25
    },
    additionalQuestions: {
      category: "Skills",
      questions: [{
        id: 100,
        questionText: "Company-specific question...",
        isCustom: true
      }]
    }
  }
};
```

### 3. Evaluating a Candidate
```typescript
const evaluation: CandidateKSADocument = {
  // ... base fields
  jobFitEvaluation: {
    Knowledge: {
      weight: 40,
      questionResponses: [{
        questionId: 1,
        response: "...",
        score: 8,
        notes: "..."
      }],
      rawScore: 80,
      weightedScore: 32
    },
    // ... Skills and Ability
  },
  valuesFitEvaluation: {
    "Innovation": {
      questionResponses: [...],
      overallAlignment: "strong",
      score: 9
    }
  },
  summary: {
    totalScore: 85,
    recommendation: "advance",
    // ... other fields
  }
};
```

## Integration with Existing Models

### Job Document Integration
The `JobDocument` has been updated to include:
- `ksaGuidelineId` - Reference to KSA guideline
- `evaluationMappingId` - Reference to job-specific customizations

### Evaluation Tracking
Candidate evaluations are stored in `CandidateKSADocument` and linked to:
- Application through `applicationId`
- Pipeline stage through `stageId`
- Evaluator through `evaluatorId`

## Best Practices

### 1. Guideline Design
- Keep questions specific and measurable
- Include clear evaluation criteria
- Define red flags for each KSA attribute
- Use appropriate difficulty levels

### 2. Weight Management
- Use ranges for flexibility
- Provide clear rationale for preset weights
- Consider job requirements when customizing

### 3. Multi-Tenant Considerations
- Guidelines are tenant-scoped
- Companies can share guidelines within a tenant
- Keep company-specific data separate

### 4. Evaluation Quality
- Track quality metrics (completeness, consistency)
- Use response templates for consistency
- Leverage AI assistance for transcription and analysis

## Model Relationships

```
TenantDocument
  └── CompanyDocument
        ├── CompanyValuesDocument
        └── JobDocument
              ├── KSAEvaluationMappingDocument
              └── ApplicationDocument
                    └── CandidateKSADocument

KSAGuidelineDocument
  ├── KSAGuidelineTemplateDocument
  └── KSAEvaluationMappingDocument
        └── CandidateKSADocument

KSABenchmarkDocument
  └── CandidateKSADocument (for percentile comparisons)
```

## Future Enhancements

1. **AI-Powered Evaluation**: Enhanced AI assistance for scoring and analysis
2. **Video Interview Integration**: Support for video-based evaluations
3. **Collaborative Evaluation**: Multiple evaluators with consensus building
4. **Dynamic Weighting**: Adaptive weighting based on candidate responses
5. **Skills Gap Analysis**: Automatic identification of skill gaps