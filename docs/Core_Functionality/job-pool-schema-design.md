# Job Pool System - Database Schema Design

## Current Structure (To Be Changed)
- Jobs have a direct `jobLevelId` field (one-to-one relationship)
- Jobs are created for specific levels
- No reusability across levels

## New Structure

### 1. Update Job Model
- Remove `jobLevelId` field from Job model
- Jobs will exist independently in a pool
- Add fields for job pool management:
  - `isPoolJob` - boolean to identify pool jobs
  - `baseDescription` - base job description that can be customized per level
  - `baseRequirements` - base requirements that can be customized per level

### 2. Create JobLevelAssignment Model (Junction Table)
```prisma
model JobLevelAssignment {
  id             String    @id @default(cuid())
  jobId          String
  jobLevelId     String
  
  // Level-specific customizations
  customTitle    String?   // Override job title for this level
  customDescription String? // Level-specific description
  customRequirements String? // Level-specific requirements
  positionsAvailable Int @default(1) // Number of positions for this job-level combo
  
  // Status and metadata
  isActive       Boolean   @default(true)
  createdBy      String?
  updatedBy      String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  
  // Relations
  job            Job       @relation(fields: [jobId], references: [id], onDelete: Cascade)
  jobLevel       JobLevel  @relation(fields: [jobLevelId], references: [id], onDelete: Cascade)
  createdByUser  User?     @relation("JobLevelAssignmentCreatedBy", fields: [createdBy], references: [id])
  updatedByUser  User?     @relation("JobLevelAssignmentUpdatedBy", fields: [updatedBy], references: [id])
  
  @@unique([jobId, jobLevelId])
  @@index([jobId])
  @@index([jobLevelId])
}
```

### 3. Update Position Model
- Add `jobLevelAssignmentId` to track which job-level combination was used
- This maintains the connection between positions and the specific job-level assignment

## Migration Strategy

### Phase 1: Schema Updates
1. Add new fields to Job model
2. Create JobLevelAssignment model
3. Add relations

### Phase 2: Data Migration
1. For each existing job with a jobLevelId:
   - Create a JobLevelAssignment record
   - Set isPoolJob = false (legacy jobs)
2. Update Position records to reference JobLevelAssignment

### Phase 3: UI Updates
1. Create job pool management interface
2. Update job creation flow
3. Implement job-to-level assignment UI

## Benefits
- **Reusability**: Same job can be used across multiple levels
- **Consistency**: Standardized job titles and base descriptions
- **Flexibility**: Level-specific customizations when needed
- **Scalability**: Easy to add/remove level assignments
- **Maintainability**: Update job once, affects all levels

## UI Flow

### Job Pool Management
1. Create/Edit jobs in the pool (without level assignment)
2. View all pool jobs in a grid/list
3. Assign jobs to one or more levels
4. Customize per-level details if needed

### Position Creation
1. Select a job from the pool
2. Select the level for this position
3. System uses the JobLevelAssignment to get details
4. Create position with the assignment reference