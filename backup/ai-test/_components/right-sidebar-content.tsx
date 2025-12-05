/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Database } from 'lucide-react';
import type { CompanyContextData } from './company-context-sidebar';
import type { CellResult } from './execution-history';
import type { LevelAssignment } from './level-assignments-manager';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';
import type { GenerationStepItem } from './generation-sidebar';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExecutionHistory } from './execution-history';
import type { CompanyStage } from '@/app/(demos)/ai-test/_types/generation-types';

interface RightSidebarContentProps {
  // Generation Progress props
  generationSteps: GenerationStepItem[];
  progress: number;
  isGenerating: boolean;

  // Execution History props
  executionCells: CellResult[];
  onAddExecutionCell: (cell: CellResult) => void;
  onUpdateExecutionCell: (id: string, updates: Partial<CellResult>) => void;

  // Streaming props
  streamingAttributes?: any[];
  streamingQuestions?: any[];
  streamingProgress?: {
    attributes?: { current: number; total: number };
    questions?: { current: number; total: number };
  };

  // Additional props
  companyStages?: CompanyStage[];
  availableLevels?: string[];

  // Legacy props (kept for compatibility but no longer used)
  currentContext?: CompanyContextData | null;
  cells?: CellResult[];
  positionWork?: {
    roleTitle: string;
    roleDetails: string;
    baseOperations: string;
    services: string[];
    levelAssignments: LevelAssignment[];
    hiringCurve: number;
  };
  onLoadContext?: (context: CompanyContextData, cells?: CellResult[], positionWork?: any) => void;
}

export function RightSidebarContent({
  generationSteps,
  progress,
  isGenerating,
  executionCells,
  onUpdateExecutionCell,
  streamingAttributes,
  streamingQuestions,
  streamingProgress,
  companyStages,
  availableLevels,
}: RightSidebarContentProps) {
  const totalOperations = generationSteps.reduce((sum, step) => sum + (step.operations?.length || 0), 0);
  const hasGenerationProgress = generationSteps.length > 0;

  return (
    <div className="h-full flex flex-col w-full">
      <ScrollArea className="flex-1 w-full">
        <div className="p-4 space-y-6">
          {/* Generation Progress Section */}
          {hasGenerationProgress && (
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {isGenerating ? (
                  <Badge variant="primary" className="gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Generating...
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Complete
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {totalOperations} {totalOperations === 1 ? 'operation' : 'operations'}
                </span>
              </div>

              {/* Generation Steps */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Generation Steps
                </div>
                <div className="space-y-2">
                  {generationSteps.map((step) => (
                    <div
                      key={step.id}
                      className={cn(
                        'p-3 rounded-lg border transition-colors',
                        step.status === 'completed' && 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
                        step.status === 'in_progress' && 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
                        step.status === 'error' && 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
                        step.status === 'pending' && 'bg-muted/50 border-muted'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {step.status === 'completed' && (
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                          )}
                          {step.status === 'in_progress' && (
                            <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
                          )}
                          {step.status === 'pending' && (
                            <Circle className="h-4 w-4 text-muted-foreground" />
                          )}
                          {step.status === 'error' && (
                            <Circle className="h-4 w-4 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{step.label}</div>
                          {step.operations && step.operations.length > 0 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {step.operations.length} {step.operations.length === 1 ? 'operation' : 'operations'}
                            </div>
                          )}
                          {step.error && (
                            <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                              {step.error}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Execution History Section */}
          <div className="space-y-4">
            <ExecutionHistory
              cells={executionCells}
              onCellUpdate={onUpdateExecutionCell}
              streamingAttributes={streamingAttributes || []}
              streamingQuestions={streamingQuestions || []}
              streamingProgress={streamingProgress || {}}
              isGenerating={isGenerating}
              availableLevels={availableLevels || []}
              companyStages={companyStages || []}
            />
          </div>

          {/* Empty State when no data */}
          {!hasGenerationProgress && executionCells.length === 0 && (
            <div className="flex items-center justify-center h-full p-8 text-center text-muted-foreground">
              <div>
                <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No generation in progress</p>
                <p className="text-xs mt-1">Start generating to see progress here</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
