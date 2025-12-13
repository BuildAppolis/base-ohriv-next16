import { ApiRouteConfig } from "@motiadev/core";

export const config: ApiRouteConfig = {
  name: "APIHealthCheck",
  type: "api",
  path: "/health",
  method: "GET",
  emits: ["health.check.completed"],
};

export const handler = async (req: any, ctx: any) => {
  ctx.logger.info("Ohriv backend API health check called");

  return {
    status: 200,
    body: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "ohriv-motia-backend",
      port: 3000,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
    },
  };
};
