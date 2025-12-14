import { EventConfig } from '@motiadev/core';
import { z } from 'zod';
import type {
  HealthAlertEmail,
  HealthAlertEmailSent
} from '../../types/health.js';
import type { HealthFlowContext } from '../../types/context-types.js';

export const config: EventConfig = {
  type: 'event',
  name: 'HealthAlertEmail',
  description: 'Sends email notifications for health alerts',
  subscribes: ['health.alert.email'],
  emits: ['health.alert.email.sent'],
  flows: ['monitoring', 'system', 'alerts'],
  input: z.object({
    severity: z.enum(['warning', 'critical']),
    title: z.string(),
    message: z.string(),
    metadata: z.object({
      status: z.string().optional(),
      issues: z.record(z.string(), z.string()).optional(),
      metrics: z.record(z.string(), z.any()).optional(),
      alertIssues: z.array(z.string()).optional(),
    }).optional(),
  }),
};

export const handler = async (
  input: HealthAlertEmail,
  { emit, logger }: HealthFlowContext
) => {
  const timestamp = new Date().toISOString();

  logger.warn('Health alert email triggered', {
    severity: input.severity,
    title: input.title,
    hasMetadata: !!input.metadata,
  });

  try {
    // In a real implementation, you would integrate with an email service
    // For now, we'll simulate the email sending
    logger.info('Simulating health alert email send', {
      to: process.env.ADMIN_EMAIL || 'admin@ohriv.com',
      subject: `[${input.severity.toUpperCase()}] ${input.title}`,
      message: input.message,
      timestamp,
    });

    // Emit success event with type safety
    const emailSentEvent: HealthAlertEmailSent = {
      success: true,
      severity: input.severity,
      title: input.title,
      timestamp,
    };
    await emit('health.alert.email.sent', emailSentEvent);

    return {
      success: true,
      message: 'Health alert email processed',
      severity: input.severity,
      title: input.title,
      timestamp,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logger.error('Failed to send health alert email', {
      error: errorMessage,
      severity: input.severity,
      title: input.title,
    });

    // Emit failure event with type safety
    const emailErrorEvent: HealthAlertEmailSent = {
      success: false,
      error: errorMessage,
      severity: input.severity,
      title: input.title,
      timestamp,
    };
    await emit('health.alert.email.sent', emailErrorEvent);

    return {
      success: false,
      error: 'Failed to process health alert email',
      timestamp,
    };
  }
};