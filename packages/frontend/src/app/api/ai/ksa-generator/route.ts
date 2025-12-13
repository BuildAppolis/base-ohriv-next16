/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import path from "path";
import { convertToCoreMessages, streamText, validateUIMessages } from "ai";
import { gateway } from "ai";

const promptPath = path.join(
  process.cwd(),
  "docs/AI/INSTRUCTIONS/KSA_ORCHESTRATOR_PROMPT.md"
);

const fallbackPrompt = `You are a KSA generator. Output ONLY valid JSON with KSA_JobFit and CoreValues_CompanyFit, 1-3 questions each, using the provided company context. No prose.`;

const loadPrompt = () => {
  try {
    return fs.readFileSync(promptPath, "utf8");
  } catch (err) {
    console.error("Failed to load KSA prompt:", err);
    return fallbackPrompt;
  }
};

const systemPrompt = loadPrompt();

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const uiMessages = await validateUIMessages({ messages: body.messages });
    const coreMessages = convertToCoreMessages(uiMessages);

    const result = await streamText({
      model: gateway("openai/gpt-4.1-mini"),
      system: systemPrompt,
      messages: coreMessages,
    });

    const anyResult = result as any;
    if (typeof anyResult.toAIStreamResponse === "function") {
      return anyResult.toAIStreamResponse();
    }
    if (typeof anyResult.toDataStreamResponse === "function") {
      return anyResult.toDataStreamResponse();
    }
    if (typeof anyResult.toTextStreamResponse === "function") {
      return anyResult.toTextStreamResponse();
    }
    if (typeof anyResult.toReadableStream === "function") {
      return new Response(anyResult.toReadableStream(), {
        headers: { "Content-Type": "text/plain" },
      });
    }

    // Fallback: plain text
    return new Response(String(result), {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("KSA generator error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
