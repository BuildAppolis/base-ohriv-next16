/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Loader } from "@/components/ai-elements/loader";
import { cn } from "@/lib/utils";

interface WorkerViewProps {
  // Loose type to align with AI SDK runtime shape
  invocation: any;
}

export default function WorkerView({ invocation }: WorkerViewProps) {
  switch (invocation.state) {
    case "input-streaming":
      return (
        <div className="flex items-center text-muted-foreground">
          <Loader className="mr-2 size-4" />
          <span className="font-medium text-sm">
            Assigning task to worker...
          </span>
        </div>
      );

    case "input-available":
      return (
        <div className="font-medium text-muted-foreground text-sm">
          {invocation.input?.workerType} worker is executing the task...
        </div>
      );

    case "output-available": {
      if (invocation.output.state === "loading") {
        return (
          <div className="flex items-center text-muted-foreground">
            <Loader className="mr-2 size-4" />
            <span className="font-medium text-sm">
              Worker is processing the task...
            </span>
          </div>
        );
      }

      const result = invocation.output.result;

      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-b from-zinc-50 to-zinc-100 px-3 py-1.5 shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)] dark:from-zinc-800 dark:to-zinc-900">
                <span className="font-semibold text-xs text-zinc-700 tracking-wider dark:text-zinc-300">
                  {invocation.input?.workerType?.toUpperCase() || "WORKER"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                <span className="font-medium text-sm text-zinc-600 dark:text-zinc-400">
                  Task: {invocation.input?.taskId}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-b from-white to-zinc-50/50 p-6 shadow-[0px_1px_0px_0px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_rgba(255,_255,_255,_0.25)] dark:from-zinc-900 dark:to-zinc-950/50">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
              <h3 className="font-semibold text-sm text-zinc-900 tracking-tight dark:text-zinc-100">
                Task Description
              </h3>
            </div>
            <p className="text-pretty text-sm text-zinc-700 leading-relaxed dark:text-zinc-300">
              {invocation.input?.description}
            </p>
          </div>

          <div className="rounded-xl bg-gradient-to-b from-white to-zinc-50/50 p-6 shadow-[0px_1px_0px_0px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_rgba(255,_255,_255,_0.25)] dark:from-zinc-900 dark:to-zinc-950/50">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <h3 className="font-semibold text-sm text-zinc-900 tracking-tight dark:text-zinc-100">
                Output
              </h3>
            </div>
            <p className="text-pretty text-sm text-zinc-700 leading-relaxed dark:text-zinc-300">
              {result.output}
            </p>
          </div>

          <div className="rounded-xl bg-gradient-to-b from-white to-zinc-50/50 p-6 shadow-[0px_1px_0px_0px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_rgba(255,_255,_255,_0.25)] dark:from-zinc-900 dark:to-zinc-950/50">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <h3 className="font-semibold text-sm text-zinc-900 tracking-tight dark:text-zinc-100">
                Explanation
              </h3>
            </div>
            <p className="text-pretty text-sm text-zinc-700 leading-relaxed dark:text-zinc-300">
              {result.explanation}
            </p>
          </div>

          {result.deliverables && result.deliverables.length > 0 && (
            <div className="rounded-xl bg-gradient-to-b from-white to-zinc-50/50 p-6 shadow-[0px_1px_0px_0px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_rgba(255,_255,_255,_0.25)] dark:from-zinc-900 dark:to-zinc-950/50">
              <div className="mb-5 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                <h3 className="font-semibold text-sm text-zinc-900 tracking-tight dark:text-zinc-100">
                  Deliverables
                </h3>
              </div>
              <div className="space-y-4">
                {result.deliverables.map(
                  (deliverable: any, index: number) => (
                    <div
                      className="rounded-lg bg-gradient-to-b from-zinc-50 to-zinc-100/50 p-4 shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)] transition-all duration-200 hover:shadow-md dark:from-zinc-800 dark:to-zinc-900/50"
                      key={index}
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <h4 className="text-balance font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                          {deliverable.name}
                        </h4>
                        <div className="flex gap-2">
                          <span className="rounded-md bg-zinc-200 px-2.5 py-1 font-medium text-xs text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                            {deliverable.type}
                          </span>
                          <span
                            className={cn(
                              "rounded-md px-2.5 py-1 font-medium text-xs",
                              deliverable.status === "completed"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : deliverable.status === "review"
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                  : deliverable.status === "approved"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                    : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                            )}
                          >
                            {deliverable.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-pretty text-sm text-zinc-600 leading-relaxed dark:text-zinc-400">
                        {deliverable.content}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {result.issues && result.issues.length > 0 && (
            <div className="rounded-xl bg-gradient-to-b from-red-50 to-red-100/50 p-6 shadow-[0px_1px_0px_0px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_rgba(255,_255,_255,_0.25)] dark:from-red-950/50 dark:to-red-900/30">
              <div className="mb-5 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                <h3 className="font-semibold text-red-900 text-sm tracking-tight dark:text-red-100">
                  Issues Encountered
                </h3>
              </div>
              <ul className="space-y-3">
                {result.issues.map((issue: string, index: number) => (
                  <li className="flex items-start gap-3" key={index}>
                    <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-200 shadow-sm dark:bg-red-900/50">
                      <span className="font-medium text-red-600 text-xs dark:text-red-400">
                        !
                      </span>
                    </div>
                    <span className="text-pretty text-red-800 text-sm leading-relaxed dark:text-red-200">
                      {issue}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.suggestions && result.suggestions.length > 0 && (
            <div className="rounded-xl bg-gradient-to-b from-amber-50 to-amber-100/50 p-6 shadow-[0px_1px_0px_0px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_rgba(255,_255,_255,_0.25)] dark:from-amber-950/50 dark:to-amber-900/30">
              <div className="mb-5 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <h3 className="font-semibold text-amber-900 text-sm tracking-tight dark:text-amber-100">
                  Suggestions for Improvement
                </h3>
              </div>
              <ul className="space-y-3">
                {result.suggestions.map(
                  (suggestion: string, index: number) => (
                    <li className="flex items-start gap-3" key={index}>
                      <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-200 shadow-sm dark:bg-amber-900/50">
                        <span className="font-medium text-amber-600 text-xs dark:text-amber-400">
                          ✓
                        </span>
                      </div>
                      <span className="text-pretty text-amber-800 text-sm leading-relaxed dark:text-amber-200">
                        {suggestion}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    case "output-error":
      return (
        <div className="flex items-center gap-3 rounded-lg bg-gradient-to-b from-red-50 to-red-100/50 p-4 shadow-[0px_1px_0px_0px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_rgba(255,_255,_255,_0.25)] dark:from-red-950/50 dark:to-red-900/30">
          <div className="h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
          <span className="font-medium text-red-800 text-sm dark:text-red-200">
            Error: {invocation.errorText}
          </span>
        </div>
      );

    default:
      return null;
  }
}
