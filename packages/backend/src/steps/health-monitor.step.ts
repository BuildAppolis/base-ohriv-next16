import { EventConfig } from "@motiadev/core";
import { z } from "zod";

// Input schema for health check requests
const healthCheckRequestedSchema = z.object({
  timestamp: z.string(),
  detailed: z.boolean(),
  check: z.enum(["memory", "uptime", "all"]),
  requestHeaders: z.record(z.string(), z.any()),
});

// Input schema for health check completions
const healthCheckCompletedSchema = z.object({
  status: z.enum(["healthy", "degraded", "unhealthy"]),
  responseTime: z.number(),
  timestamp: z.string(),
  checks: z
    .object({
      memory: z
        .object({
          status: z.enum(["pass", "warn", "fail"]),
        })
        .optional(),
      uptime: z
        .object({
          status: z.enum(["pass", "warn", "fail"]),
        })
        .optional(),
    })
    .optional(),
  error: z.string().optional(),
});

// Input schema for health alerts
const healthAlertSchema = z.object({
  status: z.enum(["degraded", "unhealthy"]),
  issues: z.object({
    memory: z.enum(["pass", "warn", "fail"]),
    uptime: z.enum(["pass", "warn", "fail"]),
  }),
  metrics: z.object({
    memoryUsage: z.number(),
    uptime: z.number(),
    timestamp: z.string(),
  }),
});

export const config: EventConfig = {
  type: "event",
  name: "HealthMonitor",
  description: "Monitors health check events and handles alerting",
  subscribes: [
    "health.check.requested",
    "health.check.completed",
    "health.alert.triggered",
  ],
  emits: [
    {
      topic: "health.alert.email",
      label: "Send Health Alert Email",
      conditional: true,
    },
    {
      topic: "health.metrics.recorded",
      label: "Record Health Metrics",
      conditional: false,
    },
  ],
  flows: ["monitoring", "system", "alerts"],
};

export const handler = async (input: any, { emit, logger, state }: any) => {
  const topic = Object.keys(input)[0] as
    | "health.check.requested"
    | "health.check.completed"
    | "health.alert.triggered";
  const data = input[topic];

  switch (topic) {
    case "health.check.requested":
      await handleHealthCheckRequested(data, { emit, logger });
      break;

    case "health.check.completed":
      await handleHealthCheckCompleted(data, { emit, logger, state });
      break;

    case "health.alert.triggered":
      await handleHealthAlert(data, { emit, logger });
      break;

    default:
      logger.warn("Unknown health monitor topic", { topic });
  }
};

async function handleHealthCheckRequested(
  data: z.infer<typeof healthCheckRequestedSchema>,
  { emit, logger }: { emit: any; logger: any },
) {
  logger.info("Health check request received", {
    timestamp: data.timestamp,
    detailed: data.detailed,
    check: data.check,
  });

  // Record that a health check was requested
  await emit({
    topic: "health.metrics.recorded",
    data: {
      type: "health_check_requested",
      timestamp: data.timestamp,
      metadata: {
        detailed: data.detailed,
        check: data.check,
      },
    },
  });
}

async function handleHealthCheckCompleted(
  data: z.infer<typeof healthCheckCompletedSchema>,
  { emit, logger, state }: { emit: any; logger: any; state: any },
) {
  const { status, responseTime, timestamp, checks, error } = data;

  logger.info("Health check completed", {
    status,
    responseTime,
    timestamp,
    hasError: !!error,
  });

  // Store health metrics in state for historical tracking
  const healthKey = `health:metrics:${new Date(timestamp).toISOString().split("T")[0]}`;
  const existingMetrics = (await state.get(healthKey)) || [];

  existingMetrics.push({
    timestamp,
    status,
    responseTime,
    checks,
    error,
  });

  // Keep only last 1000 entries per day
  if (existingMetrics.length > 1000) {
    existingMetrics.splice(0, existingMetrics.length - 1000);
  }

  await state.set(healthKey, existingMetrics, { ttl: 7 * 24 * 60 * 60 * 1000 }); // 7 days TTL

  // Record metrics
  await emit({
    topic: "health.metrics.recorded",
    data: {
      type: "health_check_completed",
      status,
      responseTime,
      timestamp,
      checks,
      error,
    },
  });

  // Check for consecutive failures
  const recentKey = "health:recent_failures";
  const recentFailures = (await state.get(recentKey)) || [];

  if (status === "unhealthy") {
    recentFailures.push(timestamp);

    // Keep only last 10 failures
    if (recentFailures.length > 10) {
      recentFailures.splice(0, recentFailures.length - 10);
    }

    await state.set(recentKey, recentFailures, { ttl: 60 * 60 * 1000 }); // 1 hour TTL

    // If we have 3+ failures in the last hour, escalate
    if (recentFailures.length >= 3) {
      await emit({
        topic: "health.alert.email",
        data: {
          severity: "critical",
          title: "Multiple Health Check Failures Detected",
          message: `Health check has failed ${recentFailures.length} times in the last hour. Immediate attention required.`,
          failures: recentFailures,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } else {
    // Clear failures if we get a healthy response
    if (recentFailures.length > 0) {
      await state.set(recentKey, []);
    }
  }
}

async function handleHealthAlert(
  data: z.infer<typeof healthAlertSchema>,
  { emit, logger }: { emit: any; logger: any },
) {
  const { status, issues, metrics } = data;

  logger.warn("Health alert triggered", {
    status,
    issues,
    metrics,
  });

  // Determine alert severity
  let severity: "warning" | "critical" = "warning";
  if (
    status === "unhealthy" ||
    issues.memory === "fail" ||
    issues.uptime === "fail"
  ) {
    severity = "critical";
  }

  // Build alert message
  const alertIssues = [];
  if (issues.memory !== "pass") {
    alertIssues.push(
      `Memory usage: ${issues.memory} (${Math.round(metrics.memoryUsage)}%)`,
    );
  }
  if (issues.uptime !== "pass") {
    alertIssues.push(
      `Uptime: ${issues.uptime} (${Math.floor(metrics.uptime)}s)`,
    );
  }

  // Send alert email
  await emit({
    topic: "health.alert.email",
    data: {
      severity,
      title: `Ohriv Backend Health Alert - ${status.toUpperCase()}`,
      message: `Health status: ${status}\n\nIssues detected:\n${alertIssues.join("\n")}\n\nTimestamp: ${metrics.timestamp}\nMemory Usage: ${Math.round(metrics.memoryUsage)}%\nUptime: ${Math.floor(metrics.uptime)}s`,
      metadata: {
        status,
        issues,
        metrics,
        alertIssues,
      },
    },
  });

  // Record alert
  await emit({
    topic: "health.metrics.recorded",
    data: {
      type: "health_alert",
      severity,
      status,
      issues,
      metrics,
      timestamp: new Date().toISOString(),
    },
  });
}
