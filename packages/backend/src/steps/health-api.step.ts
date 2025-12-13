import { ApiRouteConfig, Handlers } from '@motiadev/core'
import { z } from 'zod'

// Response schema for successful health check
const healthResponseSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
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
    arrayBuffers: z.number()
  }),
  service: z.object({
    name: z.string(),
    version: z.string(),
    environment: z.string(),
    nodeVersion: z.string(),
    platform: z.string(),
    arch: z.string()
  }),
  system: z.object({
    loadAverage: z.array(z.number()),
    cpuCount: z.number(),
    freeMemory: z.number(),
    totalMemory: z.number()
  }),
  checks: z.object({
    memory: z.object({
      status: z.enum(['pass', 'warn', 'fail']),
      threshold: z.number(),
      usage: z.number()
    }),
    uptime: z.object({
      status: z.enum(['pass', 'warn', 'fail']),
      threshold: z.number(),
      current: z.number()
    })
  })
})

// Error response schema
const errorResponseSchema = z.object({
  error: z.string(),
  timestamp: z.string(),
  status: z.string()
})

// Query parameter schema
const queryParamsSchema = z.object({
  detailed: z.coerce.boolean().optional().default(false),
  check: z.enum(['memory', 'uptime', 'all']).optional().default('all')
})

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'HealthCheckApi',
  description: 'Health check endpoint that returns service health information',
  path: '/api/health',
  method: 'GET',
  emits: [
    {
      topic: 'health.check.requested',
      label: 'Health Check Request',
      conditional: false
    },
    {
      topic: 'health.check.completed',
      label: 'Health Check Completed',
      conditional: false
    },
    {
      topic: 'health.alert.triggered',
      label: 'Health Alert',
      conditional: true
    }
  ],
  flows: ['monitoring', 'system'],
  queryParams: [
    {
      name: 'detailed',
      description: 'Return detailed health information including memory breakdown'
    },
    {
      name: 'check',
      description: 'Specific health check to perform (memory, uptime, or all)'
    }
  ],
  responseSchema: {
    200: healthResponseSchema,
    500: errorResponseSchema
  }
}

export const handler: Handlers['HealthCheckApi'] = async (req, { emit, logger }) => {
  const startTime = Date.now()

  try {
    // Parse query parameters
    const query = queryParamsSchema.parse(req.queryParams)
    const { detailed, check } = query

    logger.info('Health check requested', {
      detailed,
      check,
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown'
    })

    // Emit health check request event
    await emit({
      topic: 'health.check.requested',
      data: {
        timestamp: new Date().toISOString(),
        detailed,
        check,
        requestHeaders: req.headers
      }
    })

    // Gather system information
    const processMemory = process.memoryUsage()
    const systemMemory = process.resourceUsage?.().userCPUTime || 0
    const uptime = process.uptime()
    const loadAvg = process.platform !== 'win32' ? process.loadavg() : [0, 0, 0]

    // Calculate memory usage percentage
    const memoryUsage = processMemory.heapUsed / processMemory.heapTotal * 100
    const totalSystemMemory = require('os').totalmem()
    const freeSystemMemory = require('os').freemem()

    // Perform health checks
    const memoryStatus = memoryUsage > 90 ? 'fail' : memoryUsage > 80 ? 'warn' : 'pass'
    const uptimeStatus = uptime < 60 ? 'warn' : 'pass' // Warn if uptime is less than 1 minute (recent restart)

    // Determine overall health status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    if (memoryStatus === 'fail' || uptimeStatus === 'fail') {
      overallStatus = 'unhealthy'
    } else if (memoryStatus === 'warn' || uptimeStatus === 'warn') {
      overallStatus = 'degraded'
    }

    // Build response
    const healthData = {
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
        arrayBuffers: processMemory.arrayBuffers
      },
      service: {
        name: 'ohriv-motia-backend',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      },
      system: {
        loadAverage: loadAvg,
        cpuCount: require('os').cpus().length,
        freeMemory,
        totalMemory: totalSystemMemory
      },
      checks: {
        memory: {
          status: memoryStatus,
          threshold: 80, // Warn at 80% memory usage
          usage: Math.round(memoryUsage * 100) / 100
        },
        uptime: {
          status: uptimeStatus,
          threshold: 60, // Warn if uptime is less than 60 seconds
          current: Math.floor(uptime)
        }
      }
    }

    // Check if we need to trigger health alerts
    if (overallStatus !== 'healthy') {
      await emit({
        topic: 'health.alert.triggered',
        data: {
          status: overallStatus,
          issues: {
            memory: memoryStatus,
            uptime: uptimeStatus
          },
          metrics: {
            memoryUsage: memoryUsage,
            uptime: uptime,
            timestamp: new Date().toISOString()
          }
        }
      })
    }

    // Emit health check completion event
    await emit({
      topic: 'health.check.completed',
      data: {
        status: overallStatus,
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        checks: healthData.checks
      }
    })

    logger.info('Health check completed', {
      status: overallStatus,
      responseTime: Date.now() - startTime,
      memoryUsage: memoryUsage,
      uptime: uptime
    })

    // If not detailed, return a simplified response
    if (!detailed) {
      return {
        status: 200,
        body: {
          status: overallStatus,
          timestamp: healthData.timestamp,
          uptime: healthData.uptime,
          service: healthData.service,
          memory: {
            percentage: healthData.memory.percentage
          },
          checks: healthData.checks
        }
      }
    }

    return {
      status: 200,
      body: healthData
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

    logger.error('Health check failed', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      responseTime: Date.now() - startTime
    })

    // Emit health check failure event
    await emit({
      topic: 'health.check.completed',
      data: {
        status: 'unhealthy',
        error: errorMessage,
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    })

    return {
      status: 500,
      body: {
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
        status: 'error'
      }
    }
  }
}