"use client";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const statusConfig = {
  "input-streaming": {
    badge: { variant: "secondary" as const, text: "Processing Input" },
    icon: Clock,
    color: "text-blue-600 dark:text-blue-400",
  },
  "input-available": {
    badge: { variant: "outline" as const, text: "Input Ready" },
    icon: CheckCircle,
    color: "text-emerald-600 dark:text-emerald-400",
  },
  "output-available": {
    badge: { variant: "primary" as const, text: "Complete" },
    icon: CheckCircle,
    color: "text-emerald-600 dark:text-emerald-400",
  },
  "output-error": {
    badge: { variant: "destructive" as const, text: "Error" },
    icon: AlertTriangle,
    color: "text-red-600 dark:text-red-400",
  },
};

export default function CoordinatorView({
  invocation,
}: {
  // Loose type to align with AI SDK runtime shape
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  invocation: any;
}) {
  const state = (invocation?.state ||
    "input-streaming") as keyof typeof statusConfig;
  const config = statusConfig[state] ?? statusConfig["input-streaming"];
  const StatusIcon = config.icon;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Badge
              className="px-3 py-1.5 font-medium text-sm tracking-tight shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)]"
              variant={config.badge.variant}
            >
              <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
              {config.badge.text}
            </Badge>
          </div>
          <h1 className="text-balance font-semibold text-2xl tracking-tight">
            Coordination Center
          </h1>
          <p className="text-pretty text-muted-foreground leading-relaxed">
            {invocation.input?.action}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-[0px_1px_0px_0px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_rgba(255,_255,_255,_0.25)]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <StatusIcon className={cn("h-4 w-4", config.color)} />
              <h3 className="font-medium tracking-tight">Current Status</h3>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-pretty text-muted-foreground text-sm leading-relaxed">
              {invocation.output?.coordination?.message}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-[0px_1px_0px_0px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_rgba(255,_255,_255,_0.25)]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-medium tracking-tight">Progress</h3>
              </div>
              <span className="font-medium text-sm tabular-nums">
                {Math.round(
                  invocation.output?.coordination?.progress?.percentage || 0
                )}
                %
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <Progress
              className="h-2 bg-muted/50"
              value={invocation.output?.coordination?.progress?.percentage || 0}
            />
            <p className="text-muted-foreground text-sm">
              <span className="font-medium text-foreground">Phase:</span>{" "}
              {invocation.output?.coordination?.currentPhase}
            </p>
          </CardContent>
        </Card>
      </div>

      {invocation.output?.coordination?.nextSteps?.length > 0 && (
        <Card className="border-0 shadow-[0px_1px_0px_0px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_rgba(255,_255,_255,_0.25)]">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <h3 className="font-medium tracking-tight">Next Steps</h3>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-3">
              {invocation.output?.coordination?.nextSteps?.map(
                (step: string, index: number) => (
                  <li className="flex items-start gap-3 text-sm" key={index}>
                    <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/60" />
                    <span className="text-pretty leading-relaxed">{step}</span>
                  </li>
                )
              )}
            </ul>
          </CardContent>
        </Card>
      )}

      {invocation.output?.coordination?.blockers?.length > 0 && (
        <Card className="border-0 bg-gradient-to-br from-red-50/50 to-red-50/20 shadow-[0px_1px_0px_0px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_rgba(255,_255,_255,_0.25)] dark:from-red-950/20 dark:to-red-950/10">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <h3 className="font-medium text-red-900 tracking-tight dark:text-red-100">
                Blockers
              </h3>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-3">
              {invocation.output?.coordination?.blockers?.map(
                (blocker: string, index: number) => (
                  <li className="flex items-start gap-3 text-sm" key={index}>
                    <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                    <span className="text-pretty text-red-800 leading-relaxed dark:text-red-200">
                      {blocker}
                    </span>
                  </li>
                )
              )}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {invocation.output?.coordination?.resolution && (
          <Card className="border-0 shadow-[0px_1px_0px_0px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_rgba(255,_255,_255,_0.25)]">
            <CardHeader className="pb-4">
              <h3 className="font-medium tracking-tight">Resolution Plan</h3>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2">
                <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  Action
                </p>
                <p className="text-pretty text-sm leading-relaxed">
                  {invocation.output?.coordination?.resolution?.action}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                    Timeline
                  </p>
                  <p className="font-medium text-sm tabular-nums">
                    {invocation.output?.coordination?.resolution?.timeline}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                    Impact
                  </p>
                  <p className="font-medium text-sm">
                    {invocation.output?.coordination?.resolution?.impact}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {invocation.output?.coordination?.summary && (
          <Card className="border-0 shadow-[0px_1px_0px_0px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_rgba(255,_255,_255,_0.25)]">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-medium tracking-tight">Summary</h3>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1 text-center">
                  <p className="font-semibold text-2xl tabular-nums">
                    {invocation.output?.coordination?.summary?.completedTasks}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    of {invocation.output?.coordination?.summary?.totalTasks}{" "}
                    tasks
                  </p>
                </div>
                <div className="space-y-1 text-center">
                  <p className="font-semibold text-2xl tabular-nums">
                    {Math.round(
                      (invocation.output?.coordination?.summary
                        ?.completedTasks /
                        invocation.output?.coordination?.summary?.totalTasks) *
                      100
                    )}
                    %
                  </p>
                  <p className="text-muted-foreground text-xs">complete</p>
                </div>
                <div className="space-y-1 text-center">
                  <p className="font-semibold text-2xl tabular-nums">
                    {invocation.output?.coordination?.summary?.qualityScore}
                  </p>
                  <p className="text-muted-foreground text-xs">quality score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {invocation.output?.coordination?.deliverables?.length > 0 && (
        <Card className="border-0 shadow-[0px_1px_0px_0px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_rgba(255,_255,_255,_0.25)]">
          <CardHeader className="pb-4">
            <h3 className="font-medium tracking-tight">Deliverables</h3>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-3">
              {invocation.output?.coordination?.deliverables?.map(
                (deliverable: string, index: number) => (
                  <li className="flex items-start gap-3 text-sm" key={index}>
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-pretty leading-relaxed">
                      {deliverable}
                    </span>
                  </li>
                )
              )}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
