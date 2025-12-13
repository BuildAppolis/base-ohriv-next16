import { EventConfig } from "@motiadev/core";

export const config: EventConfig = {
  type: "event",
  name: "HealthCheck",
  subscribes: ["health.check.requested"],
  emits: ["health.check.completed"],
};

export default async function handler(input: any, ctx: any) {
  ctx.logger.info("Ohriv backend health check executed");

  return {
    success: true,
    timestamp: new Date().toISOString(),
    status: "healthy",
    service: "ohriv-motia-backend",
    port: 3000,
    environment: process.env.NODE_ENV || "development",
  };
}
