# Algorithm Deployment System - Implementation Plan

## Overview
A comprehensive system for managing algorithm deployment at platform and company levels, with A/B testing capabilities.

## Requirements

### 1. Platform-Wide Default Algorithms
- Three algorithm types: Logistic Regression, Weighted Average, Quadratic Weighted Kappa
- Each type stores: algorithmId + revisionId (version)
- Only logged-in users within an organization can view/manage
- Only one version active per algorithm type at a time
- Once set, can only be replaced (never removed)

### 2. Company-Specific Overrides
- Companies can override platform defaults
- Inherit from platform if not overridden
- Same rules: one per type, replaceable only

### 3. A/B Testing
- Randomize algorithm selection for production testing
- Configure traffic splits between variants
- Track which variant a user sees

## Data Model

```prisma
// Platform-wide algorithm settings
model PlatformAlgorithmSetting {
  id             String           @id @default(cuid())
  algorithmType  AlgorithmType    // WEIGHTED_AVERAGE, QUADRATIC_WEIGHTED_KAPPA, LOGISTIC_REGRESSION
  algorithmId    String
  revisionId     String
  isActive       Boolean          @default(true)
  setBy          String
  setAt          DateTime         @default(now())
  notes          String?          // Reason for this deployment

  algorithm      Algorithm         @relation("PlatformAlgorithmSetting", fields: [algorithmId], references: [id])
  revision       AlgorithmRevision @relation("PlatformRevisionSetting", fields: [revisionId], references: [id])
  setByUser      User             @relation("PlatformAlgorithmSetBy", fields: [setBy], references: [id])

  @@unique([algorithmType])  // Only one active per type
  @@index([algorithmType])
  @@index([isActive])
}

// Company-specific algorithm settings (overrides platform defaults)
model CompanyAlgorithmSetting {
  id             String           @id @default(cuid())
  organizationId String
  algorithmType  AlgorithmType
  algorithmId    String
  revisionId     String
  isActive       Boolean          @default(true)
  setBy          String
  setAt          DateTime         @default(now())
  notes          String?

  organization   Organization      @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  algorithm      Algorithm         @relation("CompanyAlgorithmSetting", fields: [algorithmId], references: [id])
  revision       AlgorithmRevision @relation("CompanyRevisionSetting", fields: [revisionId], references: [id])
  setByUser      User             @relation("CompanyAlgorithmSetBy", fields: [setBy], references: [id])

  @@unique([organizationId, algorithmType])  // Only one active per type per company
  @@index([organizationId])
  @@index([algorithmType])
  @@index([isActive])
}

// A/B Testing configurations
model ABTest {
  id             String           @id @default(cuid())
  name           String
  description    String?
  algorithmType  AlgorithmType
  organizationId String?          // null = platform-wide test
  isActive       Boolean          @default(true)

  // Variants configuration
  // Example: [
  //   { "name": "Control", "algorithmId": "...", "revisionId": "...", "weight": 50 },
  //   { "name": "Variant A", "algorithmId": "...", "revisionId": "...", "weight": 50 }
  // ]
  variants       Json

  startDate      DateTime         @default(now())
  endDate        DateTime?
  createdBy      String
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt

  organization   Organization?    @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  createdByUser  User            @relation("ABTestCreatedBy", fields: [createdBy], references: [id])

  @@index([organizationId])
  @@index([algorithmType])
  @@index([isActive])
}

// Track which variant a user/session sees (for consistent A/B testing)
model ABTestAssignment {
  id             String           @id @default(cuid())
  testId         String
  userId         String?
  sessionId      String?
  variantName    String
  assignedAt     DateTime         @default(now())

  test           ABTest           @relation(fields: [testId], references: [id], onDelete: Cascade)

  @@unique([testId, userId])
  @@unique([testId, sessionId])
  @@index([testId])
  @@index([userId])
  @@index([sessionId])
}
```

## User Model Updates

```prisma
model User {
  // ... existing fields ...

  // Algorithm deployment tracking
  platformAlgorithmsSet    PlatformAlgorithmSetting[]  @relation("PlatformAlgorithmSetBy")
  companyAlgorithmsSet     CompanyAlgorithmSetting[]   @relation("CompanyAlgorithmSetBy")
  abTestsCreated           ABTest[]                    @relation("ABTestCreatedBy")
}
```

## Algorithm & Revision Updates

```prisma
model Algorithm {
  // ... existing fields ...

  platformSettings    PlatformAlgorithmSetting[]  @relation("PlatformAlgorithmSetting")
  companySettings     CompanyAlgorithmSetting[]   @relation("CompanyAlgorithmSetting")
}

model AlgorithmRevision {
  // ... existing fields ...

  platformSettings    PlatformAlgorithmSetting[]  @relation("PlatformRevisionSetting")
  companySettings     CompanyAlgorithmSetting[]   @relation("CompanyRevisionSetting")
}
```

## Organization Updates

```prisma
model Organization {
  // ... existing fields ...

  algorithmSettings   CompanyAlgorithmSetting[]
  abTests             ABTest[]
}
```

## UI Implementation

### Deploy Page (`/admin/algorithms/[id]/deploy`)

Layout:
```
┌─────────────────────────────────────────────┐
│ Current Algorithm: [Name]                   │
│ Type: [LOGISTIC_REGRESSION]                 │
├─────────────────────────────────────────────┤
│                                              │
│ Platform Deployment Status                  │
│ ┌─────────────────────────────────────────┐ │
│ │ ✓ Set as Platform Default                │ │
│ │ Version: v3 (In-Use)                      │ │
│ │ Set by: John Doe on Jan 15, 2025         │ │
│ │ [Change Version] [View Details]          │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ Company Override (Optional)                 │
│ ┌─────────────────────────────────────────┐ │
│ │ Using Platform Default                   │ │
│ │ [Set Company Override]                   │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ A/B Testing                                 │
│ ┌─────────────────────────────────────────┐ │
│ │ No active tests                          │ │
│ │ [Create A/B Test]                        │ │
│ └─────────────────────────────────────────┘ │
│                                              │
└─────────────────────────────────────────────┘
```

### Deployment Flow

**Setting Platform Default:**
1. Button: "Set as Platform Default"
2. Modal opens:
   - Shows current version selector
   - Warning: "This will become the default algorithm for all organizations"
   - Notes field (optional): "Reason for deployment"
   - Requirement checks:
     - Version must be TESTED or IN_USE
     - Cannot deploy UNTESTED versions
   - Confirm button

**Changing Version:**
1. Button: "Change Version"
2. Modal shows:
   - List of all TESTED versions
   - Current version highlighted
   - Warning about impact
   - Notes field
   - Confirm button

**Company Override:**
1. Button: "Set Company Override"
2. Select company (if platform admin) or use current org
3. Select algorithm version
4. Notes field
5. Confirm

**A/B Test Creation:**
1. Button: "Create A/B Test"
2. Multi-step modal:
   - Step 1: Test details (name, description, duration)
   - Step 2: Select variants (2-4 versions)
   - Step 3: Set traffic split (percentage sliders)
   - Step 4: Target (platform-wide or specific company)
   - Step 5: Review and confirm

## Backend API

### tRPC Routes

```typescript
// Platform deployment
algorithms.deploy.setPlatformDefault
algorithms.deploy.getPlatformSettings
algorithms.deploy.replacePlatformVersion

// Company deployment
algorithms.deploy.setCompanyOverride
algorithms.deploy.getCompanySettings
algorithms.deploy.replaceCompanyVersion
algorithms.deploy.removeCompanyOverride

// A/B Testing
algorithms.abtest.create
algorithms.abtest.list
algorithms.abtest.get
algorithms.abtest.update
algorithms.abtest.end
algorithms.abtest.getActiveVariant

// Resolution (which algorithm to use)
algorithms.resolve.getAlgorithm  // Returns correct algorithm based on user/company/A/B test
```

## Security & Permissions

- **Platform Default:** Only super admins can set
- **Company Override:** Company admins only
- **A/B Tests:** Admins can create
- **View Settings:** All authenticated users in org can view
- **Deployment requires:** Algorithm must be TESTED or IN_USE

## Algorithm Resolution Logic

Priority order:
1. Active A/B test assignment (if user is in test)
2. Company-specific override
3. Platform default
4. Fallback to null (no algorithm set)

## Migration Strategy

1. Add new models to schema
2. Create migration
3. Build backend API
4. Create UI components
5. Add deploy page
6. Test thoroughly
7. Deploy to production

## Testing Checklist

- [ ] Can set platform default
- [ ] Can only replace, not remove
- [ ] Can set company override
- [ ] Company override takes precedence
- [ ] Can remove company override to use platform default
- [ ] Can create A/B test
- [ ] A/B test assignment is consistent per user
- [ ] A/B test takes highest priority
- [ ] Cannot deploy UNTESTED versions
- [ ] Permissions work correctly
- [ ] UI is intuitive and clear
