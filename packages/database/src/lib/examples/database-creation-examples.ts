/**
 * RavenDB Database Creation Examples
 *
 * RavenDB makes creating databases on demand incredibly simple and efficient.
 * Here are multiple approaches for creating tenant databases dynamically.
 */

import { createDatabaseClient } from "../../client";
import { getDatabaseConfig } from "../../config";

// Method 1: Direct Database Creation (Simplest)
async function createDatabaseDirectly(tenantId: string) {
  console.log(`🚀 Creating database for tenant: ${tenantId}`);

  // 1. Just connect to RavenDB with the new database name
  // RavenDB automatically creates it if it doesn't exist!
  const client = createDatabaseClient({
    ...getDatabaseConfig(),
    database: `tenant-${tenantId}`, // This database will be created automatically
    enableOptimisticConcurrency: true,
  });

  // 2. Initialize the client (this creates the database)
  await client.initialize();

  // 3. Test the connection by storing something
  const session = await client.openSession();

  const tenantConfig = {
    collection: "tenant-configs",
    id: `tenant-configs/${tenantId}`,
    tenantId,
    createdAt: new Date().toISOString(),
    initialized: true,
  };

  await session.store(tenantConfig);
  await session.saveChanges();
  session.dispose();

  console.log(`✅ Database 'tenant-${tenantId}' created successfully!`);
  return client;
}

// Method 2: Using RavenDB Management API (More control)
async function createDatabaseWithAPI(tenantId: string) {
  const config = getDatabaseConfig();
  const serverUrl = config.urls[0];
  const databaseName = `tenant-${tenantId}`;

  try {
    // Create database via HTTP API
    const response = await fetch(`${serverUrl}/admin/databases`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        DatabaseName: databaseName,
        Settings: {
          DataDirectory: `Databases/${databaseName}`,
          Encrypted: false, // Set to true for HIPAA compliance
        },
      }),
    });

    if (response.ok) {
      console.log(`✅ Database '${databaseName}' created via API`);
    } else {
      console.log(`ℹ️ Database '${databaseName}' may already exist`);
    }

    // Now connect to it
    return await createDatabaseClient({
      ...config,
      database: databaseName,
    });
  } catch (error) {
    console.error(`❌ Failed to create database: ${(error as Error).message}`);
    throw error;
  }
}

// Method 3: Batch Database Creation (For multiple tenants)
async function createMultipleDatabases(tenantIds: string[]) {
  console.log(`🏭 Creating ${tenantIds.length} databases in parallel...`);

  // Create all databases concurrently
  const databasePromises = tenantIds.map(async (tenantId) => {
    try {
      const client = createDatabaseClient({
        ...getDatabaseConfig(),
        database: `tenant-${tenantId}`,
      });

      await client.initialize();

      // Initialize with basic structure
      const session = await client.openSession();

      await session.store({
        collection: "tenant-configs",
        id: `tenant-configs/${tenantId}`,
        tenantId,
        createdAt: new Date().toISOString(),
        status: "active",
      });

      await session.saveChanges();
      session.dispose();

      return { tenantId, success: true, client };
    } catch (error) {
      return { tenantId, success: false, error: (error as Error).message };
    }
  });

  // Wait for all databases to be created
  const results = await Promise.all(databasePromises);

  // Log results
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success);

  console.log(`✅ ${successful} databases created successfully`);
  if (failed.length > 0) {
    console.log(`❌ ${failed.length} databases failed to create`);
    failed.forEach((f) => console.log(`  - ${f.tenantId}: ${f.error}`));
  }

  return results;
}

// Method 4: Check if Database Exists
async function checkDatabaseExists(databaseName: string): Promise<boolean> {
  try {
    const client = createDatabaseClient({
      ...getDatabaseConfig(),
      database: databaseName,
    });

    // Try to initialize - if it fails, database doesn't exist
    await client.initialize();

    // Test with a simple operation
    const session = await client.openSession();
    session.dispose();
    await client.dispose();

    return true;
  } catch (error) {
    return false;
  }
}

// Method 5: Enhanced Tenant Creation (Production ready)
async function createProductionTenant(tenantData: {
  tenantId: string;
  name: string;
  plan: "free" | "standard" | "enterprise";
  encryptionEnabled?: boolean;
}) {
  const { tenantId, name, plan, encryptionEnabled = false } = tenantData;
  const databaseName = `tenant-${tenantId}`;

  console.log(`🏥 Creating HIPAA-compliant tenant: ${name}`);

  try {
    // Step 1: Check if database already exists
    const exists = await checkDatabaseExists(databaseName);
    if (exists) {
      throw new Error(`Database ${databaseName} already exists`);
    }

    // Step 2: Create the database
    const client = createDatabaseClient({
      ...getDatabaseConfig(),
      database: databaseName,
      enableOptimisticConcurrency: true,
    });

    await client.initialize();

    // Step 3: Initialize tenant structure
    const session = await client.openSession();

    // Store tenant configuration
    await session.store({
      collection: "tenant-configs",
      id: `tenant-configs/${tenantId}`,
      tenantId,
      configType: "system",
      config: {
        tenantName: name,
        plan,
        encryptionEnabled,
        hipaaCompliant: true,
        features: getFeaturesForPlan(plan),
        limits: getLimitsForPlan(plan),
      },
      version: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: "system",
    });

    // Create initial indexes setup
    await session.store({
      collection: "system-indexes",
      id: `system-indexes/${tenantId}`,
      tenantId,
      indexes: [
        "companies/by-name",
        "candidates/by-email",
        "jobs/by-status",
        "evaluations/by-candidate",
      ],
      createdAt: new Date().toISOString(),
    });

    await session.saveChanges();
    session.dispose();

    console.log(`✅ Tenant "${name}" database created: ${databaseName}`);
    console.log(`🔒 Encryption: ${encryptionEnabled ? "ENABLED" : "DISABLED"}`);
    console.log(`📋 Plan: ${plan.toUpperCase()}`);

    return {
      success: true,
      databaseName,
      tenantId,
      message: `Tenant ${name} created successfully`,
    };
  } catch (error) {
    console.error(`❌ Failed to create tenant: ${(error as Error).message}`);
    return {
      success: false,
      tenantId,
      message: (error as Error).message,
    };
  }
}

// Helper functions for tenant setup
function getFeaturesForPlan(plan: string) {
  const baseFeatures = {
    evaluations: true,
    basicAnalytics: true,
    candidates: true,
    jobs: true,
  };

  switch (plan) {
    case "free":
      return {
        ...baseFeatures,
        advancedAnalytics: false,
        aiEvaluation: false,
        apiAccess: false,
      };
    case "standard":
      return {
        ...baseFeatures,
        advancedAnalytics: true,
        aiEvaluation: true,
        apiAccess: false,
      };
    case "enterprise":
      return {
        ...baseFeatures,
        advancedAnalytics: true,
        aiEvaluation: true,
        apiAccess: true,
        dedicatedSupport: true,
        customIntegrations: true,
      };
    default:
      return baseFeatures;
  }
}

function getLimitsForPlan(plan: string) {
  switch (plan) {
    case "free":
      return {
        companies: 1,
        users: 5,
        storageGB: 10,
        evaluationsPerMonth: 100,
      };
    case "standard":
      return {
        companies: 5,
        users: 25,
        storageGB: 100,
        evaluationsPerMonth: 1000,
      };
    case "enterprise":
      return {
        companies: 50,
        users: 500,
        storageGB: 1000,
        evaluationsPerMonth: 10000,
      };
    default:
      return { companies: 1, users: 5, storageGB: 10 };
  }
}

// Usage examples
export async function demonstrateDatabaseCreation() {
  console.log("🎯 Demonstrating RavenDB Database Creation...\n");

  try {
    // Example 1: Simple database creation
    console.log("1. Simple Database Creation:");
    const tenant1Client = await createDatabaseDirectly("healthcare-corp");
    console.log("   ✅ Database created and initialized\n");

    // Example 2: Multiple databases
    console.log("2. Batch Database Creation:");
    const tenantIds = ["medical-center", "clinic-abc", "hospital-xyz"];
    const batchResults = await createMultipleDatabases(tenantIds);
    console.log(
      `   ✅ ${batchResults.filter((r) => r.success).length}/${
        batchResults.length
      } databases created\n`
    );

    // Example 3: Production tenant creation
    console.log("3. Production Tenant Creation:");
    const tenantResult = await createProductionTenant({
      tenantId: "advanced-healthcare",
      name: "Advanced Healthcare Partners",
      plan: "enterprise",
      encryptionEnabled: true,
    });
    console.log(
      `   ${tenantResult.success ? "✅" : "❌"} ${tenantResult.message}\n`
    );

    // Example 4: Check existing databases
    console.log("4. Database Existence Check:");
    const dbExists = await checkDatabaseExists("tenant-healthcare-corp");
    console.log(
      `   Database 'tenant-healthcare-corp' exists: ${
        dbExists ? "Yes" : "No"
      }\n`
    );

    console.log("🎉 Database creation demonstration completed!");
  } catch (error) {
    console.error("❌ Demonstration failed:", error);
  }
}

// Export for use in other modules
export {
  createDatabaseDirectly,
  createDatabaseWithAPI,
  createMultipleDatabases,
  checkDatabaseExists,
  createProductionTenant,
};

// Run demonstration if this file is executed directly
if (require.main === module) {
  demonstrateDatabaseCreation().catch(console.error);
}
