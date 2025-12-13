/**
 * Logger index file - Centralized exports for all logger functionality
 *
 * Usage examples:
 *
 * // Client-side logging (console only)
 * import { logger } from '@/lib/logger'
 * logger.email.info('Email operation completed')
 *
 * // Server-side logging (console + file in dev)
 * import { serverLogger } from '@/lib/logger'
 * serverLogger.auth.debug('User authentication successful')
 *
 * // Types and utilities
 * import { LogCategory, LogLevel, getFileLogger } from '@/lib/logger'
 */

// Core logger exports
export { Logger, logger } from './logger';
export { serverLogger } from './logger-server';
export { getFileLogger } from './logger-file';

// Type exports
export type {
  LogCategory,
  LogLevel
} from './logger';

export type {
  FileLoggerConfig,
  LogEntry
} from './logger-file';

// Default export for convenience
export { serverLogger as default } from './logger-server';