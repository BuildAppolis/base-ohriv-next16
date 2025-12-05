/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { ModernWorkflowWrapper } from './modern-workflow-wrapper';
import { CompanyContextData } from '@/app/(demos)/ai-test/_components/company-context-sidebar';
import type { CompanyStage, PositionSuggestion } from '@/app/(demos)/ai-test/_types/generation-types';
import type { CellResult } from '../_types';
import type { GenerationStepItem } from './generation-sidebar';
import type { GeneratedPosition } from '@/hooks/use-company-contexts';

interface AITestWorkflowProps {
  // Company Information
  companyName: string;
  companyDescription: string;
  currentContext: CompanyContextData | null;
  onCompanyNameChange: (name: string) => void;
  onCompanyDescriptionChange: (description: string) => void;
  onCurrentContextChange: (context: CompanyContextData) => void;
  onResetContext?: () => void;

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
}

/**
 * Main AI-Test workflow orchestrator component using modern resizable layout
 * This replaces the complex dual-sidebar layout with a cleaner, more maintainable solution
 */
export function AITestWorkflow(props: AITestWorkflowProps) {
  return <ModernWorkflowWrapper {...props} />;
}