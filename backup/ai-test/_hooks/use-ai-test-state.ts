/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * AI-Test Page State Management Hook
 * Consolidates all state management for the AI-Test page to reduce complexity
 * and improve maintainability.
 */

import { useState, useCallback } from "react";
import type {
  CompanyContextData,
  DescriptionAnalysis,
  CompanyStage,
  PositionSuggestion,
  LevelAssignment,
  CellResult,
} from "../_types";
import type { GenerationStepItem } from "../_components/generation-sidebar";

export interface CompanyInfo {
  companyName: string;
  companyDescription: string;
  currentContext: CompanyContextData | null;
}

export interface RoleSetup {
  roleTitle: string;
  roleDetails: string;
  baseOperations: string;
  hiringCurve: number; // 10-90%
  services: string[];
  levelAssignments: LevelAssignment[];
}

export interface DescriptionManagement {
  descriptionAnalysis: DescriptionAnalysis | null;
  lastAnalyzedDescription: string;
  enhancedDescription: {
    enhanced: string;
    changes: string[];
  } | null;
  showingEnhanced: boolean;
  lastEnhancementType: "enhance" | "incorporate" | null;
  lastAdditions: {
    techStack?: string[];
    additionalInfo?: Record<string, string>;
  } | null;
  descriptionHasBeenEnhanced: boolean;
}

export interface GenerationState {
  generationSteps: GenerationStepItem[];
  progress: number;
  isGenerating: boolean;
  streamingAttributes: any[];
  streamingQuestions: any[];
  streamingProgress: {
    attributes?: { current: number; total: number };
    questions?: { current: number; total: number };
  };
}

export interface StageConfiguration {
  companyStages: CompanyStage[];
  stagesConfigured: boolean;
}

export interface PositionManagement {
  positionSuggestions: PositionSuggestion[];
  loadingSuggestions: boolean;
  suggestionsError: string | null;
}

export interface ExecutionTracking {
  cells: CellResult[];
}

/**
 * Central hook for all AI-Test page state management
 */
export function useAITestState({
  addExecutionCellToCurrentContext,
}: {
  addExecutionCell: (cell: CellResult) => void;
  addExecutionCellToCurrentContext: (cell: CellResult) => void;
}) {
  // Company Information State
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    companyName: "",
    companyDescription: "",
    currentContext: null,
  });

  // Role Setup State
  const [roleSetup, setRoleSetup] = useState<RoleSetup>({
    roleTitle: "",
    roleDetails: "",
    baseOperations: "",
    hiringCurve: 50,
    services: [],
    levelAssignments: [],
  });

  // Description Management State
  const [descriptionManagement, setDescriptionManagement] =
    useState<DescriptionManagement>({
      descriptionAnalysis: null,
      lastAnalyzedDescription: "",
      enhancedDescription: null,
      showingEnhanced: false,
      lastEnhancementType: null,
      lastAdditions: null,
      descriptionHasBeenEnhanced: false,
    });

  // Generation State
  const [generationState, setGenerationState] = useState<GenerationState>({
    generationSteps: [],
    progress: 0,
    isGenerating: false,
    streamingAttributes: [],
    streamingQuestions: [],
    streamingProgress: {},
  });

  // Stage Configuration State
  const [stageConfiguration, setStageConfiguration] =
    useState<StageConfiguration>({
      companyStages: [],
      stagesConfigured: false,
    });

  // Position Management State
  const [positionManagement, setPositionManagement] =
    useState<PositionManagement>({
      positionSuggestions: [],
      loadingSuggestions: false,
      suggestionsError: null,
    });

  // Execution Tracking State
  const [executionTracking, setExecutionTracking] = useState<ExecutionTracking>(
    {
      cells: [],
    }
  );

  // Company Info Actions
  const updateCompanyName = useCallback((name: string) => {
    setCompanyInfo((prev) => ({ ...prev, companyName: name }));
  }, []);

  const updateCompanyDescription = useCallback((description: string) => {
    setCompanyInfo((prev) => ({ ...prev, companyDescription: description }));
  }, []);

  const updateCurrentContext = useCallback(
    (context: CompanyContextData | null) => {
      setCompanyInfo((prev) => ({ ...prev, currentContext: context }));
    },
    []
  );

  // Role Setup Actions
  const updateRoleTitle = useCallback((title: string) => {
    setRoleSetup((prev) => ({ ...prev, roleTitle: title }));
  }, []);

  const updateRoleDetails = useCallback((details: string) => {
    setRoleSetup((prev) => ({ ...prev, roleDetails: details }));
  }, []);

  const updateBaseOperations = useCallback((operations: string) => {
    setRoleSetup((prev) => ({ ...prev, baseOperations: operations }));
  }, []);

  const updateHiringCurve = useCallback((curve: number) => {
    setRoleSetup((prev) => ({ ...prev, hiringCurve: curve }));
  }, []);

  const updateServices = useCallback((services: string[]) => {
    setRoleSetup((prev) => ({ ...prev, services }));
  }, []);

  const updateLevelAssignments = useCallback(
    (assignments: LevelAssignment[]) => {
      setRoleSetup((prev) => ({ ...prev, levelAssignments: assignments }));
    },
    []
  );

  // Description Management Actions
  const updateDescriptionAnalysis = useCallback(
    (analysis: DescriptionAnalysis | null) => {
      setDescriptionManagement((prev) => ({
        ...prev,
        descriptionAnalysis: analysis,
      }));
    },
    []
  );

  const updateLastAnalyzedDescription = useCallback((description: string) => {
    setDescriptionManagement((prev) => ({
      ...prev,
      lastAnalyzedDescription: description,
    }));
  }, []);

  const updateEnhancedDescription = useCallback(
    (enhanced: DescriptionManagement["enhancedDescription"]) => {
      setDescriptionManagement((prev) => ({
        ...prev,
        enhancedDescription: enhanced,
      }));
    },
    []
  );

  const updateShowingEnhanced = useCallback((showing: boolean) => {
    setDescriptionManagement((prev) => ({ ...prev, showingEnhanced: showing }));
  }, []);

  const updateDescriptionHasBeenEnhanced = useCallback((enhanced: boolean) => {
    setDescriptionManagement((prev) => ({
      ...prev,
      descriptionHasBeenEnhanced: enhanced,
    }));
  }, []);

  const updateLastEnhancementType = useCallback(
    (type: DescriptionManagement["lastEnhancementType"]) => {
      setDescriptionManagement((prev) => ({
        ...prev,
        lastEnhancementType: type,
      }));
    },
    []
  );

  const updateLastAdditions = useCallback(
    (additions: DescriptionManagement["lastAdditions"]) => {
      setDescriptionManagement((prev) => ({
        ...prev,
        lastAdditions: additions,
      }));
    },
    []
  );

  // Generation State Actions
  const updateGenerationSteps = useCallback((steps: GenerationStepItem[]) => {
    setGenerationState((prev) => ({ ...prev, generationSteps: steps }));
  }, []);

  const updateProgress = useCallback((progress: number) => {
    setGenerationState((prev) => ({ ...prev, progress }));
  }, []);

  const updateIsGenerating = useCallback((generating: boolean) => {
    setGenerationState((prev) => ({ ...prev, isGenerating: generating }));
  }, []);

  const updateStreamingAttributes = useCallback((attributes: any[]) => {
    setGenerationState((prev) => ({
      ...prev,
      streamingAttributes: attributes,
    }));
  }, []);

  const updateStreamingQuestions = useCallback((questions: any[]) => {
    setGenerationState((prev) => ({ ...prev, streamingQuestions: questions }));
  }, []);

  const updateStreamingProgress = useCallback(
    (progress: GenerationState["streamingProgress"]) => {
      setGenerationState((prev) => ({ ...prev, streamingProgress: progress }));
    },
    []
  );

  // Stage Configuration Actions
  const updateCompanyStages = useCallback((stages: CompanyStage[]) => {
    setStageConfiguration((prev) => ({ ...prev, companyStages: stages }));
  }, []);

  const updateStagesConfigured = useCallback((configured: boolean) => {
    setStageConfiguration((prev) => ({
      ...prev,
      stagesConfigured: configured,
    }));
  }, []);

  // Position Management Actions
  const updatePositionSuggestions = useCallback(
    (suggestions: PositionSuggestion[]) => {
      setPositionManagement((prev) => ({
        ...prev,
        positionSuggestions: suggestions,
      }));
    },
    []
  );

  const updateSuggestionsError = useCallback((error: string | null) => {
    setPositionManagement((prev) => ({ ...prev, suggestionsError: error }));
  }, []);

  const updateExecutionCell = useCallback(
    (id: string, updates: Partial<CellResult>) => {
      setExecutionTracking((prev) => ({
        cells: prev.cells.map((cell) =>
          cell.id === id ? { ...cell, ...updates } : cell
        ),
      }));
    },
    []
  );

  const clearExecutionCells = useCallback(() => {
    setExecutionTracking((prev) => ({ ...prev, cells: [] }));
  }, []);

  return {
    // State objects
    companyInfo,
    roleSetup,
    descriptionManagement,
    generationState,
    stageConfiguration,
    positionManagement,
    executionTracking,

    // Company Info actions
    updateCompanyName,
    updateCompanyDescription,
    updateCurrentContext,

    // Role Setup actions
    updateRoleTitle,
    updateRoleDetails,
    updateBaseOperations,
    updateHiringCurve,
    updateServices,
    updateLevelAssignments,

    // Description Management actions
    updateDescriptionAnalysis,
    updateLastAnalyzedDescription,
    updateEnhancedDescription,
    updateShowingEnhanced,
    updateDescriptionHasBeenEnhanced,
    updateLastEnhancementType,
    updateLastAdditions,

    // Generation State actions
    updateGenerationSteps,
    updateProgress,
    updateIsGenerating,
    updateStreamingAttributes,
    updateStreamingQuestions,
    updateStreamingProgress,

    // Stage Configuration actions
    updateCompanyStages,
    updateStagesConfigured,

    // Position Management actions
    updatePositionSuggestions,
    updateSuggestionsError,

    // Execution Tracking actions
    addExecutionCell: (cell: CellResult) => {
      const cellWithTimestamp = {
        ...cell,
        createdAt: new Date().toISOString(),
      };

      // Add to local state
      setExecutionTracking((prev) => ({
        cells: [...prev.cells, cellWithTimestamp],
      }));

      // Also save to the current context for persistence
      addExecutionCellToCurrentContext(cellWithTimestamp);
    },
    updateExecutionCell,
    clearExecutionCells,
  };
}
