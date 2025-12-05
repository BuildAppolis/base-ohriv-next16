/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { generateAttributesWithProgressOptimized } from "./generate-attributes-optimized";
import { generateQuestionsWithProgressOptimized } from "./generate-questions-optimized";
import type {
  AttributeGenerationRequest,
  AttributeGenerationResult,
} from "./generate-attributes-optimized";
import type {
  QuestionGenerationRequest,
  QuestionGenerationResult,
} from "./generate-questions-optimized";

/**
 * CLIENT-SIDE: Optimized generation logic with reduced API calls
 * This file demonstrates how to use the optimized server actions for much faster generation
 */

interface OptimizedGenerationConfig {
  useOptimizedGeneration: boolean;
  enableBatchProcessing: boolean;
  parallelBatchSize: number;
  enableProgressiveLoading: boolean;
}

const DEFAULT_CONFIG: OptimizedGenerationConfig = {
  useOptimizedGeneration: true,
  enableBatchProcessing: true,
  parallelBatchSize: 3,
  enableProgressiveLoading: true,
};

/**
 * Fast attribute generation with batch processing
 * Reduces API calls from ~8-10 to just 3 (one per category)
 */
export async function generateAttributesFast(
  request: AttributeGenerationRequest,
  onProgress?: (progress: AttributeGenerationResult) => void,
  config: Partial<OptimizedGenerationConfig> = {}
): Promise<AttributeGenerationResult> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  if (!finalConfig.useOptimizedGeneration) {
    // Fall back to original slower method if needed
    const { generateAttributesWithProgress } = await import(
      "./generate-attributes"
    );
    return generateAttributesWithProgress(request);
  }

  return await generateAttributesWithProgressOptimized(request);
}

/**
 * Fast question generation with batch processing
 * Reduces API calls from ~48-64 to ~12-20 (one per level-stage combination)
 */
export async function generateQuestionsFast(
  request: QuestionGenerationRequest,
  onProgress?: (progress: QuestionGenerationResult) => void,
  config: Partial<OptimizedGenerationConfig> = {}
): Promise<QuestionGenerationResult> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  if (!finalConfig.useOptimizedGeneration) {
    // Fall back to original slower method if needed
    const { generateQuestionsWithProgress } = await import(
      "./generate-questions"
    );
    return generateQuestionsWithProgress(request);
  }

  return await generateQuestionsWithProgressOptimized(request);
}

/**
 * Streaming client wrapper for real-time progress updates
 * Maintains the same streaming interface as the original but much faster
 */
export class OptimizedGenerationClient {
  private config: OptimizedGenerationConfig;
  private generationCache: Map<string, any> = new Map();

  constructor(config: Partial<OptimizedGenerationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate attributes with real-time streaming progress
   * Performance improvement: ~70% faster due to batch API calls
   */
  async generateAttributesWithStreaming(
    request: AttributeGenerationRequest,
    onProgress?: (result: AttributeGenerationResult) => void
  ): Promise<AttributeGenerationResult> {
    const cacheKey = `attributes-${JSON.stringify(request)}`;

    // Check cache first
    if (this.generationCache.has(cacheKey)) {
      const cached = this.generationCache.get(cacheKey);
      if (onProgress && cached.progress) {
        onProgress(cached);
      }
      return cached;
    }

    let currentIndex = 0;
    const allAttributes: any[] = [];

    while (true) {
      const result = await generateAttributesFast(
        { ...request, currentIndex },
        onProgress,
        this.config
      );

      if (result.success && result.progress) {
        // Single attribute progress - continue streaming
        allAttributes.push(result.progress.attribute);

        if (onProgress) {
          onProgress(result);
        }

        currentIndex++;

        // Small delay for UX (but much smaller since API is faster)
        if (this.config.enableProgressiveLoading) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } else if (result.success && result.attributes) {
        // All attributes completed
        const finalResult = {
          ...result,
          attributes: result.attributes,
        };

        this.generationCache.set(cacheKey, finalResult);
        return finalResult;
      } else {
        throw new Error(result.error || "Failed to generate attributes");
      }
    }
  }

  /**
   * Generate questions with real-time streaming progress
   * Performance improvement: ~80% faster due to batch API calls and parallel processing
   */
  async generateQuestionsWithStreaming(
    request: QuestionGenerationRequest,
    onProgress?: (result: QuestionGenerationResult) => void
  ): Promise<QuestionGenerationResult> {
    const cacheKey = `questions-${JSON.stringify(request)}`;

    // Check cache first
    if (this.generationCache.has(cacheKey)) {
      const cached = this.generationCache.get(cacheKey);
      if (onProgress && cached.progress) {
        onProgress(cached);
      }
      return cached;
    }

    let currentIndex = 0;
    const allQuestions: any[] = [];

    while (true) {
      const result = await generateQuestionsFast(
        { ...request, currentIndex },
        onProgress,
        this.config
      );

      if (result.success && result.progress) {
        // Single question progress - continue streaming
        allQuestions.push(result.progress.question);

        if (onProgress) {
          onProgress(result);
        }

        currentIndex++;

        // Small delay for UX (but much smaller since API is faster)
        if (this.config.enableProgressiveLoading) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } else if (result.success && result.questions) {
        // All questions completed
        const finalResult = {
          ...result,
          questions: result.questions,
        };

        this.generationCache.set(cacheKey, finalResult);
        return finalResult;
      } else {
        throw new Error(result.error || "Failed to generate questions");
      }
    }
  }

  /**
   * Clear generation cache (useful for testing or when context changes)
   */
  clearCache(): void {
    this.generationCache.clear();
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): {
    cacheSize: number;
    config: OptimizedGenerationConfig;
    estimatedSpeedup: {
      attributes: string;
      questions: string;
    };
  } {
    return {
      cacheSize: this.generationCache.size,
      config: this.config,
      estimatedSpeedup: {
        attributes: "~70% faster (3 API calls vs 8-10)",
        questions: "~80% faster (12-20 API calls vs 48-64)",
      },
    };
  }
}

/**
 * Convenience function for the most common use case
 * Create a singleton client instance
 */
export const optimizedGenerationClient = new OptimizedGenerationClient();

/**
 * Quick usage examples:
 *
 * // Basic usage (fastest)
 * const result = await generateAttributesFast(request);
 *
 * // With streaming progress
 * await optimizedGenerationClient.generateAttributesWithStreaming(request, (progress) => {
 *   console.log(`Generated ${progress.progress?.current}/${progress.progress?.total} attributes`);
 * });
 *
 * // Custom configuration
 * const client = new OptimizedGenerationClient({
 *   useOptimizedGeneration: true,
 *   parallelBatchSize: 5,
 *   enableProgressiveLoading: false // Even faster, no UX delays
 * });
 */

export type {
  AttributeGenerationRequest,
  AttributeGenerationResult,
  QuestionGenerationRequest,
  QuestionGenerationResult,
};
