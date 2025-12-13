import { EventConfig } from "@motiadev/core";
import { z } from "zod";

// Email alert schema
const healthAlertEmailSchema = z.object({
  severity: z.enum(["warning", "critical"]),
  title: z.string(),
  message: z.string(),
  metadata: z
    .object({
      status: z.string().optional(),
      issues: z.record(z.string()).optional(),
      metrics: z.record(z.any()).optional(),
      alertIssues: z.array(z.string()).optional(),
    })
    .optional(),
});

export const config: EventConfig = {
  type: "event",
  name: "HealthAlertEmail",
  description: "Sends email notifications for health alerts",
  subscribes: ["health.alert.email"],
  emits: ["health.alert.email.sent"],
  flows: ["monitoring", "system", "alerts"],
};

export const handler = async (input: any, { emit, logger }: any) => {
  const alertData = healthAlertEmailSchema.parse(input);

  logger.warn("Health alert email triggered", {
    severity: alertData.severity,
    title: alertData.title,
    hasMetadata: !!alertData.metadata,
  });

  try {
    // In a real implementation, you would integrate with an email service
    // For now, we'll simulate the email sending
    logger.info("Simulating health alert email send", {
      to: process.env.ADMIN_EMAIL || "admin@ohriv.com",
      subject: `[${alertData.severity.toUpperCase()}] ${alertData.title}`,
      message: alertData.message,
      timestamp: new Date().toISOString(),
    });

    // Emit success event
    await emit({
      topic: "health.alert.email.sent",
      data: {
        success: true,
        severity: alertData.severity,
        title: alertData.title,
        timestamp: new Date().toISOString(),
      },
    });

    return {
      success: true,
      message: "Health alert email processed",
      severity: alertData.severity,
      title: alertData.title,
    };
  } catch (error) {
    logger.error("Failed to send health alert email", {
      error: error instanceof Error ? error.message : "Unknown error",
      severity: alertData.severity,
      title: alertData.title,
    });

    // Emit failure event
    await emit({
      topic: "health.alert.email.sent",
      data: {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        severity: alertData.severity,
        title: alertData.title,
        timestamp: new Date().toISOString(),
      },
    });

    return {
      success: false,
      error: "Failed to process health alert email",
    };
  }
};
