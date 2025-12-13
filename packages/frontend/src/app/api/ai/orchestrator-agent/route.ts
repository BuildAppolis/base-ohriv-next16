/* eslint-disable @typescript-eslint/no-explicit-any */
import { orchestratorAgent } from "@/lib/ai/orchestrator-agent";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { validateUIMessages } from "ai";

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

/** Maximum duration for streaming responses (60 seconds) */
export const maxDuration = 60;

/** Rate limit key prefix for this endpoint */
const RATE_LIMIT_KEY_PREFIX = "ai-orchestrater-agent";

/**
 * Main API endpoint for the orchestrater agent
 *
 * This endpoint processes user messages and uses a multi-step AI agent
 * with various tools to provide comprehensive answers. The agent can:
 * - Search the web for current information
 * - Analyze complex problems
 * - Make decisions between options
 * - Provide structured final answers with citations
 */
export async function POST(req: Request) {
  try {
    // Extract client IP for rate limiting
    const clientIP = extractClientIP(req);

    // Check rate limit before processing
    const rateLimitResult = await checkRateLimit(
      `${RATE_LIMIT_KEY_PREFIX}-${clientIP}`
    );

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    // Parse request body
    const body = await req.json();

    // Use the orchestrator agent pattern
    return orchestratorAgent.respond({
      messages: await validateUIMessages({ messages: body.messages }),
    });
  } catch (error) {
    console.error("Error in multi-step tool agent:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extracts the client IP address from request headers for rate limiting
 */
function extractClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIP = req.headers.get("x-real-ip");
  const cfConnectingIP = req.headers.get("cf-connecting-ip");

  return (
    forwarded?.split(",")[0].trim() || realIP || cfConnectingIP || "unknown"
  );
}

/**
 * Creates a rate limit exceeded response
 */
function createRateLimitResponse(rateLimitResult: any): Response {
  const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: "Rate limit exceeded. Please try again later.",
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": retryAfter.toString(),
        ...rateLimitResult.headers,
      },
    }
  );
}
