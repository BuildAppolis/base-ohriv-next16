'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Users, ChevronDown, ChevronUp, CheckCircle2, Circle } from 'lucide-react';
import { InlineRoleLevelSelector } from './inline-role-level-selector';
import { LevelReference } from './level-reference';
import { cn } from '@/lib/utils';
import type { CompanyStage } from '@/app/(demos)/ai-test/_types/generation-types';

export interface LevelAssignment {
  id: string;
  level: string;
  positionCount: number;
  assignedStageIds: string[]; // Which interview stages apply to this level
  operations?: string; // Impact & scope for this level (outcomes and sphere of influence)
}

interface LevelAssignmentsManagerProps {
  assignments: LevelAssignment[];
  onChange: (assignments: LevelAssignment[]) => void;
  companyStages: CompanyStage[];
  className?: string;
}

export function LevelAssignmentsManager({ assignments, onChange, companyStages, className }: LevelAssignmentsManagerProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Ensure all assignments always have system stages in their assignedStageIds
  const ensureSystemStages = (assignment: LevelAssignment): LevelAssignment => {
    const systemStageIds = companyStages
      .filter(stage => stage.isSystemDefault)
      .map(stage => stage.id || stage.name);

    const currentStageIds = assignment.assignedStageIds || [];
    const allStageIds = [...new Set([...systemStageIds, ...currentStageIds])];

    return {
      ...assignment,
      assignedStageIds: allStageIds,
    };
  };

  const addAssignment = () => {
    // System stages are always enabled by default
    const systemStageIds = companyStages
      .filter(stage => stage.isSystemDefault)
      .map(stage => stage.id || stage.name);

    const newAssignment: LevelAssignment = {
      id: Date.now().toString(),
      level: '',
      positionCount: 1,
      assignedStageIds: systemStageIds,
      operations: ''
    };
    onChange([...assignments, newAssignment]);
  };

  const updateAssignment = (id: string, updates: Partial<LevelAssignment>) => {
    onChange(
      assignments.map(a => {
        if (a.id === id) {
          const updated = { ...a, ...updates };
          return ensureSystemStages(updated);
        }
        return a;
      })
    );
  };

  const removeAssignment = (id: string) => {
    onChange(assignments.filter(a => a.id !== id));
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleStage = (assignmentId: string, stageId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    // Check if this is a system stage - system stages cannot be toggled off
    const stage = companyStages.find(s => (s.id || s.name) === stageId);
    if (stage?.isSystemDefault) return; // Don't allow toggling system stages

    const currentStages = assignment.assignedStageIds || [];
    const newStages = currentStages.includes(stageId)
      ? currentStages.filter(id => id !== stageId)
      : [...currentStages, stageId];

    updateAssignment(assignmentId, { assignedStageIds: newStages });
  };

  const totalPositions = assignments.reduce((sum, a) => sum + (a.positionCount || 0), 0);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Level Assignments
          <span className="ml-1 text-xs text-muted-foreground">
            (Which levels to hire and how many positions)
          </span>
        </label>
        {assignments.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span className="font-medium">{totalPositions} total position{totalPositions !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Assignment List */}
      <div className="space-y-2">
        {assignments.map((assignment) => {
          const isExpanded = expandedIds.has(assignment.id);
          // Count system stages (always enabled) + custom stages
          const systemStagesCount = companyStages.filter(s => s.isSystemDefault).length;
          const customStagesCount = (assignment.assignedStageIds || []).filter(id => {
            const stage = companyStages.find(s => (s.id || s.name) === id);
            return stage && !stage.isSystemDefault;
          }).length;
          const stagesCount = systemStagesCount + customStagesCount;
          const hasOperations = Boolean(assignment.operations?.trim());

          return (
            <Card key={assignment.id} className="border-2">
              <CardContent className="p-3">
                {/* Header Row */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 flex-wrap">
                    <InlineRoleLevelSelector
                      value={assignment.level}
                      onChange={(level) => updateAssignment(assignment.id, { level })}
                    />

                    {assignment.level && (
                      <LevelReference level={assignment.level} compact />
                    )}

                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max="99"
                        value={assignment.positionCount || ''}
                        onChange={(e) => updateAssignment(assignment.id, {
                          positionCount: parseInt(e.target.value) || 1
                        })}
                        className="w-20 text-sm text-center"
                        placeholder="1"
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        position{(assignment.positionCount || 1) !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Indicators */}
                    {assignment.level && (
                      <div className="flex items-center gap-1 ml-auto">
                        <Badge variant={stagesCount > 0 ? 'primary' : 'secondary'} className="text-xs">
                          {stagesCount} stage{stagesCount !== 1 ? 's' : ''}
                        </Badge>
                        {hasOperations && (
                          <Badge variant="outline" className="text-xs">
                            ✓ Impact
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {assignment.level && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(assignment.id)}
                        className="h-8 px-2"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAssignment(assignment.id)}
                      className="h-8 px-2 text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Validation */}
                {!assignment.level && (
                  <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">
                    Please select a level for this assignment
                  </p>
                )}

                {/* Expanded Details */}
                {isExpanded && assignment.level && (
                  <div className="mt-4 space-y-4 border-t pt-4">
                    {/* Stage Selection */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Interview Stages for this Level</label>
                        <Badge variant={stagesCount > 0 ? 'primary' : 'secondary'} className="text-xs">
                          {stagesCount} of {companyStages.length} selected
                        </Badge>
                      </div>

                      <div className="space-y-1.5">
                        {companyStages.length === 0 ? (
                          <div className="text-center py-4 text-xs text-muted-foreground border-2 border-dashed rounded-lg">
                            No stages configured. Please configure stages in Step 2.
                          </div>
                        ) : (
                          companyStages.map((stage) => {
                            const isSystemStage = stage.isSystemDefault;
                            const isAssigned = isSystemStage || (assignment.assignedStageIds || []).includes(stage.id || stage.name);
                            const isClickable = !isSystemStage;

                            return (
                              <div
                                key={stage.id || stage.name}
                                className={cn(
                                  'flex items-center gap-2 p-2 rounded-md border-2 transition-all',
                                  isClickable && 'cursor-pointer',
                                  !isClickable && 'opacity-75 cursor-not-allowed',
                                  isAssigned
                                    ? 'border-primary bg-primary/5'
                                    : 'border-transparent hover:border-muted-foreground/20 hover:bg-muted/30'
                                )}
                                onClick={() => isClickable && toggleStage(assignment.id, stage.id || stage.name)}
                              >
                                <div className="flex-shrink-0">
                                  {isAssigned ? (
                                    <CheckCircle2 className={cn("h-4 w-4", isSystemStage ? "text-primary" : "text-primary")} />
                                  ) : (
                                    <Circle className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>

                                <div
                                  className="flex items-center justify-center w-8 h-8 rounded-full text-base flex-shrink-0"
                                  style={{ backgroundColor: `${stage.color}20`, color: stage.color }}
                                >
                                  {stage.icon}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <h4 className="font-medium text-xs">{stage.name}</h4>
                                    {stage.isSystemDefault && (
                                      <Badge variant="secondary" className="text-xs px-1 py-0">
                                        Always On
                                      </Badge>
                                    )}
                                  </div>
                                  {stage.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                      {stage.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {systemStagesCount > 0 && (
                        <p className="text-xs text-muted-foreground">
                          System stages are always enabled. You can optionally add custom stages.
                        </p>
                      )}
                    </div>

                    {/* Impact & Scope */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Impact & Scope for {assignment.level}
                        <span className="ml-1 text-xs text-muted-foreground font-normal">
                          (Outcomes and sphere of influence)
                        </span>
                      </label>
                      <Textarea
                        placeholder={`e.g., "${assignment.level === 'Entry Level' || assignment.level === 'Junior'
                          ? 'Deliver features under guidance, contribute to team goals, build technical foundation, grow capabilities within assigned areas'
                          : assignment.level === 'Senior'
                            ? 'Drive technical direction for major features, scale team capabilities through mentorship, ensure architectural integrity, influence product outcomes'
                            : 'Own features end-to-end, deliver quality solutions independently, collaborate across teams, impact team velocity and product quality'}"`}
                        value={assignment.operations || ''}
                        onChange={(e) => updateAssignment(assignment.id, { operations: e.target.value })}
                        rows={3}
                        className="font-mono text-xs resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        Describe the outcomes this level achieves and their breadth of influence (individual → team → product → company).
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={addAssignment}
        className="w-full border-dashed"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Level Assignment
      </Button>

      {/* Validation Messages */}
      {assignments.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">
          Add at least one level assignment to specify hiring needs
        </p>
      )}

      {assignments.length > 0 && assignments.some(a => !a.level) && (
        <p className="text-xs text-amber-600 dark:text-amber-500 text-center">
          All assignments must have a level selected
        </p>
      )}

      {/* Helper Text */}
      {assignments.length > 0 && assignments.every(a => a.level) && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-xs text-blue-900 dark:text-blue-100">
            <strong>Hiring Summary:</strong> You&apos;re hiring {totalPositions} total position{totalPositions !== 1 ? 's' : ''} across {assignments.length} level{assignments.length !== 1 ? 's' : ''}
            {assignments.length > 0 && (
              <span>
                {' '}({assignments.map(a => `${a.positionCount} ${a.level}`).join(', ')})
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
