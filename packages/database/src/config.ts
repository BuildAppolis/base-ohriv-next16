import { DatabaseConfig } from './client';
import { IAuthOptions } from 'ravendb';

// Certificate type as defined in RavenDB
type CertificateType = 'pem' | 'pfx';

export function getDatabaseConfig(): DatabaseConfig {
  const url = process.env.RAVENDB_URL || 'http://localhost:8080';
  const database = process.env.RAVENDB_DATABASE || 'ohriv-dev';

  const urls = Array.isArray(url) ? url : [url];

  const config: DatabaseConfig = {
    urls,
    database,
    enableOptimisticConcurrency: true,
    maxNumberOfRequestsPerSession: 30,
  };

  // Add authentication if available
  const certBase64 = process.env.RAVENDB_CERTIFICATE_BASE64;
  const keyBase64 = process.env.RAVENDB_PRIVATE_KEY_BASE64;

  if (certBase64 && keyBase64) {
    config.authOptions = {
      certificate: Buffer.from(certBase64, 'base64').toString('utf-8'),
      password: Buffer.from(keyBase64, 'base64').toString('utf-8'), // Note: RavenDB uses 'password' field for private key
      type: 'pem' as CertificateType
    } as IAuthOptions;
  }

  return config;
}

export function isProduction(): boolean {
  const nodeEnv = process.env.NODE_ENV;
  const ravenUrl = process.env.RAVENDB_URL;

  return nodeEnv === 'production' || (ravenUrl !== undefined && ravenUrl.startsWith('https'));
}

export function getStudioUrl(): string {
  if (isProduction()) {
    return process.env.RAVENDB_URL || 'https://localhost:8080';
  }
  return 'http://localhost:8080';
}