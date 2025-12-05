/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Type-Safe AI Client with Zod Schema Validation
 * This is a new implementation that provides comprehensive type safety for AI operations
 */

import { createOpenAI } from "@ai-sdk/openai";
import { generateText, streamText } from "ai";
import {
  AIRequestSchema,
  AIStreamingRequestSchema,
  AIResponseSchema,
  type AIStreamEvent,
  type AIGenerationType,
  type AIResponseFormat,
} from "@/schemas/ai";

// Initialize OpenAI provider
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Type-safe AI generation options with full schema validation
 */
export interface TypeSafeAIGenerateOptions {
  prompt: string;
  type?: AIGenerationType;
  responseFormat?: AIResponseFormat;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  instructions?: string;
  context?: any;
  model?: string;
  instructionSet?: string;
  reasoning?: "none" | "low" | "medium" | "high";
  verbosity?: "low" | "medium" | "high";
}

/**
 * Type-safe AI generation result with comprehensive metadata
 */
export interface TypeSafeAIGenerateResult {
  success: boolean;
  content: string;
  data?: any;
  metadata: {
    model: string;
    requestId: string;
    timestamp: string;
    processingTime: number;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Type-safe streaming options with schema-validated events
 */
export interface TypeSafeAIStreamingOptions extends TypeSafeAIGenerateOptions {
  onEvent?: (event: AIStreamEvent) => void;
  onStart?: () => void;
  onProgress?: (content: string, progress: number) => void;
  onComplete?: (result: TypeSafeAIGenerateResult) => void;
  onError?: (error: Error) => void;
}

/**
 * Generate AI content with full type safety and schema validation
 */
export async function generateTypeSafe(
  options: TypeSafeAIGenerateOptions
): Promise<TypeSafeAIGenerateResult> {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    // Validate input using our Zod schema
    const validatedRequest = AIRequestSchema.parse({
      prompt: options.prompt,
      type: options.type || "general",
      responseFormat: options.responseFormat || "text",
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 2000,
      systemPrompt: options.systemPrompt,
      instructions: options.instructions,
      context: options.context,
      requestId,
      timestamp: new Date().toISOString(),
    });

    const model = options.model || "gpt-4o";

    // Build the full prompt
    let fullPrompt = validatedRequest.prompt;
    let finalSystemPrompt =
      validatedRequest.systemPrompt || "You are a helpful AI assistant.";

    // Add context if provided
    if (validatedRequest.context) {
      let contextString = "";
      if (typeof validatedRequest.context === "object") {
        contextString = `CONTEXT:\n${JSON.stringify(
          validatedRequest.context,
          null,
          2
        )}\n\n`;
      } else {
        contextString = `CONTEXT:\n${validatedRequest.context}\n\n`;
      }

      if (validatedRequest.instructions) {
        contextString += `INSTRUCTIONS:\n${validatedRequest.instructions}\n\n`;
      }

      contextString += `REQUEST:\n${validatedRequest.prompt}`;
      fullPrompt = contextString;
    } else if (validatedRequest.instructions) {
      fullPrompt = `INSTRUCTIONS:\n${validatedRequest.instructions}\n\nREQUEST:\n${validatedRequest.prompt}`;
    }

    // Adjust system prompt based on type
    switch (validatedRequest.type) {
      case "analysis":
        finalSystemPrompt =
          validatedRequest.systemPrompt ||
          "You are an expert analyst. Break down complex information into clear insights and actionable recommendations.";
        break;
      case "recommendations":
        finalSystemPrompt =
          validatedRequest.systemPrompt ||
          "You are an expert advisor. Provide specific, actionable recommendations based on the provided context.";
        break;
      case "json":
        finalSystemPrompt =
          validatedRequest.systemPrompt ||
          "You are a helpful AI assistant. Respond with valid JSON only. Do not include any explanations or text outside of the JSON structure.";
        break;
    }

    // Configure generation parameters
    const generateOptions: any = {
      model: openai(model),
      prompt: fullPrompt,
      system: finalSystemPrompt,
      temperature: validatedRequest.temperature,
      maxTokens: validatedRequest.maxTokens,
    };

    // Add JSON format if requested
    if (validatedRequest.responseFormat === "json") {
      generateOptions.format = "json";
    }

    console.log(
      "TypeSafe AI: Generating with model:",
      model,
      "Type:",
      validatedRequest.type
    );

    const result = await generateText(generateOptions);
    const processingTime = Date.now() - startTime;

    // Create type-safe response
    const response: TypeSafeAIGenerateResult = {
      success: true,
      content: result.text,
      metadata: {
        model,
        requestId,
        timestamp: new Date().toISOString(),
        processingTime,
        usage: result.usage
          ? {
              promptTokens: result.usage.inputTokens || 0,
              completionTokens: result.usage.outputTokens || 0,
              totalTokens:
                (result.usage.inputTokens || 0) +
                (result.usage.outputTokens || 0),
            }
          : undefined,
      },
    };

    // Validate response using our schema
    const validatedResponse = AIResponseSchema.parse(response);

    return validatedResponse;
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error("TypeSafe AI generation failed:", error);

    // Create error response
    const errorResponse: TypeSafeAIGenerateResult = {
      success: false,
      content: "",
      metadata: {
        model: options.model || "unknown",
        requestId,
        timestamp: new Date().toISOString(),
        processingTime,
      },
      error: {
        code: "GENERATION_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
        details: error,
      },
    };

    return errorResponse;
  }
}

/**
 * Generate AI content with streaming and full type safety
 */
export async function generateTypeSafeStream(
  options: TypeSafeAIStreamingOptions
): Promise<void> {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    // Validate input using streaming schema
    const validatedRequest = AIStreamingRequestSchema.parse({
      ...options,
      stream: true,
      requestId,
      timestamp: new Date().toISOString(),
    });

    const model = options.model || "gpt-4o";

    // Build the full prompt (same logic as above)
    let fullPrompt = validatedRequest.prompt;
    let finalSystemPrompt =
      validatedRequest.systemPrompt || "You are a helpful AI assistant.";

    if (validatedRequest.context) {
      let contextString = "";
      if (typeof validatedRequest.context === "object") {
        contextString = `CONTEXT:\n${JSON.stringify(
          validatedRequest.context,
          null,
          2
        )}\n\n`;
      } else {
        contextString = `CONTEXT:\n${validatedRequest.context}\n\n`;
      }

      if (validatedRequest.instructions) {
        contextString += `INSTRUCTIONS:\n${validatedRequest.instructions}\n\n`;
      }

      contextString += `REQUEST:\n${validatedRequest.prompt}`;
      fullPrompt = contextString;
    } else if (validatedRequest.instructions) {
      fullPrompt = `INSTRUCTIONS:\n${validatedRequest.instructions}\n\nREQUEST:\n${validatedRequest.prompt}`;
    }

    // Adjust system prompt based on type
    switch (validatedRequest.type) {
      case "analysis":
        finalSystemPrompt =
          validatedRequest.systemPrompt ||
          "You are an expert analyst. Break down complex information into clear insights and actionable recommendations.";
        break;
      case "recommendations":
        finalSystemPrompt =
          validatedRequest.systemPrompt ||
          "You are an expert advisor. Provide specific, actionable recommendations based on the provided context.";
        break;
      case "json":
        finalSystemPrompt =
          validatedRequest.systemPrompt ||
          "You are a helpful AI assistant. Respond with valid JSON only. Do not include any explanations or text outside of the JSON structure.";
        break;
    }

    // Send start event
    const startEvent: AIStreamEvent = {
      type: "start",
      id: crypto.randomUUID(),
      requestId,
      timestamp: new Date().toISOString(),
    };

    if (options.onStart) options.onStart();
    if (options.onEvent) options.onEvent(startEvent);

    // Configure streaming
    const generateOptions: any = {
      model: openai(model),
      prompt: fullPrompt,
      system: finalSystemPrompt,
      temperature: validatedRequest.temperature,
      maxTokens: validatedRequest.maxTokens,
    };

    if (validatedRequest.responseFormat === "json") {
      generateOptions.format = "json";
    }

    console.log("TypeSafe AI: Starting stream with model:", model);

    const result = await streamText(generateOptions);
    let fullContent = "";

    for await (const delta of result.textStream) {
      fullContent += delta;

      // Create progress event
      const progressEvent: AIStreamEvent = {
        type: "progress",
        id: crypto.randomUUID(),
        requestId,
        timestamp: new Date().toISOString(),
        content: fullContent,
        progress: {
          current: fullContent.length,
          percentage: Math.min(
            (fullContent.length / (validatedRequest.maxTokens || 2000)) * 100,
            95
          ),
        },
      };

      if (options.onEvent) options.onEvent(progressEvent);
      if (options.onProgress)
        options.onProgress(
          fullContent,
          progressEvent.progress?.percentage || 0
        );
    }

    // Create completion result
    const processingTime = Date.now() - startTime;
    const usage = await result.usage;
    const completionResult: TypeSafeAIGenerateResult = {
      success: true,
      content: fullContent,
      metadata: {
        model,
        requestId,
        timestamp: new Date().toISOString(),
        processingTime,
        usage: usage
          ? {
              promptTokens: usage.inputTokens || 0,
              completionTokens: usage.outputTokens || 0,
              totalTokens: (usage.inputTokens || 0) + (usage.outputTokens || 0),
            }
          : undefined,
      },
    };

    // Create complete event
    const completeEvent: AIStreamEvent = {
      type: "complete",
      id: crypto.randomUUID(),
      requestId,
      timestamp: new Date().toISOString(),
      result: completionResult,
      usage: completionResult.metadata.usage,
    };

    if (options.onEvent) options.onEvent(completeEvent);
    if (options.onComplete) options.onComplete(completionResult);
  } catch (error) {
    console.error("TypeSafe AI streaming failed:", error);

    const errorEvent: AIStreamEvent = {
      type: "error",
      id: crypto.randomUUID(),
      requestId,
      timestamp: new Date().toISOString(),
      error: {
        code: "STREAM_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
        details: error,
      },
    };

    if (options.onEvent) options.onEvent(errorEvent);
    if (options.onError) {
      const errorObj =
        error instanceof Error ? error : new Error("Unknown streaming error");
      options.onError(errorObj);
    }
  }
}
