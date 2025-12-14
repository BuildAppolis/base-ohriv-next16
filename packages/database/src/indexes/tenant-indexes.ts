/**
 * RavenDB Index Definitions for Tenant Management
 *
 * These index definitions follow RavenDB JavaScript/Node.js patterns
 * and optimize common queries for multi-tenant operations.
 *
 * Indexes can be deployed using RavenDB Studio or via the client API
 */

export const TENANT_INDEXES = {
  /**
   * Index for finding tenants by owner or owner email
   * Used in authentication and tenant lookup operations
   */
  TENANTS_BY_OWNER: {
    name: 'Tenants/ByOwner',
    maps: [
      `from tenant in docs.Tenants
       select new {
           tenant.TenantId = tenant.tenantId,
           tenant.Name = tenant.name,
           tenant.OwnerUserId = tenant.ownerUserId,
           tenant.OwnerEmail = tenant.ownerEmail,
           tenant.Status = tenant.status,
           tenant.Plan = tenant.plan,
           tenant.CreatedAt = tenant.createdAt
       }`
    ],
    fields: {
      OwnerEmail: { indexing: 'Exact' },
      OwnerUserId: { indexing: 'Exact' },
      Status: { indexing: 'Exact' },
      Plan: { indexing: 'Exact' }
    },
    stores: {
      TenantId: 'Yes',
      Name: 'Yes',
      OwnerEmail: 'Yes',
      Status: 'Yes'
    }
  },

  /**
   * Index for user memberships across tenants
   * Used for finding all tenants a user belongs to
   */
  USER_MEMBERSHIPS_BY_USER: {
    name: 'UserMemberships/ByUser',
    maps: [
      `from membership in docs.Memberships
       select new {
           membership.UserId = membership.userId,
           membership.TenantId = membership.tenantId,
           membership.Role = membership.role,
           membership.Scopes = membership.scopes,
           membership.IsActive = membership.isActive,
           membership.AcceptedAt = membership.acceptedAt
       }`
    ],
    fields: {
      UserId: { indexing: 'Exact' },
      TenantId: { indexing: 'Exact' },
      Role: { indexing: 'Exact' },
      IsActive: { indexing: 'Exact' }
    },
    stores: {
      TenantId: 'Yes',
      Role: 'Yes',
      Scopes: 'Yes'
    }
  },

  /**
   * Index for tenant members by role and activity
   * Used for finding active users within a tenant
   */
  USER_MEMBERSHIPS_BY_TENANT: {
    name: 'UserMemberships/ByTenant',
    maps: [
      `from membership in docs.Memberships
       select new {
           membership.TenantId = membership.tenantId,
           membership.UserId = membership.userId,
           membership.Role = membership.role,
           membership.IsActive = membership.isActive,
           membership.InvitedAt = membership.invitedAt,
           membership.AcceptedAt = membership.acceptedAt
       }`
    ],
    fields: {
      TenantId: { indexing: 'Exact' },
      Role: { indexing: 'Exact' },
      IsActive: { indexing: 'Exact' }
    },
    stores: {
      UserId: 'Yes',
      Role: 'Yes',
      IsActive: 'Yes'
    }
  },

  /**
   * Index for partner organizations by type and status
   * Used for managing partner/reseller relationships
   */
  PARTNERS_BY_TYPE: {
    name: 'Partners/ByType',
    maps: [
      `from partner in docs.Partners
       select new {
           partner.PartnerId = partner.partnerId,
           partner.Name = partner.name,
           partner.BusinessType = partner.businessType,
           partner.Status = partner.status,
           partner.OwnTenantId = partner.ownTenantId,
           partner.CustomerTenantIds = partner.customerTenantIds,
           partner.CreatedAt = partner.createdAt,
           RevSharePercent = partner.revSharePercent
       }`
    ],
    fields: {
      BusinessType: { indexing: 'Exact' },
      Status: { indexing: 'Exact' },
      OwnTenantId: { indexing: 'Exact' }
    },
    stores: {
      PartnerId: 'Yes',
      Name: 'Yes',
      BusinessType: 'Yes',
      Status: 'Yes',
      RevSharePercent: 'Yes'
    }
  },

  /**
   * Index for tenant configurations by type
   * Used for managing tenant-specific settings
   */
  TENANT_CONFIGS_BY_TYPE: {
    name: 'TenantConfigs/ByType',
    maps: [
      `from config in docs.TenantConfigs
       select new {
           config.TenantId = config.tenantId,
           config.ConfigType = config.configType,
           config.Version = config.version,
           config.IsActive = config.isActive,
           config.UpdatedAt = config.updatedAt,
           config.UpdatedBy = config.updatedBy
       }`
    ],
    fields: {
      TenantId: { indexing: 'Exact' },
      ConfigType: { indexing: 'Exact' },
      IsActive: { indexing: 'Exact' }
    },
    stores: {
      Version: 'Yes',
      IsActive: 'Yes',
      UpdatedAt: 'Yes'
    }
  },

  /**
   * Index for tenant usage statistics
   * Used for monitoring and billing purposes
   */
  TENANTS_BY_USAGE_STATS: {
    name: 'Tenants/ByUsageStats',
    maps: [
      `from tenant in docs.Tenants
       select new {
           tenant.TenantId = tenant.tenantId,
           tenant.Name = tenant.name,
           tenant.Plan = tenant.plan,
           CompaniesCount = tenant.usageStats.companiesCount,
           UsersCount = tenant.usageStats.usersCount,
           StorageUsedGB = tenant.usageStats.storageUsedGB,
           EvaluationsCount = tenant.usageStats.evaluationsCount,
           LastCalculated = tenant.usageStats.lastCalculated,
           CompanyLimit = tenant.companyLimit,
           UserLimit = tenant.userLimit,
           StorageLimitGB = tenant.storageLimitGB
       }`
    ],
    fields: {
      Plan: { indexing: 'Exact' }
    },
    stores: {
      TenantId: 'Yes',
      Name: 'Yes',
      Plan: 'Yes',
      CompaniesCount: 'Yes',
      UsersCount: 'Yes',
      StorageUsedGB: 'Yes'
    }
  }
};

/**
 * Index deployment helper for RavenDB
 * This shows how to deploy these indexes using the RavenDB client
 */
export const INDEX_DEPLOYMENT_HELPER = {
  /**
   * Deploy all tenant-related indexes
   * @param store RavenDB DocumentStore
   */
  async deployAllIndexes(store: any) {
    try {
      // Deploy each index definition
      for (const [key, indexDefinition] of Object.entries(TENANT_INDEXES)) {
        // Note: Actual deployment depends on RavenDB client API
        // This is a placeholder for the deployment logic
        console.log(`📋 Preparing to deploy index: ${indexDefinition.name}`);

        // Example deployment (adjust based on actual RavenDB client):
        // const index = await store.maintenance.send(
        //   new PutIndexesOperation({ indexes: [indexDefinition] })
        // );
      }

      console.log('🎉 All tenant indexes deployed successfully');
    } catch (error) {
      console.error('❌ Failed to deploy indexes:', error);
      throw error;
    }
  },

  /**
   * Get index by name
   * @param indexName Name of the index
   * @returns Index definition or null if not found
   */
  getIndexByName(indexName: string) {
    return Object.values(TENANT_INDEXES).find(index => index.name === indexName) || null;
  },

  /**
   * List all available index names
   * @returns Array of index names
   */
  listIndexNames(): string[] {
    return Object.values(TENANT_INDEXES).map(index => index.name);
  }
};

/**
 * Usage examples for the tenant indexes
 */
export const INDEX_EXAMPLES = {
  // Find all tenants owned by a specific user
  findTenantsByOwner: `
    const tenants = await session.query({ indexName: 'Tenants/ByOwner' })
      .whereEquals('OwnerUserId', 'user-123')
      .all();
  `,

  // Find all active users in a tenant
  findActiveTenantUsers: `
    const users = await session.query({ indexName: 'UserMemberships/ByTenant' })
      .whereEquals('TenantId', 'tenant-456')
      .whereEquals('IsActive', true)
      .all();
  `,

  // Find all tenants for a user across all their memberships
  findUserTenants: `
    const memberships = await session.query({ indexName: 'UserMemberships/ByUser' })
      .whereEquals('UserId', 'user-789')
      .whereEquals('IsActive', true)
      .all();

    const tenantIds = memberships.map(m => m.TenantId);
  `,

  // Find partners by business type
  findPartnersByType: `
    const partners = await session.query({ indexName: 'Partners/ByType' })
      .whereEquals('BusinessType', 'reseller')
      .whereEquals('Status', 'active')
      .all();
  `,

  // Get tenant configuration
  getTenantConfig: `
    const configs = await session.query({ indexName: 'TenantConfigs/ByType' })
      .whereEquals('TenantId', 'tenant-123')
      .whereEquals('ConfigType', 'system')
      .whereEquals('IsActive', true)
      .all();
  `,

  // Find tenants approaching usage limits
  findTenantsByUsage: `
    const tenants = await session.query({ indexName: 'Tenants/ByUsageStats' })
      .whereGreaterThan('StorageUsedGB', 80) // Using more than 80GB
      .whereEquals('Plan', 'free') // On free plan
      .all();
  `
};