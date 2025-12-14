import { EventConfig } from '@motiadev/core';
import { z } from 'zod';
import type {
  HealthCheckRequest,
  HealthCheckCompleted,
  HealthAlert
} from '../../types/health.js';
import type {
  HealthFlowContext,
  HealthEventInput
} from '../../types/context-types.js';

export const config: EventConfig = {
  type: 'event',
  name: 'HealthMonitor',
  description: 'Monitors health check events and tracks system health trends',
  subscribes: ['health.check.requested', 'health.check.completed'],
  emits: ['health.alert.triggered'],
  flows: ['monitoring', 'system'],
  // Remove input schema to allow any event type
  // input: z.object({}).passthrough(), // Allow any object structure
};

export const handler = async (
  input: HealthEventInput,
  { emit, logger, state }: HealthFlowContext
) => {
  const timestamp = new Date().toISOString();

  // Handle health check request
  if ('detailed' in input) {
    const requestData = input as HealthCheckRequest;
    logger.info('Health check request received', {
      timestamp: requestData.timestamp,
      detailed: requestData.detailed,
      check: requestData.check,
    });

    // Store request in state for tracking
    try {
      await state.set('health-monitor', `request-${requestData.timestamp}`, {
        ...requestData,
        processedAt: timestamp,
      });
    } catch (error) {
      logger.warn('Failed to store health check request in state', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: requestData.timestamp,
      });
    }

    return {
      success: true,
      message: 'Health check request logged',
      timestamp,
    };
  }

  // Handle health check completion
  if ('status' in input && 'responseTime' in input) {
    const completedData = input as HealthCheckCompleted;

    logger.info('Health check completed', {
      status: completedData.status,
      responseTime: completedData.responseTime,
      timestamp: completedData.timestamp,
      checks: completedData.checks,
    });

    // Store completion data in state for trend analysis
    try {
      await state.set('health-monitor', `completion-${completedData.timestamp}`, {
        ...completedData,
        processedAt: timestamp,
      });

      // Get recent health checks for trend analysis
      const recentChecks = await state.getGroup('health-monitor') as (HealthCheckCompleted | HealthCheckRequest)[];
      const completedChecks = recentChecks.filter((check) => 'status' in check) as HealthCheckCompleted[];

      // If we have multiple recent failures, trigger an alert
      if (completedChecks.length >= 3) {
        const recentStatuses = completedChecks.slice(-3).map((check) => check.status);
        const failureCount = recentStatuses.filter((status) => status !== 'healthy').length;

        if (failureCount >= 2) {
          const healthAlertEvent: HealthAlert = {
            status: 'unhealthy',
            issues: {
              memory: completedData.checks.memory.status,
              uptime: completedData.checks.uptime.status,
            },
            metrics: {
              memoryUsage: completedData.checks.memory.usage,
              uptime: completedData.checks.uptime.current,
              timestamp: completedData.timestamp,
            },
          };
          await emit('health.alert.triggered', healthAlertEvent);

          logger.warn('Multiple health check failures detected', {
            recentStatuses,
            failureCount,
            triggeredAlert: true,
          });
        }
      }
    } catch (error) {
      logger.error('Failed to process health check completion', {
        error: error instanceof Error ? error.message : 'Unknown error',
        status: completedData.status,
        timestamp: completedData.timestamp,
      });
    }

    return {
      success: true,
      message: 'Health check completion processed',
      timestamp,
      status: completedData.status,
      responseTime: completedData.responseTime,
    };
  }

  // Handle unknown event type
  logger.warn('Unknown health event type received', {
    input,
    timestamp,
  });

  return {
    success: false,
    message: 'Unknown event type',
    timestamp,
  };
};