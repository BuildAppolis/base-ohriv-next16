'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider, SliderThumb } from '@/components/ui/slider';
import { Code, Loader2 } from 'lucide-react';
import { PositionSuggestions } from './position-suggestions';
import { LevelAssignmentsManager, LevelAssignment } from './level-assignments-manager';
import { TagInput } from '@/components/ui/tag-input';
import { GeneratedPositionsManager } from './generated-positions-manager';
import type { CompanyStage, PositionSuggestion } from '@/app/(demos)/ai-test/_types/generation-types';
import type { GeneratedPosition } from '@/lib/atoms/company-contexts';

interface PositionGeneratorStepProps {
  roleTitle: string;
  roleDetails: string;
  baseOperations: string;
  services: string[];
  levelAssignments: LevelAssignment[];
  hiringCurve: number;
  positionSuggestions: PositionSuggestion[];
  loadingSuggestions: boolean;
  suggestionsError: string | null;
  companyStages: CompanyStage[];
  isGenerating: boolean;
  isGeneratingAdditional: boolean;
  onRoleTitleChange: (title: string) => void;
  onRoleDetailsChange: (details: string) => void;
  onBaseOperationsChange: (operations: string) => void;
  onServicesChange: (services: string[]) => void;
  onLevelAssignmentsChange: (assignments: LevelAssignment[]) => void;
  onHiringCurveChange: (curve: number) => void;
  onSelectPosition: (suggestion: PositionSuggestion) => void;
  onManualEntry: () => void;
  onRetryPositionSuggestions: () => void;
  onGenerateSuggestions: () => void;
  onGenerateRoleSetup: () => void;
  onGenerateAdditionalRole: () => void;

  // Generated positions management
  generatedPositions?: GeneratedPosition[];
  onLoadGeneratedPosition: (position: GeneratedPosition) => void;
  onRemoveGeneratedPosition: (positionId: string) => void;
  onUpdateGeneratedPosition?: (positionId: string, updates: Partial<GeneratedPosition>) => void;
}

export function PositionGeneratorStep({
  roleTitle,
  roleDetails,
  baseOperations,
  services,
  levelAssignments,
  hiringCurve,
  positionSuggestions,
  loadingSuggestions,
  suggestionsError,
  companyStages,
  isGenerating,
  onRoleTitleChange,
  onRoleDetailsChange,
  onBaseOperationsChange,
  onServicesChange,
  onLevelAssignmentsChange,
  onHiringCurveChange,
  onSelectPosition,
  onManualEntry,
  onRetryPositionSuggestions,
  onGenerateSuggestions,
  onGenerateRoleSetup,

  // Generated positions management
  generatedPositions = [],
  onLoadGeneratedPosition,
  onRemoveGeneratedPosition,
  onUpdateGeneratedPosition,
}: PositionGeneratorStepProps) {
  const canGenerate =
    roleTitle.trim() &&
    levelAssignments.length > 0 &&
    levelAssignments.every(a => a.level && a.assignedStageIds.length > 0);

  return (
    <Card className='rounded-none border-none shadow-none'>
      <CardHeader className='py-4'>


        <CardTitle className="flex flex-row items-center gap-2">
          <Code className="h-5 w-5 flex-shrink-0" />
          <span>Step 3: Position Generator</span>
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm mt-1.5">
          Generate attributes, questions, and job template for a position.
        </CardDescription>

      </CardHeader>
      <CardContent className="space-y-4">
        {/* Position Suggestions - Always visible */}
        <PositionSuggestions
          suggestions={positionSuggestions}
          isLoading={loadingSuggestions}
          error={suggestionsError}
          onSelectPosition={onSelectPosition}
          onManualEntry={onManualEntry}
          onRetry={onRetryPositionSuggestions}
          onGenerateSuggestions={onGenerateSuggestions}
        />

        {/* Generated Positions Management - Only show when positions exist */}
        {generatedPositions && generatedPositions.length > 0 && (
          <GeneratedPositionsManager
            positions={generatedPositions}
            onLoadPosition={onLoadGeneratedPosition}
            onRemovePosition={onRemoveGeneratedPosition}
            onUpdatePosition={onUpdateGeneratedPosition}
          />
        )}

        {/* Position Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Position Title</label>
          <Input
            placeholder="Full-Stack Developer"
            value={roleTitle}
            onChange={(e) => onRoleTitleChange(e.target.value)}
            className="font-mono text-sm"
          />
        </div>

        <Textarea
          placeholder="Additional details (optional): Need someone to lead our patient portal rebuild..."
          value={roleDetails}
          onChange={(e) => onRoleDetailsChange(e.target.value)}
          rows={2}
          className="font-mono text-sm"
        />

        {/* Base Impact & Scope */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Base Impact & Scope (Optional)
            <span className="ml-1 text-xs text-muted-foreground">(Core outcomes for all levels)</span>
          </label>
          <Textarea
            placeholder="e.g., Drive patient portal innovation, improve healthcare accessibility through technology, ensure system reliability and user satisfaction..."
            value={baseOperations}
            onChange={(e) => onBaseOperationsChange(e.target.value)}
            rows={2}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Describe the fundamental outcomes and influence shared across all levels. Each level will also have specific impact & scope.
          </p>
        </div>

        {/* Level Assignments (now includes per-level stages and impact & scope) */}
        <LevelAssignmentsManager
          assignments={levelAssignments}
          onChange={onLevelAssignmentsChange}
          companyStages={companyStages}
        />

        {/* Tools/Services */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Tools/Services
            <span className="ml-1 text-xs text-muted-foreground">(Used by this position)</span>
          </label>
          <TagInput
            tags={services}
            onChange={onServicesChange}
            placeholder="Add tool/service (e.g., Figma, Jira, AWS)..."
          />
          <p className="text-xs text-muted-foreground">
            Specify the tools, platforms, or services this position will use. Helps AI generate better context.
          </p>
        </div>

        {/* Hiring Curve Threshold */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Hiring Curve Threshold</label>
            <span className="text-sm font-medium text-primary">{hiringCurve}%</span>
          </div>
          <Slider
            value={[hiringCurve]}
            onValueChange={(value) => onHiringCurveChange(value[0])}
            min={10}
            max={90}
            step={5}
            className="w-full"
          >
            <SliderThumb />
          </Slider>
          <p className="text-xs text-muted-foreground">
            Sets the minimum score for candidate acceptance. Lower = more lenient, Higher = more selective.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={onGenerateRoleSetup}
            className="w-full sm:w-auto"
            disabled={!canGenerate || isGenerating}
          >
            {isGenerating && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Generate Position
          </Button>
          {/* <Button
            variant="outline"
            onClick={onGenerateAdditionalRole}
            className="w-full sm:w-auto"
            disabled={!canGenerate || isGeneratingAdditional}
          >
            {isGeneratingAdditional && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Generate Additional Position
          </Button> */}
        </div>

        {levelAssignments.some(a => a.level && a.assignedStageIds.length === 0) && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            Each level must have at least one interview stage assigned (expand levels to configure)
          </p>
        )}
      </CardContent>
    </Card>
  );
}
