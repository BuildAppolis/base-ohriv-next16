import { IDocumentSession, IDocumentStore, IAuthOptions } from "ravendb";
export interface DatabaseConfig {
    urls: string[];
    database: string;
    authOptions?: IAuthOptions;
    enableOptimisticConcurrency?: boolean;
    maxNumberOfRequestsPerSession?: number;
}
export declare class RavenDBClient {
    private store;
    private config;
    constructor(config: DatabaseConfig);
    initialize(): Promise<void>;
    openSession(): Promise<IDocumentSession>;
    dispose(): Promise<void>;
    getStore(): IDocumentStore;
    isInitialized(): boolean;
}
export declare function createDatabaseClient(config: DatabaseConfig): RavenDBClient;
export declare function setDatabaseClient(client: RavenDBClient): void;
export declare function getDatabaseClient(): RavenDBClient;
export declare function withSession<T>(callback: (session: IDocumentSession) => Promise<T>): Promise<T>;
//# sourceMappingURL=client.d.ts.map