import { tool } from "ai";
import { z } from "zod";

/**
 * Coordinator Tool - Manages the overall orchestration process
 *
 * This tool coordinates between the orchestrator and workers, tracking progress,
 * managing dependencies, and providing status updates.
 */
export const coordinatorTool = tool({
  description:
    "MANDATORY tool for managing the orchestration process. Use 'start' after planning, 'check_progress' after every 2-3 worker tasks, 'resolve_blocker' when tasks fail, and 'complete' when all tasks are finished. Essential for tracking progress and managing dependencies.",
  inputSchema: z.object({
    planId: z.string().describe("Unique identifier for the orchestration plan"),
    action: z
      .enum([
        "start",
        "check_progress",
        "resolve_blocker",
        "complete",
        "pause",
        "resume",
      ])
      .describe("Action to perform in the orchestration process"),
    context: z
      .string()
      .optional()
      .describe("Additional context for the action"),
    taskResults: z
      .array(
        z.object({
          taskId: z.string(),
          status: z.enum(["completed", "failed", "in_progress", "blocked"]),
          output: z.string().optional(),
        })
      )
      .optional()
      .describe("Results from completed tasks"),
  }),
  async *execute({ action, context, taskResults }) {
    yield { state: "loading" as const };

    // Simulate coordination work
    await new Promise((resolve) => setTimeout(resolve, 800));

    let coordinationResult;

    switch (action) {
      case "start":
        coordinationResult = {
          status: "orchestration_started",
          message: "Orchestration process has been initiated",
          nextSteps: [
            "Review the implementation plan",
            "Assign tasks to appropriate workers",
            "Begin execution of high-priority tasks",
          ],
          currentPhase: "initialization",
          estimatedCompletion: "8-12 hours",
        };
        break;

      case "check_progress": {
        const completedTasks =
          taskResults?.filter((t) => t.status === "completed").length || 0;
        const totalTasks = 6; // Based on our implementation plan
        const progress = Math.round((completedTasks / totalTasks) * 100);

        coordinationResult = {
          status: "progress_checked",
          message: `Orchestration progress: ${progress}% complete`,
          progress: {
            completed: completedTasks,
            total: totalTasks,
            percentage: progress,
          },
          currentPhase:
            progress < 30
              ? "early_stage"
              : progress < 70
              ? "active_development"
              : "finalization",
          nextSteps:
            progress < 50
              ? ["Continue with high-priority tasks", "Monitor for blockers"]
              : [
                  "Focus on testing and quality assurance",
                  "Prepare for deployment",
                ],
          blockers:
            taskResults
              ?.filter((t) => t.status === "blocked")
              .map((t) => t.taskId) || [],
        };
        break;
      }

      case "resolve_blocker":
        coordinationResult = {
          status: "blocker_resolved",
          message: `Blockers have been addressed: ${context}`,
          resolution: {
            action: "Escalated to senior team members",
            timeline: "2-4 hours",
            impact: "Minimal delay to overall timeline",
          },
          nextSteps: [
            "Resume blocked tasks",
            "Update timeline estimates",
            "Monitor for additional issues",
          ],
        };
        break;

      case "complete":
        coordinationResult = {
          status: "orchestration_completed",
          message: "All tasks have been successfully completed",
          summary: {
            totalTasks: 6,
            completedTasks: 6,
            failedTasks: 0,
            overallStatus: "completed" as const,
            qualityScore: 92,
            nextSteps: [
              "Conduct final review",
              "Deploy to production",
              "Monitor system performance",
            ],
          },
          deliverables: [
            "Requirements analysis document",
            "System architecture diagrams",
            "Working application",
            "Comprehensive test suite",
            "Deployed production system",
            "Complete documentation",
          ],
        };
        break;

      case "pause":
        coordinationResult = {
          status: "orchestration_paused",
          message: "Orchestration process has been paused",
          reason: context || "Manual pause requested",
          nextSteps: [
            "Save current progress",
            "Document current state",
            "Resume when ready",
          ],
        };
        break;

      case "resume":
        coordinationResult = {
          status: "orchestration_resumed",
          message: "Orchestration process has been resumed",
          nextSteps: [
            "Review current progress",
            "Continue with pending tasks",
            "Monitor for any issues",
          ],
        };
        break;

      default:
        coordinationResult = {
          status: "unknown_action",
          message: "Unknown action requested",
          nextSteps: ["Please specify a valid action"],
        };
    }

    yield { state: "ready" as const, coordination: coordinationResult };
  },
});

export type CoordinatorUIToolInvocation = {
  state:
    | "loading"
    | "ready"
    | "input-streaming"
    | "input-available"
    | "output-available"
    | "output-error";
  input?: {
    planId: string;
    action:
      | "start"
      | "check_progress"
      | "resolve_blocker"
      | "complete"
      | "pause"
      | "resume";
    context?: string;
    taskResults?: Array<{
      taskId: string;
      status: "completed" | "failed" | "in_progress" | "blocked";
      output?: string;
    }>;
  };
  output?: {
    state: "loading" | "ready";
    coordination?: {
      status: string;
      message: string;
      nextSteps?: string[];
      currentPhase?: string;
      estimatedCompletion?: string;
      progress?: {
        completed: number;
        total: number;
        percentage: number;
      };
      blockers?: string[];
      resolution?: {
        action: string;
        timeline: string;
        impact: string;
      };
      summary?: {
        totalTasks: number;
        completedTasks: number;
        failedTasks: number;
        overallStatus: "in_progress" | "completed" | "failed" | "needs_review";
        qualityScore: number;
        nextSteps: string[];
      };
      deliverables?: string[];
    };
  };
  errorText?: string;
};
