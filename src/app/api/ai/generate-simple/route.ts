/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Simple AI Generation API using AI SDK
 * POST /api/ai/generate-simple - Replaces complex OpenAI implementation
 */

import { NextRequest } from "next/server";
import { serverLogger as logger } from "@/lib/logger";
import { generateStreamSimple } from "@/lib/ai/ai-sdk-client";
import { AI_MODELS } from "@/lib/open_ai/client";

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

async function handleRequest(req: NextRequest, method: string) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const queryParams: Partial<GenerateRequestParams> = {};
    if (searchParams.has("model")) {
      queryParams.model = searchParams.get("model") || undefined;
    }

    // Parse request body
    const bodyParams: Partial<GenerateRequestParams> = {};
    if (method === "POST") {
      const contentType = req.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        const jsonBody = await req.json();
        Object.assign(bodyParams, jsonBody);
      } else {
        const formData = await req.formData();
        Object.assign(bodyParams, Object.fromEntries(formData.entries()));
      }
    }

    // Merge parameters with model-specific defaults
    const params: GenerateRequestParams = {
      model: bodyParams.model || queryParams.model || AI_MODELS.GPT_4O,
      temperature: 0.7,
      maxTokens: 2000,
      type: "general",
      responseFormat: "text",
      ...bodyParams,
      ...queryParams,
    };

    console.log("AI SDK API: Processing request", {
      model: params.model,
      hasPrompt: !!params.prompt,
      hasContext: !!params.context,
      instructionSet: params.instructionSet,
    });

    // Validate required fields
    if (!params.prompt?.trim() && !params.context && !params.instructionSet) {
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

    // Create ReadableStream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Send start event
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "start",
              message: "Starting AI generation...",
            })}\n\n`
          )
        );

        try {
          await generateStreamSimple(
            {
              ...params,
              prompt: params.prompt ?? "",
            },
            (event) => {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
              );
            }
          );

          // Send completion marker
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();

          logger.api.info("Stream completed successfully", {
            model: params.model,
          });
        } catch (error) {
          logger.api.error("Error in AI SDK streaming", {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            model: params.model,
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
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    logger.api.error("Error in AI SDK API route", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return new Response(
      JSON.stringify({
        error: "AI generation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function POST(req: NextRequest) {
  return handleRequest(req, "POST");
}

export async function GET(req: NextRequest) {
  return handleRequest(req, "GET");
}
