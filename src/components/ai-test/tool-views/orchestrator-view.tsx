/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Loader } from "@/components/ai-elements/loader";
interface OrchestratorViewProps {
  // Using a loose type to accommodate AI SDK tool payload shape
  invocation: any;
}

export default function OrchestratorView({
  invocation,
}: OrchestratorViewProps) {
  switch (invocation.state) {
    case "input-streaming":
      return (
        <div className="flex items-center text-muted-foreground">
          <Loader className="mr-3 size-4" />
          <span className="font-medium text-sm tracking-tight">
            Planning orchestration...
          </span>
        </div>
      );

    case "input-available":
      return (
        <div className="font-medium text-muted-foreground text-sm tracking-tight">
          Analyzing requirements and creating implementation plan...
        </div>
      );

    case "output-available": {
      const plan = invocation.output?.plan;

      if (invocation.output?.state === "loading" || !plan) {
        return (
          <div className="flex items-center text-muted-foreground">
            <Loader className="mr-3 size-4" />
            <span className="font-medium text-sm tracking-tight">
              Generating orchestration plan...
            </span>
          </div>
        );
      }

      return (
        <div className="space-y-6 rounded-xl bg-gradient-to-b from-white to-zinc-50/50 p-6 shadow-[0px_1px_0px_0px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_rgba(255,_255,_255,_0.25)] dark:from-zinc-900 dark:to-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-b from-zinc-50 to-zinc-100 px-3 py-1.5 shadow-[0px_1px_0px_0px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_rgba(255,_255,_255,_0.25)] dark:from-zinc-800 dark:to-zinc-900">
              <span className="font-semibold text-xs text-zinc-600 tracking-wider dark:text-zinc-400">
                ORCHESTRATOR
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
              <span className="font-medium text-sm text-zinc-700 tracking-tight dark:text-zinc-300">
                KSA coordination plan
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Request
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed dark:text-zinc-300">
              {plan.request}
            </p>
            {plan.contextSummary ? (
              <div className="rounded-lg bg-gradient-to-b from-zinc-50 to-zinc-100/60 p-4 text-sm text-zinc-700 shadow-[0px_1px_0px_0px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_rgba(255,_255,_255,_0.25)] dark:from-zinc-800 dark:to-zinc-900/60 dark:text-zinc-200">
                {plan.contextSummary}
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Steps
            </p>
            {plan?.steps && plan.steps.length > 0 ? (
              <ul className="space-y-2">
                {plan.steps.map((step: string, index: number) => (
                  <li className="flex items-start gap-3" key={index}>
                    <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500" />
                    <span className="text-sm text-zinc-700 leading-relaxed dark:text-zinc-300">
                      {step}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                Waiting for orchestration steps...
              </p>
            )}
          </div>
        </div>
      );
    }

    case "output-error":
      return (
        <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
          <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
          <span className="font-semibold text-sm tracking-tight">
            Error: {invocation.errorText}
          </span>
        </div>
      );

    default:
      return null;
  }
}
