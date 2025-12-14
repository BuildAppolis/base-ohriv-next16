# @ohriv/database

RavenDB database layer for the Ohriv platform with development, cluster, and production deployment support.

## 🚀 Quick Start

### Development Mode (Single Node)

```bash
# Start RavenDB for local development
pnpm docker:db:dev

# Access RavenDB Studio
open http://localhost:8080
```

### Cluster Mode (Local Testing)

```bash
# Start 3-node development cluster
pnpm docker:db:cluster

# Check cluster status
pnpm docker:db:cluster:status

# Initialize cluster replication
pnpm docker:db:cluster:init
```

### Production Deployment

```bash
# Deploy to production VPS
RAVENDB_PUBLIC_URL=https://ravendb.yourdomain.com \
RAVENDB_SERVER_URL=https://ravendb.yourdomain.com \
pnpm docker:db:prod:deploy
```

## 📁 Package Structure

```
packages/database/
├── src/
│   ├── client.ts        # Main RavenDBClient implementation
│   ├── cluster.ts       # Cluster management utilities
│   ├── config.ts        # Environment-based configuration
│   ├── types/index.ts   # Type definitions
│   └── index.ts         # Main exports
├── docker/
│   ├── docker-compose.dev.yml       # Single-node development
│   ├── docker-compose.cluster.dev.yml # 3-node development cluster
│   └── docker-compose.prod.yml      # Production deployment
├── scripts/
│   ├── docker-dev.sh     # Development Docker management
│   ├── docker-cluster.sh # Cluster Docker management
│   └── docker-prod.sh    # Production Docker management
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for development:

```env
# Required
RAVENDB_URL=http://localhost:8080
RAVENDB_DATABASE=ohriv-dev

# Production
RAVENDB_PUBLIC_URL=https://ravendb.yourdomain.com
RAVENDB_SERVER_URL=https://ravendb.yourdomain.com

# Optional (for production)
RAVENDB_CERT_PATH=/path/to/certificate.pfx
RAVENDB_CERT_PASSWORD=your-cert-password
RAVENDB_CLUSTER_IPS=vps1.yourdomain.com,vps2.yourdomain.com,vps3.yourdomain.com
```

### Database Client Setup

```typescript
import { createDatabaseClient, getDatabaseConfig, withSession } from '@ohriv/database';

// Simple setup using environment variables
const dbClient = createDatabaseClient(getDatabaseConfig());
await dbClient.initialize();

// Use with session helper
const user = await withSession(async (session) => {
  const newUser = {
    name: 'John Doe',
    email: 'john@example.com'
  };

  await session.store(newUser, 'users/john-doe');
  await session.saveChanges();
  return newUser;
});
```

## 🏗️ Cluster Setup

### Development Cluster (3 Nodes)

```bash
# Start the cluster
pnpm docker:db:cluster:start

# Configure replication in Studio:
# 1. Open http://localhost:8080
# 2. Create database → Settings → Replication & Sharding
# 3. Set Replication Factor to 3
# 4. Select all nodes
```

### Production Cluster

```typescript
import { clusterManager } from '@ohriv/database';

// Define your VPS IPs
const vpsIps = [
  'vps1.yourdomain.com',
  'vps2.yourdomain.com',
  'vps3.yourdomain.com'
];

// Get production cluster config
const clusterConfig = clusterManager.getProductionCluster(vpsIps);

// Create tenant-specific databases with replication
const tenantClient = clusterManager.createClientForCluster(
  'production',
  `tenant-${tenantId}`
);
```

## 🏥 HIPAA Compliance

### Per-Tenant Database Architecture

```typescript
// Create isolated database per tenant
export class HIPAACompliantTenantManager {
  async provisionTenant(tenantId: string, tenantConfig: TenantConfig) {
    // 1. Create encrypted database
    const db = await this.createTenantDatabase(tenantId);

    // 2. Set up replication (minimum 3 nodes)
    await this.configureReplication(db, {
      factor: 3,
      nodes: ['region1', 'region2', 'region3']
    });

    // 3. Configure sharding if needed
    if (tenantConfig.expectedDataSize > '1TB') {
      await this.enableSharding(db, { shards: 3 });
    }

    // 4. Set up compliance features
    await this.configureComplianceFeatures(db);

    return db;
  }
}
```

### Security Features

- ✅ **Encryption in Transit**: TLS 1.3 enabled by default
- ✅ **Data Isolation**: Per-tenant databases
- ✅ **Access Controls**: Role-based permissions
- ✅ **Audit Logging**: Built-in change tracking
- ✅ **Backup Compliance**: Automated encrypted backups
- ✅ **High Availability**: Multi-node replication

## 🛠️ Available Scripts

### Database Package Scripts

```bash
# Development
pnpm docker:db:dev              # Start single-node dev instance
pnpm docker:db:dev:start        # Start dev container
pnpm docker:db:dev:stop         # Stop dev container
pnpm docker:db:dev:logs         # Show dev logs
pnpm docker:db:dev:status       # Show container status

# Cluster
pnpm docker:db:cluster          # Start 3-node development cluster
pnpm docker:db:cluster:start    # Start cluster containers
pnpm docker:db:cluster:stop     # Stop cluster containers
pnpm docker:db:cluster:logs     # Show cluster logs
pnpm docker:db:cluster:init     # Show cluster setup instructions

# Production
pnpm docker:db:prod             # Run production script
pnpm docker:db:prod:deploy      # Deploy to production
pnpm docker:db:prod:stop        # Stop production containers
pnpm docker:db:prod:status      # Check production status
```

### Root Package Scripts (Shortcuts)

```bash
# Same commands but from project root
pnpm docker:db:dev
pnpm docker:db:cluster
pnpm docker:db:prod:deploy
```

## 🔍 Usage Examples

### Basic CRUD Operations

```typescript
import { withSession } from '@ohriv/database';

// Create document
const user = await withSession(async (session) => {
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date()
  };
  await session.store(user, 'users/john-doe');
  return user;
});

// Read document
const user = await withSession(async (session) => {
  return await session.load('users/john-doe');
});

// Update document
await withSession(async (session) => {
  const user = await session.load('users/john-doe');
  user.email = 'newemail@example.com';
  await session.saveChanges();
});

// Delete document
await withSession(async (session) => {
  session.delete('users/john-doe');
});
```

### Multi-Tenant Setup with TenantService

```typescript
import { TenantService } from '@ohriv/database';

// Initialize the tenant service
const tenantService = new TenantService();

// Create a new tenant with isolated database
const tenant = await tenantService.createTenant({
  name: 'Healthcare Corp',
  plan: 'standard',
  ownerUserId: 'user-123',
  ownerEmail: 'admin@healthcare.com',
  ownerName: 'John Smith'
});

// Add users to tenant
await tenantService.addUserToTenant(tenant.tenantId, {
  userId: 'recruiter-456',
  email: 'recruiter@healthcare.com',
  name: 'Jane Doe'
}, 'recruiter');

// Get tenant's isolated database client
const tenantClient = await tenantService.getTenantClient(tenant.tenantId);
```

### Advanced Multi-Tenant Setup

```typescript
import { createDatabaseClient, clusterManager } from '@ohriv/database';

class CustomTenantService {
  async createTenantDatabase(tenantId: string) {
    const config = clusterManager.getCurrentClusterConfig();

    const client = createDatabaseClient({
      urls: config.nodes.map(node => node.url),
      database: `tenant-${tenantId}`,
      enableOptimisticConcurrency: true
    });

    await client.initialize();
    return client;
  }

  async getTenantDatabase(tenantId: string) {
    return clusterManager.createClientForCluster('development', `tenant-${tenantId}`);
  }
}
```

### Query Operations

```typescript
// Simple queries
const users = await withSession(async (session) => {
  return await session.query({ collection: 'users' })
    .whereEquals('isActive', true)
    .orderByDescending('createdAt')
    .toList();
});

// Advanced queries with indexing
const patients = await withSession(async (session) => {
  return await session.query({ collection: 'patients' })
    .whereBetween('age', 18, 65)
    .whereEquals('insurance', 'BlueCross')
    .orderBy('lastName')
    .take(50)
    .all();
});
```

## 🐳 Docker Architecture

### Development (Single Node)
- **Container**: `ravendb/ravendb:latest`
- **Ports**: 8080 (Studio), 38888 (TCP)
- **Storage**: Docker volume `raven-dev-data`
- **Security**: Unsecured access for private network

### Development Cluster (3 Nodes)
- **3 Containers**: `raven-node-1`, `raven-node-2`, `raven-node-3`
- **Ports**: 8080-8082 (Studio), 38888-38890 (TCP)
- **Storage**: Separate volumes per node
- **Networking**: Internal Docker network for communication

### Production (Multi-VPS)
- **Multiple VPS**: Each running RavenDB container
- **Load Balancing**: nginx/HAProxy for failover
- **SSL/TLS**: Encrypted communication
- **Disks**: Encrypted volumes for data at rest
- **Monitoring**: Health checks and alerting

## 🚨 Production Deployment Guide

### Prerequisites

1. **SSL Certificates**: Valid SSL certificate for your domain
2. **Firewall Rules**: Open ports 8080, 38888 between VPS instances
3. **Domain Configuration**: DNS A records pointing to VPS IPs
4. **Disk Encryption**: Encrypted volumes on each VPS

### Deployment Steps

```bash
# 1. Set environment variables
export RAVENDB_PUBLIC_URL=https://ravendb.yourdomain.com
export RAVENDB_SERVER_URL=https://ravendb.yourdomain.com
export RAVENDB_CLUSTER_IPS=vps1.yourdomain.com,vps2.yourdomain.com,vps3.yourdomain.com

# 2. Deploy to production
pnpm docker:db:prod:deploy

# 3. Configure replication via Studio
# 4. Set up monitoring and backups
# 5. Test failover scenarios
```

### Monitoring and Maintenance

```bash
# Check cluster status
pnpm docker:db:prod:status

# View logs
pnpm docker:db:prod:logs

# Create backup
./scripts/docker-prod.sh backup

# Update RavenDB version
pnpm docker:db:prod:update
```

## 🤝 Contributing

When making changes to this package:

1. Run type checking: `pnpm --filter @ohriv/database type-check`
2. Test Docker setups in both dev and cluster modes
3. Update documentation for new features
4. Add examples for new functionality

## 📚 Additional Resources

- [RavenDB Documentation](https://ravendb.net/docs)
- [RavenDB Docker Guide](https://ravendb.net/docs/article-page/latest/deployment/docker)
- [HIPAA Compliance Guide](https://www.hhs.gov/hipaa/for-professionals/index.html)

## 🔧 Troubleshooting

### Common Issues

1. **Container won't start**: Check if port 8080 is already in use
2. **Cluster nodes can't communicate**: Verify Docker network configuration
3. **Replication not working**: Check node URLs and firewall rules
4. **Studio not accessible**: Verify container is running and healthy

### Debug Commands

```bash
# Check container status
docker ps --filter "name=raven"

# Check container logs
pnpm docker:db:dev:logs

# Test network connectivity
curl -I http://localhost:8080

# Clean up everything
pnpm docker:db:clean
```