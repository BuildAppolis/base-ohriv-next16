"use client";

/**
 * React Hook for AI Generation
 *
 * Provides a simple interface for AI generation with loading states and error handling
 */

import { useState, useCallback } from "react";
import {
  AIGenerator,
  AIGenerateOptions,
  AIGenerateResult,
  AIStreamEvent,
  AIStreamCallback,
} from "@/lib/ai/ai-client";

export interface UseAIGenerationState {
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  result: AIGenerateResult | null;
  progress: number;
  streamedContent: string;
}

export interface UseAIGenerationOptions extends AIGenerateOptions {
  onSuccess?: (result: AIGenerateResult) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: number, content: string) => void;
  enableStreaming?: boolean;
}

export function useAIGeneration(options: UseAIGenerationOptions = { prompt: '' }) {
  const [state, setState] = useState<UseAIGenerationState>({
    isLoading: false,
    isStreaming: false,
    error: null,
    result: null,
    progress: 0,
    streamedContent: "",
  });

  const generate = useCallback(
    async (generateOptions: Partial<AIGenerateOptions>) => {
      const mergedOptions = { ...options, ...generateOptions };

      setState((prev) => ({
        ...prev,
        isLoading: true,
        isStreaming: false,
        error: null,
        result: null,
        progress: 0,
        streamedContent: "",
      }));

      try {
        const onEvent: AIStreamCallback | undefined = options.enableStreaming
          ? (event: AIStreamEvent) => {
              switch (event.type) {
                case "start":
                  setState((prev) => ({
                    ...prev,
                    isStreaming: true,
                    progress: 0,
                    streamedContent: "",
                  }));
                  break;

                case "progress":
                  setState((prev) => ({
                    ...prev,
                    progress: event.progress || 0,
                    streamedContent: event.content || "",
                  }));
                  options.onProgress?.(
                    event.progress || 0,
                    event.content || ""
                  );
                  break;

                case "complete":
                  setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    isStreaming: false,
                    result: event.result || null,
                    progress: 100,
                    streamedContent: event.result?.content || "",
                  }));
                  if (event.result) {
                    options.onSuccess?.(event.result);
                  }
                  break;

                case "error":
                  setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    isStreaming: false,
                    error: event.error || "Unknown error",
                  }));
                  options.onError?.(event.error || "Unknown error");
                  break;
              }
            }
          : undefined;

        const result = await AIGenerator.generate(mergedOptions, onEvent);

        console.log("useAIGeneration: Generation completed", {
          hasResult: !!result,
          contentLength: result?.content?.length,
          enableStreaming: options.enableStreaming
        });

        // If streaming is enabled, the result might be null since events are handled via onEvent
        // But if streaming completes successfully, there should be a result
        if (options.enableStreaming && result) {
          // Stream completed with final result - trigger success callback if not already called
          if (!state.result) {
            setState((prev) => ({
              ...prev,
              isLoading: false,
              isStreaming: false,
              result,
              progress: 100,
              streamedContent: result.content,
            }));
            options.onSuccess?.(result);
          }
        } else if (!options.enableStreaming && result) {
          // Non-streaming mode - set result directly
          setState((prev) => ({
            ...prev,
            isLoading: false,
            result,
            progress: 100,
            streamedContent: result.content,
          }));
          options.onSuccess?.(result);
        } else if (!result) {
          // This shouldn't happen but let's handle it gracefully
          console.error("useAIGeneration: No result received from generation");
          setState((prev) => ({
            ...prev,
            isLoading: false,
            isStreaming: false,
            error: "No result received from AI generation",
          }));
          options.onError?.("No result received from AI generation");
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isStreaming: false,
          error: errorMessage,
        }));
        options.onError?.(errorMessage);
        throw error;
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isStreaming: false,
      error: null,
      result: null,
      progress: 0,
      streamedContent: "",
    });
  }, []);

  const generateJSON = useCallback(
    async (prompt: string, context?: any, model?: string) => {
      return AIGenerator.generateJSON(
        prompt,
        context,
        model || options.model,
        options.enableStreaming
          ? (event: AIStreamEvent) => {
              switch (event.type) {
                case "start":
                  setState((prev) => ({
                    ...prev,
                    isStreaming: true,
                    progress: 0,
                    streamedContent: "",
                  }));
                  break;

                case "progress":
                  setState((prev) => ({
                    ...prev,
                    progress: event.progress || 0,
                    streamedContent: event.content || "",
                  }));
                  options.onProgress?.(
                    event.progress || 0,
                    event.content || ""
                  );
                  break;

                case "complete":
                  setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    isStreaming: false,
                    result: event.result || null,
                    progress: 100,
                    streamedContent: event.result?.content || "",
                  }));
                  if (event.result) {
                    options.onSuccess?.(event.result);
                  }
                  break;

                case "error":
                  setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    isStreaming: false,
                    error: event.error || "Unknown error",
                  }));
                  options.onError?.(event.error || "Unknown error");
                  break;
              }
            }
          : undefined
      );
    },
    [options]
  );

  const analyze = useCallback(
    async (prompt: string, context?: any, model?: string) => {
      return AIGenerator.analyze(
        prompt,
        context,
        model || options.model,
        options.enableStreaming
          ? (event: AIStreamEvent) => {
              switch (event.type) {
                case "start":
                  setState((prev) => ({
                    ...prev,
                    isStreaming: true,
                    progress: 0,
                    streamedContent: "",
                  }));
                  break;

                case "progress":
                  setState((prev) => ({
                    ...prev,
                    progress: event.progress || 0,
                    streamedContent: event.content || "",
                  }));
                  options.onProgress?.(
                    event.progress || 0,
                    event.content || ""
                  );
                  break;

                case "complete":
                  setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    isStreaming: false,
                    result: event.result || null,
                    progress: 100,
                    streamedContent: event.result?.content || "",
                  }));
                  if (event.result) {
                    options.onSuccess?.(event.result);
                  }
                  break;

                case "error":
                  setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    isStreaming: false,
                    error: event.error || "Unknown error",
                  }));
                  options.onError?.(event.error || "Unknown error");
                  break;
              }
            }
          : undefined
      );
    },
    [options]
  );

  const recommend = useCallback(
    async (prompt: string, context?: any, model?: string) => {
      return AIGenerator.recommend(
        prompt,
        context,
        model || options.model,
        options.enableStreaming
          ? (event: AIStreamEvent) => {
              switch (event.type) {
                case "start":
                  setState((prev) => ({
                    ...prev,
                    isStreaming: true,
                    progress: 0,
                    streamedContent: "",
                  }));
                  break;

                case "progress":
                  setState((prev) => ({
                    ...prev,
                    progress: event.progress || 0,
                    streamedContent: event.content || "",
                  }));
                  options.onProgress?.(
                    event.progress || 0,
                    event.content || ""
                  );
                  break;

                case "complete":
                  setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    isStreaming: false,
                    result: event.result || null,
                    progress: 100,
                    streamedContent: event.result?.content || "",
                  }));
                  if (event.result) {
                    options.onSuccess?.(event.result);
                  }
                  break;

                case "error":
                  setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    isStreaming: false,
                    error: event.error || "Unknown error",
                  }));
                  options.onError?.(event.error || "Unknown error");
                  break;
              }
            }
          : undefined
      );
    },
    [options]
  );

  return {
    // State
    ...state,

    // Actions
    generate,
    generateJSON,
    analyze,
    recommend,
    reset,

    // Computed values
    hasContent: !!(state.result || state.streamedContent),
    content: state.streamedContent || state.result?.content || "",

    // Loading states
    isIdle: !state.isLoading && !state.isStreaming,
    isProcessing: state.isLoading || state.isStreaming,
  };
}
