import { createDatabaseClient, RavenDBClient } from './client';

export interface ClusterNode {
  id: string;
  url: string;
  studioUrl: string;
  tcpPort: number;
  role: 'primary' | 'replica';
}

export interface DatabaseClusterConfig {
  nodes: ClusterNode[];
  replicationFactor: number;
  enableSharding?: boolean;
  shards?: number;
}

export class DatabaseClusterManager {
  private static instance: DatabaseClusterManager;
  private configs: Map<string, DatabaseClusterConfig> = new Map();

  static getInstance(): DatabaseClusterManager {
    if (!DatabaseClusterManager.instance) {
      DatabaseClusterManager.instance = new DatabaseClusterManager();
    }
    return DatabaseClusterManager.instance;
  }

  // Development cluster configurations
  getDevelopmentCluster(): DatabaseClusterConfig {
    return {
      nodes: [
        {
          id: 'node-1',
          url: 'http://localhost:8080',
          studioUrl: 'http://localhost:8080',
          tcpPort: 38888,
          role: 'primary'
        },
        {
          id: 'node-2',
          url: 'http://localhost:8081',
          studioUrl: 'http://localhost:8081',
          tcpPort: 38889,
          role: 'replica'
        },
        {
          id: 'node-3',
          url: 'http://localhost:8082',
          studioUrl: 'http://localhost:8082',
          tcpPort: 38890,
          role: 'replica'
        }
      ],
      replicationFactor: 3,
      enableSharding: false
    };
  }

  // Production cluster configurations
  getProductionCluster(vpsIps: string[]): DatabaseClusterConfig {
    const nodes = vpsIps.map((ip, index) => ({
      id: `prod-node-${index + 1}`,
      url: `https://${ip}:8080`,
      studioUrl: `https://${ip}:8080`,
      tcpPort: 38888,
      role: index === 0 ? 'primary' as const : 'replica' as const
    }));

    return {
      nodes,
      replicationFactor: Math.min(vpsIps.length, 3), // Minimum 3, max available
      enableSharding: true,
      shards: Math.max(1, Math.floor(vpsIps.length / 2))
    };
  }

  createClientForCluster(clusterName: string, databaseName: string): RavenDBClient {
    const cluster = this.configs.get(clusterName);
    if (!cluster) {
      throw new Error(`Cluster '${clusterName}' not found`);
    }

    // Use primary node for initial connection
    const primaryNode = cluster.nodes.find(node => node.role === 'primary');
    if (!primaryNode) {
      throw new Error('No primary node found in cluster');
    }

    return createDatabaseClient({
      urls: cluster.nodes.map(node => node.url),
      database: databaseName,
      enableOptimisticConcurrency: true,
      maxNumberOfRequestsPerSession: 30
    });
  }

  registerCluster(name: string, config: DatabaseClusterConfig): void {
    this.configs.set(name, config);
  }

  getClusterStatus(clusterName: string): ClusterNode[] {
    const cluster = this.configs.get(clusterName);
    return cluster?.nodes || [];
  }

  // Helper to detect if we're running in development
  isDevelopment(): boolean {
    const nodeEnv = process.env.NODE_ENV;
    const ravenUrl = process.env.RAVENDB_URL;

    return nodeEnv !== 'production' ||
           (ravenUrl !== undefined && ravenUrl.includes('localhost'));
  }

  // Get appropriate cluster config for current environment
  getCurrentClusterConfig(): DatabaseClusterConfig {
    if (this.isDevelopment()) {
      return this.getDevelopmentCluster();
    }

    // Production: load from environment variables
    const vpsIps = process.env.RAVENDB_CLUSTER_IPS?.split(',') || [];
    if (vpsIps.length === 0) {
      throw new Error('RAVENDB_CLUSTER_IPS not configured for production');
    }

    return this.getProductionCluster(vpsIps);
  }

  // Initialize cluster with default configurations
  initialize(): void {
    this.registerCluster('development', this.getDevelopmentCluster());

    // Production cluster will be registered when VPS IPs are available
    if (process.env.RAVENDB_CLUSTER_IPS) {
      const vpsIps = process.env.RAVENDB_CLUSTER_IPS.split(',');
      this.registerCluster('production', this.getProductionCluster(vpsIps));
    }
  }
}

// Singleton instance for easy access
export const clusterManager = DatabaseClusterManager.getInstance();

// Initialize with default configurations
clusterManager.initialize();