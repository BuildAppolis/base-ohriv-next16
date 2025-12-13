/**
 * SSE endpoint for streaming question generation
 * Provides real-time updates as questions are generated one-by-one
 */

import { NextRequest } from "next/server";
import { streamQuestions } from "@/lib/ai/_instructions/streaming-question-generator";
import type {
  CompanyContext,
  RoleDetails,
  GeneratedAttribute,
} from "@/types/old/company_old/generation-types";
import { serverLogger as logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      context,
      role,
      attributes,
      services,
      assignedStageIds,
      levelAssignments,
    } = body as {
      context: CompanyContext;
      role: RoleDetails;
      attributes: GeneratedAttribute[];
      services?: string[];
      assignedStageIds?: string[];
      levelAssignments?: Array<{
        id: string;
        level: string;
        positionCount: number;
        assignedStageIds: string[];
        operations?: string;
      }>;
    };

    logger.api.info("Starting SSE question streaming", {
      role: role.title,
      attributeCount: attributes.length,
      stageCount: assignedStageIds?.length || 0,
    });

    // Create ReadableStream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Stream questions one-by-one
          for await (const event of streamQuestions(
            context,
            role,
            attributes,
            services,
            assignedStageIds,
            levelAssignments
          )) {
            const data = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }

          // Send completion
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          logger.api.error("Error in question streaming", {
            error: error instanceof Error ? error.message : String(error),
          });

          const errorData = `data: ${JSON.stringify({
            type: "error",
            message: "Generation failed",
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
    logger.api.error("Failed to start question streaming", {
      error: error instanceof Error ? error.message : String(error),
    });

    return new Response(
      JSON.stringify({ error: "Failed to start streaming" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
