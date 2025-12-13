"use client";

import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export type StreamingJsonProps = HTMLAttributes<HTMLPreElement> & {
  label?: string;
  isStreaming?: boolean;
};

export function StreamingJson({
  className,
  label = "Response",
  isStreaming = false,
  children,
  ...props
}: StreamingJsonProps) {
  return (
    <div className="rounded-lg border bg-card/70 shadow-sm">
      <div className="flex items-center justify-between border-b px-3 py-2 text-xs font-medium text-muted-foreground">
        <span>{label}</span>
        {isStreaming && (
          <span className="animate-pulse text-[10px] uppercase tracking-wide">
            streaming…
          </span>
        )}
      </div>
      <div className="max-h-[520px] overflow-auto bg-neutral-950 text-neutral-50">
        <pre
          className={cn(
            "whitespace-pre-wrap break-words p-3 font-mono text-[12px] leading-relaxed",
            className
          )}
          {...props}
        >
          {children}
        </pre>
      </div>
    </div>
  );
}
