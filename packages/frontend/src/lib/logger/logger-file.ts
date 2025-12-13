/* eslint-disable @typescript-eslint/no-explicit-any */
import { writeFile, appendFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import * as path from "path";
import { format } from "date-fns";
import type { LogLevel, LogCategory } from "./logger";

interface FileLoggerConfig {
  baseDir: string;
  sessionId: string;
  isDevelopment: boolean;
}

interface LogEntry {
  timestamp: string;
  category: LogCategory;
  level: LogLevel;
  message: string;
  data?: any[];
}

class FileLogger {
  private config: FileLoggerConfig;
  private sessionDir: string;
  private logQueues: Map<string, LogEntry[]> = new Map();
  private writeTimers: Map<string, NodeJS.Timeout> = new Map();
  private readonly BATCH_INTERVAL = 1000; // Write logs every second
  private readonly MAX_BATCH_SIZE = 50; // Write immediately if batch reaches this size

  constructor(config: Partial<FileLoggerConfig> = {}) {
    const sessionId = config.sessionId || this.generateSessionId();
    const dateStr = format(new Date(), "yyyy-MM-dd");

    this.config = {
      baseDir: config.baseDir || path.join(process.cwd(), "logs"),
      sessionId,
      isDevelopment:
        config.isDevelopment ?? process.env.NODE_ENV === "development",
    };

    this.sessionDir = path.join(this.config.baseDir, `${sessionId}_${dateStr}`);
  }

  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${randomStr}`;
  }

  private getLogFileName(category: LogCategory, level: LogLevel): string {
    const categoryMap: Record<LogCategory, string> = {
      email: "email_logs.log",
      auth: "auth_logs.log",
      setup: "setup_logs.log",
      campaign: "campaign_logs.log",
      webhook: "webhook_logs.log",
      api: "api_logs.log",
      general: "general_logs.log",
    };

    // Separate error logs into their own files
    if (level === "error") {
      return `error_${category}_logs.log`;
    }

    return categoryMap[category] || "misc_logs.log";
  }

  private async ensureDirectoryExists(dir: string): Promise<void> {
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    const parts = [
      `[${entry.timestamp}]`,
      `[${entry.category.toUpperCase()}]`,
      `[${entry.level.toUpperCase()}]`,
      entry.message,
    ];

    if (entry.data && entry.data.length > 0) {
      const dataStr = entry.data
        .map((item) => {
          try {
            return typeof item === "object"
              ? JSON.stringify(item, null, 2)
              : String(item);
          } catch {
            return String(item);
          }
        })
        .join(" ");

      if (dataStr) {
        parts.push("\n  Data:", dataStr);
      }
    }

    return parts.join(" ") + "\n";
  }

  private async writeQueue(fileName: string): Promise<void> {
    const queue = this.logQueues.get(fileName);
    if (!queue || queue.length === 0) return;

    const entries = queue.splice(0); // Clear the queue
    const filePath = path.join(this.sessionDir, fileName);

    try {
      await this.ensureDirectoryExists(this.sessionDir);

      const logContent = entries
        .map((entry) => this.formatLogEntry(entry))
        .join("");

      if (existsSync(filePath)) {
        await appendFile(filePath, logContent);
      } else {
        await writeFile(filePath, logContent);
      }
    } catch (error) {
      // Fallback to console if file write fails
      console.error("[FileLogger] Failed to write logs:", error);
      entries.forEach((entry) => {
        console.log(this.formatLogEntry(entry));
      });
    }
  }

  private scheduleWrite(fileName: string): void {
    // Clear existing timer
    const existingTimer = this.writeTimers.get(fileName);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Schedule new write
    const timer = setTimeout(() => {
      this.writeQueue(fileName).catch(console.error);
      this.writeTimers.delete(fileName);
    }, this.BATCH_INTERVAL);

    this.writeTimers.set(fileName, timer);
  }

  async log(
    category: LogCategory,
    level: LogLevel,
    message: string,
    ...data: any[]
  ): Promise<void> {
    // Only write to files in development mode
    if (!this.config.isDevelopment) return;

    const fileName = this.getLogFileName(category, level);
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      category,
      level,
      message,
      data: data.length > 0 ? data : undefined,
    };

    // Add to queue
    if (!this.logQueues.has(fileName)) {
      this.logQueues.set(fileName, []);
    }
    const queue = this.logQueues.get(fileName)!;
    queue.push(entry);

    // Write immediately if batch size is reached
    if (queue.length >= this.MAX_BATCH_SIZE) {
      await this.writeQueue(fileName);
    } else {
      // Otherwise, schedule batch write
      this.scheduleWrite(fileName);
    }
  }

  async flush(): Promise<void> {
    // Clear all timers
    this.writeTimers.forEach((timer) => {
      clearTimeout(timer);
    });
    this.writeTimers.clear();

    // Write all queued logs
    const writePromises = Array.from(this.logQueues.keys()).map((fileName) =>
      this.writeQueue(fileName)
    );

    await Promise.all(writePromises);
  }

  getSessionInfo() {
    return {
      sessionId: this.config.sessionId,
      sessionDir: this.sessionDir,
      logsPath: this.config.baseDir,
    };
  }
}

// Create singleton instance
let fileLoggerInstance: FileLogger | null = null;

export function getFileLogger(): FileLogger {
  if (!fileLoggerInstance) {
    fileLoggerInstance = new FileLogger();
  }
  return fileLoggerInstance;
}

// Export type
export type { FileLogger, FileLoggerConfig, LogEntry };
