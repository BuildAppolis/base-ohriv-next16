# RavenDB Migration Guide for Ohriv Platform

## Overview

RavenDB is a schema-less NoSQL document database, which means there's no formal migration process required like in SQL databases. This guide explains how to work with document changes, deploy new models, and maintain backward compatibility.

## Key Concepts

### Schema-less Nature
- Documents can have different structures within the same collection
- New fields are automatically handled as optional
- Old documents continue working with new models
- No ALTER TABLE or migration scripts required

### Document Conventions
- **Collection Naming**: kebab-case (e.g., `stack-auth-users`, `billing-accounts`)
- **Document IDs**: `{collection}/{unique-id}` format
- **Type Safety**: TypeScript interfaces enforce structure at compile-time

## Migration Strategies

### 1. Adding New Models/Collections

New models can be used immediately. RavenDB automatically creates collections when the first document is saved.

```typescript
// Example: Creating a new Stack Auth user
const user: StackAuthUserDocument = {
  id: 'stack-auth-users/user-123',
  collection: 'stack-auth-users',
  tenantId: 'tenant-456',
  stackAuthUserId: 'auth-user-789',
  // ... other fields
};

await session.store(user);
await session.saveChanges();
```

### 2. Adding New Fields to Existing Models

Since RavenDB is schema-less, you can add new fields without migration:

```typescript
// Old documents will work fine with new fields being undefined
interface UserDocument {
  // Existing fields
  name: string;
  email: string;

  // New field - optional for backward compatibility
  newField?: string;
}
```

### 3. Modifying Field Types

When changing field types, handle both old and new formats:

```typescript
interface UserDocument {
  // Handle both string (old) and number (new) age
  age: string | number;
}

// In your code:
function processAge(age: string | number): number {
  if (typeof age === 'string') {
    return parseInt(age, 10);
  }
  return age;
}
```

### 4. Removing Fields

Removed fields will simply be ignored in existing documents:

```typescript
interface UserDocument {
  // Removed field won't cause errors
  // oldField: string;  // Deprecated

  // New fields
  newField: string;
}
```

## Deployment Process

### 1. Code Deployment

1. Update TypeScript interfaces
2. Deploy application code
3. New models are immediately available
4. No database downtime required

### 2. Index Updates

New indexes should be deployed before they're needed:

```typescript
// Example: Creating an index for Stack Auth users
export class StackAuthUsers_ByStackAuthId extends AbstractIndexCreationTask<StackAuthUserDocument> {
  constructor() {
    super();
    this.map = `docs.AuthSessions.Select(session => new {
      StackAuthUserId = session.stackAuthUserId,
      TenantId = session.tenantId,
      Email = session.email
    })`;
  }
}
```

Deploy indexes:
```typescript
// During application startup
await store.executeIndex(new StackAuthUsers_ByStackAuthId());
```

### 3. Data Transformation (Optional)

For complex changes, you might want to transform existing data:

```typescript
// Example: Migrating email preferences to new format
async function migrateEmailPreferences(session: IDocumentSession) {
  const users = await session.query<StackAuthUserDocument>({
    collection: 'stack-auth-users'
  }).all();

  for (const user of users) {
    if (user.emailNotifications === true) {
      // Transform to new format
      user.clientMetadata = {
        ...user.clientMetadata,
        notifications: {
          email: true,
          push: false,
          inApp: true
        }
      };

      // Remove old field
      delete user.emailNotifications;
    }
  }

  await session.saveChanges();
}
```

## Best Practices

### 1. Backward Compatibility

- Always make new fields optional
- Handle multiple field types gracefully
- Provide default values for missing fields
- Test with existing documents

### 2. Versioning

Consider adding version information for major changes:

```typescript
interface DocumentVersion {
  version: number;
  migratedAt?: string;
}

interface UserDocument extends DocumentVersion {
  name: string;
  email: string;
}
```

### 3. Validation

Add runtime validation for optional fields:

```typescript
function getUserDisplayName(user: StackAuthUserDocument): string {
  return user.displayName || user.email || 'Unknown User';
}
```

### 4. Testing

- Test with various document versions
- Include migration scenarios in tests
- Verify queries work with mixed document structures

## Rollback Strategy

Since RavenDB doesn't have formal migrations, rollback is straightforward:

1. Deploy previous code version
2. TypeScript interfaces enforce old structure
3. New fields are ignored
4. Old fields work as before

## Monitoring

### 1. Document Structure Changes

Monitor for documents missing expected fields:

```typescript
// Find documents without new required field
const usersWithoutNewField = await session.query<StackAuthUserDocument>({
  collection: 'stack-auth-users'
})
.whereNotExists('newField')
.all();
```

### 2. Performance Impact

Monitor query performance after structural changes:
- New indexes might take time to build
- Query patterns might need adjustment
- Consider using RavenDB's built-in profiling

## Specific to Ohriv Integration

### Stack Auth Integration

1. **User Syncing**: Stack Auth users are mirrored in RavenDB
2. **Team Creation**: Automatic team creation when companies are added
3. **Metadata Storage**: Store Stack Auth metadata for offline access

```typescript
// Sync Stack Auth user to RavenDB
async function syncStackAuthUser(stackUser: StackUser): Promise<void> {
  const userDoc: StackAuthUserDocument = {
    id: `stack-auth-users/${stackUser.id}`,
    collection: 'stack-auth-users',
    stackAuthUserId: stackUser.id,
    tenantId: stackUser.metadata.tenantId,
    email: stackUser.email,
    // Map Stack Auth fields to RavenDB
  };

  await withSession(async session => {
    await session.store(userDoc);
  });
}
```

### Stripe Integration

1. **Webhook Processing**: Store webhook events for audit
2. **Customer Management**: Link Stripe customers to billing accounts
3. **Subscription Tracking**: Mirror subscription status in RavenDB

```typescript
// Handle Stripe webhook
async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  const billingDoc: BillingAccountDocument = {
    id: `billing-accounts/${event.data.object.customer}`,
    collection: 'billing-accounts',
    stripeCustomerId: event.data.object.customer as string,
    lastWebhookEvent: event.type,
    lastWebhookAt: new Date().toISOString(),
    // Process event-specific data
  };
}
```

## Common Scenarios

### Scenario 1: Adding Billing to Existing Companies

```typescript
// Existing company documents will work fine
// Billing fields are optional and can be added later
const company = await session.load<CompanyDocument>(`companies/${companyId}`);

if (!company.billingAccountId) {
  // Add billing account
  company.billingAccountId = await createBillingAccount(company);
  await session.saveChanges();
}
```

### Scenario 2: Migrating from Simple Roles to Stack Auth Teams

```typescript
// Old documents have simple role field
interface OldUserDocument {
  role: 'admin' | 'user';
}

// New documents use Stack Auth teams
interface NewUserDocument extends StackAuthIntegratedDocument {
  stackAuthTeamId: string;
}

// Migration function
async function migrateRolesToTeams(session: IDocumentSession): Promise<void> {
  const oldUsers = await session
    .query<OldUserDocument>({ collection: 'users' })
    .whereEquals('hasRole', true)
    .all();

  for (const user of oldUsers) {
    // Create Stack Auth team for user's company
    const teamId = await createStackAuthTeam(user.companyId);
    user.stackAuthTeamId = teamId;
  }

  await session.saveChanges();
}
```

## Troubleshooting

### Issues and Solutions

1. **Type Mismatch Errors**
   - Check TypeScript interfaces match actual documents
   - Use type guards for optional fields

2. **Missing Indexes**
   - Deploy indexes before querying new fields
   - Use RavenDB Studio to check index status

3. **Performance Degradation**
   - Monitor indexing progress
   - Consider batch transformations for large datasets

4. **Validation Errors**
   - Add null checks for new optional fields
   - Provide sensible defaults

## Tools and Resources

### RavenDB Tools
- **RavenDB Studio**: Visual database management
- **Data Explorer**: Browse and edit documents
- **Index Management**: Create and monitor indexes

### Development Tools
- **TypeScript**: Type safety and IntelliSense
- **RavenDB Client**: Official Node.js client
- **Migrations**: Custom scripts for complex changes

### Monitoring
- **RavenDB Metrics**: Built-in performance monitoring
- **Application Logs**: Track transformation operations
- **Error Tracking**: Monitor for type-related errors

## Conclusion

RavenDB's schema-less nature makes migrations significantly simpler than traditional SQL databases. The key is maintaining backward compatibility through optional fields and proper type handling. With careful planning and testing, you can evolve your data model without downtime or complex migration scripts.