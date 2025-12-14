import { ApiRouteConfig } from '@motiadev/core';
import { z } from 'zod';
import type {
  HealthApiContext,
  SimpleHealthApiRequest,
  MotiaApiResponse
} from '../../types/context-types.js';
import type {
  SimpleHealthResponse,
  HealthCheckCompleted,
  ErrorResponse
} from '../../types/health.js';

// Inline schemas for response validation
const HealthStatusSchema = z.enum(['healthy', 'degraded', 'unhealthy']);

const SimpleHealthResponseSchema = z.object({
  status: HealthStatusSchema,
  timestamp: z.string(),
  service: z.string(),
  port: z.number(),
  environment: z.string(),
  version: z.string(),
  uptime: z.number(),
  memory: z.record(z.string(), z.number()),
});

const ErrorResponseSchema = z.object({
  error: z.string(),
  timestamp: z.string(),
  status: z.string(),
});

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'HealthCheck',
  description: 'Simple health check endpoint for load balancers and monitoring',
  path: '/health',
  method: 'GET',
  emits: ['health.check.completed'],
  flows: ['monitoring', 'system'],
  responseSchema: {
    200: SimpleHealthResponseSchema,
    500: ErrorResponseSchema,
  },
};

// Simple health checking utility
const performSimpleHealthCheck = () => {
  const processMemory = process.memoryUsage();
  const uptime = process.uptime();

  const memoryUsage = (processMemory.heapUsed / processMemory.heapTotal) * 100;
  const memoryCheck = memoryUsage > 90 ? 'fail' : memoryUsage > 80 ? 'warn' : 'pass';
  const uptimeCheck = uptime < 60 ? 'warn' : 'pass';

  const overallStatus: 'healthy' | 'degraded' | 'unhealthy' =
    memoryCheck === 'fail' || uptimeCheck === 'fail'
    ? 'unhealthy'
    : memoryCheck === 'warn' || uptimeCheck === 'warn'
    ? 'degraded'
    : 'healthy';

  // Convert MemoryUsage to Record<string, number>
  const memoryRecord: Record<string, number> = {
    rss: processMemory.rss,
    heapTotal: processMemory.heapTotal,
    heapUsed: processMemory.heapUsed,
    external: processMemory.external,
    arrayBuffers: processMemory.arrayBuffers,
  };

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    service: 'ohriv-motia-backend',
    port: parseInt(process.env.PORT || '3001'),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    uptime: Math.floor(uptime),
    memory: memoryRecord,
  };
};

export const handler = async (
  req: SimpleHealthApiRequest,
  { emit, logger }: HealthApiContext
): Promise<MotiaApiResponse<SimpleHealthResponse | ErrorResponse>> => {
  const startTime = Date.now();

  try {
    logger.info('Simple health check requested', {
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
    });

    // Perform simple health check
    const healthData = performSimpleHealthCheck();

    // Emit health check completion event
    const healthCheckCompletedEvent: HealthCheckCompleted = {
      status: healthData.status,
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      checks: {
        memory: {
          status: healthData.status === 'healthy' ? 'pass' : healthData.status === 'degraded' ? 'warn' : 'fail',
          usage: 0, // Not included in simple check
        },
        uptime: {
          status: healthData.uptime > 60 ? 'pass' : 'warn',
          current: healthData.uptime,
        },
      },
    };
    await emit('health.check.completed', healthCheckCompletedEvent);

    logger.info('Simple health check completed', {
      status: healthData.status,
      responseTime: Date.now() - startTime,
      uptime: healthData.uptime,
    });

    return {
      status: 200,
      body: healthData as SimpleHealthResponse,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    logger.error('Simple health check failed', {
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