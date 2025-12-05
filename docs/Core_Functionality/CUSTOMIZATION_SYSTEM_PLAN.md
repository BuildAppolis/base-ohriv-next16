# AI Generation Customization System - Comprehensive Plan

## Overview

Build a comprehensive customization system that allows users to interactively edit AI-generated attributes, questions, and job templates. Includes both manual editing capabilities and an AI chat interface for intelligent modifications.

---

## Current State Analysis

### Existing UI Components We Can Leverage:

1. **`question-form.tsx`** - Full-featured question creation/editing form
   - Question text, description, difficulty level
   - Answer characteristics (poor, average, great traits)
   - Attribute associations (checkboxes)
   - Stage selection
   - Follow-up questions
   - Internal notes
   - Real-time quality analysis

2. **`attribute-weight-selector.tsx`** - Sophisticated weight management
   - Sliders + numeric inputs
   - Auto-balancing (adjusts other weights automatically)
   - Lock functionality to freeze specific weights
   - Visual validation (total = 100%)

3. **`StageSelector`** - Stage selection component
4. **`FollowUpQuestionsInput`** - Follow-up questions management

---

## User Requirements

### 1. Attribute Customization
- ✅ Adjust weight percentages (already have UI!)
- ⚠️ Reorder attributes (need drag-and-drop)
- ⚠️ Add/remove attributes

### 2. Question Customization
- ⚠️ Reorder questions (drag-and-drop)
- ⚠️ Adjust difficulty levels (inline dropdown)
- ⚠️ Control questions per stage (grouping + filtering)
- ⚠️ Edit question text (inline or modal)
- ⚠️ Change attribute associations
- ⚠️ Change stage assignments
- ⚠️ Delete questions
- ⚠️ Add new questions

### 3. AI Chat Interface
- ⚠️ Natural language requests: "More difficult questions for React"
- ⚠️ Alternative questions: "Show other questions for problem-solving"
- ⚠️ Add questions: "Add 2 more questions for technical round"
- ⚠️ Before/after preview of changes
- ⚠️ Accept/reject AI suggestions

---

## Architecture Design

### Phase 1: Interactive Manual Editors (Build First)

#### Component 1: `AttributeEditor`
**Purpose:** Allow users to adjust attribute weights and reorder

**Features:**
- Reuses existing `AttributeWeightSelector` for weight management
- Adds drag-and-drop reordering (`@dnd-kit/sortable`)
- Shows KSA category badges (Knowledge, Skill, Ability, Value)
- Displays total weight validation
- Shows attribute descriptions

**Technical:**
```tsx
interface AttributeEditorProps {
  attributes: GeneratedAttribute[]
  onAttributesChange: (updated: GeneratedAttribute[]) => void
}
```

**UI Layout:**
```
┌─────────────────────────────────────┐
│  ATTRIBUTES EDITOR                  │
├─────────────────────────────────────┤
│                                     │
│  ≡ 🧠 React Knowledge    [lock] 25% │
│    ▓▓▓▓▓░░░░░░░░░░░                │
│    KNOWLEDGE | Junior-friendly      │
│                                     │
│  ≡ 💻 Problem Solving   [lock] 30%  │
│    ▓▓▓▓▓▓▓░░░░░░░░░                │
│    SKILL | Critical for role        │
│                                     │
│  ≡ 🤝 Communication     [lock] 25%  │
│    ▓▓▓▓▓░░░░░░░░░░░                │
│    ABILITY | Team collaboration     │
│                                     │
│  ≡ 🎯 Initiative        [lock] 20%  │
│    ▓▓▓▓░░░░░░░░░░░░                │
│    VALUE | Self-starter             │
│                                     │
│  Total: 100% ✓                      │
└─────────────────────────────────────┘
```

---

#### Component 2: `QuestionEditor`
**Purpose:** Allow users to edit, reorder, and manage questions

**Features:**
- Sortable question list with drag-and-drop
- Group by stage (collapsible sections)
- Inline editing for quick changes
- Full modal edit using existing `QuestionForm`
- Filter by: stage, difficulty, attribute
- Add new questions manually
- Delete questions
- Show question count per stage

**Technical:**
```tsx
interface QuestionEditorProps {
  questions: GeneratedQuestion[]
  attributes: GeneratedAttribute[]
  stages: Stage[]
  onQuestionsChange: (updated: GeneratedQuestion[]) => void
  onAddQuestion: () => void
}
```

**UI Layout:**
```
┌─────────────────────────────────────────────────┐
│  QUESTIONS EDITOR                    [+ Add]    │
├─────────────────────────────────────────────────┤
│  Filters: [All Stages ▼] [All Difficulties ▼]  │
│           [All Attributes ▼]                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  ▼ Technical Round (5 questions)                │
│  ┌───────────────────────────────────────────┐ │
│  │ ≡ Q1: Describe your experience with...    │ │
│  │    Intermediate | React, Problem Solving  │ │
│  │    [Edit] [Delete] [Expand ▼]             │ │
│  └───────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────┐ │
│  │ ≡ Q2: How would you approach...           │ │
│  │    Advanced | Problem Solving             │ │
│  │    [Edit] [Delete] [Expand ▼]             │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ▼ Behavioral Round (3 questions)               │
│  ┌───────────────────────────────────────────┐ │
│  │ ≡ Q3: Tell me about a time when...        │ │
│  │    Basic | Communication, Initiative      │ │
│  │    [Edit] [Delete] [Expand ▼]             │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Expanded Question Card:**
```
┌─────────────────────────────────────────────┐
│ ≡ Q1: Describe your experience with React   │
│                                             │
│ Question Text: [Editable textarea]          │
│                                             │
│ Difficulty: [Intermediate ▼]               │
│ Stage: [Technical Round ▼]                 │
│                                             │
│ Evaluates Attributes:                       │
│ ☑ React Knowledge                          │
│ ☑ Problem Solving                          │
│ ☐ Communication                            │
│                                             │
│ Answer Characteristics:                     │
│ Poor (1-2): [List of traits]               │
│ Average (5-6): [List of traits]            │
│ Great (9-10): [List of traits]             │
│                                             │
│ [Full Edit Modal] [Save Changes]           │
└─────────────────────────────────────────────┘
```

---

#### Component 3: `GenerationResultsEditor`
**Purpose:** Container for all customization tools

**Features:**
- Tabbed interface: Attributes | Questions | Job Template
- Floating AI chat panel (Phase 2)
- Save & Finalize button
- Discard Changes button
- Show change count indicator

**Technical:**
```tsx
interface GenerationResultsEditorProps {
  initialAttributes: GeneratedAttribute[]
  initialQuestions: GeneratedQuestion[]
  initialJobTemplate: GeneratedJobTemplate
  onSave: (data: CustomizedGeneration) => void
  onCancel: () => void
}
```

**UI Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Customize AI Generation Results        [💬 AI Chat]   │
├─────────────────────────────────────────────────────────┤
│  [Attributes] [Questions] [Job Template]                │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │                                                   │ │
│  │  [Content based on active tab]                   │ │
│  │                                                   │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Changes Made: 3 attributes modified, 2 questions edited│
│                                                         │
│  [Discard Changes]           [Save & Finalize →]       │
└─────────────────────────────────────────────────────────┘
```

---

### Phase 2: AI Chat Interface (Build Second)

#### Component 4: `AICustomizationChat`
**Purpose:** Natural language interface for intelligent modifications

**Features:**
- Chat interface with conversation history
- Interprets natural language requests
- Shows AI-suggested changes as diff/preview
- Apply or reject suggestions
- Multiple conversation threads

**Natural Language Commands:**
```javascript
// Difficulty Modifications
"Make questions for React more difficult"
"Change Q3 to Advanced difficulty"
"I need easier questions for junior candidates"

// Question Variations
"Show me alternative questions for problem-solving"
"Can I see different ways to ask about React hooks?"
"Give me 3 variations of this question"

// Question Generation
"Add 2 more difficult questions for technical round"
"Generate questions about testing for intermediate level"
"I need a question about AWS for the senior round"

// Bulk Operations
"Make all behavioral questions Basic difficulty"
"Move these questions to final round"
"Remove questions about Python"

// Attribute Modifications
"Increase weight for communication skills"
"Balance weights evenly across all attributes"
"Lock React knowledge at 30%"
```

**Technical:**
```tsx
interface AICustomizationChatProps {
  currentAttributes: GeneratedAttribute[]
  currentQuestions: GeneratedQuestion[]
  onSuggestChanges: (changes: SuggestedChanges) => void
}

interface SuggestedChanges {
  type: 'modify_questions' | 'add_questions' | 'modify_attributes'
  changes: any[]
  reasoning: string
  preview: {
    before: any
    after: any
  }
}
```

**UI Layout:**
```
┌─────────────────────────────────────────┐
│  💬 AI Customization Assistant          │
├─────────────────────────────────────────┤
│                                         │
│  You: I need more difficult questions  │
│       for React knowledge               │
│                                         │
│  AI: I can help with that! I'll:       │
│      • Change Q2 to Advanced            │
│      • Add 2 new Expert questions       │
│      • Adjust answer characteristics    │
│                                         │
│      Preview Changes:                   │
│      ┌───────────────────────────────┐ │
│      │ Before → After                │ │
│      │ Q2: Intermediate → Advanced   │ │
│      │ +2 new questions (Expert)     │ │
│      └───────────────────────────────┘ │
│                                         │
│      [Apply Changes] [Cancel]           │
│                                         │
│  You: [Type your request...]           │
│                                         │
└─────────────────────────────────────────┘
```

---

## Implementation Roadmap

### Week 1: Foundation (Phase 1)
**Goal:** Build interactive manual editors

**Tasks:**
1. Install drag-and-drop dependencies (`@dnd-kit`)
2. Create `AttributeEditor` component
   - Integrate existing `AttributeWeightSelector`
   - Add sortable drag-and-drop
   - Add KSA category badges
3. Create `QuestionEditorCard` component
   - Inline editing for text
   - Difficulty dropdown
   - Stage dropdown
   - Attribute multi-select
   - Expand/collapse
4. Create `QuestionEditor` component
   - Sortable question list
   - Group by stage (collapsible)
   - Filter controls
   - Add/delete functionality
5. Create `GenerationResultsEditor` container
   - Tab navigation
   - State management
   - Save/discard logic
6. Integrate with `ai-test/page.tsx`
   - "Customize Results" button after generation
   - Modal/full-page view
   - Handle save to simulation database

### Week 2: AI Chat Interface (Phase 2)
**Goal:** Add intelligent natural language modifications

**Tasks:**
1. Create AI prompt engineering for request interpretation
2. Create `customization-interpreter.ts`
   - Parse natural language into structured commands
3. Create `question-variation-generator.ts`
   - Generate alternative questions
   - Match difficulty and attributes
4. Create `bulk-question-modifier.ts`
   - Apply multiple changes at once
5. Create tRPC endpoints:
   - `aiCustomization.interpretRequest`
   - `aiCustomization.generateAlternatives`
   - `aiCustomization.generateMoreQuestions`
   - `aiCustomization.applyBulkChanges`
6. Create `AICustomizationChat` component
   - Chat UI with history
   - Request interpretation
   - Change preview
   - Apply/reject flow
7. Integrate chat into `GenerationResultsEditor`
   - Floating panel or sidebar
   - Context-aware suggestions

### Week 3: Polish & Advanced Features
**Goal:** Refine UX and add power-user features

**Tasks:**
1. Add keyboard shortcuts
2. Add bulk selection (select multiple questions)
3. Add question templates/presets
4. Add undo/redo functionality
5. Add export functionality (JSON, CSV)
6. Add comparison view (show original vs. modified)
7. Add validation and warnings
8. Performance optimization for large question sets
9. Mobile responsiveness
10. Documentation and help tooltips

---

## Technical Architecture

### State Management

```typescript
// Main state structure
interface CustomizationState {
  original: {
    attributes: GeneratedAttribute[]
    questions: GeneratedQuestion[]
    jobTemplate: GeneratedJobTemplate
  }
  current: {
    attributes: GeneratedAttribute[]
    questions: GeneratedQuestion[]
    jobTemplate: GeneratedJobTemplate
  }
  history: CustomizationState[] // For undo/redo
  isDirty: boolean
  changeCount: number
}

// Track changes
interface ChangeLog {
  timestamp: Date
  type: 'attribute' | 'question' | 'template'
  action: 'add' | 'modify' | 'delete' | 'reorder'
  before: any
  after: any
  source: 'manual' | 'ai'
}
```

### Data Flow

```
1. AI Generation Complete
   ↓
2. User clicks "Customize Results"
   ↓
3. Load GenerationResultsEditor with initial data
   ↓
4. User makes changes (manual or via AI chat)
   ↓
5. Changes tracked in state
   ↓
6. User clicks "Save & Finalize"
   ↓
7. Validate changes (weights = 100%, required fields)
   ↓
8. Commit to database (simulation mode)
   ↓
9. Return to main page with updated results
```

### tRPC Endpoints

```typescript
// AI Customization Router
export const aiCustomizationRouter = router({
  // Parse natural language request into structured command
  interpretRequest: publicProcedure
    .input(z.object({
      request: z.string(),
      context: z.object({
        attributes: z.array(attributeSchema),
        questions: z.array(questionSchema),
      })
    }))
    .mutation(async ({ input }) => {
      // Use GPT to interpret request
      // Return structured command
    }),

  // Generate alternative questions
  generateAlternatives: publicProcedure
    .input(z.object({
      questionId: z.string(),
      count: z.number().default(3),
      context: companyContextSchema,
    }))
    .mutation(async ({ input }) => {
      // Generate variations of the question
    }),

  // Generate more questions matching criteria
  generateMoreQuestions: publicProcedure
    .input(z.object({
      criteria: z.object({
        attributeId: z.string().optional(),
        difficulty: difficultySchema.optional(),
        stageId: z.string().optional(),
        count: z.number(),
      }),
      context: companyContextSchema,
    }))
    .mutation(async ({ input }) => {
      // Generate new questions matching criteria
    }),

  // Apply bulk modifications
  applyBulkChanges: publicProcedure
    .input(z.object({
      changes: z.array(changeSchema),
    }))
    .mutation(async ({ input }) => {
      // Apply multiple changes at once
    }),
})
```

---

## Dependencies

### New Packages Required

```json
{
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^8.0.0",
  "@dnd-kit/utilities": "^3.2.2"
}
```

### Existing Packages to Leverage

- `@/components/ui/*` - Shadcn components
- `@/components/setup/question-form` - Full question editor
- `@/components/setup/attribute-weight-selector` - Weight management
- `@/lib/ai/client` - OpenAI integration
- tRPC for type-safe endpoints

---

## File Structure

```
src/
├── components/
│   └── ai-test/
│       ├── generation-results-editor.tsx       # Main container
│       ├── attribute-editor.tsx                # Attribute weight + reorder
│       ├── question-editor.tsx                 # Question list manager
│       ├── question-editor-card.tsx            # Individual question card
│       ├── question-editor-filters.tsx         # Filter controls
│       ├── ai-customization-chat.tsx           # AI chat interface
│       ├── ai-change-preview.tsx               # Before/after preview
│       └── customization-tabs.tsx              # Tab navigation
│
├── lib/
│   └── ai/
│       ├── customization-interpreter.ts        # Parse NL requests
│       ├── question-variation-generator.ts     # Generate alternatives
│       ├── bulk-question-modifier.ts           # Bulk operations
│       └── customization-validator.ts          # Validate changes
│
└── server/
    └── routers/
        └── ai-customization.ts                 # tRPC endpoints
```

---

## Success Metrics

### User Experience
- ✅ Users can adjust all AI outputs before finalizing
- ✅ Changes are intuitive and feel responsive
- ✅ AI chat reduces manual editing time by 60%
- ✅ Users feel in control of the generation process

### Technical
- ✅ <100ms response time for manual edits
- ✅ <3s response time for AI suggestions
- ✅ Support 100+ questions without performance issues
- ✅ Zero data loss during editing sessions

### Business
- ✅ 90%+ of users customize before finalizing
- ✅ Average 5-10 customizations per generation
- ✅ 80%+ satisfaction with customization tools
- ✅ Reduces support requests about "AI got it wrong"

---

## Open Questions

1. **Persistence:** Should we save in-progress customizations?
2. **Collaboration:** Multiple users editing same generation?
3. **Templates:** Save customization patterns for reuse?
4. **Approval:** Require admin approval for finalizing?
5. **Versioning:** Track versions of customized generations?

---

## Next Steps

1. **Review this plan** with team/stakeholders
2. **Prioritize features** - What's must-have vs. nice-to-have?
3. **Get design approval** on UI mockups
4. **Install dependencies** and set up project structure
5. **Start Week 1** implementation with AttributeEditor

---

## Notes

- **Reuse existing components** wherever possible
- **Keep AI chat optional** - manual editing should work standalone
- **Progressive enhancement** - start simple, add complexity
- **Mobile-first** - ensure works on tablets/phones
- **Accessibility** - keyboard navigation, screen readers
