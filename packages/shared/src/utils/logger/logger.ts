/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Centralized logging system with environment variable controls
 *
 * Usage:
 * // Client-side:
 * import { logger } from '@/lib/logger'
 *
 * // Server-side (with file logging):
 * import { serverLogger as logger } from '@/lib/logger-server'
 *
 * logger.email.info('Email sent to:', recipient)
 * logger.auth.debug('User logged in:', userId)
 * logger.setup.error('Setup status check:', data)
 *
 * Environment variables:
 * DEBUG_EMAIL=true      - Enable email system logging
 * DEBUG_AUTH=true       - Enable authentication logging
 * DEBUG_SETUP=true      - Enable setup/middleware logging
 * DEBUG_CAMPAIGN=true   - Enable campaign/mailing logging
 * DEBUG_WEBHOOK=true    - Enable webhook logging
 * DEBUG_API=true        - Enable API route logging
 * DEBUG_ALL=true        - Enable all logging
 *
 * Console output control:
 * LOG_TO_CONSOLE=false  - Disable console output (file only in dev)
 * LOG_TO_FILE=true      - Enable file logging (dev only, default: true)
 */

type LogLevel = "debug" | "info" | "warn" | "error";
type LogCategory =
  | "email"
  | "auth"
  | "setup"
  | "campaign"
  | "webhook"
  | "api"
  | "general";

interface LoggerConfig {
  email: boolean;
  auth: boolean;
  setup: boolean;
  campaign: boolean;
  webhook: boolean;
  api: boolean;
  all: boolean;
}

interface OutputConfig {
  console: boolean;
  file: boolean;
}

// Client-safe environment variable access
function getDebugFlag(flag: string): boolean {
  // Check if we're on the server
  if (typeof window === "undefined") {
    try {
      switch (flag) {
        case "email":
          return process.env.DEBUG_EMAIL === "true";
        case "auth":
          return process.env.DEBUG_AUTH === "true";
        case "setup":
          return process.env.DEBUG_SETUP === "true";
        case "campaign":
          return process.env.DEBUG_CAMPAIGN === "true";
        case "webhook":
          return process.env.DEBUG_WEBHOOK === "true";
        case "api":
          return process.env.DEBUG_API === "true";
        case "all":
          return process.env.DEBUG_ALL === "true";
        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  // On client, use process.env directly (these need to be NEXT_PUBLIC_ prefixed in production)
  // For now, default to false on client to prevent errors
  return false;
}

export class Logger {
  protected config: LoggerConfig;
  protected output: OutputConfig;
  private _bypass: boolean = false;

  constructor() {
    this.config = {
      email: getDebugFlag("email"),
      auth: getDebugFlag("auth"),
      setup: getDebugFlag("setup"),
      campaign: getDebugFlag("campaign"),
      webhook: getDebugFlag("webhook"),
      api: getDebugFlag("api"),
      all: getDebugFlag("all"),
    };

    // Output configuration
    this.output = {
      console:
        typeof window === "undefined"
          ? process.env.LOG_TO_CONSOLE !== "false" // Default true on server
          : true, // Always true on client
      file:
        typeof window === "undefined"
          ? process.env.LOG_TO_FILE !== "false" // Default true on server in dev
          : false, // Never on client
    };
  }

  protected shouldLog(category: LogCategory): boolean {
    // General category is always enabled unless explicitly disabled
    if (category === "general") return true;
    return (
      this.config.all ||
      this.config[category as keyof Omit<LoggerConfig, "all">] ||
      false
    );
  }

  protected formatMessage(
    category: LogCategory,
    level: LogLevel,
    message: string
  ): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${category.toUpperCase()}] [${level.toUpperCase()}]`;
    return `${prefix} ${message}`;
  }

  protected logInternal(
    category: LogCategory,
    level: LogLevel,
    message: string,
    ...args: any[]
  ) {
    if (!this.shouldLog(category)) return;

    // Console logging (if enabled OR bypass is active)
    if (this.output.console || this._bypass) {
      const formattedMessage = this.formatMessage(category, level, message);

      // Add bypass indicator if in bypass mode
      const finalMessage =
        this._bypass && !this.output.console
          ? `[BYPASS] ${formattedMessage}`
          : formattedMessage;

      switch (level) {
        case "debug":
          console.debug(finalMessage, ...args);
          break;
        case "info":
          console.log(finalMessage, ...args);
          break;
        case "warn":
          console.warn(finalMessage, ...args);
          break;
        case "error":
          console.error(finalMessage, ...args);
          break;
      }
    }
  }

  private log(
    category: LogCategory,
    level: LogLevel,
    message: string,
    ...args: any[]
  ) {
    this.logInternal(category, level, message, ...args);
  }

  // Email logging
  email = {
    debug: (message: string, ...args: any[]) =>
      this.log("email", "debug", message, ...args),
    info: (message: string, ...args: any[]) =>
      this.log("email", "info", message, ...args),
    warn: (message: string, ...args: any[]) =>
      this.log("email", "warn", message, ...args),
    error: (message: string, ...args: any[]) =>
      this.log("email", "error", message, ...args),
  };

  // Auth logging
  auth = {
    debug: (message: string, ...args: any[]) =>
      this.log("auth", "debug", message, ...args),
    info: (message: string, ...args: any[]) =>
      this.log("auth", "info", message, ...args),
    warn: (message: string, ...args: any[]) =>
      this.log("auth", "warn", message, ...args),
    error: (message: string, ...args: any[]) =>
      this.log("auth", "error", message, ...args),
  };

  // Setup/middleware logging
  setup = {
    debug: (message: string, ...args: any[]) =>
      this.log("setup", "debug", message, ...args),
    info: (message: string, ...args: any[]) =>
      this.log("setup", "info", message, ...args),
    warn: (message: string, ...args: any[]) =>
      this.log("setup", "warn", message, ...args),
    error: (message: string, ...args: any[]) =>
      this.log("setup", "error", message, ...args),
  };

  // Campaign/mailing logging
  campaign = {
    debug: (message: string, ...args: any[]) =>
      this.log("campaign", "debug", message, ...args),
    info: (message: string, ...args: any[]) =>
      this.log("campaign", "info", message, ...args),
    warn: (message: string, ...args: any[]) =>
      this.log("campaign", "warn", message, ...args),
    error: (message: string, ...args: any[]) =>
      this.log("campaign", "error", message, ...args),
  };

  // Webhook logging
  webhook = {
    debug: (message: string, ...args: any[]) =>
      this.log("webhook", "debug", message, ...args),
    info: (message: string, ...args: any[]) =>
      this.log("webhook", "info", message, ...args),
    warn: (message: string, ...args: any[]) =>
      this.log("webhook", "warn", message, ...args),
    error: (message: string, ...args: any[]) =>
      this.log("webhook", "error", message, ...args),
  };

  // API route logging
  api = {
    debug: (message: string, ...args: any[]) =>
      this.log("api", "debug", message, ...args),
    info: (message: string, ...args: any[]) =>
      this.log("api", "info", message, ...args),
    warn: (message: string, ...args: any[]) =>
      this.log("api", "warn", message, ...args),
    error: (message: string, ...args: any[]) =>
      this.log("api", "error", message, ...args),
  };

  // General logging (always enabled unless explicitly disabled)
  general = {
    debug: (message: string, ...args: any[]) =>
      this.log("general", "debug", message, ...args),
    info: (message: string, ...args: any[]) =>
      this.log("general", "info", message, ...args),
    warn: (message: string, ...args: any[]) =>
      this.log("general", "warn", message, ...args),
    error: (message: string, ...args: any[]) =>
      this.log("general", "error", message, ...args),
  };

  // Utility method to check current config
  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  // Get output configuration
  getOutputConfig(): OutputConfig {
    return { ...this.output };
  }

  // Utility method to temporarily enable/disable categories
  setCategory(category: keyof LoggerConfig, enabled: boolean) {
    this.config[category] = enabled;
  }

  // Utility method to control output destinations
  setOutput(type: keyof OutputConfig, enabled: boolean) {
    this.output[type] = enabled;
  }

  // Enable/disable bypass mode for immediate console output
  get bypass(): boolean {
    return this._bypass;
  }

  set bypass(value: boolean) {
    this._bypass = value;
    if (value) {
      console.log("[Logger] Bypass mode enabled - console output forced ON");
    } else {
      console.log(
        "[Logger] Bypass mode disabled - using normal output settings"
      );
    }
  }

  // Temporarily enable bypass for a specific operation
  withBypass<T>(operation: () => T): T {
    const previousBypass = this._bypass;
    this._bypass = true;
    try {
      return operation();
    } finally {
      this._bypass = previousBypass;
    }
  }

  // Async version of withBypass
  async withBypassAsync<T>(operation: () => Promise<T>): Promise<T> {
    const previousBypass = this._bypass;
    this._bypass = true;
    try {
      return await operation();
    } finally {
      this._bypass = previousBypass;
    }
  }
}

// Export singleton instance for client-side use
export const logger = new Logger();

// Export types for use in other files
export type { LogCategory, LogLevel };
