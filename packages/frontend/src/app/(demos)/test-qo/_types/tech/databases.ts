import type { TechStackItem } from "../company";

export const DATABASES: TechStackItem[] = [
  // SQL Databases
  {
    id: "postgresql",
    name: "PostgreSQL",
    category: "datastorage",
    description: "Advanced open-source relational database with rich features"
  },
  {
    id: "mysql",
    name: "MySQL",
    category: "datastorage",
    description: "Popular open-source relational database for web applications"
  },
  {
    id: "sqlite",
    name: "SQLite",
    category: "datastorage",
    description: "Self-contained, serverless SQL database engine"
  },
  // NoSQL Databases
  {
    id: "mongodb",
    name: "MongoDB",
    category: "datastorage",
    description: "Document-oriented NoSQL database for modern applications"
  },
  {
    id: "dynamodb",
    name: "Amazon DynamoDB",
    category: "datastorage",
    description: "Fully managed NoSQL database service by AWS"
  },
  {
    id: "cassandra",
    name: "Apache Cassandra",
    category: "datastorage",
    description: "Distributed NoSQL database for large-scale applications"
  },
  {
    id: "couchbase",
    name: "Couchbase",
    category: "datastorage",
    description: "Distributed NoSQL cloud database for modern applications"
  },
  // Vector Databases (AI/ML)
  {
    id: "pinecone",
    name: "Pinecone",
    category: "datastorage",
    description: "Vector database for AI applications and similarity search"
  },
  {
    id: "chromadb",
    name: "ChromaDB",
    category: "datastorage",
    description: "Open-source vector database for AI applications"
  },
  {
    id: "weaviate",
    name: "Weaviate",
    category: "datastorage",
    description: "Real-time vector database for scalable AI applications"
  },
  // Cache & Search
  {
    id: "redis",
    name: "Redis",
    category: "datastorage",
    description: "In-memory data structure store for caching and real-time data"
  },
  {
    id: "elasticsearch",
    name: "Elasticsearch",
    category: "datastorage",
    description: "Distributed search and analytics engine"
  },
  {
    id: "opensearch",
    name: "OpenSearch",
    category: "datastorage",
    description: "Open-source distributed search and analytics suite"
  },
  // Time Series
  {
    id: "influxdb",
    name: "InfluxDB",
    category: "datastorage",
    description: "Time series database for monitoring and IoT data"
  },
  {
    id: "timescaledb",
    name: "TimescaleDB",
    category: "datastorage",
    description: "PostgreSQL extension for time-series data"
  }
];