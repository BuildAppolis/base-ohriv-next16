/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useChat } from "@ai-sdk/react";
import { type ChatStatus, DefaultChatTransport } from "ai";
import {
  CopyIcon,
  RefreshCcwIcon,
  SettingsIcon,
  UsersIcon,
  WorkflowIcon,
} from "lucide-react";
import {
  type FormEvent,
  type ReactNode,
  type SVGProps,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { Action, Actions } from "@/components/ai-elements/actions";
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import { Message, MessageContent } from "@/components/ai-elements/message";
// UI Components

import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
// Types and utilities
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import sampleContext from "@/app/(demos)/test-response/company_context_example.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeEditor } from "@/components/buildappolis/code-editor";
import { StreamingJson } from "@/components/ai-elements/streaming-json";
import { JsonViewer } from "@/components/buildappolis/json-tree-viewer";
import { CodeBlock } from "@/components/ai-elements/code-block";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CompanyContextInput } from "@/types/ai/company";
import { calculateCost, estimateTokens } from "@/lib/ai/cost-calculator";
import { getCostLevel } from "@/lib/ai/cost-colors";

import CoordinatorView from "./tool-views/coordinator-view";
// Tool view components
import OrchestratorView from "./tool-views/orchestrator-view";
import WorkerView from "./tool-views/worker-view";
import { OrchestratorToolUIMessage } from "@/lib/ai/orchestrator-tool-types";
import { ScrollArea } from "../ui/scroll-area";

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const sampleContextPreview =
  JSON.stringify(sampleContext, null, 2).split("\n").slice(0, 24).join("\n") +
  "\n...";

type TooltipKey =
  | "company_context_example.json"
  | "KSA_JobFit"
  | "CoreValues_CompanyFit"
  | "KSA_ORCHESTRATOR_PROMPT.md"
  | "ORCHESTRATOR/README.md"
  | "ORCHESTRATOR/AGENT_FLOW.md";

const initialTooltipContent: Record<TooltipKey, string> = {
  "company_context_example.json": ["```json", sampleContextPreview, "```"].join(
    "\n"
  ),
  KSA_JobFit:
    "```markdown\nKSA_JobFit: Behavioral Knowledge/Skills/Abilities questions with evaluation_criteria, expected_answers, follow_up_probes, and red_flag_indicators. See expected_outputs/ksa_job_fit.json.\n```",
  CoreValues_CompanyFit:
    "```markdown\nCoreValues_CompanyFit: Two behavioral questions per exact core value name with sample_indicators (strong/weak) and follow_up_probes. See expected_outputs/ksa_company_fit.json.\n```",
  "KSA_ORCHESTRATOR_PROMPT.md":
    "```markdown\nKSA_FRAMEWORK_FROM_CONTEXT.md: Protocol for parsing company context, KSA definitions, required JSON shape, and validation checklist.\n```",
  "ORCHESTRATOR/README.md":
    "```markdown\nORCHESTRATOR/README.md: Overview of the orchestrator-worker pattern, tools, and demo usage.\n```",
  "ORCHESTRATOR/AGENT_FLOW.md":
    "```markdown\nORCHESTRATOR/AGENT_FLOW.md: Detailed orchestrator-worker decision flow and tool sequencing.\n```",
};

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface HeaderSectionProps {
  hasResults: boolean;
  status: ChatStatus;
}

interface ChainOfThoughtDisplayProps {
  messages: OrchestratorToolUIMessage[];
  status: ChatStatus;
  finalKsa?: { KSA_JobFit?: any; CoreValues_CompanyFit?: any };
}

interface ErrorStateProps {
  error: string;
}

interface ToolStep {
  icon: any;
  label: string;
  description: string;
  status: "complete" | "active" | "pending";
  content?: React.ReactNode;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Orchestrator-Worker Chat Demo Component
 *
 * A comprehensive AI agent interface that demonstrates the Orchestrator-Worker pattern
 * for complex project management and task coordination. The agent can break down
 * complex requests into manageable tasks and assign them to specialized workers.
 */
export function OrchestratorChatDemo() {
  const [input, setInput] = useState("");
  const [draftInput, setDraftInput] = useState("");
  const [lastInputText, setLastInputText] = useState("");
  const [costStats, setCostStats] = useState<{
    inputTokens: number;
    outputTokens: number;
    totalCost: number | null;
  } | null>(null);
  const [finalKsa, setFinalKsa] = useState<
    { KSA_JobFit?: any; CoreValues_CompanyFit?: any } | undefined
  >(undefined);

  const { messages, sendMessage, status, regenerate, error } =
    useChat<OrchestratorToolUIMessage>({
      transport: new DefaultChatTransport({
        api: "/api/ai/orchestrator-agent",
        credentials: "include",
        headers: { "Custom-Header": "value" },
      }),
      onError: (error) => {
        toast.error(error.message);
      },
    });

  /**
   * Handles form submission for new messages
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) {
      return;
    }

    const validation = validateCompanyContextInput(input);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid company context JSON");
      return;
    }

    const normalizedText = JSON.stringify(validation.parsed, null, 2);
    sendMessage({ text: normalizedText });
    setInput(""); // Clear input after sending
    setLastInputText(normalizedText);
  };

  const hasAssistantResponse = messages.some(
    (message) => message.role === "assistant"
  );

  // Compute token/cost summary after completion
  useEffect(() => {
    if (!hasAssistantResponse || status === "streaming") return;

    const assistantMessages = messages.filter(
      (m) => m.role === "assistant" && m.parts
    );
    const lastAssistant = assistantMessages[assistantMessages.length - 1];
    const outputText = lastAssistant ? extractText(lastAssistant) : "";
    const inputTokens = lastInputText ? estimateTokens(lastInputText) : 0;
    const outputTokens = outputText ? estimateTokens(outputText) : 0;
    const cost = calculateCost({
      model: "gpt-4.1-mini",
      inputTokens,
      outputTokens,
    });

    setCostStats({
      inputTokens,
      outputTokens,
      totalCost: cost?.totalCost ?? null,
    });

    try {
      const parsed = JSON.parse(outputText);
      if (parsed && typeof parsed === "object") {
        setFinalKsa({
          KSA_JobFit: parsed.KSA_JobFit,
          CoreValues_CompanyFit: parsed.CoreValues_CompanyFit,
        });
      }
    } catch {
      setFinalKsa(undefined);
    }
  }, [hasAssistantResponse, status, messages, lastInputText]);

  return (
    <div className="relative size-full p-6">
      <div className="flex h-full flex-col space-y-6">
        <HeaderSection hasResults={messages.length > 0} status={status} />
        <ScrollArea className="h-fit">
          <Conversation className="relative h-full w-full flex-1">
            <ConversationContent>
              {/* Show loading state when streaming */}
              {status === "streaming" && messages.length === 0 && (
                <LoadingState />
              )}

              {/* Show error state if there's an error */}
              {error && <ErrorState error={error.message} />}

              {/* Render messages */}
              {messages.map((message) => (
                <MessageRenderer
                  key={message.id}
                  message={message}
                  messages={messages}
                  onRegenerate={regenerate}
                  status={status}
                  finalKsa={finalKsa}
                />
              ))}

              {status === "submitted" && <Loader />}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        </ScrollArea>
        {hasAssistantResponse && status !== "streaming" && costStats && (
          <div className="flex justify-end">
            <CostBadge stats={costStats} />
          </div>
        )}

        {hasAssistantResponse ? (
          <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm text-muted-foreground">
            <span>
              {status === "streaming" || status === "submitted"
                ? "Please wait for generation to finish to start a new generation."
                : "Output generated. Start a new run to send another context."}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={status === "streaming" || status === "submitted"}
                onClick={() => window.location.reload()}
              >
                New run
              </Button>
            </div>
          </div>
        ) : (
          <form
            className="space-y-3"
            onSubmit={handleSubmit}
          >
            <Card className="border bg-card/80 shadow-sm">
              <CardHeader className="py-4">
                <div className="flex items-center justify-between gap-2 w-full">
                  <div>
                    <CardTitle className="text-base">
                      Company context JSON
                    </CardTitle>
                    <p className="text-muted-foreground text-xs">
                      Paste your company context; output will be KSA_JobFit and CoreValues_CompanyFit JSON.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* <Button
                      size="sm"
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        setInput(JSON.stringify(sampleContext, null, 2))
                      }
                    >
                      Load sample
                    </Button> */}
                    <Button
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={() => setInput("")}
                    >
                      Clear
                    </Button>
                    <div className="flex items-center gap-1">
                      <IconButton
                        icon={<CopyIcon className="h-3.5 w-3.5" />}
                        label="Copy"
                        onClick={() => navigator.clipboard.writeText(input)}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="">
                <div className="space-y-3">
                  <textarea
                    className="w-full rounded-md border bg-background p-3 font-mono text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    rows={10}
                    placeholder="Paste JSON here, then click Import JSON -- or load a sample, then click Import JSON."
                    value={draftInput}
                    onChange={(e) => setDraftInput(e.target.value)}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setDraftInput(JSON.stringify(sampleContext, null, 2));
                      }}
                    >
                      Load sample
                    </Button>
                    <Button
                      size="sm"
                      type="button"
                      variant="primary"
                      onClick={() => {
                        const validation = validateCompanyContextInput(draftInput);
                        if (!validation.valid) {
                          toast.error(validation.error || "Invalid JSON");
                          return;
                        }
                        const normalized = JSON.stringify(validation.parsed, null, 2);
                        setInput(normalized);
                      }}
                    >
                      Import JSON
                    </Button>
                    <Button
                      size="sm"
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setDraftInput("");
                        setInput("");
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="rounded-md border bg-muted/30 p-3">
                    <p className="mb-2 text-xs font-semibold text-muted-foreground">
                      Current JSON (read-only)
                    </p>
                    <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words font-mono text-xs">
                      {input || "No JSON loaded"}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                type="submit"
                variant="primary"
                disabled={!input || status === "submitted" || status === "streaming"}
              >
                {status === "submitted" || status === "streaming"
                  ? "Generating..."
                  : "Submit"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT DEFINITIONS
// ============================================================================

/**
 * Header Section Component
 */
const HeaderSection = ({ hasResults, status }: HeaderSectionProps) => (
  <div className={cn("space-y-2", !hasResults && "mx-auto")}>
    <HeaderSectionHeading
      patternType="KSA Generator"
      status={status}
      subtitle="KSA Framework"
      title="KSA Interview Orchestrator"
    />

    <div className={cn("space-y-6", hasResults && "hidden")}>
      <p className="mb-4 max-w-xl text-muted-foreground text-sm leading-6">
        This orchestrator is tuned to the KSA interview protocol. Paste your
        company context JSON (matching{" "}
        <HeaderSectionCalloutTooltip fileKey="company_context_example.json" />
        ) and it will return{" "}
        <HeaderSectionCalloutTooltip fileKey="KSA_JobFit" /> and{" "}
        <HeaderSectionCalloutTooltip fileKey="CoreValues_CompanyFit" /> JSON
        aligned with the KSA instructions (
        <HeaderSectionCalloutTooltip fileKey="KSA_ORCHESTRATOR_PROMPT.md" />
        ). Internal docs:{" "}
        <HeaderSectionCalloutTooltip fileKey="ORCHESTRATOR/README.md" /> and{" "}
        <HeaderSectionCalloutTooltip fileKey="ORCHESTRATOR/AGENT_FLOW.md" />.
      </p>
    </div>
  </div>
);

/**
 * Message Renderer Component
 */
interface MessageRendererProps {
  message: OrchestratorToolUIMessage;
  messages: OrchestratorToolUIMessage[];
  status: ChatStatus;
  onRegenerate: () => void;
  finalKsa?: { KSA_JobFit?: any; CoreValues_CompanyFit?: any };
}

const MessageRenderer = ({
  message,
  messages,
  status,
  onRegenerate,
  finalKsa,
}: MessageRendererProps) => {
  const hasSources =
    message.role === "assistant" &&
    message.parts.filter((part) => part.type === "source-url").length > 0;

  const hasToolCalls =
    message.role === "assistant" &&
    message.parts.some((part) => part.type?.startsWith("tool-"));

  return (
    <div className="flex flex-col">
      {/* Sources Display */}
      {hasSources && (
        <Sources>
          <SourcesTrigger
            count={
              message.parts.filter((part) => part.type === "source-url").length
            }
          />
          {message.parts
            .filter((part) => part.type === "source-url")
            .map((part, i) => (
              <SourcesContent key={`${message.id}-${i}`}>
                <Source
                  href={part.url}
                  key={`${message.id}-${i}`}
                  title={part.url}
                />
              </SourcesContent>
            ))}
        </Sources>
      )}

      {/* Chain of Thought Display */}
      {hasToolCalls && (
        <div className="mx-2 mb-4 ">
          <ChainOfThoughtDisplay
            messages={[message]}
            status={status}
            finalKsa={finalKsa || undefined}
          />
        </div>
      )}

      {/* Message Parts */}
      {message.parts.map((part, index) => (
        <MessagePartRenderer
          key={`${message.id}-${index}`}
          message={message}
          messages={messages}
          onRegenerate={onRegenerate}
          part={part}
          partIndex={index}
          status={status}
        />
      ))}
    </div>
  );
};

/**
 * Message Part Renderer Component
 */
interface MessagePartRendererProps {
  part: any;
  message: OrchestratorToolUIMessage;
  messages: OrchestratorToolUIMessage[];
  status: ChatStatus;
  partIndex: number;
  onRegenerate: () => void;
}

const MessagePartRenderer = ({
  part,
  message,
  messages,
  status,
  partIndex,
  onRegenerate,
}: MessagePartRendererProps) => {
  const isLastPart = partIndex === message.parts.length - 1;
  const isSecondToLastPart = partIndex === message.parts.length - 2;
  const isLastMessage = message.id === messages.at(-1)?.id;
  const isStreaming =
    status === "streaming" &&
    partIndex === message.parts.length - 1 &&
    message.id === messages.at(-1)?.id;

  switch (part.type) {
    case "text":
      return (
        <>
          <Message from={message.role} isLast={isLastMessage}>
            <MessageContent className="w-full">
              <JSONMessageViewer
                isStreaming={isStreaming && message.role === "assistant"}
                label={
                  message.role === "assistant" ? "KSA Output" : "Company Context"
                }
                text={part.text}
              />
            </MessageContent>
          </Message>
          {message.role === "assistant" && isSecondToLastPart && (
            <MessageActions onRegenerate={onRegenerate} text={part.text} />
          )}
        </>
      );

    case "reasoning":
      return (
        <Reasoning className="mt-4 w-full" isStreaming={isStreaming}>
          <ReasoningTrigger />
          <ReasoningContent>{part.text}</ReasoningContent>
        </Reasoning>
      );

    default:
      return null;
  }
};

/**
 * Message Actions Component
 */
interface MessageActionsProps {
  text: string;
  onRegenerate: () => void;
}

const MessageActions = ({ text, onRegenerate }: MessageActionsProps) => (
  <Actions className="mb-2">
    <Action label="Retry" onClick={onRegenerate}>
      <RefreshCcwIcon className="size-3" />
    </Action>
    <Action label="Copy" onClick={() => navigator.clipboard.writeText(text)}>
      <CopyIcon className="size-3" />
    </Action>
  </Actions>
);

const safeParseJSON = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const extractJson = (value: string) => {
  // Try fenced code block ```json ... ```
  const fencedMatch = value.match(/```json\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  // Try from first { to last }
  const firstBrace = value.indexOf("{");
  const lastBrace = value.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return value.slice(firstBrace, lastBrace + 1).trim();
  }

  return null;
};

const validateCompanyContextInput = (
  value: string
): { valid: boolean; parsed?: CompanyContextInput; error?: string } => {
  const parsed = safeParseJSON(value);
  if (!parsed || typeof parsed !== "object") {
    return { valid: false, error: "Input is not valid JSON" };
  }

  const requiredTopLevel = [
    "company_profile",
    "mission_and_culture",
    "interview_steps",
    "technologies",
    "positions",
  ];

  for (const key of requiredTopLevel) {
    if (!(key in parsed)) {
      return { valid: false, error: `Missing required field: ${key}` };
    }
  }

  if (!Array.isArray((parsed as any).positions) || (parsed as any).positions.length === 0) {
    return { valid: false, error: "positions must be a non-empty array" };
  }

  return { valid: true, parsed: parsed as CompanyContextInput };
};

const JSONMessageViewer = ({
  text,
  label,
  isStreaming = false,
}: {
  text: string;
  label: string;
  isStreaming?: boolean;
}) => {
  const extracted = extractJson(text);
  const parsed = extracted ? safeParseJSON(extracted) : safeParseJSON(text);
  const value = parsed
    ? JSON.stringify(parsed, null, 2)
    : extracted || text;

  if (isStreaming) {
    return (
      <StreamingJson isStreaming label={label}>
        {value}
      </StreamingJson>
    );
  }

  if (!parsed) {
    return (
      <Tabs defaultValue="view" className="w-full">
        <TabsList className="mb-2 grid w-full grid-cols-2">
          <TabsTrigger value="view">View</TabsTrigger>
          <TabsTrigger value="raw">Raw</TabsTrigger>
        </TabsList>
        <TabsContent value="view" className="m-0">
          <pre className="whitespace-pre-wrap break-words rounded-md border bg-muted/30 p-3 font-mono text-xs shadow-sm">
            {value}
          </pre>
        </TabsContent>
        <TabsContent value="raw" className="m-0">
          <CodeEditor
            className="rounded-md border"
            path={`${label.toLowerCase().replace(/\s+/g, "-")}.json`}
            downloadFileName={`${label.toLowerCase().replace(/\s+/g, "-")}.json`}
            height="320px"
            language="json"
            readOnly
            showToolbar
            title={label}
            value={value}
          />
        </TabsContent>
      </Tabs>
    );
  }

  return (
    <Tabs defaultValue="view" className="w-full">
      <TabsList className="mb-2 grid w-full grid-cols-2">
        <TabsTrigger value="view">View</TabsTrigger>
        <TabsTrigger value="raw">Raw</TabsTrigger>
      </TabsList>
      <TabsContent value="view" className="m-0">
        <JsonViewer data={parsed} rootName="response" defaultExpanded />
      </TabsContent>
      <TabsContent value="raw" className="m-0">
        <CodeEditor
          className="rounded-md border"
          path={`${label.toLowerCase().replace(/\s+/g, "-")}.json`}
          downloadFileName={`${label.toLowerCase().replace(/\s+/g, "-")}.json`}
          height="320px"
          language="json"
          readOnly
          showToolbar
          title={label}
          value={value}
        />
      </TabsContent>
    </Tabs>
  );
};

const IconButton = ({
  icon,
  onClick,
  label,
}: {
  icon: ReactNode;
  onClick: () => void;
  label: string;
}) => (
  <Button
    aria-label={label}
    className="h-8 w-8 px-0"
    onClick={onClick}
    size="icon"
    type="button"
    variant="ghost"
  >
    {icon}
  </Button>
);

/**
 * Loading State Component
 */
const LoadingState = () => (
  <div className="flex h-full flex-col items-center justify-center space-y-4">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50">
      <Loader />
    </div>
    <div className="space-y-1 text-center">
      <p className="font-medium text-foreground text-sm">
        Initializing orchestrator agent
      </p>
      <p className="text-muted-foreground text-xs">
        Setting up workers and preparing coordination
      </p>
    </div>
  </div>
);

/**
 * Error State Component
 */
const ErrorState = ({ error }: ErrorStateProps) => (
  <div className="flex h-full flex-col items-center justify-center space-y-3 text-center">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
      <svg
        className="h-5 w-5 text-destructive"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        />
      </svg>
    </div>
    <div className="space-y-1">
      <p className="font-medium text-destructive text-sm">Error</p>
      <p className="max-w-sm text-muted-foreground text-xs">{error}</p>
    </div>
  </div>
);

// ============================================================================
// CHAIN OF THOUGHT & ICONS
// ============================================================================

/**
 * Orchestrator Icon Component
 */
function OrchestratorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="text-zinc-800 dark:text-zinc-100">
      <svg
        data-testid="geist-icon"
        height="16"
        strokeLinejoin="round"
        style={{ color: "currentcolor" }}
        viewBox="0 0 16 16"
        width="16"
        {...props}
      >
        <path
          d="M2.5 0.5V0H3.5V0.5C3.5 1.60457 4.39543 2.5 5.5 2.5H6V3V3.5H5.5C4.39543 3.5 3.5 4.39543 3.5 5.5V6H3H2.5V5.5C2.5 4.39543 1.60457 3.5 0.5 3.5H0V3V2.5H0.5C1.60457 2.5 2.5 1.60457 2.5 0.5Z"
          fill="currentColor"
        />
        <path
          d="M14.5 4.5V5H13.5V4.5C13.5 3.94772 13.0523 3.5 12.5 3.5H12V3V2.5H12.5C13.0523 2.5 13.5 2.05228 13.5 1.5V1H14H14.5V1.5C14.5 2.05228 14.9477 2.5 15.5 2.5H16V3V3.5H15.5C14.9477 3.5 14.5 3.94772 14.5 4.5Z"
          fill="currentColor"
        />
        <path
          d="M8.40706 4.92939L8.5 4H9.5L9.59294 4.92939C9.82973 7.29734 11.7027 9.17027 14.0706 9.40706L15 9.5V10.5L14.0706 10.5929C11.7027 10.8297 9.82973 12.7027 9.59294 15.0706L9.5 16H8.5L8.40706 15.0706C8.17027 12.7027 6.29734 10.8297 3.92939 10.5929L3 10.5V9.5L3.92939 9.40706C6.29734 9.17027 8.17027 7.29734 8.40706 4.92939Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

/**
 * Chain of Thought Display Component
 */
const ChainOfThoughtDisplay = ({
  messages,
  finalKsa,
}: ChainOfThoughtDisplayProps) => {
  const toolSteps = extractToolSteps(messages, finalKsa);

  if (toolSteps.length === 0) {
    return null;
  }

  return (
    <ChainOfThought defaultOpen>
      <ChainOfThoughtHeader>Project Coordination Process</ChainOfThoughtHeader>
      <ChainOfThoughtContent>
        {toolSteps.map((step, index) => (
          <ChainOfThoughtStep
            description={step.description}
            icon={step.icon}
            key={index}
            label={step.label}
            status={step.status}
          >
            {step.content}
          </ChainOfThoughtStep>
        ))}
      </ChainOfThoughtContent>
    </ChainOfThought>
  );
};

/**
 * Extracts tool steps from messages for Chain of Thought display
 */
const extractToolSteps = (
  messages: OrchestratorToolUIMessage[],
  finalKsa?: { KSA_JobFit?: any; CoreValues_CompanyFit?: any }
): ToolStep[] => {
  const steps: ToolStep[] = [];

  for (const message of messages) {
    if (message.role === "assistant" && message.parts) {
      const toolCalls = message.parts.filter((part) =>
        part.type?.startsWith("tool-")
      );

      toolCalls.forEach((tool, index) => {
        const step = getToolStep(
          tool,
          index === toolCalls.length - 1,
          finalKsa
        );
        if (step) {
          steps.push(step);
        }
      });
    }
  }

  return steps;
};

/**
 * Gets tool step information for Chain of Thought display
 */
const getToolStep = (
  tool: any,
  isLast: boolean,
  finalKsa?: { KSA_JobFit?: any; CoreValues_CompanyFit?: any }
): ToolStep | null => {
  const status = isLast ? "active" : "complete";
  const isLoading =
    tool.state !== "output-available" ||
    tool.output?.state === "loading" ||
    tool.state === "input-streaming";

  switch (tool.type) {
    case "tool-orchestrator":
      return {
        icon: SettingsIcon,
        label: "Orchestration",
        description: `Planning: "${tool.input?.request || "Complex project"}"`,
        status,
        content: (
          <div className="mx-2 max-w-xl first-of-type:mt-4">
            <Tool className="rounded-xl" defaultOpen>
              <ToolHeader state={tool.state} type={tool.type} />
              <ToolContent>
                <div className="p-4">
                  <OrchestratorView invocation={tool} />
                </div>
                {tool.input && <ToolInput input={tool.input} />}
              </ToolContent>
            </Tool>
          </div>
        ),
      };
    case "tool-ksa_jobfit":
      return {
        icon: UsersIcon,
        label: "KSA JobFit",
        description: "Generate Knowledge/Skills/Abilities JSON",
        status,
        content: (
          <div className="mx-2 max-w-xl first-of-type:mt-4">
            <Tool className="rounded-xl" defaultOpen>
              <ToolHeader state={tool.state} type={tool.type} />
              <ToolContent>
                {isLoading ? (
                  <ToolLoading label="Generating KSA_JobFit..." />
                ) : (
                  <div className="p-4 space-y-2 text-sm text-muted-foreground">
                    <p>Context received, producing KSA_JobFit.</p>
                    {finalKsa?.KSA_JobFit ? (
                      <ToolResponse
                        json={finalKsa.KSA_JobFit}
                        label="Response"
                      />
                    ) : (
                      <>
                        {tool.input && <ToolInput input={tool.input} />}
                        {tool.output && (
                          <ToolOutput
                            output={tool.output}
                            errorText={tool.errorText}
                          />
                        )}
                      </>
                    )}
                  </div>
                )}
              </ToolContent>
            </Tool>
          </div>
        ),
      };
    case "tool-ksa_companyfit":
      return {
        icon: UsersIcon,
        label: "KSA Company Fit",
        description: "Generate CoreValues_CompanyFit JSON",
        status,
        content: (
          <div className="mx-2 max-w-xl first-of-type:mt-4">
            <Tool className="rounded-xl" defaultOpen>
              <ToolHeader state={tool.state} type={tool.type} />
              <ToolContent>
                {isLoading ? (
                  <ToolLoading label="Generating CoreValues_CompanyFit..." />
                ) : (
                  <div className="p-4 space-y-2 text-sm text-muted-foreground">
                    <p>Context received, producing CoreValues_CompanyFit.</p>
                    {finalKsa?.CoreValues_CompanyFit ? (
                      <ToolResponse
                        json={finalKsa.CoreValues_CompanyFit}
                        label="Response"
                      />
                    ) : (
                      <>
                        {tool.input && <ToolInput input={tool.input} />}
                        {tool.output && (
                          <ToolOutput
                            output={tool.output}
                            errorText={tool.errorText}
                          />
                        )}
                      </>
                    )}
                  </div>
                )}
              </ToolContent>
            </Tool>
          </div>
        ),
      };
    case "tool-worker":
      return {
        icon: UsersIcon,
        label: "Worker Execution",
        description: `${tool.input?.workerType || "Specialist"} worker executing task`,
        status,
        content: (
          <div className="mt-2">
            <div className="mx-2 max-w-xl first-of-type:mt-4">
              <Tool className="rounded-xl">
                <ToolHeader state={tool.state} type={tool.type} />
                <ToolContent>
                  <div className="p-4">
                    <WorkerView invocation={tool} />
                  </div>
                  <ToolInput input={tool.input} />
                </ToolContent>
              </Tool>
            </div>
          </div>
        ),
      };
    case "tool-coordinator":
      return {
        icon: WorkflowIcon,
        label: "Coordination",
        description: `Managing: ${tool.input?.action || "orchestration process"}`,
        status,
        content: (
          <div className="mt-2">
            <div className="mx-2 max-w-xl first-of-type:mt-4">
              <Tool className="rounded-xl">
                <ToolHeader state={tool.state} type={tool.type} />
                <ToolContent>
                  <div className="p-4">
                    <CoordinatorView invocation={tool} />
                  </div>
                  <ToolInput input={tool.input} />
                </ToolContent>
              </Tool>
            </div>
          </div>
        ),
      };
    default:
      return null;
  }
};

const summarizeContext = (context: string) => {
  try {
    const parsed = JSON.parse(context);
    return {
      company: parsed.company_profile?.name,
      values: parsed.mission_and_culture?.core_values?.length || 0,
      positions: parsed.positions?.length || 0,
    };
  } catch {
    return { contextPreview: context.slice(0, 120) };
  }
};

const ToolLoading = ({ label }: { label: string }) => (
  <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
    <Loader className="size-4" />
    <span>{label}</span>
  </div>
);

const ToolResponse = ({ json, label }: { json: any; label: string }) => {
  const text = JSON.stringify(json, null, 2);
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <div className="rounded-md border bg-muted/40 p-2">
        <CodeBlock
          className="max-h-96 overflow-auto [&_*]:whitespace-pre-wrap"
          code={text}
          language="json"
          showLineNumbers
        />
      </div>
      <div className="rounded-md border bg-muted/30 p-2">
        <JsonViewer data={json} rootName="response" defaultExpanded />
      </div>
    </div>
  );
};
// Extract text content from assistant message parts
const extractText = (message: OrchestratorToolUIMessage): string => {
  if ((message as any).content && typeof (message as any).content === "string") {
    return (message as any).content as string;
  }
  if (!message.parts) return "";
  return message.parts
    .map((part: any) => {
      if (part.text) return part.text;
      if (part.content) return String(part.content);
      return "";
    })
    .join("\n");
};

const CostBadge = ({
  stats,
}: {
  stats: { inputTokens: number; outputTokens: number; totalCost: number | null };
}) => {
  const totalTokens = stats.inputTokens + stats.outputTokens;
  const totalCost = stats.totalCost ?? 0;
  const costLevel = getCostLevel(totalCost);

  return (
    <TooltipProvider delayDuration={50}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            className="flex items-center justify-center rounded-full shadow-sm"
          >
            <SettingsIcon className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="w-64 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Token & Cost</span>
            <span
              className="rounded-md px-2 py-1 text-xs font-semibold"
              style={{
                backgroundColor: costLevel.bgColor,
                color: costLevel.color,
                border: `1px solid ${costLevel.borderColor}`,
              }}
            >
              {costLevel.label}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <span className="text-muted-foreground">Input tokens</span>
            <span className="text-right font-medium">{stats.inputTokens}</span>
            <span className="text-muted-foreground">Output tokens</span>
            <span className="text-right font-medium">
              {stats.outputTokens}
            </span>
            <span className="text-muted-foreground">Total tokens</span>
            <span className="text-right font-medium">{totalTokens}</span>
            <span className="text-muted-foreground">Est. cost (USD)</span>
            <span className="text-right font-semibold">
              ${totalCost.toFixed(4)}
            </span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ============================================================================
// COMPONENT DEFINITIONS
// ============================================================================

function HeaderSectionCallout({ children }: { children: React.ReactNode }) {
  return (
    <span className="inset-shadow-2xs inset-shadow-white/25 whitespace-nowrap rounded-[3px] border-[1px] border-primary/10 bg-linear-to-b from-primary/5 to-muted/40 px-1 py-[1px] text-primary text-xs">
      {children}
    </span>
  );
}

function HeaderSectionCalloutTooltip({ fileKey }: { fileKey: TooltipKey }) {
  const content = initialTooltipContent[fileKey];

  return (
    <TooltipProvider delayDuration={50}>
      <Tooltip>
        <TooltipTrigger asChild>
          <HeaderSectionCallout>{fileKey}</HeaderSectionCallout>
        </TooltipTrigger>
        <TooltipContent className="max-w-[320px] whitespace-pre-wrap text-xs">
          <pre className="max-h-[240px] overflow-auto text-xs">{content}</pre>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function HeaderSectionHeading({
  title = "",
  subtitle = "",
  status,
  patternType,
}: {
  title: string;
  subtitle: string;
  status: ChatStatus;
  patternType: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 md:flex-row">
      <div className="flex items-center justify-center rounded-lg bg-muted p-[4px] shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)]">
        {status !== "ready" ? (
          <div className="rounded-md bg-primary/10 p-1 shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)]">
            <Loader className="size-8 text-foreground" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <OpenAIIcon className="size-8 rounded-md bg-primary/10 p-1 text-foreground shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)]" />
            <AISDKIcon className="size-8 rounded-md bg-primary/10 p-1 text-foreground shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)]" />
          </div>
        )}
      </div>
      <div>
        <h1 className="font-semibold text-2xl text-foreground tracking-tight">
          {title}
        </h1>
        <div className="flex items-center justify-center gap-2 md:justify-start">
          <p className="font-mono text-muted-foreground text-xs md:text-sm">
            {subtitle}
          </p>{" "}
          <p className="rounded-full bg-muted/50 px-2 py-1 text-muted-foreground text-xs">
            {patternType}
          </p>
        </div>
      </div>
    </div>
  );
}
const OpenAIIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    height="1em"
    preserveAspectRatio="xMidYMid"
    viewBox="0 0 256 260"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z" />
  </svg>
);

function AISDKIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="text-zinc-800 dark:text-zinc-100">
      <svg
        data-testid="multi-agent-icon"
        height="16"
        strokeLinejoin="round"
        style={{ color: "currentcolor" }}
        viewBox="0 0 16 16"
        width="16"
        {...props}
      >
        <path
          d="M2.5 0.5V0H3.5V0.5C3.5 1.60457 4.39543 2.5 5.5 2.5H6V3V3.5H5.5C4.39543 3.5 3.5 4.39543 3.5 5.5V6H3H2.5V5.5C2.5 4.39543 1.60457 3.5 0.5 3.5H0V3V2.5H0.5C1.60457 2.5 2.5 1.60457 2.5 0.5Z"
          fill="currentColor"
        />
        <path
          d="M14.5 4.5V5H13.5V4.5C13.5 3.94772 13.0523 3.5 12.5 3.5H12V3V2.5H12.5C13.0523 2.5 13.5 2.05228 13.5 1.5V1H14H14.5V1.5C14.5 2.05228 14.9477 2.5 15.5 2.5H16V3V3.5H15.5C14.9477 3.5 14.5 3.94772 14.5 4.5Z"
          fill="currentColor"
        />
        <path
          d="M8.40706 4.92939L8.5 4H9.5L9.59294 4.92939C9.82973 7.29734 11.7027 9.17027 14.0706 9.40706L15 9.5V10.5L14.0706 10.5929C11.7027 10.8297 9.82973 12.7027 9.59294 15.0706L9.5 16H8.5L8.40706 15.0706C8.17027 12.7027 6.29734 10.8297 3.92939 10.5929L3 10.5V9.5L3.92939 9.40706C6.29734 9.17027 8.17027 7.29734 8.40706 4.92939Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
