# Logging System Documentation

## Overview

The application uses a centralized logging system that supports both console and file-based logging. In development mode, logs can be written to session-based directories for easy debugging and analysis.

### Quick Bypass Mode

When you need immediate console output without changing environment variables:

```typescript
// Enable bypass mode - forces console output
logger.bypass = true
logger.api.info('This will show in console regardless of LOG_TO_CONSOLE setting')

// Disable bypass mode
logger.bypass = false

// Temporary bypass for specific operations
logger.withBypass(() => {
  logger.api.debug('This shows in console')
  logger.auth.info('This also shows in console')
})

// Async version
await logger.withBypassAsync(async () => {
  const result = await someOperation()
  logger.api.info('Operation result:', result) // Shows in console
  return result
})
```

## Architecture

### Components

1. **Base Logger** (`src/lib/logger.ts`)
   - Core logging functionality
   - Category-based logging (email, auth, api, etc.)
   - Environment variable configuration
   - Console output control

2. **Server Logger** (`src/lib/logger-server.ts`)
   - Extends base logger with file writing capabilities
   - Server-side only (uses Node.js fs module)
   - Automatic session management
   - Graceful shutdown handling

3. **File Logger** (`src/lib/logger-file.ts`)
   - Handles file writing operations
   - Session-based directory structure
   - Efficient batching (writes every 1 second or 50 entries)
   - Automatic directory creation

## Usage

### Client-Side (Browser)
```typescript
import { logger } from '@/lib/logger'

// Logs only to browser console
logger.general.info('Client-side log')
logger.auth.error('Authentication error', { userId })
```

### Server-Side (API Routes, Server Components)
```typescript
import { serverLogger as logger } from '@/lib/logger-server'

// Logs to both console and files (based on config)
logger.api.info('API request received', { endpoint, method })
logger.email.debug('Email sent', { recipient, subject })
logger.setup.error('Configuration error', new Error('Missing config'))
```

## Configuration

### Environment Variables

Add to `.env.local` or `.env`:

```bash
# Enable/disable specific log categories
DEBUG_EMAIL=true      # Email system logging
DEBUG_AUTH=true       # Authentication logging  
DEBUG_SETUP=true      # Setup/middleware logging
DEBUG_CAMPAIGN=true   # Campaign/mailing logging
DEBUG_WEBHOOK=true    # Webhook logging
DEBUG_API=true        # API route logging
DEBUG_ALL=true        # Enable all categories

# Output control (server-side only)
LOG_TO_CONSOLE=false  # Disable console output (default: true)
LOG_TO_FILE=true      # Enable file logging (default: true in dev)
```

### Log Categories

- `general` - General application logs (always enabled)
- `auth` - Authentication and authorization
- `email` - Email sending and processing
- `api` - API route requests and responses
- `setup` - Application setup and configuration
- `campaign` - Marketing campaigns and mailings
- `webhook` - Webhook processing

### Log Levels

- `debug` - Detailed debugging information
- `info` - General informational messages
- `warn` - Warning messages
- `error` - Error messages and stack traces

## File Structure

Logs are organized in session-based directories:

```
logs/
└── [sessionId]_[date]/
    ├── general_logs.log
    ├── auth_logs.log
    ├── api_logs.log
    ├── email_logs.log
    ├── setup_logs.log
    ├── campaign_logs.log
    ├── webhook_logs.log
    └── error_[category]_logs.log
```

Example:
```
logs/
└── mf4ur5na-r7vi4x_2025-09-03/
    ├── general_logs.log
    ├── api_logs.log
    └── error_setup_logs.log
```

## API Endpoints

### Test Logger
`GET /api/test-logger`
- Tests server-side logging
- Returns current configuration
- Forces log flush

### Read Logs
`GET /api/logs`
- List all sessions: `/api/logs`
- List files in session: `/api/logs?sessionId=xxx`
- Read specific file: `/api/logs?sessionId=xxx&file=general_logs.log`

### Test Page
`/test-logger`
- Interactive page to test logging
- Shows client vs server logging
- Displays configuration

## Bypass Mode

The logger includes a bypass feature for immediate console output during debugging:

### Basic Usage
```typescript
// Enable bypass - all logs go to console regardless of settings
logger.bypass = true

// Your debugging code
logger.api.debug('Debugging API issue', { request, response })

// Disable bypass when done
logger.bypass = false
```

### Temporary Bypass
```typescript
// Synchronous operations
logger.withBypass(() => {
  logger.auth.info('User login attempt', { email })
  // All logs within this block show in console
})

// Async operations
const result = await logger.withBypassAsync(async () => {
  logger.api.info('Starting async operation')
  const data = await fetchData()
  logger.api.debug('Received data', data)
  return data
})
```

### When to Use Bypass
- Quick debugging without restarting server
- Investigating specific issues in real-time
- Temporary verbose logging for troubleshooting
- Development iterations where you need immediate feedback

### Bypass Indicators
When bypass is active and console output is normally disabled, logs are prefixed with `[BYPASS]`:
```
[BYPASS] [2025-01-03T10:30:45.123Z] [API] [INFO] Request received
```

## Best Practices

1. **Use Appropriate Categories**
   ```typescript
   // Good
   logger.auth.error('Login failed', { userId, reason })
   logger.api.info('Request processed', { endpoint, duration })
   
   // Avoid
   logger.general.info('Login failed') // Use auth category
   ```

2. **Include Relevant Context**
   ```typescript
   // Good
   logger.email.info('Email sent', { 
     recipient, 
     subject, 
     templateId,
     timestamp: new Date()
   })
   
   // Minimal
   logger.email.info('Email sent')
   ```

3. **Use Appropriate Log Levels**
   - `debug`: Development details, function entry/exit
   - `info`: Normal operations, successful completions
   - `warn`: Recoverable issues, deprecations
   - `error`: Failures, exceptions, critical issues

4. **Server-Side Only for Sensitive Data**
   ```typescript
   // Server-side only
   logger.auth.debug('Token validated', { token: token.substring(0, 10) + '...' })
   
   // Never on client
   // logger.auth.debug('Password check', { password }) // NEVER DO THIS
   ```

5. **Structured Data**
   ```typescript
   // Good - structured objects
   logger.api.error('Database error', {
     query: 'SELECT * FROM users',
     error: err.message,
     stack: err.stack,
     timestamp: new Date()
   })
   
   // Avoid - concatenated strings
   logger.api.error('Database error: ' + err.message)
   ```

## Development Workflow

1. **Enable file-only logging** to reduce console clutter:
   ```bash
   # .env.local
   DEBUG_ALL=true
   LOG_TO_CONSOLE=false
   LOG_TO_FILE=true
   ```

2. **Check logs** during development:
   - Via API: `http://localhost:3000/api/logs`
   - Direct file access: `./logs/[session]/`
   - Use `tail -f logs/*/api_logs.log` to follow logs

3. **Debug specific issues**:
   ```bash
   # Enable only specific categories
   DEBUG_AUTH=true
   DEBUG_API=true
   DEBUG_EMAIL=false
   ```

4. **Production considerations**:
   - File logging is automatically disabled in production
   - Consider using external logging services
   - Set appropriate log levels for production

## Troubleshooting

### Logs not appearing
1. Check environment variables are loaded (restart dev server)
2. Verify `NODE_ENV=development`
3. Check the correct logger is imported (serverLogger for server-side)
4. Ensure `DEBUG_ALL=true` or specific category is enabled

### Console still showing logs
1. Set `LOG_TO_CONSOLE=false` in `.env.local`
2. Restart the development server
3. Note: Client-side logs always go to console

### Can't find log files
1. Check `./logs/` directory exists
2. Look for session directories with today's date
3. Use `/api/logs` endpoint to list sessions
4. Ensure server-side code is using `serverLogger`

## Examples

### API Route Logging
```typescript
// src/app/api/users/route.ts
import { serverLogger as logger } from '@/lib/logger-server'

export async function GET(request: Request) {
  logger.api.info('GET /api/users', { 
    headers: Object.fromEntries(request.headers.entries()) 
  })
  
  try {
    const users = await fetchUsers()
    logger.api.debug('Users fetched', { count: users.length })
    return Response.json(users)
  } catch (error) {
    logger.api.error('Failed to fetch users', error)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

### TRPC Procedure Logging
```typescript
// src/server/routers/auth.ts
import { serverLogger as logger } from '@/lib/logger-server'

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input, ctx }) => {
      logger.auth.info('Login attempt', { email: input.email })
      
      try {
        const user = await authenticate(input)
        logger.auth.info('Login successful', { userId: user.id })
        return { user }
      } catch (error) {
        logger.auth.error('Login failed', { 
          email: input.email, 
          error: error.message 
        })
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }
    })
})
```

### Email Service Logging
```typescript
// src/lib/email/service.ts
import { serverLogger as logger } from '@/lib/logger-server'

export async function sendEmail(options: EmailOptions) {
  logger.email.info('Sending email', {
    to: options.to,
    subject: options.subject,
    template: options.template
  })
  
  try {
    const result = await emailClient.send(options)
    logger.email.debug('Email sent successfully', { 
      messageId: result.messageId 
    })
    return result
  } catch (error) {
    logger.email.error('Email send failed', {
      to: options.to,
      error: error.message
    })
    throw error
  }
}
```