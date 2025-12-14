import { DocumentStore, IDocumentSession, IDocumentStore, IAuthOptions } from "ravendb";

export interface DatabaseConfig {
  urls: string[];
  database: string;
  authOptions?: IAuthOptions;
  enableOptimisticConcurrency?: boolean;
  maxNumberOfRequestsPerSession?: number;
}

export class RavenDBClient {
  private store: IDocumentStore | null = null;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = {
      enableOptimisticConcurrency: true,
      maxNumberOfRequestsPerSession: 30,
      ...config
    };
  }

  async initialize(): Promise<void> {
    if (this.store) {
      throw new Error('RavenDB client is already initialized');
    }

    try {
      if (this.config.authOptions) {
        this.store = new DocumentStore(this.config.urls, this.config.database, this.config.authOptions);
      } else {
        this.store = new DocumentStore(this.config.urls, this.config.database);
      }

      this.store.conventions.useOptimisticConcurrency = this.config.enableOptimisticConcurrency!;
      this.store.conventions.maxNumberOfRequestsPerSession = this.config.maxNumberOfRequestsPerSession!;

      this.store.initialize();
    } catch (error) {
      throw new Error(`Failed to initialize RavenDB client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async openSession(): Promise<IDocumentSession> {
    if (!this.store) {
      throw new Error('RavenDB client is not initialized. Call initialize() first.');
    }

    return this.store.openSession();
  }

  async dispose(): Promise<void> {
    if (this.store) {
      await this.store.dispose();
      this.store = null;
    }
  }

  getStore(): IDocumentStore {
    if (!this.store) {
      throw new Error('RavenDB client is not initialized. Call initialize() first.');
    }
    return this.store;
  }

  isInitialized(): boolean {
    return this.store !== null;
  }
}

let databaseClient: RavenDBClient | null = null;

export function createDatabaseClient(config: DatabaseConfig): RavenDBClient {
  return new RavenDBClient(config);
}

export function setDatabaseClient(client: RavenDBClient): void {
  databaseClient = client;
}

export function getDatabaseClient(): RavenDBClient {
  if (!databaseClient) {
    throw new Error('Database client not initialized. Call setDatabaseClient() first.');
  }
  return databaseClient;
}

export async function withSession<T>(
  callback: (session: IDocumentSession) => Promise<T>
): Promise<T> {
  const client = getDatabaseClient();
  const session = await client.openSession();

  try {
    const result = await callback(session);
    await session.saveChanges();
    return result;
  } finally {
    session.dispose();
  }
}