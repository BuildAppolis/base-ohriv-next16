import { createDatabaseClient, RavenDBClient, withSession } from '../client';
import { getDatabaseConfig } from '../config';
import { clusterManager } from '../cluster';
import {
  TenantDocument,
  UserDocument,
  UserMembership,
  PartnerDocument,
  TenantConfigDocument
} from '../models';
import {
  TenantPlan,
  TenantStatus,
  PartnerBusinessType
} from '../models/enums/system';
import { TenantRole } from '../models/enums/user';

/**
 * Tenant Management Service
 * Handles tenant lifecycle, database provisioning, and user management
 */
export class TenantService {
  private managementClient: RavenDBClient | null = null;
  private tenantClients: Map<string, RavenDBClient> = new Map();

  constructor() {
    this.initializeManagementClient();
  }

  /**
   * Initialize the management database client
   * This database stores tenant metadata and handles authentication
   */
  private async initializeManagementClient(): Promise<void> {
    const config = getDatabaseConfig();
    this.managementClient = createDatabaseClient({
      ...config,
      database: 'ohriv-management' // Central management database
    });
    await this.managementClient.initialize();
  }

  /**
   * Create a new tenant
   * @param tenantData Tenant information
   * @returns Created tenant document
   */
  async createTenant(tenantData: {
    name: string;
    plan: TenantPlan;
    ownerUserId: string;
    ownerEmail: string;
    ownerName: string;
    settings?: any;
  }): Promise<TenantDocument> {
    if (!this.managementClient) {
      throw new Error('Management client not initialized');
    }

    return withSession(async (session) => {
      // Create tenant document
      const tenantId = `tenant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const databaseName = `tenant-${tenantId}`;

      const tenant: TenantDocument = {
        collection: 'tenants',
        id: `tenants/${tenantId}`,
        tenantId,
        name: tenantData.name,
        plan: tenantData.plan,
        status: TenantStatus.Active,
        databaseName,
        ownerUserId: tenantData.ownerUserId,
        ownerEmail: tenantData.ownerEmail,
        ownerName: tenantData.ownerName,
        companyLimit: this.getCompanyLimit(tenantData.plan),
        userLimit: this.getUserLimit(tenantData.plan),
        storageLimitGB: this.getStorageLimit(tenantData.plan),
        settings: tenantData.settings || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: tenantData.ownerUserId,
        usageStats: {
          companiesCount: 0,
          usersCount: 0,
          storageUsedGB: 0,
          evaluationsCount: 0,
          lastCalculated: new Date().toISOString()
        }
      };

      await session.store(tenant);

      // Provision tenant database
      await this.provisionTenantDatabase(tenantId, databaseName, tenantData.plan);

      return tenant;
    });
  }

  /**
   * Get tenant by ID
   * @param tenantId Tenant identifier
   * @returns Tenant document
   */
  async getTenant(tenantId: string): Promise<TenantDocument | null> {
    if (!this.managementClient) {
      throw new Error('Management client not initialized');
    }

    return withSession(async (session) => {
      return await session.load(`tenants/${tenantId}`);
    });
  }

  /**
   * Update tenant information
   * @param tenantId Tenant identifier
   * @param updates Fields to update
   * @returns Updated tenant document
   */
  async updateTenant(tenantId: string, updates: Partial<TenantDocument>): Promise<TenantDocument> {
    if (!this.managementClient) {
      throw new Error('Management client not initialized');
    }

    return withSession(async (session) => {
      const tenant = await session.load(`tenants/${tenantId}`) as TenantDocument;
      if (!tenant) {
        throw new Error(`Tenant ${tenantId} not found`);
      }

      Object.assign(tenant, updates);
      tenant.updatedAt = new Date().toISOString();

      await session.saveChanges();
      return tenant;
    });
  }

  /**
   * Delete a tenant and its database
   * @param tenantId Tenant identifier
   */
  async deleteTenant(tenantId: string): Promise<void> {
    if (!this.managementClient) {
      throw new Error('Management client not initialized');
    }

    // Get tenant info for database name
    const tenant = await this.getTenant(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    // Delete tenant database
    await this.deleteTenantDatabase(tenant.databaseName);

    // Delete tenant from management database
    return withSession(async (session) => {
      session.delete(`tenants/${tenantId}`);
      await session.saveChanges();
    });
  }

  /**
   * Get tenant database client
   * @param tenantId Tenant identifier
   * @returns RavenDB client for tenant's database
   */
  async getTenantClient(tenantId: string): Promise<RavenDBClient> {
    // Check if client already exists in cache
    if (this.tenantClients.has(tenantId)) {
      return this.tenantClients.get(tenantId)!;
    }

    // Get tenant information
    const tenant = await this.getTenant(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    // Create client for tenant database
    const clusterConfig = clusterManager.getCurrentClusterConfig();
    const client = createDatabaseClient({
      urls: clusterConfig.nodes.map((node: any) => node.url),
      database: tenant.databaseName,
      enableOptimisticConcurrency: true,
      maxNumberOfRequestsPerSession: 30
    });

    await client.initialize();

    // Cache the client
    this.tenantClients.set(tenantId, client);

    return client;
  }

  /**
   * Add user to tenant
   * @param tenantId Tenant identifier
   * @param userData User data
   * @param role User role in tenant
   * @returns User membership document
   */
  async addUserToTenant(
    tenantId: string,
    userData: {
      userId: string;
      email: string;
      name: string;
    },
    role: TenantRole
  ): Promise<UserMembership> {
    const membership: UserMembership = {
      userId: userData.userId,
      tenantId,
      role,
      scopes: this.getDefaultScopesForRole(role),
      invitedBy: 'system',
      invitedAt: new Date().toISOString(),
      acceptedAt: new Date().toISOString(),
      isActive: true
    };

    // Add membership to tenant database
    const tenantClient = await this.getTenantClient(tenantId);
    return withSession(async (session) => {
      session.store(membership, `memberships/${userData.userId}-${tenantId}`);
      await session.saveChanges();
      return membership;
    });
  }

  /**
   * Remove user from tenant
   * @param tenantId Tenant identifier
   * @param userId User identifier
   */
  async removeUserFromTenant(tenantId: string, userId: string): Promise<void> {
    const tenantClient = await this.getTenantClient(tenantId);
    return withSession(async (session) => {
      session.delete(`memberships/${userId}-${tenantId}`);
      await session.saveChanges();
    });
  }

  /**
   * Get user's tenant memberships
   * @param userId User identifier
   * @returns Array of tenant memberships
   */
  async getUserMemberships(userId: string): Promise<UserMembership[]> {
    if (!this.managementClient) {
      throw new Error('Management client not initialized');
    }

    return withSession(async (session) => {
      const memberships = await session
        .query({ collection: 'memberships' })
        .whereEquals('userId', userId)
        .whereEquals('isActive', true)
        .all();

      return memberships as UserMembership[];
    });
  }

  /**
   * Get all tenants for a user
   * @param userId User identifier
   * @returns Array of tenant IDs
   */
  async getUserTenants(userId: string): Promise<string[]> {
    const memberships = await this.getUserMemberships(userId);
    return memberships.map(m => m.tenantId);
  }

  /**
   * Create partner
   * @param partnerData Partner information
   * @returns Created partner document
   */
  async createPartner(partnerData: {
    name: string;
    tenantId: string; // Partner's own tenant
    businessType: PartnerBusinessType;
    contactInfo: any;
  }): Promise<PartnerDocument> {
    if (!this.managementClient) {
      throw new Error('ManagementClient not initialized');
    }

    return withSession(async (session) => {
      const partnerId = `partner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const partner: PartnerDocument = {
        collection: 'partners',
        id: `partners/${partnerId}`,
        partnerId,
        name: partnerData.name,
        status: 'pending',
        ownTenantId: partnerData.tenantId,
        customerTenantIds: [],
        businessType: partnerData.businessType,
        contactInfo: partnerData.contactInfo,
        revSharePercent: 10, // Default 10% revenue share
        commissionStructure: {
          signupBonus: 0,
          monthlyRecurring: 0
        },
        capabilities: [],
        certifications: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: partnerData.tenantId,
        performanceMetrics: {
          customersCount: 0,
          totalRevenue: 0,
          satisfactionScore: 0,
          lastUpdated: new Date().toISOString()
        }
      };

      await session.store(partner);
      return partner;
    });
  }

  /**
   * Get partner by ID
   * @param partnerId Partner identifier
   * @returns Partner document
   */
  async getPartner(partnerId: string): Promise<PartnerDocument | null> {
    if (!this.managementClient) {
      throw new Error('Management client not initialized');
    }

    return withSession(async (session) => {
      return await session.load(`partners/${partnerId}`);
    });
  }

  /**
   * Provision a new tenant database
   * @param tenantId Tenant identifier
   * @param databaseName Database name
   * @param plan Tenant plan
   */
  private async provisionTenantDatabase(
    tenantId: string,
    databaseName: string,
    plan: 'free' | 'standard' | 'enterprise'
  ): Promise<void> {
    // For production, this would create the database through the cluster
    // For development, the database is automatically created on first access

    const clusterConfig = clusterManager.getCurrentClusterConfig();
    const client = createDatabaseClient({
      urls: clusterConfig.nodes.map((node: any) => node.url),
      database: databaseName,
      enableOptimisticConcurrency: true,
      maxNumberOfRequestsPerSession: 30
    });

    await client.initialize();

    // Set up initial configuration
    await this.setupTenantDatabase(client, tenantId, plan);
  }

  /**
   * Set up tenant database with initial configuration
   * @param client Database client
   * @param tenantId Tenant identifier
   * @param plan Tenant plan
   */
  private async setupTenantDatabase(
    client: RavenDBClient,
    tenantId: string,
    plan: string
  ): Promise<void> {
    const session = await client.openSession();
  try {
    // Store tenant configuration in tenant database
    const config: TenantConfigDocument = {
      collection: 'tenant-configs',
      id: `tenant-configs/${tenantId}`,
      tenantId,
      configType: 'system',
      config: {
        plan,
        features: this.getFeaturesForPlan(plan as 'free' | 'standard' | 'enterprise'),
        limits: {
          companies: this.getCompanyLimit(plan as 'free' | 'standard' | 'enterprise'),
          users: this.getUserLimit(plan as 'free' | 'standard' | 'enterprise'),
          storage: this.getStorageLimit(plan as 'free' | 'standard' | 'enterprise'),
        },
        version: 1,
        isActive: true,
      },
      version: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: 'system',
      updatedAt: new Date().toISOString(),
      changeHistory: []
    };

    await session.store(config);
    await session.saveChanges();
  } finally {
    session.dispose();
  }
  }

  /**
   * Delete tenant database
   * @param databaseName Database name
   */
  private async deleteTenantDatabase(databaseName: string): Promise<void> {
    // In production, this would use the cluster API to drop the database
    // For development, we would clean up the client cache
    this.tenantClients.clear();
  }

  /**
   * Get company limit based on plan
   */
  private getCompanyLimit(plan: 'free' | 'standard' | 'enterprise'): number {
    switch (plan) {
      case 'free': return 1;
      case 'standard': return 5;
      case 'enterprise': return 50;
      default: return 1;
    }
  }

  /**
   * Get user limit based on plan
   */
  private getUserLimit(plan: 'free' | 'standard' | 'enterprise'): number {
    switch (plan) {
      case 'free': return 5;
      case 'standard': return 25;
      case 'enterprise': return 500;
      default: return 5;
    }
  }

  /**
   * Get storage limit based on plan
   */
  private getStorageLimit(plan: 'free' | 'standard' | 'enterprise'): number {
    switch (plan) {
      case 'free': return 10;
      case 'standard': return 100;
      case 'enterprise': return 1000;
      default: return 10;
    }
  }

  /**
   * Get features enabled for plan
   */
  private getFeaturesForPlan(plan: 'free' | 'standard' | 'enterprise'): Record<string, boolean> {
    const baseFeatures = {
      basicRecruitment: true,
      evaluations: true,
      reports: true,
    };

    switch (plan) {
      case 'free':
        return {
          ...baseFeatures,
          aiEvaluation: false,
          advancedAnalytics: false,
          customWorkflows: false,
          apiAccess: false,
          sso: false,
          prioritySupport: false,
        };
      case 'standard':
        return {
          ...baseFeatures,
          aiEvaluation: true,
          advancedAnalytics: false,
          customWorkflows: false,
          apiAccess: false,
          sso: true,
          prioritySupport: false,
        };
      case 'enterprise':
        return {
          ...baseFeatures,
          aiEvaluation: true,
          advancedAnalytics: true,
          customWorkflows: true,
          apiAccess: true,
          sso: true,
          prioritySupport: true,
          dedicatedInfrastructure: true,
          customIntegrations: true,
        };
      default:
        return baseFeatures;
    }
  }

  /**
   * Get default scopes for role
   */
  private getDefaultScopesForRole(role: string): string[] {
    const roleScopes: Record<string, string[]> = {
      owner: ['*'],
      admin: ['users', 'companies', 'jobs', 'reports', 'settings'],
      recruiter: ['candidates', 'jobs', 'applications', 'interviews'],
      interviewer: ['evaluations', 'candidates'],
      viewer: ['read'],
      partner_manager: ['customers', 'reports', 'analytics'],
    };

    return roleScopes[role] || ['read'];
  }

  /**
   * Close all database connections
   */
  async close(): Promise<void> {
    // Close tenant clients
    for (const client of this.tenantClients.values()) {
      await client.dispose();
    }
    this.tenantClients.clear();

    // Close management client
    if (this.managementClient) {
      await this.managementClient.dispose();
      this.managementClient = null;
    }
  }
}