/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Dynamic AI Generation API - Production Ready
 * POST /api/ai/generate with JSON body (recommended for large context)
 */

import { NextRequest } from "next/server";
import { openai, AI_MODELS } from "@/lib/open_ai/client";
import { serverLogger as logger } from "@/lib/logger";
import {
  adjustTemperatureForModel,
  getModelEndpoint,
  supportsStreaming,
  supportsJSONFormat,
  getMaxTokensForModel,
  getStreamingDelta,
  supportsTemperature,
} from "@/lib/ai/ai-models";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface GenerateRequestParams {
  model?: string;
  context?: any;
  instructions?: string;
  instructionSet?: string;
  prompt?: string;
  temperature?: number;
  maxTokens?: number;
  type?: "general" | "analysis" | "recommendations" | "custom" | "json";
  systemPrompt?: string;
  responseFormat?: "text" | "json";
  reasoning?: "none" | "low" | "medium" | "high";
  verbosity?: "low" | "medium" | "high";
}

/**
 * Check if a model supports reasoning parameters
 */
function supportsReasoningModel(model: string): boolean {
  // Check if model supports reasoning (GPT-5 series and O-series)
  const reasoningModels = [
    AI_MODELS.GPT_5_1,
    AI_MODELS.GPT_5,
    AI_MODELS.GPT_5_MINI,
    AI_MODELS.GPT_5_NANO,
    AI_MODELS.GPT_5_PRO,
    AI_MODELS.O3,
    AI_MODELS.O3_PRO,
    AI_MODELS.O3_DEEP_RESEARCH,
    AI_MODELS.O4_MINI,
    AI_MODELS.O4_MINI_DEEP_RESEARCH,
    AI_MODELS.O1,
    AI_MODELS.O1_PRO,
  ];
  return reasoningModels.includes(model as any);
}

async function handleRequest(req: NextRequest, method: string) {
  try {
    console.log("API Route: Starting handleRequest", { method, url: req.url });

    // Extract query parameters (only model for body-first approach)
    const { searchParams } = new URL(req.url);
    const queryParams: Partial<GenerateRequestParams> = {};
    if (searchParams.has("model")) {
      queryParams.model = searchParams.get("model") || undefined;
    }

    // Parse request body
    const bodyParams: Partial<GenerateRequestParams> = {};
    if (method === "POST") {
      const contentType = req.headers.get("content-type");
      console.log("API Route: Parsing body", { contentType, method });

      if (contentType?.includes("application/json")) {
        const jsonBody = await req.json();
        console.log("API Route: JSON body parsed", {
          hasContext: !!jsonBody.context,
          hasInstructionSet: !!jsonBody.instructionSet,
          hasPrompt: !!jsonBody.prompt,
        });
        Object.assign(bodyParams, jsonBody);
      } else {
        const formData = await req.formData();
        console.log("API Route: FormData parsed");
        Object.assign(bodyParams, Object.fromEntries(formData.entries()));
      }
    }

    // Merge parameters with model-specific defaults
    const modelId = bodyParams.model || queryParams.model || AI_MODELS.GPT_4O;
    const params: GenerateRequestParams = {
      model: modelId,
      temperature: 0.7,
      maxTokens: getMaxTokensForModel(modelId),
      type: "general",
      responseFormat: "text",
      ...bodyParams,
      ...queryParams,
    };

    console.log("API Route: Merged params", {
      model: params.model,
      hasPrompt: !!params.prompt,
      hasContext: !!params.context,
      instructionSet: params.instructionSet,
    });

    // Validate required fields
    if (!params.prompt?.trim() && !params.context && !params.instructionSet) {
      console.log("API Route: Validation failed - missing required fields");
      return new Response(
        JSON.stringify({
          error:
            "Either 'prompt', 'context', or 'instructionSet' parameter is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Load instruction set if specified
    let instructionSetContent = "";
    if (params.instructionSet === "ksa-framework") {
      try {
        const instructionsPath = path.join(
          process.cwd(),
          "src/app/(main)/test-response/ksa_framework_instructions.txt"
        );
        instructionSetContent = fs.readFileSync(instructionsPath, "utf-8");
        if (!instructionSetContent) {
          return new Response(
            JSON.stringify({
              error: "KSA framework instructions file not found or empty",
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      } catch (error) {
        logger.api.error("Failed to load KSA framework instructions", {
          instructionSet: params.instructionSet,
          error: error instanceof Error ? error.message : String(error),
        });
        return new Response(
          JSON.stringify({
            error: "Failed to load KSA framework instructions",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    } else if (params.instructionSet === "ksa-framework-short") {
      try {
        const instructionsPath = path.join(
          process.cwd(),
          "src/app/(main)/test-response/ksa_framework_instructions_short.txt"
        );
        instructionSetContent = fs.readFileSync(instructionsPath, "utf-8");
        if (!instructionSetContent) {
          return new Response(
            JSON.stringify({
              error: "KSA framework short instructions file not found or empty",
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      } catch (error) {
        logger.api.error("Failed to load KSA framework short instructions", {
          instructionSet: params.instructionSet,
          error: error instanceof Error ? error.message : String(error),
        });
        return new Response(
          JSON.stringify({
            error: "Failed to load KSA framework short instructions",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Adjust temperature based on model constraints (only if supported)
    // GPT-5 models require reasoning parameter for temperature support
    const canUseTemperature = supportsTemperature(
      params.model || AI_MODELS.GPT_4O,
      params.reasoning
    );
    const adjustedTemperature = canUseTemperature
      ? adjustTemperatureForModel(
          params.model || AI_MODELS.GPT_4O,
          params.temperature || 0.7
        )
      : undefined;

    logger.api.info("Starting dynamic AI generation", {
      method,
      type: params.type,
      model: params.model,
      hasContext: !!params.context,
      hasInstructions: !!params.instructions,
      instructionSet: params.instructionSet,
      hasInstructionSet: !!instructionSetContent,
      instructionSetLength: instructionSetContent?.length || 0,
      temperature: params.temperature,
      adjustedTemperature,
      maxTokens: params.maxTokens,
      responseFormat: params.responseFormat,
    });

    // Create ReadableStream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let chunkCount = 0;

        try {
          // Build system prompt
          let finalSystemPrompt =
            params.systemPrompt || "You are a helpful AI assistant.";

          switch (params.type) {
            case "analysis":
              finalSystemPrompt =
                params.systemPrompt ||
                "You are an expert analyst. Break down complex information into clear insights and actionable recommendations.";
              break;
            case "recommendations":
              finalSystemPrompt =
                params.systemPrompt ||
                "You are an expert advisor. Provide specific, actionable recommendations based on the provided context.";
              break;
            case "json":
              finalSystemPrompt =
                params.systemPrompt ||
                "You are a helpful AI assistant. Respond with valid JSON only. Do not include any explanations or text outside of the JSON structure.";
              break;
            case "custom":
              finalSystemPrompt =
                params.systemPrompt ||
                "You are a helpful AI assistant with expertise in the provided domain.";
              break;
            default:
              finalSystemPrompt =
                params.systemPrompt || "You are a helpful AI assistant.";
          }

          // Build the full prompt
          let fullPrompt = params.prompt;
          let combinedInstructions = params.instructions || "";

          // Add instruction set content if available
          if (instructionSetContent) {
            combinedInstructions = combinedInstructions
              ? `${instructionSetContent}\n\n${combinedInstructions}`
              : instructionSetContent;
          }

          if (params.context) {
            let contextString = "";

            // Handle context as object or string
            if (typeof params.context === "object") {
              contextString = `CONTEXT:\n${JSON.stringify(
                params.context,
                null,
                2
              )}\n\n`;
            } else {
              contextString = `CONTEXT:\n${params.context}\n\n`;
            }

            if (combinedInstructions) {
              contextString += `INSTRUCTIONS:\n${combinedInstructions}\n\n`;
            }

            contextString += `REQUEST:\n${params.prompt}`;
            fullPrompt = contextString;
          } else if (combinedInstructions) {
            fullPrompt = `INSTRUCTIONS:\n${combinedInstructions}\n\nREQUEST:\n${params.prompt}`;
          }

          // Start streaming response
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "start",
                message: "Starting AI generation...",
              })}\n\n`
            )
          );

          // Determine which endpoint to use based on model
          const modelEndpoint = getModelEndpoint(
            params.model || AI_MODELS.GPT_4O
          );
          const canStream = supportsStreaming(params.model || AI_MODELS.GPT_4O);
          const canUseJSON = supportsJSONFormat(
            params.model || AI_MODELS.GPT_4O
          );

          // Build the request dynamically based on endpoint
          const openaiRequest: any = {
            model: params.model || AI_MODELS.GPT_4O,
            stream: canStream,
          };

          // DEBUG: Log the model and endpoint
          console.log(
            "DEBUG: Model",
            params.model,
            "Endpoint",
            modelEndpoint,
            "CanStream",
            canStream
          );

          // Only add temperature if the model supports it
          if (canUseTemperature && adjustedTemperature !== undefined) {
            openaiRequest.temperature = adjustedTemperature;
          }

          // Apply endpoint-specific parameters and format
          if (modelEndpoint === "responses") {
            // TEMPORARY: Disable complex GPT-5 logic to test basic functionality
            console.log(
              "DEBUG: Using responses endpoint - this should only be GPT-5 models"
            );
            // Responses endpoint format - BASIC VERSION FOR TESTING
            openaiRequest.max_output_tokens =
              params.maxTokens ||
              getMaxTokensForModel(params.model || AI_MODELS.GPT_4O);
            openaiRequest.input = fullPrompt;
            openaiRequest.instructions = finalSystemPrompt;

            // Skip complex reasoning/verbosity logic for now
          } else {
            // Chat completions endpoint format - THIS SHOULD WORK FOR GPT-4
            console.log("DEBUG: Using chat completions endpoint");
            openaiRequest.max_completion_tokens =
              params.maxTokens ||
              getMaxTokensForModel(params.model || AI_MODELS.GPT_4O);
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

            // JSON format handling for chat completions
            if (params.responseFormat === "json") {
              openaiRequest.response_format = { type: "json_object" };
            }
          }

          // Call OpenAI with streaming
          logger.api.info("Calling OpenAI API", {
            model: openaiRequest.model,
            endpoint: modelEndpoint,
            temperature: adjustedTemperature,
            maxTokens: params.maxTokens,
            hasInstructionSet: !!instructionSetContent,
            canStream,
            canUseJSON,
            isGPT5Model: supportsReasoningModel(openaiRequest.model),
            fullRequest: JSON.stringify(openaiRequest, null, 2),
          });

          let response;
          try {
            if (modelEndpoint === "responses") {
              response = await openai.responses.create(openaiRequest);
            } else {
              response = await openai.chat.completions.create(openaiRequest);
            }
            logger.api.info("OpenAI stream created successfully", {
              endpoint: modelEndpoint,
            });
          } catch (openaiError) {
            const errorMessage =
              openaiError instanceof Error
                ? openaiError.message
                : String(openaiError);
            const isGPT5Model = supportsReasoningModel(openaiRequest.model);

            logger.api.error("Failed to create OpenAI stream", {
              error: errorMessage,
              stack:
                openaiError instanceof Error ? openaiError.stack : undefined,
              endpoint: modelEndpoint,
              model: openaiRequest.model,
              isGPT5Model,
              hasReasoning: !!openaiRequest.reasoning,
              hasTemperature: !!openaiRequest.temperature,
              requestParams: JSON.stringify(openaiRequest, null, 2),
            });

            // Enhanced error handling for GPT-5 models
            if (isGPT5Model) {
              // Check for common GPT-5 issues
              if (
                errorMessage.includes("temperature") &&
                openaiRequest.reasoning !== "none"
              ) {
                const specificError = new Error(
                  'GPT-5.1 temperature error: Temperature is only supported when reasoning is set to "none"'
                );
                logger.api.error("GPT-5 temperature restriction violated", {
                  model: openaiRequest.model,
                  reasoning: openaiRequest.reasoning,
                  temperature: openaiRequest.temperature,
                });
                throw specificError;
              }

              if (
                errorMessage.includes("max_output_tokens") &&
                openaiRequest.max_output_tokens > 4096 &&
                openaiRequest.model === "gpt-5.1"
              ) {
                const specificError = new Error(
                  "GPT-5.1 token limit exceeded: Maximum 4096 tokens allowed"
                );
                logger.api.error("GPT-5.1 token limit exceeded", {
                  model: openaiRequest.model,
                  maxTokens: openaiRequest.max_output_tokens,
                });
                throw specificError;
              }
            }

            throw openaiError;
          }

          let fullContent = "";

          // Process the OpenAI stream (different formats for different endpoints)
          logger.api.info("Starting to process OpenAI stream", {
            endpoint: modelEndpoint,
          });
          let streamEnded = false;
          let noContentCount = 0;
          const MAX_CHUNKS = 1000; // Safety limit to prevent infinite loops
          const MAX_NO_CONTENT_CHUNKS = 50; // Max empty chunks before assuming completion
          try {
            for await (const chunk of response as any) {
              if (chunkCount > MAX_CHUNKS) {
                logger.api.warn("Maximum chunk limit reached, ending stream", {
                  chunkCount,
                  model: params.model,
                  contentLength: fullContent.length,
                });
                break;
              }

              if (noContentCount > MAX_NO_CONTENT_CHUNKS) {
                logger.api.warn(
                  "Maximum no-content chunks reached, ending stream",
                  {
                    noContentCount,
                    chunkCount,
                    model: params.model,
                    contentLength: fullContent.length,
                  }
                );
                break;
              }
              chunkCount++;

              // Log chunk structure for debugging GPT-5
              if (
                supportsReasoningModel(params.model || AI_MODELS.GPT_4O) &&
                chunkCount <= 10
              ) {
                logger.api.debug("GPT-5 chunk structure", {
                  chunkNumber: chunkCount,
                  chunkKeys: Object.keys(chunk),
                  chunkType: typeof chunk,
                  hasDelta: !!chunk.delta,
                  hasContent: !!chunk.content,
                  hasOutput: !!chunk.output,
                  hasStatus: !!chunk.status,
                  hasChoices: !!chunk.choices,
                  endpoint: modelEndpoint,
                  chunkRaw: JSON.stringify(chunk, null, 2),
                });

                // Also test different delta extraction methods
                const testDeltas = {
                  delta: chunk.delta,
                  content: chunk.content,
                  outputContent: chunk.output?.[0]?.content,
                  outputText: chunk.output_text,
                  choicesDelta: chunk.choices?.[0]?.delta?.content,
                };
                logger.api.debug("Delta extraction test", {
                  chunkNumber: chunkCount,
                  testResults: testDeltas,
                });
              }

              // Handle different streaming response formats
              const delta = getStreamingDelta(
                chunk,
                params.model || AI_MODELS.GPT_4O
              );

              // DEBUG: Log chunk info for first few chunks
              if (chunkCount <= 3) {
                console.log(
                  "DEBUG: Chunk",
                  chunkCount,
                  "Model",
                  params.model,
                  "Endpoint",
                  modelEndpoint,
                  "Delta",
                  delta ? delta.slice(0, 50) : "NULL",
                  "Chunk keys",
                  Object.keys(chunk)
                );
              }

              if (delta) {
                fullContent += delta;
                noContentCount = 0; // Reset counter when we get content

                // Log first content and progress
                if (chunkCount === 1 && delta) {
                  logger.api.info("First content received", {
                    firstDelta: delta.slice(0, 100),
                    endpoint: modelEndpoint,
                  });
                }
                // Stream partial content
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: "progress",
                      content: fullContent,
                      progress: Math.min(
                        (fullContent.length / (params.maxTokens || 2000)) * 100,
                        95
                      ),
                    })}\n\n`
                  )
                );
              } else {
                noContentCount++;
                // Log when we get empty chunks for GPT-5 debugging
                if (
                  supportsReasoningModel(params.model || AI_MODELS.GPT_4O) &&
                  noContentCount > 5
                ) {
                  logger.api.debug("Multiple empty chunks detected", {
                    noContentCount,
                    chunkNumber: chunkCount,
                    model: params.model,
                    endpoint: modelEndpoint,
                  });
                }
              }

              // Check for stream completion indicators
              if (modelEndpoint === "responses") {
                // Responses endpoint completion indicators
                if (
                  chunk.status === "completed" ||
                  chunk.done ||
                  chunk.finished ||
                  chunk.status === "succeeded"
                ) {
                  logger.api.info(
                    "Stream completion detected (responses endpoint)",
                    { chunkStatus: chunk.status }
                  );
                  streamEnded = true;
                  break;
                }
              } else {
                // Chat completions endpoint completion indicators
                const choice = chunk.choices?.[0];
                if (
                  choice?.finish_reason ||
                  choice?.finish_reason === "stop" ||
                  choice?.finish_reason === "end_turn"
                ) {
                  logger.api.info(
                    "Stream completion detected (chat completions)",
                    { finishReason: choice.finish_reason }
                  );
                  streamEnded = true;
                  break;
                }
              }
            }

            // If we didn't get explicit completion, check if we have substantial content
            if (!streamEnded && fullContent.length > 0) {
              logger.api.info(
                "No explicit completion signal, but content exists - treating as complete",
                {
                  contentLength: fullContent.length,
                  chunkCount,
                }
              );
              streamEnded = true;
            }
          } catch (streamError) {
            logger.api.error("Error processing OpenAI stream", {
              error:
                streamError instanceof Error
                  ? streamError.message
                  : String(streamError),
              stack:
                streamError instanceof Error ? streamError.stack : undefined,
              chunkCount,
              endpoint: modelEndpoint,
            });

            const errorData = `data: ${JSON.stringify({
              type: "error",
              message: "Stream processing failed",
              error:
                streamError instanceof Error
                  ? streamError.message
                  : "Stream error",
              endpoint: modelEndpoint,
            })}\n\n`;
            controller.enqueue(encoder.encode(errorData));
            controller.close();
            return;
          }

          // Validate JSON if requested
          let validatedContent = fullContent;
          if (params.responseFormat === "json") {
            try {
              // Try to extract JSON from the response
              const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                JSON.parse(jsonMatch[0]); // Validate it's valid JSON
                validatedContent = jsonMatch[0];
              } else {
                throw new Error("No valid JSON found in response");
              }
            } catch (error) {
              logger.api.warn("Failed to validate JSON response", {
                error: error instanceof Error ? error.message : String(error),
              });
              // Continue with original content if validation fails
            }
          }

          // Send completion - ensure we have content even if stream ended abruptly
          const finalContent = validatedContent || fullContent || "";

          logger.api.info("Preparing completion", {
            chunkCount,
            contentLength: finalContent.length,
            validatedContentLength: validatedContent?.length || 0,
            fullContentLength: fullContent.length,
            model: params.model || AI_MODELS.GPT_4O,
            streamEnded,
            endpoint: modelEndpoint,
          });

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "complete",
                result: {
                  content: finalContent,
                  contentLength: finalContent.length,
                  model: params.model || AI_MODELS.GPT_4O,
                  temperature: adjustedTemperature,
                  type: params.type || "general",
                  responseFormat: params.responseFormat || "text",
                  timestamp: new Date().toISOString(),
                },
              })}\n\n`
            )
          );

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));

          logger.api.info("Stream completed successfully", {
            chunkCount,
            contentLength: finalContent.length,
            model: params.model || AI_MODELS.GPT_4O,
          });

          controller.close();
        } catch (error) {
          logger.api.error("Error in dynamic AI generation streaming", {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          });

          const errorData = `data: ${JSON.stringify({
            type: "error",
            message: "Generation failed",
            error: error instanceof Error ? error.message : "Unknown error",
          })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("API Route: Error in handleRequest", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      errorType: error?.constructor?.name,
    });

    logger.api.error("Failed to start dynamic AI generation", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return new Response(
      JSON.stringify({
        error: "Failed to start generation",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleRequest(req, "GET");
}

export async function POST(req: NextRequest) {
  return handleRequest(req, "POST");
}
