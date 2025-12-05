# Audit Logging System

## Overview

The audit logging system automatically tracks CRUD operations on your models with zero effort. Simply add an `audit` configuration to your model router and all operations will be logged to the database.

## Quick Start

### Basic Usage

Enable audit logging for all operations on a model:

```typescript
export const organizationRouter = createRouter({
  model: 'organization',
  audit: {
    enabled: true,  // Enable for all operations
  },
  // ... rest of config
});
```

### Selective Operation Logging

Choose which operations to log:

```typescript
export const organizationRouter = createRouter({
  model: 'organization',
  audit: {
    enabled: {
      create: true,   // Log creates
      update: true,   // Log updates
      delete: true,   // Log deletes
      read: false,    // Don't log reads (avoid noise)
      list: false,    // Don't log list operations
    },
    type: 'organization_activity',  // Custom type for filtering
  },
  // ... rest of config
});
```

### Custom Formatter

For more control over what gets logged, use a custom formatter:

```typescript
export const organizationSettingsRouter = createRouter({
  model: 'organizationSettings',
  audit: {
    enabled: true,
    type: 'settings_change',
    formatter: (operation, data, user) => ({
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      operation,
      collection: 'organizationSettings',
      documentId: data?.id || data?.organizationId,
      userId: user?.id || 'anonymous',
      type: 'settings_change',
      hook: JSON.stringify({
        operation,
        timestamp: new Date().toISOString(),
        changes: operation === 'update' ? Object.keys(data) : null,
        user: user?.email,
      }).substring(0, 255),
      userAgent: null,
    }),
  },
  // ... rest of config
});
```

## Audit Log Schema

The audit log entries are stored in the `auditLog` table with the following structure:

```prisma
model AuditLog {
  id         String   @id
  operation  String   // 'create', 'read', 'update', 'delete', 'list'
  collection String   // Model name
  documentId String?  // ID of the affected document
  userId     String   // User who performed the operation
  userAgent  String?  // User agent string (if available)
  hook       String?  // Additional context (JSON string, max 255 chars)
  type       String   @default("unknown")  // Custom type for filtering
  createdAt  DateTime @default(now())
}
```

## Features

### Automatic Integration

- **Zero Code Changes**: Add audit config to your model, done!
- **Automatic User Tracking**: Captures the current user from the session
- **Operation Context**: Records what operation was performed
- **Document Tracking**: Links to the specific document affected

### Performance Optimized

- **Non-blocking**: Audit failures don't break operations
- **Selective Logging**: Choose which operations to log
- **Efficient Storage**: Uses compact format with optional JSON in hook field

### Flexible Configuration

- **Per-Model Settings**: Each model can have different audit settings
- **Custom Types**: Use types to categorize and filter logs
- **Custom Formatters**: Full control over log format when needed

## Examples

### Example 1: Simple Audit for Job Model

```typescript
export const jobRouter = createRouter({
  model: 'job',
  audit: {
    enabled: true,  // Log everything
  },
  // ... rest of config
});
```

### Example 2: Audit with Custom Type

```typescript
export const candidateRouter = createRouter({
  model: 'candidate',
  audit: {
    enabled: {
      create: true,
      update: true,
      delete: true,
      read: false,
      list: false,
    },
    type: 'candidate_management',
  },
  // ... rest of config
});
```

### Example 3: Complex Audit with Business Logic

```typescript
export const subscriptionRouter = createRouter({
  model: 'subscription',
  audit: {
    enabled: true,
    type: 'billing_activity',
    formatter: (operation, data, user) => {
      // Capture billing-specific information
      const auditData = {
        id: `audit_billing_${Date.now()}`,
        operation,
        collection: 'subscription',
        documentId: data?.id,
        userId: user?.id || 'system',
        type: 'billing_activity',
        hook: JSON.stringify({
          operation,
          amount: data?.amount,
          plan: data?.plan,
          customer: data?.customerId,
          timestamp: new Date().toISOString(),
        }).substring(0, 255),
        userAgent: null,
      };
      
      // Special handling for payment operations
      if (operation === 'update' && data?.status === 'paid') {
        auditData.type = 'payment_received';
      }
      
      return auditData;
    },
  },
  // ... rest of config
});
```

## Querying Audit Logs

### Find All Operations on a Document

```typescript
const logs = await prisma.auditLog.findMany({
  where: {
    documentId: 'org_123',
  },
  orderBy: {
    createdAt: 'desc',
  },
});
```

### Find All Actions by a User

```typescript
const userActivity = await prisma.auditLog.findMany({
  where: {
    userId: 'user_456',
  },
  orderBy: {
    createdAt: 'desc',
  },
});
```

### Find Specific Operation Types

```typescript
const deletions = await prisma.auditLog.findMany({
  where: {
    operation: 'delete',
    type: 'organization_activity',
  },
});
```

## Best Practices

1. **Don't Log Reads for High-Traffic Models**: Avoid logging read operations on frequently accessed models to prevent database bloat.

2. **Use Types for Categorization**: Use the `type` field to categorize logs for easier filtering and reporting.

3. **Keep Hook Data Small**: The hook field is limited to 255 characters. Store only essential context.

4. **Consider Privacy**: Be mindful of what data you log, especially for sensitive operations.

5. **Regular Cleanup**: Implement a cleanup job to archive or delete old audit logs.

## Migration Guide

To add audit logging to an existing model:

1. Add the `audit` configuration to your model router:
```typescript
audit: {
  enabled: true,
},
```

2. That's it! No database migrations needed - the auditLog table already exists.

## Troubleshooting

### Audit Logs Not Appearing

1. Check that `audit.enabled` is set to `true` or the specific operation is enabled
2. Verify the user has permission to perform the operation
3. Check console for any error messages (audit failures are logged but don't throw)

### Performance Impact

Audit logging is designed to be lightweight, but if you notice performance issues:

1. Disable logging for read and list operations
2. Use selective logging only for critical operations
3. Consider implementing async audit logging in a queue for high-traffic applications

## Future Enhancements

Planned improvements for the audit system:

- [ ] Audit log retention policies
- [ ] Audit log export functionality
- [ ] Real-time audit event streaming
- [ ] Audit log analytics dashboard
- [ ] Compliance report generation