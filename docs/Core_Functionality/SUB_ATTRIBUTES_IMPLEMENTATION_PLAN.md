# Sub-Attributes Implementation Plan

## Overview
This document outlines the implementation plan for adding sub-attributes to the platform while ensuring they don't affect the main scoring weights when assigning weights to questions.

## Current System Analysis

### Database Structure
- **Attribute**: Main attributes table with name, icon, color, description
- **AttributeWeight**: Job-level weights for attributes (used in scoring)
- **QuestionAttribute**: Links questions to attributes (many-to-many)
- **JobQuestionAttributeWeight**: Granular weights for specific job-question-attribute combinations

### Current Scoring System
1. Attributes are assigned weights at the job level (0-100%)
2. Questions are linked to multiple attributes
3. When scoring candidates, each attribute receives a score (0-10)
4. Final score = weighted average of all attribute scores
5. Used for pass probability calculations and stage recommendations

## Sub-Attributes Design

### Architecture Decision
Use a **self-referential hierarchical structure** in the existing Attribute table rather than creating a separate SubAttribute table. This approach:
- Maintains backward compatibility
- Simplifies queries and relationships
- Allows for future multi-level hierarchies if needed
- Keeps the existing scoring system intact

### Database Schema Changes

#### 1. Modify Attribute Table
```sql
ALTER TABLE "Attribute" ADD COLUMN "parentAttributeId" TEXT;
ALTER TABLE "Attribute" ADD COLUMN "level" INTEGER DEFAULT 0;
ALTER TABLE "Attribute" ADD COLUMN "path" TEXT; -- For efficient queries (e.g., "parent_id/child_id")
ALTER TABLE "Attribute" ADD CONSTRAINT "Attribute_parentAttributeId_fkey" 
  FOREIGN KEY ("parentAttributeId") REFERENCES "Attribute"("id") ON DELETE CASCADE;
```

#### 2. Add Indexes for Performance
```sql
CREATE INDEX "Attribute_parentAttributeId_idx" ON "Attribute"("parentAttributeId");
CREATE INDEX "Attribute_level_idx" ON "Attribute"("level");
CREATE INDEX "Attribute_path_idx" ON "Attribute"("path");
```

### Scoring System Design

#### Key Principle: Sub-attributes don't affect main weight distribution
- Only top-level attributes have weights in AttributeWeight table
- Sub-attributes contribute to their parent's score calculation
- Job-level weights remain at the parent attribute level only

#### Score Calculation Flow
1. **Candidate Evaluation**:
   - Score sub-attributes individually (0-10 scale)
   - Calculate parent attribute score as average of sub-attribute scores
   - If no sub-attributes, use direct parent score

2. **Weight Application**:
   - Only parent attributes have job-level weights
   - Sub-attribute scores roll up to parent before weight application
   - Final weighted score calculation remains unchanged

### Implementation Steps

#### Phase 1: Database and Models (Week 1)
1. Add migration for schema changes
2. Update Prisma schema:
```prisma
model Attribute {
  id                String   @id @default(cuid())
  name              String
  icon              String
  color             String
  description       String
  isArchived        Boolean  @default(false)
  organizationId    String
  
  // Hierarchical fields
  parentAttributeId String?
  parentAttribute   Attribute?  @relation("AttributeHierarchy", fields: [parentAttributeId], references: [id], onDelete: Cascade)
  subAttributes     Attribute[] @relation("AttributeHierarchy")
  level             Int        @default(0)
  path              String?
  
  // ... existing relations
}
```

3. Update TypeScript types:
```typescript
export interface Attribute {
  // ... existing fields
  parentAttributeId?: string | null;
  parentAttribute?: Attribute | null;
  subAttributes?: Attribute[];
  level: number;
  path?: string | null;
}
```

#### Phase 2: API Updates (Week 1-2)
1. **Attribute Router Enhancements**:
   - Add `includeSubAttributes` parameter to list endpoint
   - Add `parentAttributeId` to create/update schemas
   - Add validation to prevent circular references
   - Add endpoint to get attribute hierarchy

2. **New Endpoints**:
   ```typescript
   // Get attribute tree structure
   getHierarchy: orgMemberProcedure
     .query(async ({ ctx }) => {
       // Return attributes organized by hierarchy
     })

   // Move attribute (change parent)
   moveAttribute: orgAdminProcedure
     .input(z.object({
       attributeId: z.string(),
       newParentId: z.string().nullable()
     }))
     .mutation(async ({ ctx, input }) => {
       // Validate and update hierarchy
     })
   ```

#### Phase 3: UI Components (Week 2)
1. **Attribute List Enhancement**:
   - Add tree view option for hierarchical display
   - Show indentation for sub-attributes in table view
   - Add expand/collapse for parent attributes

2. **Attribute Form Updates**:
   - Add parent attribute selector
   - Show breadcrumb for current hierarchy
   - Validation to prevent deep nesting (max 2 levels initially)

3. **Weight Assignment UI**:
   - Only show top-level attributes in weight selector
   - Display sub-attributes as informational (no weight input)
   - Add tooltip explaining sub-attribute scoring

#### Phase 4: Scoring System Updates (Week 2-3)
1. **Score Calculation Service**:
```typescript
// Calculate attribute score considering sub-attributes
function calculateAttributeScore(
  attributeId: string,
  scores: Map<string, number>,
  attributes: Map<string, Attribute>
): number {
  const attribute = attributes.get(attributeId);
  if (!attribute) return 0;

  // If has sub-attributes, average their scores
  if (attribute.subAttributes?.length > 0) {
    const subScores = attribute.subAttributes
      .map(sub => scores.get(sub.id) ?? 0)
      .filter(score => score > 0);
    
    if (subScores.length === 0) return 0;
    return subScores.reduce((sum, score) => sum + score, 0) / subScores.length;
  }

  // Otherwise return direct score
  return scores.get(attributeId) ?? 0;
}
```

2. **Scoring Page Updates**:
   - Show sub-attributes under parents
   - Allow scoring at sub-attribute level
   - Display calculated parent scores
   - Keep weight display at parent level only

#### Phase 5: Reports and Analytics (Week 3)
1. Add sub-attribute breakdown in scoring reports
2. Show which sub-attributes contributed to parent scores
3. Analytics to identify which sub-attributes correlate with success

### Migration Strategy

1. **Data Migration**:
   - All existing attributes remain as top-level (parentAttributeId = null)
   - No change to existing scoring data
   - Backward compatible

2. **Feature Toggle**:
   - Add organization setting: `enableSubAttributes`
   - Roll out gradually to organizations

### UI/UX Considerations

1. **Visual Hierarchy**:
   - Use indentation and connecting lines
   - Different icon sizes for parent/sub
   - Muted colors for sub-attributes

2. **Creation Flow**:
   - Option to create sub-attribute from parent's context menu
   - Bulk create sub-attributes when creating parent
   - Template system for common hierarchies

3. **Scoring Interface**:
   - Collapsible sections for each parent
   - Quick score all sub-attributes
   - Visual indicator when parent score is calculated vs direct

### Example Use Cases

1. **Technical Skills**:
   - Parent: "Programming"
   - Sub-attributes: "Python", "JavaScript", "SQL", "Git"

2. **Communication**:
   - Parent: "Communication Skills"
   - Sub-attributes: "Written", "Verbal", "Presentation", "Listening"

3. **Leadership**:
   - Parent: "Leadership"
   - Sub-attributes: "Team Building", "Decision Making", "Delegation", "Vision"

### Technical Considerations

1. **Performance**:
   - Use path column for efficient hierarchy queries
   - Cache attribute trees
   - Limit hierarchy depth to 2 levels initially

2. **Validation Rules**:
   - Sub-attributes cannot have weights
   - Cannot create circular references
   - Parent attribute cannot be archived if has active sub-attributes

3. **API Response Structure**:
```typescript
interface AttributeWithHierarchy {
  id: string;
  name: string;
  // ... other fields
  parentAttributeId?: string;
  subAttributes?: AttributeWithHierarchy[];
  hasWeight: boolean; // true only for top-level
  effectiveScore?: number; // calculated from sub-attributes
}
```

### Testing Strategy

1. **Unit Tests**:
   - Hierarchy validation
   - Score calculation with sub-attributes
   - Weight distribution validation

2. **Integration Tests**:
   - Full scoring flow with hierarchical attributes
   - API endpoint testing
   - Migration testing

3. **E2E Tests**:
   - Create attribute hierarchy
   - Score candidates with sub-attributes
   - Verify weight calculations

### Rollback Plan

If issues arise:
1. Remove parentAttributeId constraint
2. Set all parentAttributeId to null
3. Revert UI changes via feature flag
4. Existing scoring data remains valid

### Success Metrics

1. **Adoption**: % of organizations using sub-attributes
2. **Accuracy**: Improved scoring granularity
3. **Efficiency**: Time saved in evaluation process
4. **User Satisfaction**: Feedback on hierarchical organization

### Timeline

- **Week 1**: Database changes and basic API
- **Week 2**: UI implementation and scoring logic
- **Week 3**: Testing, documentation, and rollout
- **Week 4**: Monitoring and adjustments

### Future Enhancements

1. **Multi-level Hierarchy**: Support > 2 levels
2. **Weighted Sub-attributes**: Different weights within parent
3. **Conditional Sub-attributes**: Show/hide based on job type
4. **Sub-attribute Templates**: Pre-built hierarchies by industry