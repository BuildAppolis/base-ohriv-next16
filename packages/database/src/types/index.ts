// Basic type definitions for the database package
// These will be expanded as we add more functionality

export interface BaseDocument {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DatabaseStats {
  documentCount: number;
  databaseSize: number;
  indexes: string[];
}