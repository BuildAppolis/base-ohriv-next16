# V2 KSA Architecture Proposal

**Created:** 2025-01-23
**Status:** Planning Phase
**Goal:** Transform from generic attributes to industry-standard KSA framework with company values

---

## Executive Summary

V2 introduces a **Knowledge-Skills-Abilities (KSA)** competency framework that:
- Uses industry-standard terminology while allowing company customization
- Separates role competencies from universal company values
- Implements dual scoring (Role Fit + Cultural Fit)
- Provides core KSA templates while supporting custom additions
- Enables 1-15 minute AI-powered onboarding with context awareness

---

## Current State vs V2 Vision

### Current (V1)
```
Generic "Attributes" → Questions → Weights → Scoring
```

**Problems:**
- No semantic structure (what IS an attribute?)
- All attributes treated equally (role competencies mixed with values)
- Company context discarded after generation
- No industry standards for grading consistency
- Brilliant assholes can pass (high role fit, poor culture fit)

### V2 Vision
```
Company Context (stored)
  ↓
Core KSA Library (industry templates)
  ↓
Customized Competencies (company naming)
  ↓
Company Values (universal requirements)
  ↓
Jobs with weighted KSAs
  ↓
Stage-based evaluation
  ↓
Dual Scoring (Role Fit + Culture Fit)
  ↓
Recommendations (hire, reject, different role)
```

---

## Data Model Design

### 1. Organization Context Storage

```prisma
model Organization {
  id String @id @default(cuid())

  // ... existing fields

  // AI-extracted context (stored for future use)
  aiContext Json? // Full context from AI analysis
  industry String?
  subIndustry String?
  companySize String?
  companyStage String?
  techStack String[]
  businessModel String?

  // Culture extracted from context
  cultureValues String[] // e.g., ["Transparency", "Innovation"]
  culturePace String? // Fast-paced, Moderate, Steady
  cultureStructure String? // Flexible, Structured

  // Terminology customization
  competencyTerminology Json? // { singular: "Competency", plural: "Competencies", description: "..." }

  contextLastUpdated DateTime?
  contextConfidence Float? // AI confidence score
}
```

### 2. Enhanced Attribute Model (KSA)

```prisma
model Attribute {
  id String @id @default(cuid())
  organizationId String

  // Existing fields
  name String
  description String
  icon String?
  color String?
  isArchived Boolean @default(false)

  // NEW: KSA categorization
  category CompetencyCategory
  isCore Boolean @default(false) // Industry-standard vs custom
  coreTemplateId String? // Reference to core library
  customDisplayName String? // Company's preferred name

  // NEW: Parenting for complex competencies
  parentAttributeId String?
  parentAttribute Attribute? @relation("AttributeHierarchy", fields: [parentAttributeId], references: [id])
  subAttributes Attribute[] @relation("AttributeHierarchy")

  // NEW: Scoring scale configuration
  scoringScale Json? // { min: 1, max: 10, levels: [...] }
  scoringAnchors Json? // { level1: { description, characteristics }, ... }

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id])

  @@index([organizationId])
  @@index([category])
  @@index([isCore])
}

enum CompetencyCategory {
  KNOWLEDGE // What you need to know
  SKILL // What you can do
  ABILITY // How you work
  VALUE // Universal company requirement
}
```

### 3. Core KSA Template Library

```prisma
model CoreCompetencyTemplate {
  id String @id @default(cuid())

  name String
  description String
  category CompetencyCategory

  // Industry/role targeting
  industries String[] // ["Technology", "Healthcare", "Finance"]
  roles String[] // ["Engineer", "Manager", "Designer"]
  seniorityLevels String[] // ["Junior", "Mid", "Senior", "Staff"]

  // Sub-competencies
  subCompetencies Json[] // [{ name, description }]

  // Default scoring
  defaultScoringScale Json
  defaultAnchors Json

  // Usage tracking
  usageCount Int @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([category])
  @@index([industries])
  @@index([roles])
}
```

### 4. Company Values Integration

```prisma
model CompanyValue {
  id String @id @default(cuid())
  organizationId String

  name String // e.g., "Transparency"
  description String // What this value means to the company

  // Automatically create as VALUE attribute
  attributeId String @unique
  attribute Attribute @relation(fields: [attributeId], references: [id])

  // Evaluation criteria
  evaluationCriteria Json // How to assess this value in candidates

  // Weight (values have their own weighting separate from role competencies)
  weight Float @default(10.0) // Typically 10-20% of total score

  isActive Boolean @default(true)
  order Int @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id])

  @@index([organizationId])
}
```

### 5. Enhanced Job with KSA Weights

```prisma
model Job {
  id String @id @default(cuid())
  organizationId String

  // ... existing fields

  // NEW: KSA weight overrides per level
  levelWeightOverrides Json? // { levelId: { attributeId: weight } }

  // Values are always evaluated but weighted separately
  includeValuesEvaluation Boolean @default(true)
}

model AttributeWeight {
  id String @id @default(cuid())

  jobId String?
  levelId String?
  attributeId String

  weight Float // Must sum to 100 within category
  isLocked Boolean @default(false) // UI: locked weights don't auto-adjust

  // NEW: Category weighting
  // e.g., Knowledge: 40%, Skills: 40%, Abilities: 20%
  categoryWeight Float?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  job Job? @relation(fields: [jobId], references: [id])
  level JobLevel? @relation(fields: [levelId], references: [id])
  attribute Attribute @relation(fields: [attributeId], references: [id])

  @@unique([jobId, levelId, attributeId])
  @@index([jobId])
  @@index([levelId])
  @@index([attributeId])
}
```

### 6. Enhanced Scoring with Anchors

```prisma
model CandidateScore {
  id String @id @default(cuid())
  candidateId String
  attributeId String
  stageId String?

  score Float // 1-10 or 1-5 depending on scale
  normalizedScore Float // Always 0-100 for comparison

  // NEW: Scoring context
  anchorLevel String? // Which anchor was referenced
  transcript String? @db.Text // Pasted interview transcript
  aiAnalysis Json? // If AI processed transcript

  scoredBy String // userId
  scoredAt DateTime @default(now())

  notes String? @db.Text

  candidate Candidate @relation(fields: [candidateId], references: [id])
  attribute Attribute @relation(fields: [attributeId], references: [id])
  stage Stage? @relation(fields: [stageId], references: [id])
  scorer User @relation(fields: [scoredBy], references: [id])

  @@index([candidateId])
  @@index([attributeId])
  @@index([stageId])
}

model CandidateEvaluation {
  id String @id @default(cuid())
  candidateId String

  // Dual scoring
  roleScore Float // Weighted average of KSA scores
  cultureScore Float // Weighted average of VALUE scores
  overallScore Float // Combined with configurable ratio

  // Recommendations
  recommendation EvaluationRecommendation
  recommendationReason String? @db.Text
  alternativeRole String? // Suggest different role if mismatch

  // Flags
  isBrilliantAsshole Boolean @default(false) // High role, low culture
  isGreatCultureFit Boolean @default(false) // Low role, high culture

  completedAt DateTime?

  candidate Candidate @relation(fields: [candidateId], references: [id])

  @@index([candidateId])
}

enum EvaluationRecommendation {
  STRONG_HIRE // High role + culture
  HIRE // Good fit
  MAYBE // Borderline
  REJECT // Poor fit
  DIFFERENT_ROLE // Wrong role, but good candidate
  CULTURE_CONCERN // Good role fit, poor culture fit
}
```

---

## Scoring System V2

### Configurable Scales

**5:2 Bucket Chunks** (Justin's hybrid)
```
1-2 "Unable to perform job duties'
3-4 'Able to perform job duties with much handholding, training, and coaching'
5-6 'Able to perform job with minimal guidance
7-8 'Able to perform job and positively impact the performance of peers'
9-10 'Transforms the way the team delivers'
```

### Scoring Anchors

**Not Examples** - Characteristics, not specific responses
```json
{
  "level1": {
    "label": "Can't do it",
    "characteristics": [
      "Unable to articulate understanding of concept",
      "No relevant experience or knowledge",
      "Would require extensive training"
    ]
  },
  "level3": {
    "label": "Can do it",
    "characteristics": [
      "Demonstrates solid understanding",
      "Can complete tasks independently",
      "Meets baseline expectations"
    ]
  },
  "level5": {
    "label": "Can transform it",
    "characteristics": [
      "Deep expertise and innovative thinking",
      "Can teach and mentor others",
      "Identifies improvements to systems/processes"
    ]
  }
}
```

### UI Implementation

**Slider with Smart Anchors:**
- Draggable 1-10 slider
- JS popover shows anchor at current position
- Must view anchor before finalizing score
- Visual chunking: color-coded zones
- Lock icon to prevent auto-adjustment

---

## AI-Powered Onboarding Flow

### 15-Minute Goal

**Current Time:** 2-4 hours manual setup
**Target:** 15 minutes with AI assistance
**Achieved By:** Context awareness, templates, smart defaults

### Enhanced Flow

```
MINUTE 0-3: Company Context (Enhanced)
- AI: "Tell me about your company"
- User: Natural language description
- AI: Extracts context + STORES IT
- AI: "I see you're in [industry]. I'll use best practices for [industry] hiring."

MINUTE 3-5: Values Extraction
- AI: "I noticed you value [transparency, innovation]. Should these be evaluated in every hire?"
- User: Confirms/edits values
- AI: Creates VALUE attributes automatically

MINUTE 5-8: First Role Setup
- AI: "What role are you hiring for?"
- User: "Senior Full-Stack Developer"
- AI: Generates KSAs from CORE LIBRARY
  - Knowledge: React, Node.js, PostgreSQL (from tech stack)
  - Skills: Full-stack development, System design
  - Abilities: Problem-solving, Learning agility
- AI: Suggests weights based on seniority

MINUTE 8-12: Review & Customize
- AI: Shows generated setup
- User: Can rename competencies
  - "Technical Expertise" → "Engineering Excellence"
- User: Adjusts weights with smart sliders
- User: Reviews sample questions

MINUTE 12-15: Finalize & Activate
- AI: Creates job levels
- AI: Assigns questions to stages
- User: Confirms and activates
```

### Context-Aware Generation

**Before V2:**
```typescript
generateAttributes(roleTitle) // Generic output
```

**V2:**
```typescript
generateAttributes(
  roleTitle,
  companyContext, // Industry, size, stage, values
  coreLibrary, // Pre-validated templates
  similarCompanies // Learn from others in industry
)
```

**Benefits:**
- Industry-specific competencies
- Tech-stack aware questions
- Culture-aligned values
- Faster, higher quality output

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
**Goal:** Store and utilize company context

✅ Tasks:
- Add `aiContext` to Organization model
- Store context after generation
- Display context in org settings
- Allow manual editing

### Phase 2: KSA Categorization (Weeks 3-4)
**Goal:** Introduce competency categories

✅ Tasks:
- Add `category` field to Attribute
- Create `CompetencyCategory` enum
- Update AI generators to use categories
- UI: Category filters and grouping

### Phase 3: Core Library (Weeks 5-7)
**Goal:** Build industry-standard templates

✅ Tasks:
- Create `CoreCompetencyTemplate` model
- Seed with 50-100 templates across industries/roles
- Build template browser UI
- AI: Match templates during generation

### Phase 4: Terminology Customization (Week 8)
**Goal:** Companies rename competencies

✅ Tasks:
- Add terminology settings to org
- Update all UI to use custom terms
- Attribute aliases (core name + custom display name)

### Phase 5: Company Values (Weeks 9-10)
**Goal:** Separate values from role competencies

✅ Tasks:
- Create `CompanyValue` model
- Extract values from company context
- Auto-create VALUE attributes
- Separate scoring section

### Phase 6: Enhanced Scoring (Weeks 11-13)
**Goal:** Anchors, scales, dual scoring

✅ Tasks:
- Configurable scoring scales
- Anchor system (characteristics, not examples)
- Slider UI with smart popovers
- Lock mechanism for weights
- Dual scoring (role + culture)
- Recommendation engine

### Phase 7: Full Automation (Weeks 14-16)
**Goal:** 15-minute onboarding

✅ Tasks:
- Enhanced AI prompts with context
- Template matching algorithm
- Smart defaults based on industry
- Conversational refinement
- One-click activation

---

## Success Metrics

### Quantitative
- ⏱️ Onboarding time: < 15 minutes (from 2-4 hours)
- ✅ Setup completion: 98%+ (from ~60%)
- 🎯 Competency quality score: > 90/100
- 📊 Template adoption: 80%+ use core templates
- 🔄 Context reuse: 90%+ reuse stored context

### Qualitative
- 💬 "AI understood my company perfectly"
- 🎓 "Industry-standard competencies saved me research time"
- 🎨 "Love that I can customize terminology"
- 🚫 "Finally caught brilliant asshole candidates"
- ⚡ "Was interviewing candidates same day I signed up"

---

## Risk Mitigation

### Risk: Core templates too generic
**Mitigation:**
- Build with IO psychologist consultation
- A/B test generic vs specific
- Community contributions
- Regular updates based on usage

### Risk: Companies confused by KSA terminology
**Mitigation:**
- Default to "Competencies" (familiar term)
- Help text explains K/S/A breakdown
- Can ignore categories if not relevant
- Progressive disclosure (simple → advanced)

### Risk: Dual scoring too complex
**Mitigation:**
- Default to simple overall score
- Advanced users can enable dual scoring
- Clear visualization (role vs culture quadrant)
- Recommendations make it actionable

---

## Future Vision (Post-V2)

### Machine Learning Integration
- Learn optimal weights from successful hires
- Predict candidate success based on historical data
- Auto-adjust competencies based on performance reviews
- Recommend interview questions based on answer quality

### ATS Integration
- Auto-import candidates at "recruiter screen" stage
- Push scores/recommendations back to ATS
- Sync job descriptions
- Calendar integration for interview scheduling

### AI Interview Assistant
- Real-time transcript during video interviews
- Auto-score based on responses
- Suggest follow-up questions
- Generate post-interview summary

### Marketplace
- Community template library
- Industry-specific question packs
- Best practices from top companies
- Certification for quality templates

---

**End of Document**
