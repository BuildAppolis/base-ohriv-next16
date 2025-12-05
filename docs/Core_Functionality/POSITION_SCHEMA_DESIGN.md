# Position & Compensation Schema Design

## Overview
The Position model bridges Jobs and Candidates, allowing companies to create multiple openings for a single job posting with flexible compensation structures.

## Position Model Schema

```prisma
model Position {
  id                String           @id @default(cuid())
  jobId             String
  job               Job              @relation(fields: [jobId], references: [id], onDelete: Cascade)
  
  // Position Details
  title             String?          // Override job title if needed
  positionNumber    String?          // e.g., "ENG-2024-001"
  status            PositionStatus   @default(OPEN)
  
  // Employment Details
  employmentType    EmploymentType   // FULL_TIME, PART_TIME, CONTRACT, TEMPORARY, INTERNSHIP
  workSchedule      WorkSchedule     // STANDARD, FLEXIBLE, SHIFT, CUSTOM
  remote            RemoteType       // ONSITE, HYBRID, REMOTE
  location          String?          // Physical location if applicable
  
  // Compensation Structure
  compensationType  CompensationType // SALARY, HOURLY, CONTRACT, COMMISSION, STIPEND
  
  // Salary-based fields
  salaryMin         Decimal?         @db.Decimal(10, 2)
  salaryMax         Decimal?         @db.Decimal(10, 2)
  salaryPeriod      SalaryPeriod?    // ANNUAL, MONTHLY, BIWEEKLY, WEEKLY
  
  // Hourly-based fields
  hourlyRateMin     Decimal?         @db.Decimal(10, 2)
  hourlyRateMax     Decimal?         @db.Decimal(10, 2)
  hoursPerWeek      Int?             // Expected hours
  overtimeEligible  Boolean          @default(false)
  overtimeRate      Decimal?         @db.Decimal(10, 2) // 1.5x, 2x, etc.
  
  // Contract-based fields
  contractValue     Decimal?         @db.Decimal(10, 2)
  contractDuration  Int?             // in days
  contractType      ContractType?    // FIXED_PRICE, TIME_MATERIALS, RETAINER
  
  // Benefits & Perks
  benefits          Json?            // Flexible JSON for various benefits
  hasHealthInsurance Boolean         @default(false)
  hasDentalInsurance Boolean         @default(false)
  hasVisionInsurance Boolean         @default(false)
  has401k           Boolean          @default(false)
  matchPercentage   Int?             // 401k match percentage
  ptodays           Int?             // Paid time off days
  sickDays          Int?
  holidays          Json?            // Company holidays
  
  // Additional Compensation
  bonusStructure    Json?            // Performance bonus details
  equityOffered     Boolean          @default(false)
  equityDetails     Json?            // Stock options, RSUs, etc.
  signingBonus      Decimal?         @db.Decimal(10, 2)
  relocationAssist  Boolean          @default(false)
  relocationBudget  Decimal?         @db.Decimal(10, 2)
  
  // Schedule Details
  startDate         DateTime?        // Desired start date
  scheduleDetails   Json?            // Shift patterns, core hours, etc.
  
  // Filling Information
  candidateId       String?          
  candidate         Candidate?       @relation(fields: [candidateId], references: [id])
  filledDate        DateTime?
  actualStartDate   DateTime?
  
  // Metadata
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt
  createdBy         String?
  creator           User?            @relation("PositionCreator", fields: [createdBy], references: [id])
  
  organizationId    String
  organization      Organization     @relation(fields: [organizationId], references: [id])
  
  @@index([jobId])
  @@index([status])
  @@index([candidateId])
}

// Enums
enum PositionStatus {
  OPEN
  FILLED
  ON_HOLD
  CANCELLED
  PENDING_START    // Filled but candidate hasn't started
}

enum EmploymentType {
  FULL_TIME
  PART_TIME
  CONTRACT
  TEMPORARY
  INTERNSHIP
  VOLUNTEER
}

enum WorkSchedule {
  STANDARD         // 9-5
  FLEXIBLE         // Flexible hours
  SHIFT            // Shift work
  COMPRESSED       // 4-day work week, etc.
  CUSTOM          // Custom schedule
}

enum RemoteType {
  ONSITE
  HYBRID
  REMOTE
  FLEXIBLE        // Employee choice
}

enum CompensationType {
  SALARY
  HOURLY
  CONTRACT
  COMMISSION
  STIPEND
  VOLUNTEER       // Unpaid
}

enum SalaryPeriod {
  ANNUAL
  MONTHLY
  BIWEEKLY
  WEEKLY
  DAILY
}

enum ContractType {
  FIXED_PRICE
  TIME_MATERIALS
  RETAINER
  MILESTONE_BASED
}
```

## Relationships

```
Organization
    ↓
   Jobs
    ↓
Positions (multiple per job)
    ↓
Candidate (when filled)
```

## UI/UX Flow

### 1. Job Creation Flow
```
Create Job → Basic Info → Add Positions → Configure Each Position
```

### 2. Position Management
- **List View**: Show all positions for a job with status
- **Quick Actions**: Clone position, mark as filled, put on hold
- **Bulk Actions**: Create multiple similar positions at once

### 3. Compensation Templates
Companies can create compensation templates:
- Junior Developer Template (salary range, benefits)
- Senior Developer Template
- Contractor Template
- Hourly Worker Template

### 4. Salary/Compensation Page Structure
```
/dashboard/jobs
  ├── /active          (Active job listings)
  ├── /drafts          (Draft jobs)
  ├── /archived        (Archived jobs)
  └── /compensation    (NEW - Compensation management)
      ├── /templates   (Compensation templates)
      ├── /analytics   (Salary analytics)
      └── /market-data (Market comparison)
```

## Key Features

### 1. Position Cloning
- Clone existing positions with one click
- Modify only what's different

### 2. Bulk Position Creation
```typescript
// Example: Create 5 identical developer positions
createBulkPositions({
  jobId: 'job123',
  count: 5,
  template: developerPositionTemplate
})
```

### 3. Smart Defaults
- Pre-fill based on job level
- Suggest salary ranges based on market data
- Auto-calculate hourly from salary

### 4. Position Tracking
- Track time-to-fill for each position
- Monitor compensation competitiveness
- Alert when positions are open too long

## Implementation Priority

1. **Phase 1**: Basic position creation and management
   - Create positions with salary/hourly compensation
   - Link candidates to positions
   - Basic UI for management

2. **Phase 2**: Advanced compensation
   - Benefits management
   - Compensation templates
   - Bulk operations

3. **Phase 3**: Analytics and optimization
   - Compensation analytics
   - Market data integration
   - Position performance tracking