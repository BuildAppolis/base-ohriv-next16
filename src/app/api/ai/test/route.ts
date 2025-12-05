import { NextRequest } from "next/server";

export async function GET() {
  return new Response(JSON.stringify({ message: "API test works" }), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return new Response(JSON.stringify({
      message: "POST test works",
      received: body
    }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: "JSON parse failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}