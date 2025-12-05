/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Server-side logger with file writing capabilities
 * This module should only be imported in server components/API routes
 */
import "server-only";
import { Logger } from "./logger";
import { getFileLogger } from "./logger-file";
import type { LogLevel, LogCategory } from "./logger";

class ServerLogger extends Logger {
  private fileLogger = getFileLogger();

  constructor() {
    super();

    // Log session info on initialization (only if console output is enabled)
    if (process.env.NODE_ENV === "development" && this.output.console) {
      const sessionInfo = this.fileLogger.getSessionInfo();
      console.log("[ServerLogger] File logging initialized:", sessionInfo);
    }
  }

  protected async logInternal(
    category: LogCategory,
    level: LogLevel,
    message: string,
    ...args: any[]
  ) {
    // Call parent's log method for console output (if enabled)
    super.logInternal(category, level, message, ...args);

    // File logging (development mode only, if enabled)
    if (process.env.NODE_ENV === "development" && this.output.file) {
      this.fileLogger
        .log(category, level, message, ...args)
        .catch((err: any) => {
          // Always log file write errors to console, regardless of console output setting
          console.error("[ServerLogger] Failed to write to file:", err);
        });
    }
  }

  // Flush all pending logs to files
  async flush(): Promise<void> {
    if (process.env.NODE_ENV === "development") {
      await this.fileLogger.flush();
    }
  }

  // Get session information
  getSessionInfo() {
    if (process.env.NODE_ENV === "development") {
      return this.fileLogger.getSessionInfo();
    }
    return null;
  }
}

// Export singleton instance
export const serverLogger = new ServerLogger();

// Ensure logs are flushed on process exit
process.on("exit", () => {
  serverLogger.flush().catch(console.error);
});
process.on("SIGINT", () => {
  serverLogger
    .flush()
    .then(() => process.exit(0))
    .catch(console.error);
});
process.on("SIGTERM", () => {
  serverLogger
    .flush()
    .then(() => process.exit(0))
    .catch(console.error);
});

// Re-export types
export type { LogLevel, LogCategory } from "./logger";
