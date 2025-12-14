import { ApiRouteConfig } from '@motiadev/core';
import { z } from 'zod';
import * as os from 'os';
import type {
  HealthApiContext,
  HealthCheckApiRequest,
  MotiaApiResponse
} from '../../types/context-types.js';
import type {
  HealthCheckRequest,
  HealthCheckResponse,
  HealthCheckCompleted,
  ErrorResponse
} from '../../types/health.js';

// Inline schemas for response validation
const HealthStatusSchema = z.enum(['healthy', 'degraded', 'unhealthy']);
const CheckStatusSchema = z.enum(['pass', 'warn', 'fail']);

const HealthCheckResponseSchema = z.object({
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

const ErrorResponseSchema = z.object({
  error: z.string(),
  timestamp: z.string(),
  status: z.string(),
});

// Query parameter schema
const queryParamsSchema = z.object({
  detailed: z.coerce.boolean().optional().default(false),
  check: z.enum(['memory', 'uptime', 'all']).optional().default('all'),
});

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'HealthCheckDetailed',
  description: 'Detailed health check endpoint with comprehensive metrics',
  path: '/api/health',
  method: 'GET',
  emits: [
    {
      topic: 'health.check.requested',
      label: 'Health Check Request',
      conditional: false,
    },
    {
      topic: 'health.check.completed',
      label: 'Health Check Completed',
      conditional: false,
    },
    {
      topic: 'health.alert.triggered',
      label: 'Health Alert',
      conditional: true,
    },
  ],
  flows: ['monitoring', 'system'],
  queryParams: [
    {
      name: 'detailed',
      description: 'Return detailed health information including memory breakdown',
    },
    {
      name: 'check',
      description: 'Specific health check to perform (memory, uptime, or all)',
    },
  ],
  responseSchema: {
    200: HealthCheckResponseSchema,
    500: ErrorResponseSchema,
  },
};

// Health checking utilities
const performHealthCheck = (options: { detailed?: boolean; check?: string } = {}) => {
  const { check = 'all' } = options;

  const processMemory = process.memoryUsage();
  const uptime = process.uptime();

  // Safely get load average, fallback to [0, 0, 0] if not available
  let loadAvg = [0, 0, 0];
  try {
    if (
      process.platform !== "win32" &&
      'loadavg' in process &&
      typeof (process as { loadavg?: () => number[] }).loadavg === "function"
    ) {
      loadAvg = (process as { loadavg: () => number[] }).loadavg();
    }
  } catch {
    // loadavg not available in this environment
  }

  const memoryUsage = (processMemory.heapUsed / processMemory.heapTotal) * 100;
  const totalSystemMemory = os.totalmem();
  const freeSystemMemory = os.freemem();

  // Perform health checks
  const memoryStatus = memoryUsage > 90 ? "fail" : memoryUsage > 80 ? "warn" : "pass";
  const uptimeStatus = uptime < 60 ? "warn" : "pass";

  // Determine overall health status
  let overallStatus: "healthy" | "degraded" | "unhealthy" = "healthy";
  if (memoryStatus === "fail" || uptimeStatus === "fail") {
    overallStatus = "unhealthy";
  } else if (memoryStatus === "warn" || uptimeStatus === "warn") {
    overallStatus = "degraded";
  }

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime),
    memory: {
      used: processMemory.heapUsed,
      total: processMemory.heapTotal,
      percentage: Math.round(memoryUsage * 100) / 100,
      rss: processMemory.rss,
      heapTotal: processMemory.heapTotal,
      heapUsed: processMemory.heapUsed,
      external: processMemory.external,
      arrayBuffers: processMemory.arrayBuffers,
    },
    service: {
      name: "ohriv-motia-backend",
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      port: parseInt(process.env.PORT || "3001"),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    system: {
      loadAverage: loadAvg,
      cpuCount: os.cpus().length,
      freeMemory: freeSystemMemory,
      totalMemory: totalSystemMemory,
    },
    checks: {
      memory: {
        status: memoryStatus,
        threshold: 80,
        usage: Math.round(memoryUsage * 100) / 100,
      },
      uptime: {
        status: uptimeStatus,
        threshold: 60,
        current: Math.floor(uptime),
      },
    },
  };
};

export const handler = async (
  req: HealthCheckApiRequest,
  { emit, logger }: HealthApiContext
): Promise<MotiaApiResponse<HealthCheckResponse | ErrorResponse>> => {
  const startTime = Date.now();

  try {
    // Parse query parameters with type safety
    const query = queryParamsSchema.parse(req.queryParams);
    const { detailed = false, check = 'all' } = query;

    logger.info('Detailed health check requested', {
      detailed,
      check,
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
    });

    // Emit health check request event
    const healthCheckRequestEvent: HealthCheckRequest = {
      timestamp: new Date().toISOString(),
      detailed,
      check,
      requestHeaders: req.headers,
    };
    await emit('health.check.requested', healthCheckRequestEvent);

    // Perform detailed health check
    const healthData = performHealthCheck({ detailed, check });

    // Check if we need to trigger health alerts
    if (healthData.status !== 'healthy') {
      await emit('health.alert.triggered', {
        status: healthData.status,
        issues: {
          memory: healthData.checks.memory.status,
          uptime: healthData.checks.uptime.status,
        },
        metrics: {
          memoryUsage: healthData.memory.percentage,
          uptime: healthData.uptime,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Emit health check completion event
    const healthCheckCompletedEvent: HealthCheckCompleted = {
      status: healthData.status,
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      checks: healthData.checks,
    };
    await emit('health.check.completed', healthCheckCompletedEvent);

    logger.info('Detailed health check completed', {
      status: healthData.status,
      responseTime: Date.now() - startTime,
      memoryUsage: healthData.memory.percentage,
      uptime: healthData.uptime,
    });

    return {
      status: 200,
      body: healthData as HealthCheckResponse,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    logger.error('Detailed health check failed', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      responseTime: Date.now() - startTime,
    });

    // Emit health check failure event
    const healthCheckFailedEvent: HealthCheckCompleted = {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      checks: {
        memory: { status: 'fail', usage: 0 },
        uptime: { status: 'fail', current: 0 }
      },
    };
    await emit('health.check.completed', healthCheckFailedEvent);

    return {
      status: 500,
      body: {
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
        status: 'error',
      } as ErrorResponse,
    };
  }
};