/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Mock Database Service
 * Simulates database operations for testing AI generation
 * Shows what WOULD be created without actually creating it
 */

import type {
  CompanyContext,
  GeneratedAttribute,
  GeneratedQuestion,
  GeneratedJobTemplate,
  LevelExpectations,
} from "@/types/company";

export interface MockDatabaseOperation {
  model: string;
  operation: "CREATE" | "UPDATE" | "DELETE";
  data: any;
  mockId: string;
  timestamp: string;
}

export interface MockDatabaseResult {
  operations: MockDatabaseOperation[];
  summary: {
    totalOperations: number;
    byModel: Record<string, number>;
  };
}

let simulationMode = true;

export function enableSimulation() {
  simulationMode = true;
}

export function disableSimulation() {
  simulationMode = false;
}

export function isSimulationMode() {
  return simulationMode;
}

/**
 * Generate a mock CUID-like ID
 */
function generateMockId(prefix: string = ""): string {
  const randomString = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now().toString(36);
  return `${prefix}_mock_${timestamp}_${randomString}`;
}

// Category mapping functions removed - now using category directly from AI generation

/**
 * Mock: Update organization with AI context
 */
export function mockUpdateOrganizationContext(
  organizationId: string,
  context: CompanyContext
): MockDatabaseOperation {
  return {
    model: "Organization",
    operation: "UPDATE",
    data: {
      id: organizationId,
      name: context.name,
      aiContext: context,
      industry: context.industry,
      subIndustry: context.subIndustry,
      companySize: context.size,
      companyStage: context.stage,
      techStack: context.techStack,
      businessModel: context.businessModel,
      cultureValues: context.culture.values,
      contextLastUpdated: new Date().toISOString(),
      contextConfidence: context.confidence,
      customContext: context.customContext,
      originalDescription: context.originalDescription,
    },
    mockId: organizationId,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Mock: Create attributes from AI generation
 */
export function mockCreateAttributes(
  organizationId: string,
  attributes: GeneratedAttribute[],
  createdBy?: string
): MockDatabaseOperation[] {
  return attributes.map((attr) => {
    const attributeId = generateMockId("attr");

    // Scoring scale: 1-10 chunked into 5 levels
    const scoringScale = {
      min: 1,
      max: 10,
      levels: 5,
      levelSize: 2, // Every 2 points = 1 level
      levelLabels: [
        { range: [1, 2], label: "Can't do it", level: 1 },
        { range: [3, 4], label: "Needs support", level: 2 },
        { range: [5, 6], label: "Can do it", level: 3 },
        { range: [7, 8], label: "Can improve it", level: 4 },
        { range: [9, 10], label: "Can transform it", level: 5 },
      ],
    };

    // Scoring anchors define characteristics (not specific examples)
    const scoringAnchors = {
      description:
        "Anchors define characteristics of performance at each level",
      levels: {
        1: "Unable to demonstrate competency; significant gaps in understanding or execution",
        2: "Basic competency present but requires substantial guidance and support",
        3: "Demonstrates solid competency; can execute independently with occasional guidance",
        4: "Strong competency; can mentor others and identify improvement opportunities",
        5: "Exceptional mastery; transforms processes and elevates team performance",
      },
    };

    return {
      model: "Attribute",
      operation: "CREATE",
      data: {
        id: attributeId,
        name: attr.name,
        description: attr.description,
        icon: attr.icon || "Circle",
        color: attr.color || "#3B82F6",
        organizationId,
        category: attr.category, // Use category directly from AI generation
        isCore: false,
        isArchived: false,
        scoringScale, // 1-10 scale chunked to 5 levels
        scoringAnchors, // Characteristics-based anchors
        createdBy: createdBy || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Store sub-attributes in a way that can be created later
        _subAttributes: attr.subAttributes || [],
      },
      mockId: attributeId,
      timestamp: new Date().toISOString(),
    };
  });
}

/**
 * Mock: Create sub-attributes
 */
export function mockCreateSubAttributes(
  parentOperations: MockDatabaseOperation[],
  organizationId: string,
  createdBy?: string
): MockDatabaseOperation[] {
  const subAttrOps: MockDatabaseOperation[] = [];

  parentOperations.forEach((parentOp) => {
    const subAttributes = parentOp.data._subAttributes || [];

    subAttributes.forEach((subAttr: any) => {
      const subAttrId = generateMockId("subattr");

      subAttrOps.push({
        model: "Attribute",
        operation: "CREATE",
        data: {
          id: subAttrId,
          name: subAttr.name,
          description: subAttr.description,
          icon: "Dot",
          color: parentOp.data.color,
          organizationId,
          category: parentOp.data.category,
          isCore: false,
          isArchived: false,
          parentAttributeId: parentOp.mockId,
          level: 1,
          path: `${parentOp.mockId}/${subAttrId}`,
          createdBy: createdBy || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        mockId: subAttrId,
        timestamp: new Date().toISOString(),
      });
    });
  });

  return subAttrOps;
}

/**
 * Mock: Create questions from AI generation
 */
export function mockCreateQuestions(
  organizationId: string,
  questions: GeneratedQuestion[],
  attributeIdMap: Map<string, string>,
  createdBy?: string
): MockDatabaseOperation[] {
  return questions.map((question) => {
    const questionId = generateMockId("question");

    // Map attribute names to mock IDs
    const attributeIds = question.attributes
      .map((attrName) => attributeIdMap.get(attrName))
      .filter(Boolean) as string[];

    return {
      model: "Question",
      operation: "CREATE",
      data: {
        id: questionId,
        text: question.text,
        difficultyLevel: question.difficultyLevel || "Intermediate",
        organizationId,
        createdBy: createdBy || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expectations: question.expectations,
        internalNotes: question.internalNotes,
        // Store relationships for later creation
        _attributeIds: attributeIds,
        _stage: question.stage,
      },
      mockId: questionId,
      timestamp: new Date().toISOString(),
    };
  });
}

/**
 * Mock: Create job template
 */
export function mockCreateJob(
  organizationId: string,
  jobTemplate: GeneratedJobTemplate,
  hiringCurve: number = 50,
  createdBy?: string
): MockDatabaseOperation {
  const jobId = generateMockId("job");

  return {
    model: "Job",
    operation: "CREATE",
    data: {
      id: jobId,
      title: jobTemplate.title,
      baseDescription: jobTemplate.baseDescription,
      baseRequirements: jobTemplate.baseRequirements,
      niceToHaves: jobTemplate.niceToHaves || [],
      tags: jobTemplate.tags,
      services: jobTemplate.services || [], // Tools/services used in this role
      hiringCurve, // 10-90%, used for logistic regression chart
      // Position-specific culture characteristics
      positionWorkEnvironment: jobTemplate.positionCulture.workEnvironment,
      positionWorkPace: jobTemplate.positionCulture.workPace,
      positionCollaborationStyle:
        jobTemplate.positionCulture.collaborationStyle,
      organizationId,
      isArchived: false,
      createdBy: createdBy || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    mockId: jobId,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Mock: Create attribute weights for job
 */
export function mockCreateAttributeWeights(
  jobId: string,
  attributes: GeneratedAttribute[],
  attributeIdMap: Map<string, string>
): MockDatabaseOperation[] {
  return attributes
    .map((attr) => {
      const attributeId = attributeIdMap.get(attr.name);
      if (!attributeId) return null;

      return {
        model: "AttributeWeight",
        operation: "CREATE",
        data: {
          id: generateMockId("weight"),
          jobId,
          attributeId,
          weight: attr.weight,
          notes: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        mockId: generateMockId("weight"),
        timestamp: new Date().toISOString(),
      };
    })
    .filter(Boolean) as MockDatabaseOperation[];
}

/**
 * Mock: Create job level assignments
 */
export function mockCreateJobLevelAssignments(
  jobId: string,
  levelAssignments: Array<{ id: string; level: string; positionCount: number }>,
  levelCustomizations?: LevelExpectations[],
  createdBy?: string
): MockDatabaseOperation[] {
  return levelAssignments.map((assignment) => {
    const assignmentId = generateMockId("assignment");

    // Find matching customization for this level
    const customization = levelCustomizations?.find(
      (c) => c.level === assignment.level
    );

    return {
      model: "JobLevelAssignment",
      operation: "CREATE",
      data: {
        id: assignmentId,
        jobId,
        jobLevelId: generateMockId("joblevel"), // In production, this would be a real JobLevel ID
        customTitle: customization?.customTitle || null,
        customDescription: null, // Not in LevelExpectations, using keyResponsibilities instead
        customRequirements: null, // Not in LevelExpectations, using additionalRequirements instead
        positionsAvailable: assignment.positionCount,
        isActive: true,
        createdBy: createdBy || null,
        updatedBy: createdBy || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Store metadata for reference
        _levelName: assignment.level,
        _originalId: assignment.id,
        // Store AI-generated level customizations
        _levelCustomization: customization
          ? {
              experienceRange: customization.experienceRange,
              keyResponsibilities: customization.keyResponsibilities,
              technicalExpectations: customization.technicalExpectations,
              leadershipExpectations: customization.leadershipExpectations,
              additionalRequirements: customization.additionalRequirements,
              additionalNiceToHaves: customization.additionalNiceToHaves,
              autonomyLevel: customization.autonomyLevel,
              scopeOfImpact: customization.scopeOfImpact,
              decisionMakingAuthority: customization.decisionMakingAuthority,
            }
          : null,
      },
      mockId: assignmentId,
      timestamp: new Date().toISOString(),
    };
  });
}

/**
 * Build complete database simulation result
 */
export function buildSimulationResult(
  operations: MockDatabaseOperation[]
): MockDatabaseResult {
  const byModel: Record<string, number> = {};

  operations.forEach((op) => {
    byModel[op.model] = (byModel[op.model] || 0) + 1;
  });

  return {
    operations,
    summary: {
      totalOperations: operations.length,
      byModel,
    },
  };
}

/**
 * Main function: Simulate complete role setup
 */
export function simulateRoleSetup(
  organizationId: string,
  context: CompanyContext,
  attributes: GeneratedAttribute[],
  questions: GeneratedQuestion[],
  jobTemplate: GeneratedJobTemplate,
  hiringCurve: number = 50,
  levelAssignments: Array<{
    id: string;
    level: string;
    positionCount: number;
  }> = [],
  userId?: string
): MockDatabaseResult {
  const operations: MockDatabaseOperation[] = [];

  // 1. Update organization with context
  operations.push(mockUpdateOrganizationContext(organizationId, context));

  // 2. Create attributes
  const attributeOps = mockCreateAttributes(organizationId, attributes, userId);
  operations.push(...attributeOps);

  // 3. Create sub-attributes
  const subAttrOps = mockCreateSubAttributes(
    attributeOps,
    organizationId,
    userId
  );
  operations.push(...subAttrOps);

  // 4. Build attribute name -> ID map
  const attributeIdMap = new Map<string, string>();
  attributeOps.forEach((op) => {
    attributeIdMap.set(op.data.name, op.mockId);
  });

  // 5. Create questions
  const questionOps = mockCreateQuestions(
    organizationId,
    questions,
    attributeIdMap,
    userId
  );
  operations.push(...questionOps);

  // 6. Create job
  const jobOp = mockCreateJob(organizationId, jobTemplate, hiringCurve, userId);
  operations.push(jobOp);

  // 7. Create attribute weights
  const weightOps = mockCreateAttributeWeights(
    jobOp.mockId,
    attributes,
    attributeIdMap
  );
  operations.push(...weightOps);

  // 8. Create job level assignments with AI-generated customizations
  if (levelAssignments.length > 0) {
    const assignmentOps = mockCreateJobLevelAssignments(
      jobOp.mockId,
      levelAssignments,
      jobTemplate.levelCustomizations, // Pass AI-generated customizations
      userId
    );
    operations.push(...assignmentOps);
  }

  return buildSimulationResult(operations);
}
