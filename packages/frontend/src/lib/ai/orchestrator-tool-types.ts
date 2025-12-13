import type { Experimental_InferAgentUIMessage as InferAgentUIMessage } from "ai";
import type { orchestratorAgent } from "./orchestrator-agent";

// Re-export the main UI message type
export type OrchestratorToolUIMessage = InferAgentUIMessage<
  typeof orchestratorAgent
>;

export type { CoordinatorUIToolInvocation } from "./ai-agent-orchestrator-tools/coordinator";
// Re-export individual tool invocation types
export type { OrchestratorUIToolInvocation } from "./ai-agent-orchestrator-tools/orchestrator";
// Re-export schemas for external use
export {
  ImplementationItemSchema,
  OrchestrationSummarySchema,
  WorkerResultSchema,
  WorkerTaskSchema,
} from "./ai-agent-orchestrator-tools/schema";
export type { WorkerUIToolInvocation } from "./ai-agent-orchestrator-tools/worker";
