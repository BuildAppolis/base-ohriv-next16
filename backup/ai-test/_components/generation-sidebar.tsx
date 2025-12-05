/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Loader2, Circle, Database, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface GenerationStepItem {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  operations?: any[];
  metadata?: any;
  error?: string;
}

interface GenerationSidebarProps {
  steps: GenerationStepItem[];
  progress: number; // 0-100
  isGenerating: boolean;
}

export function GenerationSidebar({ steps, progress, isGenerating }: GenerationSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const totalOperations = steps.reduce((sum, step) => sum + (step.operations?.length || 0), 0);

  return (
    <>
      {/* Desktop: Fixed right sidebar */}
      <div className="hidden lg:block fixed right-4 top-20 w-80 xl:w-96 z-50">
        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5" />
              Generation Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Status Badge */}
            {isGenerating && (
              <div className="flex items-center gap-2 text-sm bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-2 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-medium">Generating...</span>
              </div>
            )}

            {!isGenerating && progress === 100 && (
              <div className="flex items-center gap-2 text-sm bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-2 rounded-lg">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-medium">Complete</span>
              </div>
            )}

            {/* Steps */}
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    'relative pl-6 pb-3',
                    index < steps.length - 1 &&
                    'border-l-2 ml-2 border-muted-foreground/20'
                  )}
                >
                  {/* Step Icon */}
                  <div className="absolute left-0 top-0">
                    {step.status === 'completed' && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                    {step.status === 'in_progress' && (
                      <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                    )}
                    {step.status === 'pending' && (
                      <Circle className="h-5 w-5 text-muted-foreground/40" />
                    )}
                    {step.status === 'error' && (
                      <Circle className="h-5 w-5 text-red-500" />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="space-y-1">
                    <div
                      className={cn(
                        'text-sm font-medium',
                        step.status === 'pending' && 'text-muted-foreground',
                        step.status === 'in_progress' && 'text-blue-600 dark:text-blue-400',
                        step.status === 'completed' && 'text-foreground',
                        step.status === 'error' && 'text-red-600 dark:text-red-400'
                      )}
                    >
                      {step.label}
                    </div>

                    {step.status === 'completed' && step.operations && (
                      <div className="text-xs text-muted-foreground">
                        {step.operations.length} database operation
                        {step.operations.length !== 1 ? 's' : ''}
                      </div>
                    )}

                    {step.status === 'in_progress' && (
                      <div className="text-xs text-blue-600/70 dark:text-blue-400/70">
                        Processing...
                      </div>
                    )}

                    {step.status === 'error' && step.error && (
                      <div className="text-xs text-red-600 dark:text-red-400">{step.error}</div>
                    )}

                    {step.metadata && (
                      <div className="text-xs text-muted-foreground">
                        {step.metadata.generationTime}ms
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Operations Summary */}
            {totalOperations > 0 && (
              <div className="pt-3 border-t">
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Total Operations:</span>
                    <span className="font-medium text-foreground">{totalOperations}</span>
                  </div>
                  <div className="text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                    <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full" />
                    Simulation Mode
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mobile/Tablet: Floating card */}
      <div className={cn(
        'lg:hidden fixed z-50 transition-all duration-300',
        isCollapsed
          ? 'top-20 right-4 w-auto'
          : 'top-20 right-4 left-4'
      )}>
        <Card className="shadow-lg border-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between w-full">
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-4 w-4" />
                {!isCollapsed && 'Generation Progress'}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-8 w-8 flex-shrink-0"
              >
                {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {!isCollapsed && (
            <CardContent className="space-y-3">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Overall</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Status Badge */}
              {isGenerating && (
                <div className="flex items-center gap-2 text-sm bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-2 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="font-medium">Generating...</span>
                </div>
              )}

              {!isGenerating && progress === 100 && (
                <div className="flex items-center gap-2 text-sm bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-2 rounded-lg">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Complete</span>
                </div>
              )}

              {/* Steps - scrollable on mobile */}
              <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={cn(
                      'relative pl-6 pb-3',
                      index < steps.length - 1 &&
                      'border-l-2 ml-2 border-muted-foreground/20'
                    )}
                  >
                    {/* Step Icon */}
                    <div className="absolute left-0 top-0">
                      {step.status === 'completed' && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                      {step.status === 'in_progress' && (
                        <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                      )}
                      {step.status === 'pending' && (
                        <Circle className="h-5 w-5 text-muted-foreground/40" />
                      )}
                      {step.status === 'error' && (
                        <Circle className="h-5 w-5 text-red-500" />
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="space-y-1">
                      <div
                        className={cn(
                          'text-sm font-medium',
                          step.status === 'pending' && 'text-muted-foreground',
                          step.status === 'in_progress' && 'text-blue-600 dark:text-blue-400',
                          step.status === 'completed' && 'text-foreground',
                          step.status === 'error' && 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {step.label}
                      </div>

                      {step.status === 'completed' && step.operations && (
                        <div className="text-xs text-muted-foreground">
                          {step.operations.length} operation{step.operations.length !== 1 ? 's' : ''}
                        </div>
                      )}

                      {step.status === 'in_progress' && (
                        <div className="text-xs text-blue-600/70 dark:text-blue-400/70">
                          Processing...
                        </div>
                      )}

                      {step.status === 'error' && step.error && (
                        <div className="text-xs text-red-600 dark:text-red-400">{step.error}</div>
                      )}

                      {step.metadata && (
                        <div className="text-xs text-muted-foreground">
                          {step.metadata.generationTime}ms
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Operations Summary */}
              {totalOperations > 0 && (
                <div className="pt-3 border-t">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Total Operations:</span>
                      <span className="font-medium text-foreground">{totalOperations}</span>
                    </div>
                    <div className="text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full" />
                      Simulation Mode
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </>
  );
}
