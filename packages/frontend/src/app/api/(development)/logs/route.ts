import { NextResponse } from "next/server";
import { readdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function GET(request: Request) {
  // Only allow access in development mode
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Logs API is only available in development mode" },
      { status: 403 }
    );
  }
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  const file = searchParams.get("file");

  const logsDir = path.join(process.cwd(), "logs");

  try {
    // If no sessionId, list all sessions
    if (!sessionId) {
      if (!existsSync(logsDir)) {
        return NextResponse.json({ sessions: [] });
      }

      const sessions = await readdir(logsDir);
      return NextResponse.json({ sessions });
    }

    const sessionDir = path.join(logsDir, sessionId);

    // If no file specified, list files in session
    if (!file) {
      if (!existsSync(sessionDir)) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        );
      }

      const files = await readdir(sessionDir);
      return NextResponse.json({ sessionId, files });
    }

    // Read specific log file
    const filePath = path.join(sessionDir, file);
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const content = await readFile(filePath, "utf-8");
    const lines = content.split("\n").filter((line) => line.trim());

    return NextResponse.json({
      sessionId,
      file,
      lines: lines.length,
      content: lines,
    });
  } catch (error) {
    console.error("Error reading logs:", error);
    return NextResponse.json({ error: "Failed to read logs" }, { status: 500 });
  }
}
