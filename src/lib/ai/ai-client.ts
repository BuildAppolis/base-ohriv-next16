/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * AI Client Utility
 * Client-side utility for interacting with the dynamic AI generation API
 */

export interface AIGenerateOptions {
  model?: string;
  context?: any; // Object or string context data
  instructions?: string; // Additional instructions
  instructionSet?: string; // Instruction set ID to load on-demand
  prompt: string; // The main prompt
  temperature?: number;
  maxTokens?: number;
  type?: "general" | "analysis" | "recommendations" | "custom" | "json";
  systemPrompt?: string; // Custom system prompt
  responseFormat?: "text" | "json";
  reasoning?: "none" | "low" | "medium" | "high"; // Reasoning effort for GPT-5 and O-series models
  verbosity?: "low" | "medium" | "high"; // Output verbosity control
}

export interface AIGenerateResult {
  content: string;
  contentLength: number;
  model: string;
  temperature: number;
  type: string;
  responseFormat: string;
  timestamp: string;
}

export interface AIStreamEvent {
  type: "start" | "progress" | "complete" | "error";
  message?: string;
  content?: string;
  progress?: number;
  result?: AIGenerateResult;
  error?: string;
}

export type AIStreamCallback = (event: AIStreamEvent) => void;

/**
 * Generate AI content using the simple AI SDK API
 */
export class AIGenerator {
  private static readonly API_URL = "/api/ai/generate-simple";

  /**
   * Generate AI content with streaming support (POST-first approach)
   */
  static async generate(
    options: AIGenerateOptions,
    onEvent?: AIStreamCallback
  ): Promise<AIGenerateResult> {
    const url = new URL(this.API_URL, window.location.origin);

    // Build query parameters (only model for POST-first approach)
    const params = new URLSearchParams();
    if (options.model) params.append("model", options.model);

    // Request body with all generation parameters
    const requestBody: Partial<AIGenerateOptions> = {
      prompt: options.prompt,
      context: options.context,
      instructions: options.instructions,
      instructionSet: options.instructionSet,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      type: options.type,
      systemPrompt: options.systemPrompt,
      responseFormat: options.responseFormat,
      reasoning: options.reasoning,
      verbosity: options.verbosity,
    };

    const finalUrl = url.toString() + "?" + params.toString();

    // Add timeout handling for GPT-5 models
    const isGPT5Model = options.model?.includes("gpt-5");
    const timeoutMs = isGPT5Model ? 60000 : 120000; // 60s for GPT-5, 120s for others

    // If no callback provided, return promise-based result with timeout
    if (!onEvent) {
      return this.generatePromise(finalUrl, requestBody, timeoutMs);
    }

    // Streaming implementation with timeout
    return this.generateStream(finalUrl, requestBody, onEvent, timeoutMs);
  }

  /**
   * Generate AI content using POST method with JSON body
   */
  static async generatePOST(
    options: AIGenerateOptions,
    onEvent?: AIStreamCallback
  ): Promise<AIGenerateResult> {
    if (!onEvent) {
      return this.generatePromise(this.API_URL, options);
    }

    return this.generateStreamPOST(this.API_URL, options, onEvent);
  }

  /**
   * Promise-based generation (non-streaming)
   */
  private static async generatePromise(
    url: string,
    body: Partial<AIGenerateOptions>,
    timeoutMs: number = 120000
  ): Promise<AIGenerateResult> {
    console.log("AI Generation: Starting promise-based generation", {
      url,
      bodyKeys: Object.keys(body),
      timeoutMs,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });

    console.log("AI Generation: Response received", {
      status: response.status,
      ok: response.ok,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Client: API Error Response", {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText,
      });

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || "Unknown error" };
      }

      const errorMessage =
        errorData.error ||
        errorData.details ||
        errorText ||
        "Generation failed";
      throw new Error(`API Error (${response.status}): ${errorMessage}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const decoder = new TextDecoder();
    let result: AIGenerateResult | null = null;
    let lastEvent: any = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        console.log("AI Generation: Chunk received", {
          chunkSize: chunk.length,
        });

        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            if (dataStr === "[DONE]") continue;

            try {
              const event = JSON.parse(dataStr);
              lastEvent = event;
              console.log("AI Generation: Event received", {
                type: event.type,
                hasResult: !!event.result,
              });

              if (event.type === "complete" && event.result) {
                result = event.result;
                console.log("AI Generation: Result found", {
                  contentLength: result?.content?.length,
                });
                break;
              } else if (event.type === "error") {
                console.error("AI Generation: Server error event", event);
                throw new Error(
                  event.error ||
                    event.message ||
                    "Server error during generation"
                );
              }
            } catch (parseError) {
              console.error("AI Generation: Failed to parse event", {
                dataStr,
                parseError,
              });
              // Ignore parsing errors for partial chunks
            }
          }
        }

        if (result) break;
      }
    } finally {
      reader.releaseLock();
    }

    if (!result) {
      console.error("AI Generation: No result received", { lastEvent });
      throw new Error(
        "No result received from AI stream - the stream may have failed silently"
      );
    }

    return result;
  }

  /**
   * Streaming generation with POST method
   */
  private static async generateStream(
    url: string,
    body: Partial<AIGenerateOptions>,
    onEvent: AIStreamCallback,
    timeoutMs: number = 120000
  ): Promise<AIGenerateResult> {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Client: API Error Response", {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText,
      });

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || "Unknown error" };
      }

      const errorMessage =
        errorData.error ||
        errorData.details ||
        errorText ||
        "Generation failed";
      throw new Error(`API Error (${response.status}): ${errorMessage}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const decoder = new TextDecoder();
    let result: AIGenerateResult | null = null;
    let chunkCount = 0;
    let fullContent = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        chunkCount++;
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            if (dataStr === "[DONE]") continue;

            try {
              const event = JSON.parse(dataStr);
              onEvent(event);

              // Track content for debugging
              if (event.content) {
                fullContent = event.content;
              }

              if (event.type === "complete" && event.result) {
                result = event.result;
                break;
              }
            } catch {
              // Ignore parsing errors
            }
          }
        }

        if (result) break;
      }
    } finally {
      reader.releaseLock();
    }

    if (!result) {
      console.error("AI Client: No result received from stream", {
        chunksProcessed: chunkCount,
        lastContentLength: fullContent?.length || 0,
        hasContent: !!fullContent,
        contentPreview: fullContent?.slice(0, 200),
      });
      throw new Error(
        "No result received from AI stream. This could indicate the response was incomplete or malformed."
      );
    }

    return result;
  }

  /**
   * Streaming generation with POST method
   */
  private static async generateStreamPOST(
    url: string,
    options: AIGenerateOptions,
    onEvent: AIStreamCallback
  ): Promise<AIGenerateResult> {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Client: API Error Response", {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText,
      });

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || "Unknown error" };
      }

      const errorMessage =
        errorData.error ||
        errorData.details ||
        errorText ||
        "Generation failed";
      throw new Error(`API Error (${response.status}): ${errorMessage}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const decoder = new TextDecoder();
    let result: AIGenerateResult | null = null;
    let chunkCount = 0;
    let fullContent = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        chunkCount++;
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            if (dataStr === "[DONE]") continue;

            try {
              const event = JSON.parse(dataStr);
              onEvent(event);

              // Track content for debugging
              if (event.content) {
                fullContent = event.content;
              }

              if (event.type === "complete" && event.result) {
                result = event.result;
                break;
              }
            } catch {
              // Ignore parsing errors
            }
          }
        }

        if (result) break;
      }
    } finally {
      reader.releaseLock();
    }

    if (!result) {
      console.error("AI Client: No result received from stream", {
        chunksProcessed: chunkCount,
        lastContentLength: fullContent?.length || 0,
        hasContent: !!fullContent,
        contentPreview: fullContent?.slice(0, 200),
      });
      throw new Error(
        "No result received from AI stream. This could indicate the response was incomplete or malformed."
      );
    }

    return result;
  }

  /**
   * Quick JSON generation helper
   */
  static async generateJSON(
    prompt: string,
    context?: any,
    model?: string,
    onEvent?: AIStreamCallback
  ): Promise<any> {
    const result = await this.generate(
      {
        prompt,
        context,
        model,
        type: "json",
        responseFormat: "json",
        systemPrompt:
          "You are a helpful AI assistant. Respond with valid JSON only. Do not include any explanations or text outside of the JSON structure.",
      },
      onEvent
    );

    try {
      return JSON.parse(result.content);
    } catch (error) {
      throw new Error(
        `Failed to parse JSON response: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Quick analysis helper
   */
  static async analyze(
    prompt: string,
    context?: any,
    model?: string,
    onEvent?: AIStreamCallback
  ): Promise<AIGenerateResult> {
    return this.generate(
      {
        prompt,
        context,
        model,
        type: "analysis",
        systemPrompt:
          "You are an expert analyst. Break down complex information into clear insights and actionable recommendations.",
      },
      onEvent
    );
  }

  /**
   * Quick recommendations helper
   */
  static async recommend(
    prompt: string,
    context?: any,
    model?: string,
    onEvent?: AIStreamCallback
  ): Promise<AIGenerateResult> {
    return this.generate(
      {
        prompt,
        context,
        model,
        type: "recommendations",
        systemPrompt:
          "You are an expert advisor. Provide specific, actionable recommendations based on the provided context.",
      },
      onEvent
    );
  }
}
