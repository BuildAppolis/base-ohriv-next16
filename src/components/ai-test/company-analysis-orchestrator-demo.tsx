/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type ChatStatus } from "ai";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Message,
  MessageContent,
} from "@/components/ai-elements/message";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CompanyAnalysisAgentUIMessage } from "@/lib/ai/company-analysis-orchestrator-agent";
// Ensure CompanyAnalysisAgentUIMessage is the correct type for messages
import { cn } from "@/lib/utils";
import { Loader2Icon, RouteIcon, SparklesIcon } from "lucide-react";

export function CompanyAnalysisOrchestratorDemo() {
  const [url, setUrl] = useState("");
  const [focus, setFocus] = useState("");

  const { messages, sendMessage, status, error } =
    useChat({
      transport: new DefaultChatTransport({
        api: "/api/ai/company-analysis-orchestrator",
        credentials: "include",
      }),
      onError: (err) => toast.error(err.message),
    });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!url.trim()) {
      toast.error("Enter a URL to analyze.");
      return;
    }

    const normalizedUrl = url.startsWith("http")
      ? url.trim()
      : `https://${url.trim()}`;
    const requestText = [
      `Analyze this company website: ${normalizedUrl}`,
      focus && `Notes from user: ${focus}`,
      "Follow the site_scrape -> stack_finder -> company_compiler -> company_analysis flow.",
    ]
      .filter(Boolean)
      .join("\n");

    await sendMessage({ text: requestText });
  };

  const isStreaming = status === "streaming" || status === "submitted";

  return (
    <div className="space-y-6">
      <Header status={status} />

      <Card className="border bg-card/80 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <RouteIcon className="size-4 text-primary" />
            Company Analysis Orchestrator
          </CardTitle>
          <CardDescription>
            Provide a URL and optional notes. The orchestrator will scrape,
            infer the stack, compile a blob, and summarize it for humans.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-[2fr_1fr_auto]"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <Label htmlFor="company-url">Company URL</Label>
              <Input
                id="company-url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="focus">Optional focus</Label>
              <Textarea
                id="focus"
                placeholder="Tech stack, hiring signals, ICP, etc."
                value={focus}
                className="min-h-[42px]"
                onChange={(e) => setFocus(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button
                type="submit"
                disabled={isStreaming}
                className="w-full md:w-auto"
              >
                {isStreaming ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  "Run orchestrator"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error && (
        <p className="text-destructive text-sm">
          {error.message || "Something went wrong."}
        </p>
      )}

      <div className="space-y-3">
        {messages.length === 0 && (
          <EmptyState />
        )}
        {messages.map((message, index) => {
          const parts =
            "parts" in message && message.parts && message.parts.length > 0
              ? message.parts
              : [{ type: "text", text: (message as any).content ?? "" }];
          const isLast = index === messages.length - 1;

          return (
            <div key={message.id} className="space-y-2">
              {parts.map((part: any, partIndex: number) => (
                <MessagePart
                  key={`${message.id}-${partIndex}`}
                  isLast={isLast}
                  message={message as unknown as CompanyAnalysisAgentUIMessage}
                  part={part}
                  status={status}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type MessagePartProps = {
  message: CompanyAnalysisAgentUIMessage;
  part: any;
  status: ChatStatus;
  isLast: boolean;
};

const MessagePart = ({ message, part, status, isLast }: MessagePartProps) => {
  if (part.type === "reasoning") {
    const streaming = status === "streaming" && isLast;
    return (
      <Reasoning isStreaming={streaming}>
        <ReasoningTrigger />
        <ReasoningContent>{part.text}</ReasoningContent>
      </Reasoning>
    );
  }

  if (part.type?.startsWith("tool-")) {
    return (
      <Tool defaultOpen className="bg-card/60">
        <ToolHeader state={part.state} type={part.type} />
        <ToolContent>
          <ToolInput input={part.input} />
          <ToolOutput errorText={part.errorText} output={part.output} />
        </ToolContent>
      </Tool>
    );
  }

  return (
    <Message from={"assistant"} isLast={isLast}>
      <MessageContent
        className={cn(
          "w-full max-w-3xl",
          "bg-muted/60"
        )}
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {part.text ?? ""}
        </p>
      </MessageContent>
    </Message>
  );
};

const Header = ({ status }: { status: ChatStatus }) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div className="space-y-2">
      <Badge variant="secondary">Company Analysis</Badge>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <SparklesIcon className="size-4" />
        <span>
          Orchestrated flow: site_scrape → stack_finder → company_compiler →
          company_analysis.
        </span>
      </div>
    </div>
    <StatusPill status={status} />
  </div>
);

const StatusPill = ({ status }: { status: ChatStatus }) => {
  const label = useMemo(() => {
    switch (status) {
      case "streaming":
      case "submitted":
        return "Running";
      case "ready":
      default:
        return "Idle";
    }
  }, [status]);

  const intent =
    status === "streaming" || status === "submitted"
      ? "bg-primary/10 text-primary"
      : "bg-muted text-muted-foreground";

  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-medium", intent)}>
      {label}
    </span>
  );
};

const EmptyState = () => (
  <Card className="border-dashed border-muted-foreground/40">
    <CardContent className="py-6">
      <p className="text-muted-foreground text-sm">
        Start by pasting a company URL above. The orchestrator will fetch the
        site, infer the stack, compile the context, and hand back a readable
        summary with links.
      </p>
    </CardContent>
  </Card>
);
