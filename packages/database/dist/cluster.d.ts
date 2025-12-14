import { RavenDBClient } from './client';
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
export declare class DatabaseClusterManager {
    private static instance;
    private configs;
    static getInstance(): DatabaseClusterManager;
    getDevelopmentCluster(): DatabaseClusterConfig;
    getProductionCluster(vpsIps: string[]): DatabaseClusterConfig;
    createClientForCluster(clusterName: string, databaseName: string): RavenDBClient;
    registerCluster(name: string, config: DatabaseClusterConfig): void;
    getClusterStatus(clusterName: string): ClusterNode[];
    isDevelopment(): boolean;
    getCurrentClusterConfig(): DatabaseClusterConfig;
    initialize(): void;
}
export declare const clusterManager: DatabaseClusterManager;
//# sourceMappingURL=cluster.d.ts.map