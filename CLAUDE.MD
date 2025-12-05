- When you want to check for type or lint errors, use pnpm check instead of pnpm build.

- Never run "pnpm dev" or "pnpm build" unless specifically told to do so.

- "REACT" IS ALWAYS IMPORTED WITH NEXTJS. "useEffect", "useMemo", all use " import { useEffect, useMemo } from 'react' "

# 📝 LOGGING SYSTEM - MANDATORY FOR ALL DEVELOPMENT

## ALWAYS USE THE LOGGING SYSTEM
- **Client-side**: `import { logger } from '@/lib/logger'`
- **Server-side**: `import { serverLogger } from '@/lib/logger'`
- **Default export**: `import logger from '@/lib/logger'` (exports serverLogger)
- Use appropriate categories: auth, api, email, setup, campaign, webhook, general
- Include relevant context in logs: `logger.api.info('Request', { endpoint, method, userId })`

## BYPASS MODE FOR IMMEDIATE DEBUGGING
When you need to see console output immediately without changing env vars:
```typescript
// Quick debugging
logger.bypass = true
logger.api.debug('Debugging this issue', data)
logger.bypass = false

// Or use temporary bypass
logger.withBypass(() => {
  logger.api.info('This shows in console immediately')
})
```

## HOW TO CHECK LOGS
```bash
# API endpoints to read logs:
/api/logs                                    # List all sessions
/api/logs?sessionId=xxx                      # List files in session
/api/logs?sessionId=xxx&file=api_logs.log   # Read specific log file

# Direct file access:
ls logs/                                     # See all sessions
tail -f logs/*/api_logs.log                 # Follow API logs
cat logs/[sessionId]/error_*.log           # Check errors
```

## CURRENT CONFIGURATION (.env.local)
- `DEBUG_ALL=true` - All categories enabled
- `LOG_TO_CONSOLE=false` - Console output disabled (no clutter)
- `LOG_TO_FILE=true` - File logging enabled

## LOGGING BEST PRACTICES
1. **Log all significant operations**:
   - API requests/responses
   - Database operations
   - Authentication events
   - Errors with full context

2. **Use correct log levels**:
   - `debug`: Development details
   - `info`: Normal operations
   - `warn`: Recoverable issues
   - `error`: Failures, exceptions

3. **Include structured data**:
   ```typescript
   // Good
   logger.api.error('Database error', {
     query: 'SELECT * FROM users',
     error: err.message,
     stack: err.stack
   })
   
   // Bad
   logger.api.error('Database error: ' + err.message)
   ```