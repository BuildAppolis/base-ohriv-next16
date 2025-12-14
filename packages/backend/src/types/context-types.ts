import type { FlowContext } from '@motiadev/core';
import type { HealthEventPayload, HealthEventType } from './health.js';

/**
 * Strongly typed emit function for health events
 */
export interface TypedHealthEmit {
  <T extends HealthEventType>(
    topic: T,
    data: HealthEventPayload<T>
  ): Promise<void>;
}

/**
 * Enhanced FlowContext with health-specific typing
 */
export interface HealthFlowContext<T extends HealthEventType = never>
  extends Omit<FlowContext, 'emit'> {
  emit: TypedHealthEmit;
}

/**
 * API Context with typed emits for health endpoints
 */
export interface HealthApiContext
  extends Omit<FlowContext, 'emit'> {
  emit: TypedHealthEmit;
}

/**
 * Motia API Request interface
 */
export interface MotiaApiRequest<TQueryParams = Record<string, unknown>, TBody = unknown> {
  queryParams: TQueryParams;
  headers: Record<string, string | string[] | undefined>;
  body: TBody;
  method: string;
  path: string;
}

/**
 * Motia API Response interface
 */
export interface MotiaApiResponse<TBody = unknown> {
  status: number;
  body: TBody;
  headers?: Record<string, string>;
}

/**
 * Health API Request types
 */
export interface HealthCheckApiRequest {
  queryParams: {
    detailed?: boolean;
    check?: 'memory' | 'uptime' | 'all';
  };
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
  method: string;
  path: string;
}

/**
 * Simple Health API Request types (for basic health endpoint)
 */
export interface SimpleHealthApiRequest {
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
  method: string;
  path: string;
  queryParams?: Record<string, unknown>;
}

/**
 * Health Event Union type for event handlers
 */
export type HealthEventInput =
  | { timestamp: string; detailed?: boolean; check?: string; requestHeaders?: Record<string, unknown> }
  | { status: string; responseTime: number; timestamp: string; checks: { memory: { status: string; usage: number }; uptime: { status: string; current: number } } }
  | { severity: string; title: string; message: string; metadata?: { status?: string; issues?: Record<string, string>; metrics?: Record<string, unknown>; alertIssues?: string[] } };

/**
 * Generic event context for any step
 */
export interface TypedEventContext<TEmits extends Record<string, unknown> = {}> {
  emit: <T extends keyof TEmits>(
    topic: T,
    data: TEmits[T]
  ) => Promise<void>;
  logger: {
    info: (message: string, data?: Record<string, unknown>) => void;
    warn: (message: string, data?: Record<string, unknown>) => void;
    error: (message: string, data?: Record<string, unknown>) => void;
    debug: (message: string, data?: Record<string, unknown>) => void;
  };
  state: {
    get<T>(groupId: string, key: string): Promise<T | null>;
    set<T>(groupId: string, key: string, value: T): Promise<T>;
    delete<T>(groupId: string, key: string): Promise<T | null>;
    getGroup<T>(groupId: string): Promise<T[]>;
    clear(groupId: string): Promise<void>;
  };
  streams: {
    // Stream methods would be typed here if used
  };
  trace_id: string;
}