import { z } from 'zod';

// Health status enum
export const HealthStatusSchema = z.enum(['healthy', 'degraded', 'unhealthy']);
export type HealthStatus = z.infer<typeof HealthStatusSchema>;

// Check status enum
export const CheckStatusSchema = z.enum(['pass', 'warn', 'fail']);
export type CheckStatus = z.infer<typeof CheckStatusSchema>;

// Severity enum for alerts
export const AlertSeveritySchema = z.enum(['warning', 'critical']);
export type AlertSeverity = z.infer<typeof AlertSeveritySchema>;

// Health check request schema
export const HealthCheckRequestSchema = z.object({
  timestamp: z.string(),
  detailed: z.boolean().optional().default(false),
  check: z.enum(['memory', 'uptime', 'all']).optional().default('all'),
  requestHeaders: z.record(z.string(), z.any()).optional(),
});

export type HealthCheckRequest = z.infer<typeof HealthCheckRequestSchema>;

// Health check response schema
export const HealthCheckResponseSchema = z.object({
  status: HealthStatusSchema,
  timestamp: z.string(),
  uptime: z.number(),
  memory: z.object({
    used: z.number(),
    total: z.number(),
    percentage: z.number(),
    rss: z.number(),
    heapTotal: z.number(),
    heapUsed: z.number(),
    external: z.number(),
    arrayBuffers: z.number(),
  }),
  service: z.object({
    name: z.string(),
    version: z.string(),
    environment: z.string(),
    port: z.number(),
    nodeVersion: z.string(),
    platform: z.string(),
    arch: z.string(),
  }),
  system: z.object({
    loadAverage: z.array(z.number()),
    cpuCount: z.number(),
    freeMemory: z.number(),
    totalMemory: z.number(),
  }),
  checks: z.object({
    memory: z.object({
      status: CheckStatusSchema,
      threshold: z.number(),
      usage: z.number(),
    }),
    uptime: z.object({
      status: CheckStatusSchema,
      threshold: z.number(),
      current: z.number(),
    }),
  }),
});

export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;

// Simple health check response for basic endpoint
export const SimpleHealthResponseSchema = z.object({
  status: HealthStatusSchema,
  timestamp: z.string(),
  service: z.string(),
  port: z.number(),
  environment: z.string(),
  version: z.string(),
  uptime: z.number(),
  memory: z.record(z.string(), z.number()),
});

export type SimpleHealthResponse = z.infer<typeof SimpleHealthResponseSchema>;

// Health alert schema
export const HealthAlertSchema = z.object({
  status: HealthStatusSchema,
  issues: z.object({
    memory: CheckStatusSchema.optional(),
    uptime: CheckStatusSchema.optional(),
  }),
  metrics: z.object({
    memoryUsage: z.number(),
    uptime: z.number(),
    timestamp: z.string(),
  }),
});

export type HealthAlert = z.infer<typeof HealthAlertSchema>;

// Email alert schema
export const HealthAlertEmailSchema = z.object({
  severity: AlertSeveritySchema,
  title: z.string(),
  message: z.string(),
  metadata: z.object({
    status: z.string().optional(),
    issues: z.record(z.string(), z.string()).optional(),
    metrics: z.record(z.string(), z.any()).optional(),
    alertIssues: z.array(z.string()).optional(),
  }).optional(),
});

export type HealthAlertEmail = z.infer<typeof HealthAlertEmailSchema>;

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.string(),
  timestamp: z.string(),
  status: z.string(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// Health check completed event schema
export const HealthCheckCompletedSchema = z.object({
  status: HealthStatusSchema,
  responseTime: z.number(),
  timestamp: z.string(),
  checks: z.object({
    memory: z.object({
      status: CheckStatusSchema,
      usage: z.number(),
    }),
    uptime: z.object({
      status: CheckStatusSchema,
      current: z.number(),
    }),
  }),
});

export type HealthCheckCompleted = z.infer<typeof HealthCheckCompletedSchema>;

// Email sent event schema
export const HealthAlertEmailSentSchema = z.object({
  success: z.boolean(),
  severity: AlertSeveritySchema,
  title: z.string(),
  timestamp: z.string(),
  error: z.string().optional(),
});

export type HealthAlertEmailSent = z.infer<typeof HealthAlertEmailSentSchema>;

// Event payloads for type-safe emits
export const HealthEvents = {
  'health.check.requested': HealthCheckRequestSchema,
  'health.check.completed': HealthCheckCompletedSchema,
  'health.alert.triggered': HealthAlertSchema,
  'health.alert.email': HealthAlertEmailSchema,
  'health.alert.email.sent': HealthAlertEmailSentSchema,
} as const;

export type HealthEventType = keyof typeof HealthEvents;
export type HealthEventPayload<T extends HealthEventType> = z.infer<typeof HealthEvents[T]>;