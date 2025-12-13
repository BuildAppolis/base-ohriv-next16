import { tool } from "ai";
import { z } from "zod";

/**
 * Worker Tool - Executes specialized tasks assigned by the orchestrator
 *
 * This tool represents a specialized worker that can handle specific types of tasks
 * based on their expertise area (frontend, backend, database, etc.).
 */
export const workerTool = tool({
  description:
    "Execute specialized tasks assigned by the orchestrator with domain-specific expertise",
  inputSchema: z.object({
    taskId: z.string().describe("Unique identifier for this task"),
    workerType: z
      .enum([
        "frontend",
        "backend",
        "database",
        "api",
        "testing",
        "documentation",
        "research",
        "design",
        "deployment",
      ])
      .describe("Type of worker needed for this task"),
    description: z
      .string()
      .describe("Detailed description of the task to be performed"),
    requirements: z
      .array(z.string())
      .describe("Specific requirements and constraints for this task"),
    context: z
      .string()
      .describe("Additional context about the project and dependencies"),
    expectedOutput: z
      .string()
      .describe("What the worker should produce as output"),
    priority: z
      .enum(["low", "medium", "high", "urgent"])
      .default("medium")
      .describe("Task priority"),
  }),
  async *execute({
    taskId,
    workerType,
    description,
    // requirements,
    // context,
    // expectedOutput,
    priority,
  }) {
    yield { state: "loading" as const };

    // Simulate work execution based on worker type
    const workDuration =
      priority === "urgent" ? 500 : priority === "high" ? 1000 : 1500;
    await new Promise((resolve) => setTimeout(resolve, workDuration));

    // Generate worker-specific output based on type
    const workerOutputs = {
      frontend: {
        output: `Frontend implementation completed for task: ${description}`,
        explanation:
          "Created responsive UI components using modern frameworks, implemented state management, and ensured accessibility compliance.",
        deliverables: [
          {
            name: "Component Library",
            type: "code" as const,
            content:
              "React components with TypeScript, styled with Tailwind CSS",
            status: "completed" as const,
          },
          {
            name: "User Interface Mockups",
            type: "design" as const,
            content: "Figma designs showing user flow and component hierarchy",
            status: "completed" as const,
          },
        ],
        issues: [],
        suggestions: [
          "Consider adding dark mode support",
          "Implement progressive web app features",
        ],
      },
      backend: {
        output: `Backend services implemented for task: ${description}`,
        explanation:
          "Developed RESTful APIs with proper error handling, implemented authentication, and set up database connections.",
        deliverables: [
          {
            name: "API Endpoints",
            type: "code" as const,
            content: "Express.js routes with middleware and validation",
            status: "completed" as const,
          },
          {
            name: "Database Schema",
            type: "configuration" as const,
            content: "PostgreSQL schema with migrations and indexes",
            status: "completed" as const,
          },
        ],
        issues: [],
        suggestions: ["Add rate limiting", "Implement caching strategy"],
      },
      database: {
        output: `Database design and implementation completed for task: ${description}`,
        explanation:
          "Designed normalized database schema, created indexes for performance, and implemented data migration scripts.",
        deliverables: [
          {
            name: "Database Schema",
            type: "configuration" as const,
            content: "SQL schema with tables, relationships, and constraints",
            status: "completed" as const,
          },
          {
            name: "Migration Scripts",
            type: "code" as const,
            content: "Database migration files for version control",
            status: "completed" as const,
          },
        ],
        issues: [],
        suggestions: [
          "Consider read replicas for scaling",
          "Add database monitoring",
        ],
      },
      api: {
        output: `API integration completed for task: ${description}`,
        explanation:
          "Integrated with external APIs, implemented proper error handling, and added retry logic with exponential backoff.",
        deliverables: [
          {
            name: "API Client Library",
            type: "code" as const,
            content: "TypeScript client with type-safe API calls",
            status: "completed" as const,
          },
          {
            name: "API Documentation",
            type: "documentation" as const,
            content: "OpenAPI specification with examples",
            status: "completed" as const,
          },
        ],
        issues: [],
        suggestions: [
          "Add API versioning",
          "Implement request/response logging",
        ],
      },
      testing: {
        output: `Test suite implemented for task: ${description}`,
        explanation:
          "Created comprehensive unit tests, integration tests, and end-to-end tests with 85% code coverage.",
        deliverables: [
          {
            name: "Unit Tests",
            type: "test" as const,
            content: "Jest test files covering all business logic",
            status: "completed" as const,
          },
          {
            name: "Integration Tests",
            type: "test" as const,
            content: "API integration tests with test database",
            status: "completed" as const,
          },
          {
            name: "Coverage Report",
            type: "analysis" as const,
            content: "Code coverage report showing 85% coverage",
            status: "completed" as const,
          },
        ],
        issues: [],
        suggestions: [
          "Add performance tests",
          "Implement visual regression testing",
        ],
      },
      documentation: {
        output: `Documentation created for task: ${description}`,
        explanation:
          "Created comprehensive user guides, API documentation, and developer onboarding materials.",
        deliverables: [
          {
            name: "User Guide",
            type: "documentation" as const,
            content: "Step-by-step user guide with screenshots",
            status: "completed" as const,
          },
          {
            name: "API Documentation",
            type: "documentation" as const,
            content: "Interactive API docs with examples",
            status: "completed" as const,
          },
        ],
        issues: [],
        suggestions: ["Add video tutorials", "Create troubleshooting guide"],
      },
      research: {
        output: `Research analysis completed for task: ${description}`,
        explanation:
          "Conducted market research, analyzed technical requirements, and provided recommendations with supporting data.",
        deliverables: [
          {
            name: "Research Report",
            type: "analysis" as const,
            content: "Comprehensive analysis with findings and recommendations",
            status: "completed" as const,
          },
          {
            name: "Technical Specifications",
            type: "documentation" as const,
            content: "Detailed technical requirements and constraints",
            status: "completed" as const,
          },
        ],
        issues: [],
        suggestions: [
          "Conduct user interviews",
          "Validate assumptions with prototypes",
        ],
      },
      design: {
        output: `Design work completed for task: ${description}`,
        explanation:
          "Created user experience flows, designed system architecture, and developed visual mockups.",
        deliverables: [
          {
            name: "UX Wireframes",
            type: "design" as const,
            content: "Figma wireframes showing user journey",
            status: "completed" as const,
          },
          {
            name: "System Architecture",
            type: "design" as const,
            content: "Architecture diagrams showing system components",
            status: "completed" as const,
          },
        ],
        issues: [],
        suggestions: [
          "Conduct usability testing",
          "Create design system guidelines",
        ],
      },
      deployment: {
        output: `Deployment configuration completed for task: ${description}`,
        explanation:
          "Set up CI/CD pipeline, configured production environment, and implemented monitoring and logging.",
        deliverables: [
          {
            name: "CI/CD Pipeline",
            type: "configuration" as const,
            content: "GitHub Actions workflow for automated deployment",
            status: "completed" as const,
          },
          {
            name: "Infrastructure as Code",
            type: "configuration" as const,
            content: "Terraform configuration for cloud infrastructure",
            status: "completed" as const,
          },
        ],
        issues: [],
        suggestions: ["Add blue-green deployment", "Implement auto-scaling"],
      },
    };

    const result = workerOutputs[workerType] || {
      output: `Generic work completed for task: ${description}`,
      explanation: "Completed the assigned task with general expertise.",
      deliverables: [],
      issues: [],
      suggestions: [],
    };

    const workerResult = {
      taskId,
      status: "completed" as const,
      ...result,
    };

    yield { state: "ready" as const, result: workerResult };
  },
});

export type WorkerUIToolInvocation = {
  state:
    | "loading"
    | "ready"
    | "input-streaming"
    | "input-available"
    | "output-available"
    | "output-error";
  input?: {
    taskId: string;
    workerType:
      | "frontend"
      | "backend"
      | "database"
      | "api"
      | "testing"
      | "documentation"
      | "research"
      | "design"
      | "deployment";
    description: string;
    requirements: string[];
    context: string;
    expectedOutput: string;
    priority: "low" | "medium" | "high" | "urgent";
  };
  output?: {
    state: "loading" | "ready";
    result?: {
      taskId: string;
      status: "completed" | "failed" | "needs_review";
      output: string;
      explanation: string;
      deliverables?: Array<{
        name: string;
        type:
          | "code"
          | "documentation"
          | "design"
          | "analysis"
          | "test"
          | "configuration";
        content: string;
        status: "draft" | "review" | "approved" | "completed";
      }>;
      issues?: string[];
      suggestions?: string[];
    };
  };
  errorText?: string;
};
