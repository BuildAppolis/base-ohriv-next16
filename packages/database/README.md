# @ohriv/database

RavenDB database layer for the Ohriv platform.

## Installation

```bash
pnpm add @ohriv/database
```

## Usage

### Basic Setup

```typescript
import { createDatabaseClient, setDatabaseClient, withSession } from '@ohriv/database';

// Create and initialize the database client
const dbClient = createDatabaseClient({
  urls: ['http://localhost:8080'],
  database: 'ohriv-db',
  enableOptimisticConcurrency: true,
  maxNumberOfRequestsPerSession: 30
});

// Initialize and set as the global client
await dbClient.initialize();
setDatabaseClient(dbClient);
```

### Using with Session Helper

```typescript
import { withSession } from '@ohriv/database';

// Example: Save a document
interface User {
  id?: string;
  name: string;
  email: string;
}

const user = await withSession(async (session) => {
  const newUser = {
    name: 'John Doe',
    email: 'john@example.com'
  };

  await session.store(newUser, 'users/john-doe');
  return newUser;
});
```

### Manual Session Management

```typescript
import { getDatabaseClient } from '@ohriv/database';

const client = getDatabaseClient();
const session = client.openSession();

try {
  const user = await session.load('users/john-doe');
  console.log(user);

  await session.saveChanges();
} finally {
  session.dispose();
}
```

### Authentication

```typescript
import { createDatabaseClient } from '@ohriv/database';

const dbClient = createDatabaseClient({
  urls: ['https://a.ravendb.cloud'],
  database: 'my-database',
  authOptions: {
    certificate: '-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----',
    key: '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----'
  }
});
```

## Configuration

The `DatabaseConfig` interface supports:

- `urls`: Array of RavenDB server URLs
- `database`: Database name
- `authOptions`: Optional authentication configuration
- `enableOptimisticConcurrency`: Enable optimistic concurrency (default: true)
- `maxNumberOfRequestsPerSession`: Max requests per session (default: 30)

## TypeScript Support

This package includes full TypeScript support with type definitions for:

- `RavenDBClient`: Main database client class
- `DatabaseConfig`: Configuration interface
- `BaseDocument`: Base document interface
- `DatabaseStats`: Database statistics interface

## API Reference

### Classes

- `RavenDBClient`: Main client for RavenDB operations

### Functions

- `createDatabaseClient(config): RavenDBClient` - Create a new database client
- `setDatabaseClient(client): void` - Set the global database client
- `getDatabaseClient(): RavenDBClient` - Get the current global client
- `withSession<T>(callback): Promise<T>` - Execute operations with a session

For more detailed information about RavenDB, visit: https://ravendb.net/