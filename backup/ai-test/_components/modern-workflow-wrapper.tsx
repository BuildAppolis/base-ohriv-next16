/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResizableWorkflowLayout } from './resizable-workflow-layout';
import { CompanyContextContent } from './company-context-content';
import { RightSidebarContent } from './right-sidebar-content';
import { CompanyDescriptionStep } from './company-description-step';
import { StageConfiguration } from './stage-configuration';
import { PositionGeneratorStep } from './position-generator-step';
import { Building2, Activity, Brain, Code, Building } from 'lucide-react';
import { ToolbarExpandable } from '@/components/buildappolis/step-expandable';
import type { CompanyContextData } from '@/hooks/use-company-contexts';
import type { CompanyStage, PositionSuggestion } from '@/app/(demos)/ai-test/_types/generation-types';
import type { CellResult } from '../_types';
import type { GenerationStepItem } from './generation-sidebar';
import type { GeneratedPosition } from '@/lib/atoms/company-contexts';

interface ModernWorkflowWrapperProps {
  // Company Information
  companyName: string;
  companyDescription: string;
  currentContext: CompanyContextData | null;
  onCompanyNameChange: (name: string) => void;
  onCompanyDescriptionChange: (description: string) => void;
  onCurrentContextChange: (context: CompanyContextData) => void;

  // Role Setup
  roleTitle: string;
  roleDetails: string;
  baseOperations: string;
  hiringCurve: number;
  services: string[];
  levelAssignments: any[];
  onRoleTitleChange: (title: string) => void;
  onRoleDetailsChange: (details: string) => void;
  onBaseOperationsChange: (operations: string) => void;
  onHiringCurveChange: (curve: number) => void;
  onServicesChange: (services: string[]) => void;
  onLevelAssignmentsChange: (assignments: any[]) => void;

  // Description Management
  descriptionAnalysis: any;
  lastAnalyzedDescription: string;
  enhancedDescription: any;
  showingEnhanced: boolean;
  lastEnhancementType: any;
  lastAdditions: any;
  descriptionHasBeenEnhanced: boolean;
  onCheckDescription: () => void;
  onEnhanceDescription: () => void;
  onAcceptEnhancement: () => void;
  onRejectEnhancement: () => void;
  onRegenerateEnhancement: () => void;
  onIncorporateAdditions: (additions: any) => void;
  onUseTemplate: () => void;
  onAnalyzeContext: () => void;
  onUnlockDescription: () => void;
  onGenerateDescription: () => void;
  isCheckingDescription: boolean;
  isEnhancingDescription: boolean;
  isIncorporatingAdditions: boolean;
  isAnalyzingContext: boolean;
  descriptionLocked: boolean;
  isUnlockingDescription: boolean;
  isGeneratingDescription: boolean;

  // Stage Configuration
  companyStages: CompanyStage[];
  stagesConfigured: boolean;
  onStagesChange: (stages: CompanyStage[]) => void;
  onContinueToRoleSetup: () => void;

  // Position Generation
  positionSuggestions: PositionSuggestion[];
  loadingSuggestions: boolean;
  suggestionsError: string | null;
  isGeneratingRoleSetup: boolean;
  isGeneratingAdditionalRole: boolean;
  onGenerateRoleSetup: () => void;
  onGenerateAdditionalRole: () => void;
  onSelectPosition: (suggestion: PositionSuggestion) => void;
  onManualEntry: () => void;
  onRetryPositionSuggestions: () => void;
  onGenerateSuggestions: () => void;

  // Generated Positions Management
  generatedPositions?: GeneratedPosition[];
  onLoadGeneratedPosition: (position: GeneratedPosition) => void;
  onRemoveGeneratedPosition: (positionId: string) => void;
  onUpdateGeneratedPosition?: (positionId: string, updates: Partial<GeneratedPosition>) => void;

  // Execution Tracking
  executionCells: CellResult[];
  onAddExecutionCell: (cell: CellResult) => void;
  onUpdateExecutionCell: (id: string, updates: Partial<CellResult>) => void;

  // Streaming State
  streamingAttributes?: any[];
  streamingQuestions?: any[];
  streamingProgress?: {
    attributes?: { current: number; total: number };
    questions?: { current: number; total: number };
  };

  // Generation State
  generationSteps: GenerationStepItem[];
  progress: number;
  isGenerating: boolean;

  // Analysis State Restoration
  onRestoreAnalysisState: (context: CompanyContextData) => void;

  // Reset Context
  onResetContext?: () => void;
}

function LeftPanelHeader() {
  return (
    <div className="p-4 border-b bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Company Context</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          AI Analysis
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Company profile, culture, and context configuration
      </p>
    </div>
  );
}

function RightPanelHeader({ isGenerating }: { isGenerating: boolean }) {
  return (
    <div className="p-4 border-b bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Generations</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {isGenerating ? 'Running' : 'Ready'}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Job and execution history
      </p>
    </div>
  );
}

export function ModernWorkflowWrapper(props: ModernWorkflowWrapperProps) {
  const { isGenerating } = props;

  // State for step management
  const [activeStep, setActiveStep] = useState<string | null>(null);

  // Handle continue to role setup - move to position generator step
  const handleContinueToRoleSetup = () => {
    props.onContinueToRoleSetup();
    setActiveStep('position-generator');
  };

  // Define the workflow steps
  const workflowSteps = [
    {
      id: 'company-description',
      title: 'Company Description',
      description: 'Describe your company and context for AI analysis',
      icon: Brain,
      content: (
        <CompanyDescriptionStep
          companyName={props.companyName}
          companyDescription={props.companyDescription}
          descriptionAnalysis={props.descriptionAnalysis}
          lastAnalyzedDescription={props.lastAnalyzedDescription}
          enhancedDescription={props.enhancedDescription}
          showingEnhanced={props.showingEnhanced}
          descriptionHasBeenEnhanced={props.descriptionHasBeenEnhanced}
          isGeneratingDescription={props.isGeneratingDescription}
          isCheckingDescription={props.isCheckingDescription}
          isEnhancingDescription={props.isEnhancingDescription}
          isIncorporatingAdditions={props.isIncorporatingAdditions}
          isAnalyzingContext={props.isAnalyzingContext}
          descriptionLocked={props.descriptionLocked}
          isUnlockingDescription={props.isUnlockingDescription}
          onCompanyNameChange={props.onCompanyNameChange}
          onCompanyDescriptionChange={props.onCompanyDescriptionChange}
          onGenerateDescription={props.onGenerateDescription}
          onCheckDescription={props.onCheckDescription}
          onEnhanceDescription={props.onEnhanceDescription}
          onAcceptEnhancement={props.onAcceptEnhancement}
          onRejectEnhancement={props.onRejectEnhancement}
          onRegenerateEnhancement={props.onRegenerateEnhancement}
          onIncorporateAdditions={props.onIncorporateAdditions}
          onAnalyzeContext={props.onAnalyzeContext}
          onUnlockDescription={props.onUnlockDescription}
        />
      ),
      disabled: false,
      disabledReason: undefined
    },
    {
      id: 'stage-configuration',
      title: 'Stage Configuration',
      description: 'Define interview stages for your hiring pipeline',
      icon: Building,
      disabled: !props.currentContext,
      disabledReason: !props.currentContext ? 'Complete company description first' : undefined,
      content: props.currentContext ? (
        <StageConfiguration
          stages={props.companyStages}
          onStagesChange={props.onStagesChange}
          onContinue={handleContinueToRoleSetup}
        />
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Complete company description first
        </div>
      )
    },
    {
      id: 'position-generator',
      title: 'Position Generator',
      description: 'Generate attributes, questions, and job templates',
      icon: Code,
      disabled: !props.currentContext || !(props.companyStages.length > 0 || props.stagesConfigured),
      disabledReason: (!props.currentContext || !(props.companyStages.length > 0 || props.stagesConfigured))
        ? 'Configure company stages first to enable position generation'
        : undefined,
      content: (() => {
        const hasStages = (props.currentContext?.stages && props.currentContext.stages.length > 0) ||
          (props.companyStages && props.companyStages.length > 0) ||
          props.stagesConfigured;

        return props.currentContext && hasStages ? (
          <PositionGeneratorStep
            roleTitle={props.roleTitle}
            roleDetails={props.roleDetails}
            baseOperations={props.baseOperations}
            services={props.services}
            levelAssignments={props.levelAssignments}
            hiringCurve={props.hiringCurve}
            positionSuggestions={props.positionSuggestions}
            loadingSuggestions={props.loadingSuggestions}
            suggestionsError={props.suggestionsError}
            companyStages={props.companyStages}
            isGenerating={props.isGeneratingRoleSetup}
            isGeneratingAdditional={props.isGeneratingAdditionalRole}
            onRoleTitleChange={props.onRoleTitleChange}
            onRoleDetailsChange={props.onRoleDetailsChange}
            onBaseOperationsChange={props.onBaseOperationsChange}
            onServicesChange={props.onServicesChange}
            onHiringCurveChange={props.onHiringCurveChange}
            onLevelAssignmentsChange={props.onLevelAssignmentsChange}
            onGenerateRoleSetup={props.onGenerateRoleSetup}
            onGenerateAdditionalRole={props.onGenerateAdditionalRole}
            onSelectPosition={props.onSelectPosition}
            onManualEntry={props.onManualEntry}
            onRetryPositionSuggestions={props.onRetryPositionSuggestions}
            onGenerateSuggestions={props.onGenerateSuggestions}
            generatedPositions={props.generatedPositions}
            onLoadGeneratedPosition={props.onLoadGeneratedPosition}
            onRemoveGeneratedPosition={props.onRemoveGeneratedPosition}
            onUpdateGeneratedPosition={props.onUpdateGeneratedPosition}
          />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Configure company stages first to enable position generation
          </div>
        );
      })()
    }
  ];

  // Auto-manage active step based on context state (only when no step is selected)
  useEffect(() => {
    const determineNextStep = (): string | null => {
      // Only auto-switch if no active step is set (preserve user choice)
      if (activeStep) {
        return null;
      }

      // If no context, show company description
      if (!props.currentContext) {
        return 'company-description';
      }

      // Check if stages are configured either in context or in separate state
      const hasStages = (props.currentContext.stages && props.currentContext.stages.length > 0) ||
        (props.companyStages && props.companyStages.length > 0) ||
        props.stagesConfigured;

      // If context exists but no stages configured, show stage configuration
      if (!hasStages) {
        return 'stage-configuration';
      }

      // If context and stages exist, show position generator by default
      return 'position-generator';
    };

    const nextStep = determineNextStep();

    // Only update state if the step changed
    if (nextStep && nextStep !== activeStep) {

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveStep(nextStep);
    }
  }, [props.currentContext, props.companyStages, props.stagesConfigured, activeStep]);

  // Left panel content
  const leftPanel = (
    <div className="h-full flex flex-col">
      <LeftPanelHeader />
      <ScrollArea className="flex-1">
        <div className="p-4">
          <CompanyContextContent
            context={props.currentContext}
            onChange={props.onCurrentContextChange}
            cells={props.executionCells}
            positionWork={{
              roleTitle: props.roleTitle,
              roleDetails: props.roleDetails,
              baseOperations: props.baseOperations,
              services: props.services,
              levelAssignments: props.levelAssignments,
              hiringCurve: props.hiringCurve,
            }}
            onLoadContext={(context, cells, positionWork) => {
              console.log('📦 LOADING CONTEXT - Raw context data:', context);
              console.log('📦 CONTEXT ANALYSIS FIELDS:', {
                descriptionAnalysis: context.descriptionAnalysis,
                lastAnalyzedDescription: context.lastAnalyzedDescription,
                enhancedDescription: context.enhancedDescription,
                descriptionHasBeenEnhanced: context.descriptionHasBeenEnhanced,
                lastEnhancementType: context.lastEnhancementType,
                lastAdditions: context.lastAdditions
              });

              props.onCurrentContextChange(context);

              // CRITICAL FIX: Load the damn company name and description into step 1!
              if (context.name) {
                props.onCompanyNameChange(context.name);
              }
              if (context.originalDescription) {
                props.onCompanyDescriptionChange(context.originalDescription);
              }

              // CRITICAL FIX: Restore analysis state so user can see it's already been analyzed!
              if (context.descriptionAnalysis || context.lastAnalyzedDescription || context.enhancedDescription) {
                console.log('🎯 TRIGGERING ANALYSIS STATE RESTORATION');
                props.onRestoreAnalysisState(context);
              } else {
                console.log('❌ NO ANALYSIS DATA FOUND - will show "Ready to analyze" message');
              }

              // CRITICAL FIX: Load stages into state and mark as configured if they exist!
              if (context.stages && context.stages.length > 0) {
                console.log('🎯 LOADING STAGES FROM CONTEXT:', context.stages.length, 'stages');
                props.onStagesChange(context.stages);
                console.log('✅ Stages loaded and marked as configured - Step 3 should now show');
              } else {
                console.log('❌ NO STAGES FOUND in context - will show stage configuration');
              }

              if (cells && cells.length > 0) {
                // TODO: Restore execution cells if needed
                console.log('Loading cells:', cells);
              }
              if (positionWork) {
                props.onRoleTitleChange(positionWork.roleTitle);
                props.onRoleDetailsChange(positionWork.roleDetails);
                props.onBaseOperationsChange(positionWork.baseOperations);
                props.onServicesChange(positionWork.services);
                props.onLevelAssignmentsChange(positionWork.levelAssignments);
                props.onHiringCurveChange(positionWork.hiringCurve);
              }
            }}
          />
        </div>
      </ScrollArea>
    </div>
  );

  // Main content area
  const mainContent = (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Progress indicator */}
        {isGenerating && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                <span className="text-sm font-medium">
                  Generating workflow... {Math.round(props.progress)}%
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Interactive Workflow Steps */}
        <ToolbarExpandable
          steps={workflowSteps}
          activeStep={activeStep}
          onActiveStepChange={setActiveStep}
        />
      </div>
    </ScrollArea>
  );

  // Right panel content
  const rightPanel = (
    <div className="h-full flex flex-col">
      <RightPanelHeader isGenerating={isGenerating} />
      <ScrollArea className="flex-1">
        <div className="p-4">
          <RightSidebarContent
            generationSteps={props.generationSteps}
            progress={props.progress}
            isGenerating={props.isGenerating}
            // Execution History props
            executionCells={props.executionCells}
            onUpdateExecutionCell={props.onUpdateExecutionCell}
            onAddExecutionCell={props.onAddExecutionCell}
            // Streaming props
            streamingAttributes={props.streamingAttributes}
            streamingQuestions={props.streamingQuestions}
            streamingProgress={props.streamingProgress}
            // Additional props
            companyStages={props.companyStages}
            availableLevels={props.levelAssignments?.map(a => a.level).filter(Boolean) || []}
            // Legacy props (passed for compatibility but no longer used)
            currentContext={props.currentContext}
            cells={props.executionCells}
            positionWork={{
              roleTitle: props.roleTitle,
              roleDetails: props.roleDetails,
              baseOperations: props.baseOperations,
              services: props.services,
              levelAssignments: props.levelAssignments,
              hiringCurve: props.hiringCurve,
            }}
            onLoadContext={(context, cells) => {
              console.log('📦 [RIGHT PANEL] LOADING CONTEXT - Raw context data:', context);
              console.log('📦 [RIGHT PANEL] CONTEXT ANALYSIS FIELDS:', {
                descriptionAnalysis: context.descriptionAnalysis,
                lastAnalyzedDescription: context.lastAnalyzedDescription,
                enhancedDescription: context.enhancedDescription,
                descriptionHasBeenEnhanced: context.descriptionHasBeenEnhanced,
                lastEnhancementType: context.lastEnhancementType,
                lastAdditions: context.lastAdditions
              });

              props.onCurrentContextChange(context);

              // CRITICAL FIX: Load the damn company name and description into step 1!
              if (context.name) {
                props.onCompanyNameChange(context.name);
              }
              if (context.originalDescription) {
                props.onCompanyDescriptionChange(context.originalDescription);
              }

              // CRITICAL FIX: Restore analysis state so user can see it's already been analyzed!
              if (context.descriptionAnalysis || context.lastAnalyzedDescription || context.enhancedDescription) {
                console.log('🎯 [RIGHT PANEL] TRIGGERING ANALYSIS STATE RESTORATION');
                props.onRestoreAnalysisState(context);
              } else {
                console.log('❌ [RIGHT PANEL] NO ANALYSIS DATA FOUND - will show "Ready to analyze" message');
              }

              if (cells && cells.length > 0) {
                // TODO: Restore execution cells if needed
                console.log('Loading cells:', cells);
              }
            }}
          />
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <ResizableWorkflowLayout
      leftPanel={leftPanel}
      mainContent={mainContent}
      rightPanel={rightPanel}
      onResetContext={props.onResetContext}
    />
  );
}