import { TenantService } from '../services/tenant-service';
import { setDatabaseClient, getDatabaseClient } from '../client';

/**
 * Example usage of the TenantService
 * This demonstrates how to create tenants, manage users, and work with per-tenant databases
 */

async function demonstrateTenantService() {
  console.log('🚀 Starting Tenant Service Demo...');

  try {
    // Initialize the tenant service (this sets up the management database client)
    const tenantService = new TenantService();

    // 1. Create a new tenant
    console.log('\n📝 Creating new tenant...');
    const newTenant = await tenantService.createTenant({
      name: 'TechCorp Industries',
      plan: 'standard',
      ownerUserId: 'user-123',
      ownerEmail: 'admin@techcorp.com',
      ownerName: 'John Doe',
      settings: {
        branding: {
          primaryColor: '#0066cc',
          customDomain: 'recruiting.techcorp.com'
        },
        security: {
          requireMfa: true,
          sessionTimeoutMinutes: 120
        }
      }
    });

    console.log('✅ Tenant created:', {
      tenantId: newTenant.tenantId,
      name: newTenant.name,
      plan: newTenant.plan,
      databaseName: newTenant.databaseName,
      companyLimit: newTenant.companyLimit,
      userLimit: newTenant.userLimit,
      storageLimit: newTenant.storageLimitGB + 'GB'
    });

    // 2. Retrieve tenant information
    console.log('\n🔍 Retrieving tenant information...');
    const retrievedTenant = await tenantService.getTenant(newTenant.tenantId);
    console.log('✅ Tenant retrieved:', retrievedTenant?.name);

    // 3. Add users to the tenant
    console.log('\n👥 Adding users to tenant...');

    const recruiterMembership = await tenantService.addUserToTenant(
      newTenant.tenantId,
      {
        userId: 'recruiter-456',
        email: 'recruiter@techcorp.com',
        name: 'Jane Smith'
      },
      'recruiter'
    );

    console.log('✅ Recruiter added:', {
      userId: recruiterMembership.userId,
      role: recruiterMembership.role,
      scopes: recruiterMembership.scopes,
      isActive: recruiterMembership.isActive
    });

    const interviewerMembership = await tenantService.addUserToTenant(
      newTenant.tenantId,
      {
        userId: 'interviewer-789',
        email: 'interviewer@techcorp.com',
        name: 'Bob Johnson'
      },
      'interviewer'
    );

    console.log('✅ Interviewer added:', {
      userId: interviewerMembership.userId,
      role: interviewerMembership.role,
      scopes: interviewerMembership.scopes
    });

    // 4. Get user's tenant memberships
    console.log('\n🏢 Getting user memberships...');
    const userMemberships = await tenantService.getUserMemberships('recruiter-456');
    console.log('✅ User memberships:', userMemberships.map(m => ({
      tenantId: m.tenantId,
      role: m.role,
      isActive: m.isActive
    })));

    // 5. Get tenant database client (for tenant-specific operations)
    console.log('\n🗄️ Getting tenant database client...');
    const tenantClient = await tenantService.getTenantClient(newTenant.tenantId);
    console.log('✅ Tenant client initialized for database:', newTenant.databaseName);

    // 6. Create a partner organization
    console.log('\n🤝 Creating partner organization...');
    const partner = await tenantService.createPartner({
      name: 'Staffing Solutions LLC',
      tenantId: 'partner-tenant-001', // Partner's own tenant
      businessType: 'reseller',
      contactInfo: {
        email: 'info@staffingsolutions.com',
        phone: '555-0123',
        address: {
          street: '123 Business Ave',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          postalCode: '10001'
        }
      }
    });

    console.log('✅ Partner created:', {
      partnerId: partner.partnerId,
      name: partner.name,
      businessType: partner.businessType,
      revSharePercent: partner.revSharePercent + '%'
    });

    // 7. Update tenant information
    console.log('\n📊 Updating tenant plan...');
    const updatedTenant = await tenantService.updateTenant(newTenant.tenantId, {
      plan: 'enterprise',
      companyLimit: 50,
      userLimit: 500,
      storageLimitGB: 1000
    });

    console.log('✅ Tenant updated:', {
      newPlan: updatedTenant.plan,
      newCompanyLimit: updatedTenant.companyLimit,
      newUserLimit: updatedTenant.userLimit,
      newStorageLimit: updatedTenant.storageLimitGB + 'GB'
    });

    // 8. Clean up (for demo purposes)
    console.log('\n🧹 Cleaning up...');
    await tenantService.removeUserFromTenant(newTenant.tenantId, 'recruiter-456');
    console.log('✅ Recruiter removed from tenant');

    console.log('\n🎉 Tenant Service Demo completed successfully!');

    // Close all connections
    await tenantService.close();
    console.log('📴 All database connections closed');

  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

/**
 * Demonstrate per-tenant data isolation
 * This shows how each tenant gets their own isolated database
 */
async function demonstrateDataIsolation() {
  console.log('\n🔒 Demonstrating Data Isolation...');

  try {
    const tenantService = new TenantService();

    // Create two tenants
    const tenantA = await tenantService.createTenant({
      name: 'Company A',
      plan: 'free',
      ownerUserId: 'owner-a',
      ownerEmail: 'owner@companya.com',
      ownerName: 'Alice'
    });

    const tenantB = await tenantService.createTenant({
      name: 'Company B',
      plan: 'free',
      ownerUserId: 'owner-b',
      ownerEmail: 'owner@companyb.com',
      ownerName: 'Bob'
    });

    console.log('✅ Two tenants created:', {
      companyA: { id: tenantA.tenantId, database: tenantA.databaseName },
      companyB: { id: tenantB.tenantId, database: tenantB.databaseName }
    });

    // Get separate database clients for each tenant
    const clientA = await tenantService.getTenantClient(tenantA.tenantId);
    const clientB = await tenantService.getTenantClient(tenantB.tenantId);

    // Each tenant has their own isolated database
    console.log('✅ Tenant A database:', tenantA.databaseName);
    console.log('✅ Tenant B database:', tenantB.databaseName);

    // Data in tenant A's database is completely separate from tenant B
    console.log('📊 Data isolation: Each tenant has their own RavenDB database');
    console.log('🔒 HIPAA compliance: Data is physically separated between tenants');

    await tenantService.close();
    console.log('✅ Data isolation demo completed');

  } catch (error) {
    console.error('❌ Data isolation demo failed:', error);
  }
}

// Run the demonstrations
async function main() {
  await demonstrateTenantService();
  await demonstrateDataIsolation();
}

// Export for use in tests or other modules
export {
  demonstrateTenantService,
  demonstrateDataIsolation
};

// Run demo if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}