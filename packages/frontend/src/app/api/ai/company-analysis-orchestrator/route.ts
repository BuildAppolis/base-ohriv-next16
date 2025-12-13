import { companyAnalysisOrchestratorAgent } from "@/lib/ai/company-analysis-orchestrator-agent";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { validateUIMessages } from "ai";

export const maxDuration = 60;
const RATE_LIMIT_KEY_PREFIX = "company-analysis-orchestrator";

export async function POST(req: Request) {
  try {
    const clientIP = extractClientIP(req);
    const rateLimitResult = await checkRateLimit(
      `${RATE_LIMIT_KEY_PREFIX}-${clientIP}`
    );

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    const body = await req.json();

    return companyAnalysisOrchestratorAgent.respond({
      messages: await validateUIMessages({ messages: body.messages }),
    });
  } catch (error) {
    console.error("company-analysis orchestrator error", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function extractClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIP = req.headers.get("x-real-ip");
  const cfConnectingIP = req.headers.get("cf-connecting-ip");

  return (
    forwarded?.split(",")[0].trim() || realIP || cfConnectingIP || "unknown"
  );
}

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
