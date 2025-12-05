/**
 * SSE endpoint for streaming attribute generation
 * Provides real-time updates as attributes are generated one-by-one
 */

import { NextRequest } from "next/server";
import { streamAttributes } from "@/lib/ai/_instructions/streaming-attribute-generator";
import type {
  CompanyContext,
  RoleDetails,
} from "@/types/company_old/generation-types";
import { serverLogger as logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { context, role, services } = body as {
      context: CompanyContext;
      role: RoleDetails;
      services?: string[];
    };

    logger.api.info("Starting SSE attribute streaming", {
      role: role.title,
      hasServices: !!services?.length,
    });

    // Create ReadableStream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Stream attributes one-by-one
          for await (const event of streamAttributes(context, role, services)) {
            const data = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }

          // Send completion
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          logger.api.error("Error in attribute streaming", {
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
    logger.api.error("Failed to start attribute streaming", {
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
