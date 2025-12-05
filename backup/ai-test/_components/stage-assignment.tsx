'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CompanyStage } from '@/app/(demos)/ai-test/_types/generation-types';
import { CheckCircle2, Circle } from 'lucide-react';

interface StageAssignmentProps {
  availableStages: CompanyStage[];
  assignedStageIds: string[];
  onAssignedStagesChange: (stageIds: string[]) => void;
  className?: string;
}

export function StageAssignment({
  availableStages,
  assignedStageIds,
  onAssignedStagesChange,
  className,
}: StageAssignmentProps) {
  const toggleStage = (stageId: string) => {
    if (assignedStageIds.includes(stageId)) {
      onAssignedStagesChange(assignedStageIds.filter((id) => id !== stageId));
    } else {
      onAssignedStagesChange([...assignedStageIds, stageId]);
    }
  };

  const assignedCount = assignedStageIds.length;
  const totalCount = availableStages.length;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Interview Stages for this Position
        </label>
        <Badge variant={assignedCount > 0 ? 'primary' : 'secondary'} className="text-xs">
          {assignedCount} of {totalCount} selected
        </Badge>
      </div>

      <Card className="border-2">
        <CardContent className="p-4 space-y-2">
          {availableStages.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No stages configured. Please configure stages in Step 2.
            </div>
          ) : (
            <>
              {availableStages.map((stage) => {
                const isAssigned = assignedStageIds.includes(stage.id || stage.name);

                return (
                  <div
                    key={stage.id || stage.name}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer',
                      isAssigned
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent hover:border-muted-foreground/20 hover:bg-muted/30'
                    )}
                    onClick={() => toggleStage(stage.id || stage.name)}
                  >
                    <div className="flex-shrink-0">
                      {isAssigned ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-full text-xl flex-shrink-0"
                      style={{ backgroundColor: `${stage.color}20`, color: stage.color }}
                    >
                      {stage.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{stage.name}</h4>
                        {stage.isSystemDefault && (
                          <Badge variant="secondary" className="text-xs">
                            System
                          </Badge>
                        )}
                      </div>
                      {stage.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {stage.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </CardContent>
      </Card>

      {assignedCount === 0 && availableStages.length > 0 && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Select at least one interview stage for this position
        </p>
      )}
    </div>
  );
}
