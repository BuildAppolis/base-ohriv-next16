import { EventConfig } from "@motiadev/core";
import { z } from "zod";

// Input schema for health check requests
const healthCheckRequestedSchema = z.object({
  timestamp: z.string(),
  detailed: z.boolean().optional(),
  check: z.enum(["memory", "uptime", "all"]).optional(),
  requestHeaders: z.record(z.string(), z.any()).optional(),
});

export const config: EventConfig = {
  type: "event",
  name: "HealthCheck",
  description: "Legacy health check event handler for backward compatibility",
  subscribes: ["health.check.requested"],
  emits: ["health.check.completed"],
  flows: ["monitoring", "system", "legacy"],
};

export const handler = async (input: any, ctx: any) => {
  const {
    timestamp,
    detailed = false,
    check = "all",
    requestHeaders = {},
  } = healthCheckRequestedSchema.parse(input);

  ctx.logger.info("Legacy health check executed", {
    timestamp,
    detailed,
    check,
    userAgent: requestHeaders["user-agent"],
  });

  // Basic health check logic
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  const memoryPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

  // Determine health status
  let status: "healthy" | "degraded" | "unhealthy" = "healthy";
  if (memoryPercentage > 90) {
    status = "unhealthy";
  } else if (memoryPercentage > 80) {
    status = "degraded";
  }

  // Emit completion event for monitoring
  await ctx.emit({
    topic: "health.check.completed",
    data: {
      status,
      responseTime: Date.now() - new Date(timestamp).getTime(),
      timestamp: new Date().toISOString(),
      checks: {
        memory: {
          status:
            memoryPercentage > 90
              ? "fail"
              : memoryPercentage > 80
                ? "warn"
                : "pass",
          usage: Math.round(memoryPercentage * 100) / 100,
        },
        uptime: {
          status: uptime > 60 ? "pass" : "warn",
          current: Math.floor(uptime),
        },
      },
    },
  });

  return {
    success: true,
    timestamp: new Date().toISOString(),
    status,
    service: "ohriv-motia-backend",
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || "development",
    uptime: Math.floor(uptime),
    memory: {
      usage: Math.round(memoryPercentage * 100) / 100,
      heapUsed: memoryUsage.heapUsed,
      heapTotal: memoryUsage.heapTotal,
    },
  };
};
