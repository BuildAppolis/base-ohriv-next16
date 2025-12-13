# Health Check API Documentation

This document describes the health check API endpoint and related event-driven health monitoring system.

## Overview

The health check system consists of several Motia steps:

1. **Health API Step** (`health-api.step.ts`) - HTTP endpoint at `/api/health`
2. **Health Monitor Step** (`health-monitor.step.ts`) - Event-driven monitoring and alerting
3. **Health Alert Email Step** (`health-alert-email.step.ts`) - Email notifications for alerts
4. **Legacy Health Check Step** (`health-check.step.ts`) - Backward compatibility handler

## API Endpoint

### GET /api/health

Returns comprehensive health information about the Ohriv Motia backend service.

#### Query Parameters

- `detailed` (boolean, optional) - Return detailed health information including memory breakdown
- `check` (string, optional) - Specific health check to perform (`memory`, `uptime`, or `all`)

#### Response

**Status: 200 OK**

```json
{
  "status": "healthy|degraded|unhealthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "memory": {
    "used": 50331648,
    "total": 67108864,
    "percentage": 75.0,
    "rss": 67108864,
    "heapTotal": 67108864,
    "heapUsed": 50331648,
    "external": 1048576,
    "arrayBuffers": 524288
  },
  "service": {
    "name": "ohriv-motia-backend",
    "version": "1.0.0",
    "environment": "development",
    "nodeVersion": "v20.0.0",
    "platform": "linux",
    "arch": "x64"
  },
  "system": {
    "loadAverage": [0.5, 0.3, 0.2],
    "cpuCount": 4,
    "freeMemory": 8589934592,
    "totalMemory": 16777216000
  },
  "checks": {
    "memory": {
      "status": "pass|warn|fail",
      "threshold": 80,
      "usage": 75.0
    },
    "uptime": {
      "status": "pass|warn|fail",
      "threshold": 60,
      "current": 3600
    }
  }
}
```

**Simplified Response** (when `detailed=false`):

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "service": {
    "name": "ohriv-motia-backend",
    "version": "1.0.0",
    "environment": "development",
    "nodeVersion": "v20.0.0",
    "platform": "linux",
    "arch": "x64"
  },
  "memory": {
    "percentage": 75.0
  },
  "checks": {
    "memory": {
      "status": "pass",
      "threshold": 80,
      "usage": 75.0
    },
    "uptime": {
      "status": "pass",
      "threshold": 60,
      "current": 3600
    }
  }
}
```

**Status: 500 Internal Server Error**

```json
{
  "error": "Health check failed",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "status": "error"
}
```

## Testing with curl

### Basic Health Check

```bash
curl -X GET http://localhost:3000/api/health
```

### Detailed Health Check

```bash
curl -X GET "http://localhost:3000/api/health?detailed=true"
```

### Memory-Only Check

```bash
curl -X GET "http://localhost:3000/api/health?check=memory&detailed=true"
```

### Uptime-Only Check

```bash
curl -X GET "http://localhost:3000/api/health?check=uptime"
```

### With Custom Headers

```bash
curl -X GET \
  -H "User-Agent: HealthCheck/1.0" \
  -H "X-Forwarded-For: 192.168.1.100" \
  "http://localhost:3000/api/health?detailed=true"
```

## Health Status Definitions

### Status Values

- **healthy**: All checks passing, system operating normally
- **degraded**: Some warnings detected, system operational but monitoring advised
- **unhealthy**: Critical issues detected, immediate attention required

### Check Status Values

- **pass**: Check within normal parameters
- **warn**: Check approaching threshold limits
- **fail**: Check exceeded threshold limits

## Monitoring and Alerting

### Event Flow

1. **API Request** → `health.check.requested` event emitted
2. **Health Check Performed** → `health.check.completed` event emitted
3. **If Issues Detected** → `health.alert.triggered` event emitted
4. **Alert Processing** → `health.alert.email` event emitted
5. **Email Sent** → `health.alert.email.sent` event emitted

### Alert Conditions

- **Memory Usage**: Warn at 80%, Fail at 90%
- **Uptime**: Warn if less than 60 seconds (recent restart)
- **Consecutive Failures**: Critical alert after 3+ failures in 1 hour

### Configuration

Environment variables:

- `ADMIN_EMAIL`: Email address for health alerts (default: admin@ohriv.com)
- `NODE_ENV`: Environment setting (development/production)
- `PORT`: Server port (default: 3000)

## Integration with Monitoring Systems

### Prometheus Metrics

The endpoint can be easily integrated with Prometheus by creating a scrape job:

```yaml
scrape_configs:
  - job_name: "ohriv-health"
    static_configs:
      - targets: ["localhost:3000"]
    metrics_path: "/api/health"
    scrape_interval: 30s
```

### Kubernetes Readiness/Liveness Probes

```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

### External Monitoring Services

The endpoint can be used with services like:

- UptimeRobot
- Pingdom
- DataDog
- New Relic
- AWS CloudWatch

## Performance Considerations

- **Response Time**: Typically < 50ms for basic checks
- **Memory Overhead**: Minimal, uses existing process information
- **Rate Limiting**: Consider implementing for production environments
- **Caching**: Health data is real-time and should not be cached

## Security Considerations

- **Authentication**: Consider adding API key or JWT authentication
- **Rate Limiting**: Implement to prevent abuse
- **Information Disclosure**: Avoid exposing sensitive system details in production
- **CORS**: Configure appropriately for your domain

## Troubleshooting

### Common Issues

1. **High Memory Usage**: Check for memory leaks or optimize resource usage
2. **Low Uptime**: Recent restarts indicate instability - check logs
3. **Failed Health Checks**: Review system logs and resource utilization

### Log Patterns

Monitor logs for these patterns:

- `Health check requested` - Normal operation
- `Health check completed` - Successful completion
- `Health alert triggered` - Issues detected
- `Health alert email` - Alert notifications sent

## Development

### Adding New Health Checks

1. Update the health check logic in `health-api.step.ts`
2. Add corresponding schemas and validation
3. Update monitoring step if needed
4. Test with various scenarios

### Custom Alert Channels

To add new alert channels (Slack, SMS, etc.):

1. Create new event step subscribing to `health.alert.triggered`
2. Implement channel-specific logic
3. Add appropriate error handling and retry logic

## Files Created

- `/src/steps/health-api.step.ts` - Main API endpoint
- `/src/steps/health-monitor.step.ts` - Event-driven monitoring
- `/src/steps/health-alert-email.step.ts` - Email notifications
- Updated `/src/steps/health-check.step.ts` - Legacy compatibility
- This README documentation file
