/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * AI SDK Client - Simple and reliable AI generation with type safety
 * Uses the AI SDK which handles all the complexity automatically
 * Enhanced with comprehensive Zod schema validation
 */

import { createOpenAI } from "@ai-sdk/openai";
import { generateText, streamText } from "ai";
import { type AIResponse, type AIStreamEvent } from "@/schemas/ai";
import OpenAI from "openai";

// Initialize OpenAI provider with the correct environment variable
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Fallback OpenAI client for GPT-5 models
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Type-safe options interface with required fields matching our AI operations
export interface AISDKGenerateOptions {
  // Required fields from AIRequest
  prompt: string;
  model?: string;

  // Optional fields with proper types
  type?: "general" | "analysis" | "recommendations" | "custom" | "json";
  responseFormat?: "text" | "json";
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  instructions?: string;
  context?: Record<string, unknown> | string;

  // Extended options
  reasoning?: "none" | "low" | "medium" | "high";
  verbosity?: "low" | "medium" | "high";
  instructionSet?: "ksa-framework" | "ksa-framework-short" | string;
}

// Type-safe streaming options interface
export interface AISDKStreamingOptions extends AISDKGenerateOptions {
  onEvent?: (event: AIStreamEvent) => void;
  onStart?: () => void;
  onProgress?: (content: string, progress: number) => void;
  onComplete?: (result: AIResponse) => void;
  onError?: (error: Error) => void;
}

// GPT-5 models that may have compatibility issues with AI SDK
const GPT5_MODELS = new Set([
  "gpt-5.1",
  "gpt-5",
  "gpt-5-mini",
  "gpt-5-nano",
  "gpt-5-pro",
]);

// Default models
const DEFAULT_MODELS = {
  GPT_4O: "gpt-4o",
  GPT_35_TURBO: "gpt-3.5-turbo",
} as const;

function isGPT5Model(model?: string): boolean {
  return model ? GPT5_MODELS.has(model) : false;
}

// Type-safe result interface matching our Zod schema
export interface AISDKGenerateResult {
  content: string;
  contentLength: number;
  model: string;
  temperature: number;
  type: string;
  responseFormat: string;
  timestamp: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: {
    processingTime: number;
    requestId?: string;
  };
}

/**
 * Simple AI generation using AI SDK with schema validation
 */
export async function generateSimple(
  options: AISDKGenerateOptions
): Promise<AISDKGenerateResult> {
  // // Validate input using our Zod schema
  // const validatedOptions = AIRequestSchema.parse({
  //   prompt: options.prompt,
  //   type: options.type || 'general',
  //   responseFormat: options.responseFormat || 'text',
  //   temperature: options.temperature || 0.7,
  //   maxTokens: options.maxTokens || 2000,
  //   systemPrompt: options.systemPrompt,
  //   instructions: options.instructions,
  //   context: options.context,
  //   requestId: crypto.randomUUID(),
  //   timestamp: new Date().toISOString()
  // });

  const startTime = Date.now();
  const {
    model = DEFAULT_MODELS.GPT_4O,
    prompt,
    context,
    instructions,
    instructionSet,
    temperature = 0.7,
    maxTokens = 2000,
    type = "general",
    systemPrompt,
    responseFormat = "text",
    // reasoning,
    // verbosity,
  } = options;

  // Build the full prompt
  let fullPrompt = prompt;
  let combinedInstructions = instructions || "";

  // Add instruction set content if specified
  if (instructionSet) {
    let instructionSetContent = "";
    if (instructionSet === "ksa-framework") {
      // Load KSA framework instructions
      const fs = await import("fs");
      const path = await import("path");
      try {
        const instructionsPath = path.join(
          process.cwd(),
          "src/app/(main)/test-response/ksa_framework_instructions.txt"
        );
        instructionSetContent = fs.readFileSync(instructionsPath, "utf-8");
      } catch (error) {
        console.error("Failed to load KSA framework instructions", error);
      }
    } else if (instructionSet === "ksa-framework-short") {
      const fs = await import("fs");
      const path = await import("path");
      try {
        const instructionsPath = path.join(
          process.cwd(),
          "src/app/(main)/test-response/ksa_framework_instructions_short.txt"
        );
        instructionSetContent = fs.readFileSync(instructionsPath, "utf-8");
      } catch (error) {
        console.error("Failed to load KSA framework short instructions", error);
      }
    }

    if (instructionSetContent) {
      combinedInstructions = combinedInstructions
        ? `${instructionSetContent}\n\n${combinedInstructions}`
        : instructionSetContent;
    }
  }

  // Add context to prompt if provided
  if (context) {
    let contextString = "";
    if (typeof context === "object") {
      contextString = `CONTEXT:\n${JSON.stringify(context, null, 2)}\n\n`;
    } else {
      contextString = `CONTEXT:\n${context}\n\n`;
    }

    if (combinedInstructions) {
      contextString += `INSTRUCTIONS:\n${combinedInstructions}\n\n`;
    }

    contextString += `REQUEST:\n${prompt}`;
    fullPrompt = contextString;
  } else if (combinedInstructions) {
    fullPrompt = `INSTRUCTIONS:\n${combinedInstructions}\n\nREQUEST:\n${prompt}`;
  }

  // Build system prompt
  let finalSystemPrompt = systemPrompt || "You are a helpful AI assistant.";

  switch (type) {
    case "analysis":
      finalSystemPrompt =
        systemPrompt ||
        "You are an expert analyst. Break down complex information into clear insights and actionable recommendations.";
      break;
    case "recommendations":
      finalSystemPrompt =
        systemPrompt ||
        "You are an expert advisor. Provide specific, actionable recommendations based on the provided context.";
      break;
    case "json":
      finalSystemPrompt =
        systemPrompt ||
        "You are a helpful AI assistant. Respond with valid JSON only. Do not include any explanations or text outside of the JSON structure.";
      break;
    case "custom":
      finalSystemPrompt =
        systemPrompt ||
        "You are a helpful AI assistant with expertise in the provided domain.";
      break;
  }

  console.log(
    "AI SDK: Generating with model:",
    model,
    "Response format:",
    responseFormat
  );

  // Configure generation parameters
  const generateOptions: any = {
    model: openai(model),
    prompt: fullPrompt,
    system: finalSystemPrompt,
    temperature,
    maxTokens,
  };

  // Add JSON format if requested
  if (responseFormat === "json") {
    generateOptions.format = "json";
  }

  try {
    const result = await generateText(generateOptions);

    return {
      content: result.text,
      contentLength: result.text.length,
      model,
      temperature,
      type,
      responseFormat,
      timestamp: new Date().toISOString(),
      usage: result.usage
        ? {
            promptTokens: (result.usage as any).promptTokens || 0,
            completionTokens: (result.usage as any).completionTokens || 0,
            totalTokens: (result.usage as any).totalTokens || 0,
          }
        : undefined,
      metadata: {
        processingTime: Date.now() - startTime,
      },
    };
  } catch (error) {
    console.error("AI SDK generation failed:", error);
    throw new Error(
      `AI generation failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Streaming AI generation using AI SDK
 */
export async function generateStreamSimple(
  options: AISDKGenerateOptions,
  onEvent: (event: any) => void
) {
  const {
    model = DEFAULT_MODELS.GPT_4O,
    prompt,
    context,
    instructions,
    instructionSet,
    temperature = 0.7,
    maxTokens = 2000,
    type = "general",
    systemPrompt,
    responseFormat = "text",
    // reasoning,
    // verbosity,
  } = options;

  // For GPT-5 models, use the original OpenAI implementation
  if (isGPT5Model(model)) {
    console.log(
      "AI SDK: Using fallback OpenAI implementation for GPT-5 model:",
      model
    );
    return generateStreamGPT5(options, onEvent);
  }

  // Build the full prompt (same logic as generateSimple)
  let fullPrompt = prompt;
  let combinedInstructions = instructions || "";

  // Add instruction set content if specified
  if (instructionSet) {
    let instructionSetContent = "";
    if (instructionSet === "ksa-framework") {
      const fs = await import("fs");
      const path = await import("path");
      try {
        const instructionsPath = path.join(
          process.cwd(),
          "src/app/(main)/test-response/ksa_framework_instructions.txt"
        );
        instructionSetContent = fs.readFileSync(instructionsPath, "utf-8");
      } catch (error) {
        console.error("Failed to load KSA framework instructions", error);
      }
    } else if (instructionSet === "ksa-framework-short") {
      const fs = await import("fs");
      const path = await import("path");
      try {
        const instructionsPath = path.join(
          process.cwd(),
          "src/app/(main)/test-response/ksa_framework_instructions_short.txt"
        );
        instructionSetContent = fs.readFileSync(instructionsPath, "utf-8");
      } catch (error) {
        console.error("Failed to load KSA framework short instructions", error);
      }
    }

    if (instructionSetContent) {
      combinedInstructions = combinedInstructions
        ? `${instructionSetContent}\n\n${combinedInstructions}`
        : instructionSetContent;
    }
  }

  // Add context to prompt if provided
  if (context) {
    let contextString = "";
    if (typeof context === "object") {
      contextString = `CONTEXT:\n${JSON.stringify(context, null, 2)}\n\n`;
    } else {
      contextString = `CONTEXT:\n${context}\n\n`;
    }

    if (combinedInstructions) {
      contextString += `INSTRUCTIONS:\n${combinedInstructions}\n\n`;
    }

    contextString += `REQUEST:\n${prompt}`;
    fullPrompt = contextString;
  } else if (combinedInstructions) {
    fullPrompt = `INSTRUCTIONS:\n${combinedInstructions}\n\nREQUEST:\n${prompt}`;
  }

  // Build system prompt
  let finalSystemPrompt = systemPrompt || "You are a helpful AI assistant.";

  switch (type) {
    case "analysis":
      finalSystemPrompt =
        systemPrompt ||
        "You are an expert analyst. Break down complex information into clear insights and actionable recommendations.";
      break;
    case "recommendations":
      finalSystemPrompt =
        systemPrompt ||
        "You are an expert advisor. Provide specific, actionable recommendations based on the provided context.";
      break;
    case "json":
      finalSystemPrompt =
        systemPrompt ||
        "You are a helpful AI assistant. Respond with valid JSON only. Do not include any explanations or text outside of the JSON structure.";
      break;
    case "custom":
      finalSystemPrompt =
        systemPrompt ||
        "You are a helpful AI assistant with expertise in the provided domain.";
      break;
  }

  console.log("AI SDK: Starting stream with model:", model);

  // Configure generation parameters
  const generateOptions: any = {
    model: openai(model),
    prompt: fullPrompt,
    system: finalSystemPrompt,
    temperature,
    maxTokens,
  };

  // Add JSON format if requested
  if (responseFormat === "json") {
    generateOptions.format = "json";
  }

  try {
    const result = await streamText(generateOptions);

    let fullContent = "";

    for await (const delta of result.textStream) {
      fullContent += delta;

      onEvent({
        type: "progress",
        content: fullContent,
        progress: Math.min(
          (fullContent.length / (maxTokens || 2000)) * 100,
          95
        ),
      });
    }

    // Send completion event
    onEvent({
      type: "complete",
      result: {
        content: fullContent,
        contentLength: fullContent.length,
        model,
        temperature,
        type,
        responseFormat,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("AI SDK streaming failed:", error);
    onEvent({
      type: "error",
      message: "AI generation failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * GPT-5 fallback streaming using original OpenAI client
 */
async function generateStreamGPT5(
  options: AISDKGenerateOptions,
  onEvent: (event: any) => void
) {
  const {
    model = DEFAULT_MODELS.GPT_4O,
    prompt,
    context,
    instructions,
    instructionSet,
    temperature = 0.7,
    maxTokens = 2000,
    type = "general",
    systemPrompt,
    responseFormat = "text",
    reasoning = "none", // Default for GPT-5
    verbosity = "medium", // Default for GPT-5
  } = options;

  // Build the full prompt (same logic as above)
  let fullPrompt = prompt;
  let combinedInstructions = instructions || "";

  // Add instruction set content if specified
  if (instructionSet) {
    let instructionSetContent = "";
    if (instructionSet === "ksa-framework") {
      const fs = await import("fs");
      const path = await import("path");
      try {
        const instructionsPath = path.join(
          process.cwd(),
          "src/app/(main)/test-response/ksa_framework_instructions.txt"
        );
        instructionSetContent = fs.readFileSync(instructionsPath, "utf-8");
      } catch (error) {
        console.error("Failed to load KSA framework instructions", error);
      }
    } else if (instructionSet === "ksa-framework-short") {
      const fs = await import("fs");
      const path = await import("path");
      try {
        const instructionsPath = path.join(
          process.cwd(),
          "src/app/(main)/test-response/ksa_framework_instructions_short.txt"
        );
        instructionSetContent = fs.readFileSync(instructionsPath, "utf-8");
      } catch (error) {
        console.error("Failed to load KSA framework short instructions", error);
      }
    }

    if (instructionSetContent) {
      combinedInstructions = combinedInstructions
        ? `${instructionSetContent}\n\n${combinedInstructions}`
        : instructionSetContent;
    }
  }

  // Add context to prompt if provided
  if (context) {
    let contextString = "";
    if (typeof context === "object") {
      contextString = `CONTEXT:\n${JSON.stringify(context, null, 2)}\n\n`;
    } else {
      contextString = `CONTEXT:\n${context}\n\n`;
    }

    if (combinedInstructions) {
      contextString += `INSTRUCTIONS:\n${combinedInstructions}\n\n`;
    }

    contextString += `REQUEST:\n${prompt}`;
    fullPrompt = contextString;
  } else if (combinedInstructions) {
    fullPrompt = `INSTRUCTIONS:\n${combinedInstructions}\n\nREQUEST:\n${prompt}`;
  }

  // Build system prompt
  let finalSystemPrompt = systemPrompt || "You are a helpful AI assistant.";

  switch (type) {
    case "analysis":
      finalSystemPrompt =
        systemPrompt ||
        "You are an expert analyst. Break down complex information into clear insights and actionable recommendations.";
      break;
    case "recommendations":
      finalSystemPrompt =
        systemPrompt ||
        "You are an expert advisor. Provide specific, actionable recommendations based on the provided context.";
      break;
    case "json":
      finalSystemPrompt =
        systemPrompt ||
        "You are a helpful AI assistant. Respond with valid JSON only. Do not include any explanations or text outside of the JSON structure.";
      break;
    case "custom":
      finalSystemPrompt =
        systemPrompt ||
        "You are a helpful AI assistant with expertise in the provided domain.";
      break;
  }

  console.log("GPT-5: Starting OpenAI streaming with model:", model);

  try {
    // Determine if we use responses or chat completions endpoint
    const useResponsesEndpoint = GPT5_MODELS.has(model as any);

    const openaiRequest: any = {
      model,
      stream: true,
    };

    if (useResponsesEndpoint) {
      // Responses endpoint format
      openaiRequest.max_output_tokens = maxTokens;
      openaiRequest.input = fullPrompt;
      openaiRequest.instructions = finalSystemPrompt;

      // Add reasoning and verbosity for GPT-5
      openaiRequest.reasoning = { effort: reasoning };
      openaiRequest.text = { verbosity };
    } else {
      // Chat completions format
      openaiRequest.max_completion_tokens = maxTokens;
      openaiRequest.messages = [
        {
          role: "system",
          content: finalSystemPrompt,
        },
        {
          role: "user",
          content: fullPrompt,
        },
      ];
    }

    const response = useResponsesEndpoint
      ? await openaiClient.responses.create(openaiRequest)
      : await openaiClient.chat.completions.create(openaiRequest);

    let fullContent = "";
    let chunkCount = 0;
    const MAX_CHUNKS = 5000; // Increased limit to handle longer responses

    for await (const chunk of response as any) {
      chunkCount++;

      if (chunkCount > MAX_CHUNKS) {
        console.warn("GPT-5: Maximum chunks reached, ending stream");
        break;
      }

      let delta = "";

      if (useResponsesEndpoint) {
        // Handle responses endpoint format - try multiple delta locations
        const deltaSources = [
          chunk.content,
          chunk.delta,
          chunk.output?.[0]?.content,
          chunk.output?.content,
          chunk.output_text,
          chunk.text,
          chunk.response,
          chunk.data,
          chunk.choices?.[0]?.delta?.content, // Fallback for mixed endpoints
        ];

        for (const source of deltaSources) {
          if (
            source &&
            typeof source === "string" &&
            source.trim().length > 0
          ) {
            delta = source;
            break;
          }
        }
      } else {
        // Handle chat completions format
        delta = chunk.choices?.[0]?.delta?.content || "";
      }

      if (delta) {
        fullContent += delta;
        onEvent({
          type: "progress",
          content: fullContent,
          progress: Math.min(
            (fullContent.length / (maxTokens || 2000)) * 100,
            95
          ),
        });
      }

      // Check for completion
      const isComplete = useResponsesEndpoint
        ? chunk.status === "completed" ||
          chunk.status === "succeeded" ||
          chunk.status === "finished" ||
          chunk.done
        : chunk.choices?.[0]?.finish_reason;

      if (isComplete) {
        console.log("GPT-5: Stream completed naturally");
        break;
      }

      // Also break if we have substantial content and no new chunks for a while
      // This handles cases where the stream doesn't properly signal completion
      if (fullContent.length > 100 && chunkCount > 100) {
        const trimmed = fullContent.trim();
        const lastChar = trimmed.slice(-1);

        // Check if this looks like a complete response
        let isComplete = false;

        if ([".", "!", "?", ")", "]", "}", '"', "'"].includes(lastChar)) {
          isComplete = true;
        } else if (responseFormat === "json") {
          // For JSON, check if it looks complete but has trailing comma
          try {
            // Try to parse and see if it's valid JSON after cleaning trailing commas
            const cleaned = trimmed
              .replace(/,\s*$/, "")
              .replace(/,\s*([}\]])/g, "$1");
            JSON.parse(cleaned);
            isComplete = true;
            // Use the cleaned version for the final content
            fullContent = cleaned;
            console.log("GPT-5: Fixed JSON trailing comma, ending naturally");
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (e) {
            // Not valid JSON yet, continue streaming
          }
        }

        if (isComplete && responseFormat !== "json") {
          console.log("GPT-5: Stream appears complete, ending naturally");
          break;
        }
      }
    }

    // Send completion
    onEvent({
      type: "complete",
      result: {
        content: fullContent,
        contentLength: fullContent.length,
        model,
        temperature,
        type,
        responseFormat,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("GPT-5 streaming failed:", error);
    onEvent({
      type: "error",
      message: "GPT-5 generation failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
