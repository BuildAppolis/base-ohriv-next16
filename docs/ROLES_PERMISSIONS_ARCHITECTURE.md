# 🔐 Roles & Permissions Architecture
## Multi-Tenant RBAC with Stack Auth Integration

---

## 🎯 **Executive Overview**

```
🌐 Stack Auth Teams → Ohriv Platform → Role Hierarchy → Granular Permissions
│
├── System Roles: Platform Owner, Super Admin, Partner Manager, Standard User
├── Tenant Roles: Owner, Admin, User, Viewer
├── Company Roles: Admin, Manager, Member, Evaluator
└── Permission Flags: 200+ granular permissions (resource:action:scope)
```

### **Design Philosophy:**
- **Stack Auth handles identity** (authentication, team membership)
- **Ohriv handles authorization** (roles, permissions, business logic)
- **Hierarchical permissions** inherit from top to bottom
- **Granular controls** allow precise access management
- **Scalable design** supports staffing agencies with 100+ companies

---

## 🏗️ **1. Role Hierarchy Architecture**

### **Level 1: System Roles (Platform-Wide)**
```
🔧 Platform Owner (platform_owner)
├── Scope: Entire Ohriv platform
├── Appointed by: System founders
├── Responsibilities:
│   ├── Platform strategy & vision
│   ├── Partner relationships
│   ├── Platform-level configuration
│   ├── Revenue & growth metrics
│   └── System-wide compliance
└── Default Permissions: system.* (ALL platform permissions)

🛡️ Super Admin (super_admin)
├── Scope: Entire Ohriv platform
├── Appointed by: Platform Owner
├── Responsibilities:
│   ├── Technical operations
│   ├── System monitoring & health
│   ├── Tenant onboarding & support
│   ├── Platform security
│   └── Performance optimization
└── Default Permissions: system.tenants.*, system.monitor, system.configure

🤝 Partner Manager (partner_manager)
├── Scope: Assigned partner portfolio
├── Appointed by: Platform Owner/Super Admin
├── Responsibilities:
│   ├── Partner success management
│   ├── Portfolio performance
│   ├── Partner training & support
│   ├── Revenue growth for partners
│   └── Partner compliance
└── Default Permissions: partner.*, system.tenants.view

👤 Standard User (standard_user)
├── Scope: Personal access only
├── Default role for all new users
├── Responsibilities:
│   ├── Personal profile management
│   ├── Assigned job functions
│   └── Collaboration within permissions
└── Default Permissions: user.edit:own, basic platform access
```

### **Level 2: Tenant Roles (Organization-Wide)**
```
🏢 Tenant Owner (tenant:owner)
├── Scope: Entire tenant (all companies)
├── Appointed by: System roles during tenant creation
├── Responsibilities:
│   ├── Tenant configuration & settings
│   ├── Company creation & management
│   ├── User invitations & role assignments
│   ├── Billing & subscription management
│   └── Compliance & governance
└── Default Permissions: tenant.*, company.* (all companies in tenant)

👥 Tenant Admin (tenant:admin)
├── Scope: Entire tenant (all companies)
├── Appointed by: Tenant Owner
├── Responsibilities:
│   ├── User management & permissions
│   ├── Company operations oversight
│   ├── Process configuration
│   ├── Analytics & reporting
│   └── Day-to-day administration
└── Default Permissions: tenant.users.*, tenant.companies.*, tenant.analytics.*

👥 Tenant User (tenant:user)
├── Scope: Assigned companies only
├── Appointed by: Tenant Owner/Admin
├── Responsibilities:
│   ├── Work within assigned companies
│   ├── Collaboration on projects
│   ├── Candidate evaluation (if assigned)
│   └── Basic tenant functions
└── Default Permissions: company.view:assigned, job.view:assigned, candidate.*:assigned

👀 Tenant Viewer (tenant:viewer)
├── Scope: Read-only access to tenant
├── Appointed by: Tenant Owner/Admin
├── Responsibilities:
│   ├── View-only access to reports
│   ├── Audit compliance
│   └── Information consumption
└── Default Permissions: tenant.view:*, company.view:*, analytics.view:* (read-only)
```

### **Level 3: Company Roles (Location-Specific)**
```
🏢 Company Admin (company:admin)
├── Scope: Single company
├── Appointed by: Tenant Owner/Admin
├── Responsibilities:
│   ├── Company settings & configuration
│   ├── Job creation & management
│   ├── Team invitations & role assignments
│   ├── Company-specific workflows
│   └── Local compliance
└── Default Permissions: company.manage:assigned, job.*:assigned, user.*:assigned

👨‍💼 Company Manager (company:manager)
├── Scope: Single company
├── Appointed by: Company Admin/Tenant Admin
├── Responsibilities:
│   ├── Job posting & management
│   ├── Candidate pipeline management
│   ├── Interview coordination
│   ├── Team coordination
│   └── Performance tracking
└── Default Permissions: job.create:assigned, job.edit:assigned, candidate.*:assigned

👥 Company Member (company:member)
├── Scope: Single company
├── Appointed by: Company Admin/Manager
├── Responsibilities:
│   ├── Candidate screening
│   ├── Interview participation
│   ├── Evaluation completion
│   ├── Collaboration
│   └── Daily recruiting tasks
└── Default Permissions: candidate.view:assigned, evaluation.score:assigned, job.view:assigned

🔍 Company Evaluator (company:evaluator)
├── Scope: Single company (interviewer-specific)
├── Appointed by: Company Admin/Manager
├── Responsibilities:
│   ├── Technical evaluations
│   ├── Candidate interviews
│   ├── Scoring & feedback
│   ├── Calibration participation
│   └── Quality assurance
└── Default Permissions: evaluation.*:assigned, candidate.view:assigned, interview.scheduling
```

---

## 📊 **2. Permission Matrix**

### **Permission Format: `resource:action:scope`**

```
Resource Types:
├── system*       - Platform-level operations
├── tenant*       - Organization operations
├── company*      - Company-specific operations
├── job*          - Job posting operations
├── candidate*    - Candidate management
├── evaluation*   - Assessment & scoring
├── analytics*    - Reports & insights
├── user*         - User management
├── integration*  - Third-party connections
├── report*       - Custom reports
├── communication* - Messaging & notifications
└── partner*      - Partner-specific operations

Action Types:
├── *             - All actions
├── create        - Create new resources
├── view          - Read access
├── edit          - Modify existing
├── delete        - Remove resources
├── manage        - Full control
├── publish       - Make public/live
├── archive       - Deactivate but keep
├── assign        - Grant to others
├── score         - Evaluate/rate
├── export        - Download data
├── invite        - Add users
└── configure     - Settings

Scope Types:
├── *             - All resources everywhere
├── all           - All resources in context
├── assigned      - Only assigned resources
├── own           - Only created by user
└── [company_id]  - Specific company
```

### **Role Permission Matrix**

| Role Category | System | Tenant | Companies | Jobs | Candidates | Evaluations | Analytics |
|---------------|--------|--------|-----------|------|------------|-------------|-----------|
| **Platform Owner** | `system.*` | — | — | — | — | — | `analytics.*` |
| **Super Admin** | `system.monitor`<br>`system.configure`<br>`system.tenants.*` | — | — | — | — | — | `analytics.view:*` |
| **Partner Manager** | — | — | — | — | — | — | `partner.analytics.*` |
| **Tenant Owner** | — | `tenant.*` | `company.*` | `job.*` | `candidate.*` | `evaluation.*` | `analytics.*` |
| **Tenant Admin** | — | `tenant.users.*`<br>`tenant.companies.*` | `company.view:*` | `job.view:*` | `candidate.view:*` | `evaluation.view:*` | `analytics.*` |
| **Tenant User** | — | `tenant.view` | `company.view:assigned` | `job.view:assigned` | `candidate.*:assigned` | `evaluation.*:assigned` | `analytics.view:assigned` |
| **Tenant Viewer** | — | `tenant.view` | `company.view:*` | `job.view:*` | `candidate.view:*` | `evaluation.view:*` | `analytics.view:*` |
| **Company Admin** | — | — | `company.manage:assigned` | `job.*:assigned` | `candidate.*:assigned` | `evaluation.*:assigned` | `analytics.view:assigned` |
| **Company Manager** | — | — | `company.view:assigned` | `job.*:assigned` | `candidate.*:assigned` | `evaluation.assign` | `analytics.view:assigned` |
| **Company Member** | — | — | `company.view:assigned` | `job.view:assigned` | `candidate.*:assigned` | `evaluation.score:assigned` | — |
| **Company Evaluator** | — | — | `company.view:assigned` | `job.view:assigned` | `candidate.view:assigned` | `evaluation.*:assigned` | — |

---

---

## 🔄 **3. Stack Auth Integration**

### **Custom Metadata Structure**

Stack Auth provides three types of metadata for storing custom data:

```typescript
// Team Metadata (Server-side only - maps team → tenant)
interface TeamMetadata {
  ohrivTenantId: string;
  tenantMode: "staffing_agency" | "single_company";
  maxCompanies: number;
  settings: {
    allowCrossCompanyAccess: boolean;
    defaultPermissions: string[];
  };
}

// User Metadata (Server-side only - stores Ohriv roles)
interface UserMetadata {
  ohrivSystemRole?: SystemRole;           // Platform role
  ohrivTenantRole?: TenantRole;           // Tenant role
  ohrivCompanyRoles: CompanyRoleAssignment[];  // Multi-company support
  permissionOverrides: PermissionOverride[]; // Custom permissions
  preferences: {
    defaultCompanyId?: string;
    emailNotifications: boolean;
    theme: "light" | "dark";
  };
}

// Client read-only metadata (for UI)
interface ClientReadOnlyMetadata {
  tenantId: string;
  tenantName: string;
  selectedCompanies: string[];
  permissions: string[]; // Effective permissions calculated by backend
}
```

### **Setting Up Team → Tenant Mapping**

```typescript
// When creating a tenant
await stackServerApp.updateTeam({
  teamId: "team_andela_xyz789",
  serverMetadata: {
    ohrivTenantId: "tenant-andela",
    tenantMode: "staffing_agency",
    maxCompanies: 25,
    settings: {
      allowCrossCompanyAccess: true,
      defaultPermissions: [
        "company.view:*",
        "job.view:*",
        "candidate.view:*"
      ]
    }
  }
});
```

### **Assigning Roles to Users**

```typescript
// When assigning a user to a role
await stackServerApp.updateUser({
  userId: "user_sarah_chen",
  serverMetadata: {
    ohrivSystemRole: undefined, // Could be "platform_owner", etc.
    ohrivTenantRole: "tenant:admin",
    ohrivCompanyRoles: [
      {
        companyId: "companies/microsoft-redmond",
        role: "company:admin",
        assignedAt: new Date().toISOString()
      },
      {
        companyId: "companies/tesla-palo-alto",
        role: "company:admin",
        assignedAt: new Date().toISOString()
      }
    ],
    permissionOverrides: [
      {
        permission: "candidate.delete:all",
        granted: true,
        scope: "companies/microsoft-redmond",
        reason: "Special access for cleanup",
        grantedBy: "user_elon_musk",
        grantedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
});
```

### **Permission Resolution Flow**

```typescript
// Updated to use Stack Auth metadata
async function resolvePermissions(stackAuthUser: StackAuthUser): Promise<PermissionSet> {
  // 1. Get Stack Auth user with all metadata
  const user = await stackServerApp.getUser({
    userId: stackAuthUser.id
  });

  // 2. Get team metadata for tenant mapping
  const team = await stackServerApp.getTeam({
    teamId: user.selectedTeamId
  });

  const tenantId = team.serverMetadata?.ohrivTenantId;

  // 3. Extract Ohriv-specific data from user metadata
  const systemRole = user.serverMetadata?.ohrivSystemRole;
  const tenantRole = user.serverMetadata?.ohrivTenantRole;
  const companyRoles = user.serverMetadata?.ohrivCompanyRoles || [];
  const permissionOverrides = user.serverMetadata?.permissionOverrides || [];

  // 4. Resolve permissions based on roles
  const systemPermissions = systemRole
    ? getSystemRolePermissions(systemRole)
    : [];

  const tenantPermissions = tenantRole && tenantId
    ? getTenantRolePermissions(tenantRole, tenantId)
    : [];

  const companyPermissions = await Promise.all(
    companyRoles.map(async (cr) =>
      getCompanyRolePermissions(cr.role, cr.companyId)
    )
  );

  // 5. Apply permission overrides
  const overridePermissions = permissionOverrides
    .filter(po => po.granted)
    .map(po => po.permission);

  return {
    permissions: unique([
      ...systemPermissions,
      ...tenantPermissions,
      ...companyPermissions.flat(),
      ...overridePermissions
    ]),
    context: {
      tenantId,
      systemRole,
      tenantRole,
      companyRoles,
      userId: user.id
    }
  };
}
```

### **Stack Auth SDK Usage**

```typescript
// Client-side: Get user with hooks
import { useUser } from '@stackframe/stack';

function UserProfile() {
  const user = useUser();

  // Update client read-only metadata after role changes
  const updateClientMetadata = async (permissions: string[]) => {
    if (user) {
      await user.update({
        clientReadOnlyMetadata: {
          tenantId: user.serverMetadata?.ohrivTenantId || '',
          tenantName: user.displayName || '',
          selectedCompanies: user.serverMetadata?.ohrivCompanyRoles?.map(cr => cr.companyId) || [],
          permissions
        }
      });
    }
  };

  return (
    <div>
      <h1>Welcome, {user?.displayName}!</h1>
      <p>Current permissions: {user?.clientReadOnlyMetadata?.permissions.join(', ')}</p>
    </div>
  );
}

// Server-side: API middleware
import { stackServerApp } from '@/stack';

export async function GET(req: Request) {
  // Get authenticated user
  const user = await stackServerApp.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Resolve permissions
  const permissions = await resolvePermissions(user);

  // Update client metadata for next request
  await user.update({
    clientReadOnlyMetadata: {
      tenantId: user.serverMetadata?.ohrivTenantId || '',
      tenantName: user.displayName || '',
      selectedCompanies: user.serverMetadata?.ohrivCompanyRoles?.map(cr => cr.companyId) || [],
      permissions: permissions.permissions
    }
  });

  return Response.json({
    user: {
      id: user.id,
      email: user.primaryEmail,
      displayName: user.displayName,
      selectedTeamId: user.selectedTeamId
    },
    permissions
  });
}
```

---

## 🌐 **4. Real-World Scenarios**

### **Scenario 1: Staffing Agency - "Andela Talent Solutions"**

```
🏢 Organization: Andela (Staffing Agency)
├── Stack Auth Team: "Andela Talent Solutions"
├── Ohriv Tenant: tenant-andela
├── Client Companies: 25 (Microsoft, Tesla, SpaceX, etc.)
└── Team Members: 85 shared across all companies

👤 Sarah Chen - Senior Account Manager
├── System Role: (none)
├── Tenant Role: tenant:admin
├── Company Roles:
│   ├── Microsoft: company:admin
│   ├── Tesla: company:admin
│   ├── SpaceX: company:admin
│   └── 22 other companies: company:admin
├── Effective Permissions:
│   ├── tenant.companies.* (manage all client companies)
│   ├── company.manage:* (full access to all 25 companies)
│   ├── job.create:* (post jobs for any client)
│   ├── candidate.email:* (contact candidates for any client)
│   └── analytics.view:* (view performance across all clients)
└── Daily Workflow:
    ├── Switch between companies instantly (no re-auth)
    ├── Create jobs for multiple clients
    ├── View unified pipeline across all companies
    ├── Generate cross-company reports
    └── Manage shared recruiter team

👨‍💼 Alex Rodriguez - Technical Recruiter
├── System Role: (none)
├── Tenant Role: tenant:user
├── Company Roles:
│   ├── Microsoft: company:member
│   ├── Tesla: company:member
│   ├── SpaceX: company:member
│   └── 22 other companies: company:member
├── Effective Permissions:
│   ├── company.view:assigned (view all 25 companies)
│   ├── job.view:assigned (see jobs from all clients)
│   ├── candidate.*:assigned (work with all candidates)
│   ├── evaluation.score:assigned (evaluate candidates)
│   └── analytics.view:assigned (see own performance)
└── Daily Workflow:
    ├── 9:00 AM - Screen candidates for Microsoft
    ├── 10:00 AM - Interview with Tesla candidate
    ├── 11:00 AM - Submit shortlist to SpaceX
    ├── 2:00 PM - Client call with Stripe
    ├── 3:00 PM - Schedule interviews for Microsoft
    └── 4:00 PM - Review feedback from SpaceX
```

### **Scenario 2: Single Company - "Tesla Motors"**

```
🏢 Organization: Tesla Motors
├── Stack Auth Team: "Tesla Engineering"
├── Ohriv Tenant: tenant-tesla
├── Companies: 1 (Tesla - Palo Alto)
└── Team Members: 150

👤 Elon Musk - CEO
├── System Role: (none)
├── Tenant Role: tenant:owner
├── Company Roles: Tesla: company:admin
├── Effective Permissions:
│   ├── tenant.* (full control over Tesla tenant)
│   ├── company.manage:assigned (full Tesla control)
│   ├── billing.manage (subscription management)
│   └── analytics.predictions (AI insights)
└── Daily Workflow:
    ├── Review company-wide hiring metrics
    ├── Approve senior-level offers
    ├── View recruitment costs vs ROI
    └── Strategic workforce planning

👨‍🔬 James Park - Senior Software Engineer (Interviewer)
├── System Role: (none)
├── Tenant Role: tenant:user
├── Company Roles: Tesla: company:evaluator
├── Effective Permissions:
│   ├── company.view:assigned (Tesla only)
│   ├── job.view:assigned (see open positions)
│   ├── candidate.view:assigned (assigned candidates only)
│   ├── evaluation.*:assigned (full evaluation permissions)
│   └── interview.scheduling (manage interview calendar)
└── Daily Workflow:
    ├── Review candidate applications
    ├── Conduct technical interviews
    ├── Submit detailed evaluations
    ├── Participate in calibration sessions
    └── Provide feedback on process improvement
```

### **Scenario 3: Platform Partner - "Recruiting Pro Inc"**

```
🏢 Organization: Recruiting Pro Inc (Platform Partner)
├── System Role: partner_manager
├── Managed Tenants: 50 (client companies)
├── Total Users: 500+ across all tenants
└── Services: White-glove recruiting platform management

👤 Michael Davis - Partner Success Manager
├── System Role: partner_manager
├── Tenant Access: View-only to 50 client tenants
├── Special Permissions:
│   ├── partner.tenants.view (see client health)
│   ├── partner.clients.manage (client relationships)
│   ├── system.tenants.view (platform overview)
│   └── analytics.predictions (client insights)
└── Daily Workflow:
    ├── Monitor client platform usage
    ├── Identify at-risk accounts
    ├── Schedule check-in calls
    ├── Provide best practices consulting
    └── Escalate issues to support team
```

---

## 💾 **5. Implementation Details**

### **Document Structure**

```typescript
// User Document - Stores permissions and roles
interface UserDocument {
  id: string;                    // "users/sarah-chen-123"
  email: string;                 // "sarah@andela.com"
  name: string;                  // "Sarah Chen"

  // Stack Auth integration
  stackAuthTeamId: string;       // "team_andela_xyz789"
  stackAuthUserId: string;       // "auth_user_abc123"

  // System-level role
  systemRole?: SystemRole;       // undefined for most users

  // Tenant membership
  tenantId: string;              // "tenant-andela"
  tenantRole: TenantRole;        // "tenant:admin"

  // Company assignments (multi-company support)
  companyRoles: CompanyRoleAssignment[];

  // Custom permission overrides
  permissionOverrides?: PermissionOverride[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  status: UserStatus;
}

interface CompanyRoleAssignment {
  companyId: string;             // "companies/microsoft-redmond"
  companyName: string;           // "Microsoft - Redmond"
  role: CompanyRole;             // "company:admin"
  assignedAt: Date;
  assignedBy: string;            // User ID who assigned
  permissions?: string[];        // Additional custom permissions
}

interface PermissionOverride {
  permission: string;            // "candidate.delete:all"
  granted: boolean;              // true = grant, false = deny
  scope?: string;                // company ID or other scope
  reason?: string;               // Audit trail
  grantedBy: string;             // User ID who granted override
  grantedAt: Date;
  expiresAt?: Date;              // Temporary permissions
}

// Tenant Document - Stores tenant-wide configuration
interface TenantDocument {
  id: string;                    // "tenants/andela"
  name: string;                  // "Andela Talent Solutions"
  mode: "staffing_agency" | "single_company";

  // Stack Auth integration
  stackAuthTeamId: string;       // "team_andela_xyz789"

  // Permission configuration
  defaultPermissions: {
    [TenantRole.Owner]: string[];
    [TenantRole.Admin]: string[];
    [TenantRole.User]: string[];
    [TenantRole.Viewer]: string[];
  };

  // Custom roles (if needed)
  customRoles?: Record<string, {
    name: string;
    permissions: string[];
    description: string;
  }>;

  // Company management
  maxCompanies: number;
  sharedTeamPool: boolean;

  metadata: TenantMetadata;
}
```

### **Permission Checking Implementation**

```typescript
// Permission checking service
class PermissionService {
  async hasPermission(
    userId: string,
    permission: string,
    context?: {
      companyId?: string;
      tenantId?: string;
      resourceId?: string;
    }
  ): Promise<boolean> {
    const user = await this.session.load<UserDocument>(userId);

    // 1. Check system permissions (highest priority)
    if (user.systemRole) {
      const systemPerms = await this.getSystemRolePermissions(user.systemRole);
      if (this.matchesPermission(systemPerms, permission, 'system')) {
        return true;
      }
    }

    // 2. Check tenant permissions
    const tenantPerms = await this.getTenantPermissions(
      user.tenantId,
      user.tenantRole
    );
    if (this.matchesPermission(tenantPerms, permission, 'tenant')) {
      return true;
    }

    // 3. Check company-specific permissions
    if (context?.companyId) {
      const companyRole = user.companyRoles.find(
        cr => cr.companyId === context.companyId
      );

      if (companyRole) {
        const companyPerms = await this.getCompanyRolePermissions(
          companyRole.role,
          context.companyId
        );
        if (this.matchesPermission(companyPerms, permission, 'company')) {
          return true;
        }
      }
    }

    // 4. Check permission overrides
    if (user.permissionOverrides) {
      for (const override of user.permissionOverrides) {
        if (override.permission === permission) {
          return override.granted;
        }
      }
    }

    return false;
  }

  private matchesPermission(
    permissions: string[],
    requested: string,
    scope: string
  ): boolean {
    // Check for exact match
    if (permissions.includes(requested)) {
      return true;
    }

    // Check for wildcard permissions
    const [resource, action, scope] = requested.split(':');

    // Check for resource wildcard
    if (permissions.includes(`${resource}:*`)) {
      return true;
    }

    // Check for all wildcard
    if (permissions.includes('*')) {
      return true;
    }

    // Check for resource:action:*
    const resourceAction = `${resource}:${action}:*`;
    if (permissions.includes(resourceAction)) {
      return true;
    }

    return false;
  }
}
```

### **Middleware Implementation**

```typescript
// Express middleware for permission checking
export function requirePermission(permission: string, scope?: 'company' | 'tenant') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user; // Set by auth middleware
      const context = {
        companyId: req.params.companyId,
        tenantId: req.params.tenantId || user.tenantId,
        resourceId: req.params.id
      };

      const hasPermission = await permissionService.hasPermission(
        user.id,
        permission,
        context
      );

      if (!hasPermission) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          required: permission,
          context
        });
      }

      // Add permissions to request for UI features
      req.permissions = await permissionService.getUserPermissions(user.id);

      next();
    } catch (error) {
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

// Usage examples
app.get('/api/companies',
  requireAuth,
  requirePermission('company.view:all')
);

app.post('/api/companies/:companyId/jobs',
  requireAuth,
  requirePermission('job.create:assigned', 'company')
);

app.delete('/api/users/:userId',
  requireAuth,
  requirePermission('user.delete:all')
);
```

---

## 📊 **6. Analytics & Auditing**

### **Permission Analytics**

```typescript
// Track permission usage for security auditing
interface PermissionUsageMetrics {
  userId: string;
  permission: string;
  resource: string;
  action: string;
  scope: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  failureReason?: string;
}

class PermissionAnalytics {
  async trackUsage(
    userId: string,
    permission: string,
    context: PermissionContext,
    result: 'success' | 'denied'
  ) {
    await this.session.store({
      userId,
      permission,
      resource: context.resource,
      action: context.action,
      scope: context.scope,
      timestamp: new Date(),
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      success: result === 'success',
      failureReason: result === 'denied' ? context.reason : undefined
    }, 'permission-usage/');
  }

  async generateReport(
    filters: {
      dateRange: { start: Date; end: Date };
      userId?: string;
      permission?: string;
      result?: 'success' | 'denied';
    }
  ) {
    const query = this.session
      .query<PermissionUsageMetrics>({ indexName: 'PermissionUsage' })
      .whereLessThanOrEqual('timestamp', filters.dateRange.end)
      .whereGreaterThanOrEqual('timestamp', filters.dateRange.start);

    if (filters.userId) {
      query.whereEquals('userId', filters.userId);
    }

    if (filters.permission) {
      query.whereEquals('permission', filters.permission);
    }

    if (filters.result) {
      query.whereEquals('success', filters.result === 'success');
    }

    return await query.toList();
  }
}
```

---

## 🎯 **7. Best Practices & Guidelines**

### **Permission Design Principles**

1. **Principle of Least Privilege**
   - Grant minimum permissions necessary for job function
   - Start with restrictive permissions, expand as needed
   - Regular audits to remove unused permissions

2. **Role-Based Access Control (RBAC)**
   - Use roles for permission groups
   - Avoid assigning individual permissions directly
   - Create roles based on job functions, not people

3. **Separation of Duties**
   - Critical operations require multiple people
   - No single user should have end-to-end control
   - Implement approval workflows for sensitive actions

4. **Permission Inheritance**
   - Higher-level permissions include lower-level ones
   - Tenant permissions apply to all companies in tenant
   - System permissions override all other restrictions

### **Implementation Guidelines**

```typescript
// DO: Use specific permissions
const canDeleteJob = await hasPermission(userId, 'job.delete:assigned', {
  companyId: job.companyId
});

// DON'T: Use wildcard permissions for UI checks
const hasAccess = await hasPermission(userId, '*'); // Too broad

// DO: Check permissions at multiple layers
// 1. UI level (hide/disable features)
// 2. API level (enforce permissions)
// 3. Database level (row-level security)

// DO: Log all permission checks for audit
await permissionService.trackUsage(userId, permission, context, result);

// DO: Use role-based permission assignment
await assignRole(userId, 'company:admin', companyId);

// DON'T: Assign individual permissions directly
await grantPermission(userId, 'job.create:123'); // Hard to maintain
```

---

## 📋 **8. Summary**

This role and permissions architecture provides:

1. **Comprehensive Coverage**
   - 4 system roles for platform management
   - 4 tenant roles for organization control
   - 4 company roles for location-specific access
   - 200+ granular permission flags

2. **Stack Auth Integration**
   - Seamless authentication integration
   - Custom role mapping
   - Multi-company support beyond Stack Auth limits

3. **Scalability**
   - Supports staffing agencies with 100+ companies
   - Efficient permission checking
   - Auditable and compliant

4. **Flexibility**
   - Custom permission overrides
   - Role inheritance
   - Context-aware permissions

5. **Security**
   - Principle of least privilege
   - Comprehensive auditing
   - Permission analytics

The system leverages Stack Auth for authentication while providing a sophisticated authorization layer that handles complex multi-tenant scenarios, particularly the staffing agency use case where team members work across multiple client companies.
interface GlobalUser {
  id: string;
  email: string;
  stackAuthUserId: string;
  systemRole: 'super_admin' | 'partner_manager' | 'standard_user';
  tenantMemberships: TenantMembership[];
  createdAt: Date;
  updatedAt: Date;
}

interface TenantMembership {
  tenantId: string;
  role: 'owner' | 'admin' | 'user' | 'viewer';
  permissions: string[];
  companyAccess: CompanyAccess[];
  invitedBy: string;
  invitedAt: Date;
  isActive: boolean;
}

interface CompanyAccess {
  companyId: string;
  role: 'admin' | 'manager' | 'member' | 'evaluator';
  departments?: string[];
  permissions: string[];
  assignedAt: Date;
}

// Per-Tenant Database (tenant-{id})
interface TenantUser {
  userId: string;  // References GlobalUser.id
  email: string;
  name: string;
  tenantRole: string;
  companies: CompanyMembership[];
  preferences: UserPreferences;
  lastLoginAt: Date;
}

interface CompanyMembership {
  companyId: string;
  role: string;
  departments: string[];
  permissions: string[];
  evaluatorAssignments: EvaluatorAssignment[];
}
```

### **Permission Checking Service**
```typescript
// services/permission-service.ts
export class PermissionService {
  // Check if user has specific permission
  async hasPermission(
    userId: string,
    permission: string,
    context?: {
      companyId?: string;
      tenantId?: string;
      resourceId?: string;
    }
  ): Promise<boolean> {
    // 1. Get user from global directory
    const user = await this.globalDirectory.getUser(userId);

    // 2. Check system-level permissions first
    if (user.systemRole === 'super_admin') {
      return true; // Super admin has all permissions
    }

    // 3. Parse permission: resource:action:scope
    const [resource, action, scope] = permission.split(':');

    // 4. Check tenant membership
    if (context?.tenantId) {
      const membership = user.tenantMemberships.find(
        m => m.tenantId === context.tenantId && m.isActive
      );

      if (!membership) {
        return false;
      }

      // Check tenant-level permissions
      if (this.hasTenantPermission(membership, permission)) {
        return true;
      }

      // Check company-level permissions
      if (context?.companyId) {
        const companyAccess = membership.companyAccess.find(
          c => c.companyId === context.companyId
        );

        if (companyAccess) {
          return this.hasCompanyPermission(companyAccess, permission);
        }
      }
    }

    return false;
  }

  // Get all permissions for user in context
  async getUserPermissions(
    userId: string,
    tenantId: string,
    companyId?: string
  ): Promise<PermissionSet> {
    const user = await this.globalDirectory.getUser(userId);
    const membership = user.tenantMemberships.find(
      m => m.tenantId === tenantId && m.isActive
    );

    if (!membership) {
      return { permissions: [], roles: [] };
    }

    const permissions: string[] = [];
    const roles: string[] = [membership.role];

    // Add tenant permissions
    permissions.push(...membership.permissions);

    // Add company permissions if specified
    if (companyId) {
      const companyAccess = membership.companyAccess.find(
        c => c.companyId === companyId
      );

      if (companyAccess) {
        permissions.push(...companyAccess.permissions);
        roles.push(companyAccess.role);
      }
    }

    return { permissions, roles };
  }
}
```

### **Stack Auth Integration**
```typescript
// middleware/auth-middleware.ts
export async function authMiddleware(request: Request) {
  // 1. Validate Stack Auth JWT
  const stackAuthUser = await stackServerApp.getUser({
    token: request.headers.get('Authorization')?.replace('Bearer ', '')
  });

  if (!stackAuthUser) {
    throw new UnauthorizedError();
  }

  // 2. Get user's profile from global directory
  const globalUser = await globalDirectory.getUserByStackId(
    stackAuthUser.id
  );

  // 3. Extract tenant context from request
  const tenantId = extractTenantFromRequest(request);
  const companyId = extractCompanyFromRequest(request);

  // 4. Build permission context
  const permissionContext = {
    userId: globalUser.id,
    email: globalUser.email,
    systemRole: globalUser.systemRole,
    tenantId,
    companyId,
    permissions: await permissionService.getUserPermissions(
      globalUser.id,
      tenantId,
      companyId
    )
  };

  // 5. Attach to request
  request.user = permissionContext;

  return request;
}
```

### **Permission Decorator for API Routes**
```typescript
// decorators/require-permission.ts
export function requirePermission(permission: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const request = args[0];

      if (!request.user) {
        throw new UnauthorizedError();
      }

      const hasPermission = await permissionService.hasPermission(
        request.user.userId,
        permission,
        {
          tenantId: request.user.tenantId,
          companyId: request.user.companyId
        }
      );

      if (!hasPermission) {
        throw new ForbiddenError(
          `Missing required permission: ${permission}`
        );
      }

      return originalMethod.apply(this, args);
    };
  };
}

// Usage example
class JobController {
  @requirePermission('job:create')
  async createJob(request: Request) {
    // Create job logic
  }

  @requirePermission('job:view:assigned')
  async getJob(request: Request) {
    // Get job logic
  }
}
```

---

## 🌊 **5. Permission Flow Visualizations**

### **Authentication to Authorization Flow**
```
┌─────────────────────────────────────────────────────────────────┐
│                      AUTH FLOW DIAGRAM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. USER LOGIN                                                  │
│  ┌─────────────────┐    ┌──────────────────┐                   │
│  │ Frontend        │───▶│ Stack Auth       │                   │
│  │ (Next.js)       │    │ Authentication   │                   │
│  └─────────────────┘    └──────────────────┘                   │
│           │                       │                            │
│           ▼                       ▼                            │
│       JWT Token              User Profile                       │
│           │                       │                            │
│           └───────────────────────┘                            │
│                                 │                            │
│                                 ▼                            │
│  2. BACKEND VALIDATION                                        │
│  ┌─────────────────┐    ┌──────────────────┐                   │
│  │ API Request     │───▶│ Auth Middleware  │                   │
│  │ + JWT Token     │    │ Verify Token     │                   │
│  └─────────────────┘    └──────────────────┘                   │
│                                 │                            │
│                                 ▼                            │
│                         Extract User ID                       │
│                                 │                            │
│                                 ▼                            │
│  3. PERMISSION LOOKUP                                         │
│  ┌─────────────────┐    ┌──────────────────┐                   │
│  │ User ID         │───▶│ Global Directory │                   │
│  │                 │    │ Look up User     │                   │
│  └─────────────────┘    └──────────────────┘                   │
│                                 │                            │
│                                 ▼                            │
│                 ┌─────────────────────────┐                    │
│                 │ User Membership Data    │                    │
│                 ├─ System Role           │                    │
│                 ├─ Tenant Memberships   │                    │
│                 ├─ Company Access       │                    │
│                 └─ Permissions List     │                    │
│                 └─────────────────────────┘                    │
│                                 │                            │
│                                 ▼                            │
│  4. PERMISSION CHECK                                           │
│  ┌─────────────────┐    ┌──────────────────┐                   │
│  │ Required        │───▶│ Permission       │                   │
│  │ Permission      │    │ Service Check    │                   │
│  │                 │    │                 │                   │
│  └─────────────────┘    └──────────────────┘                   │
│                                 │                            │
│                                 ▼                            │
│                        [✅] Allow / [❌] Deny                   │
│                                 │                            │
│                                 ▼                            │
│  5. API RESPONSE                                              │
│  ┌─────────────────┐    ┌──────────────────┐                   │
│  │ Process Request │◀───│ Permission       │                   │
│  │                 │    │ Granted/Denied   │                   │
│  └─────────────────┘    └──────────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **Multi-Tenant Data Isolation Flow**
```
┌─────────────────────────────────────────────────────────────────┐
│                DATA ISOLATION BY TENANT                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User Request: GET /api/tenants/google/companies/mv/jobs       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                     AUTHENTICATION                         │ │
│  │ JWT Token validated → Extract userId                       │ │
│  │                                                           │ │
│  │ Stack Auth Claims:                                         │ │
│  │ - Team: "google-tenant"                                   │ │
│  │ - Role: "member"                                          │ │
│  │ - userId: "user-123"                                      │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                 │                              │
│                                 ▼                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    PERMISSION CHECK                       │ │
│  │                                                           │ │
│  │ 1. Global Directory Lookup:                               │ │
│  │    └── user-123 has TENANT_USER role for "google"         │ │
│  │                                                           │ │
│  │ 2. Company Access Check:                                  │ │
│  │    └── user-123 has COMPANY_MEMBER role for "mv"          │ │
│  │                                                           │ │
│  │ 3. Resource Permission:                                   │ │
│  │    └── job:view permission granted for "mv"               │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                 │                              │
│                                 ▼                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    DATA ACCESS                             │ │
│  │                                                           │ │
│  │ 1. Tenant Database Selection:                             │ │
│  │    └── Connect to "tenant-google" database                │ │
│  │                                                           │ │
│  │ 2. Query with Filters:                                    │ │
│  │    └── FROM jobs WHERE companyId = "mv"                   │ │
│  │                                                           │ │
│  │ 3. Row-Level Security:                                    │ │
│  │    └── Only return jobs user can access                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                 │                              │
│                                 ▼                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                      RESPONSE                              │ │
│  │                                                           │ │
│  │ Return:                                                   │ │
│  │ [                                                        │ │
│  │   { id: "job-1", title: "Senior SWE", company: "mv" },   │ │
│  │   { id: "job-2", title: "SDE II", company: "mv" }        │ │
│  │ ]                                                        │ │
│  │                                                           │ │
│  │ Note: User never sees data from:                          │ │
│  │ - Other Google locations                                  │ │
│  │ - Other tenants                                           │ │
│  │ - Jobs they don't have access to                         │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **Cross-Tenant Partner Access Flow**
```
┌─────────────────────────────────────────────────────────────────┐
│                PARTNER MULTI-TENANT ACCESS                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Scenario: Andela Partner Manager accessing client data         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    PARTNER LOGIN                           │ │
│  │                                                           │ │
│  │ 1. Stack Auth: "andela-partners" team                     │ │
│  │ 2. System Role: PARTNER_MANAGER                           │ │
│  │ 3. Assigned Tenants: [google, microsoft, tesla]           │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                 │                              │
│                                 ▼                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                DASHBOARD LOADING                          │ │
│  │                                                           │ │
│  │ GET /api/partner/tenants                                  │ │
│  │                                                           │ │
│  │ Response:                                                 │ │
│  │ [                                                        │ │
│  │   {                                                     │ │
│  │     tenantId: "google",                                 │ │
│  │     name: "Google LLC",                                │ │
│  │     companies: 12,                                     │ │
│  │     activeJobs: 247,                                   │ │
│  │     pipeline: 1823                                     │ │
│  │   },                                                   │ │
│  │   {                                                     │ │
│  │     tenantId: "microsoft",                             │ │
│  │     name: "Microsoft Corp",                            │ │
│  │     companies: 8,                                      │ │
│  │     activeJobs: 156,                                   │ │
│  │     pipeline: 943                                      │ │
│  │   }                                                    │ │
│  │ ]                                                      │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                 │                              │
│                                 ▼                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │             ACCESSING GOOGLE DATA                        │ │
│  │                                                           │ │
│  │ User clicks on Google tile →                              │ │
│  │ GET /api/tenants/google/dashboard                         │ │
│  │                                                           │ │
│  │ Permission Check:                                        │ │
│  │ ✅ System: PARTNER_MANAGER                              │ │
│  │ ✅ Tenant: google is in assigned list                    │ │
│  │ ✅ Permission: tenant.view (for assigned tenants)        │ │
│  │                                                           │ │
│  │ Database: Connect to "tenant-google"                     │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                 │                              │
│                                 ▼                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │               CREATING NEW JOB                            │ │
│  │                                                           │ │
│  │ POST /api/tenants/google/companies/mv/jobs               │ │
│  │                                                           │ │
│  │ Permission Check:                                        │ │
│  │ ✅ System: PARTNER_MANAGER                              │ │
│  │ ✅ Tenant: google is assigned                            │ │
│  │ ✅ Company: mv is in assigned companies                 │ │
│  │ ✅ Permission: job.create (as partner)                  │ │
│  │                                                           │ │
│  │ Note: Job is marked as "partner_created": true           │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                 │                              │
│                                 ▼                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              ATTEMPTING UNAUTHORIZED ACCESS               │ │
│  │                                                           │ │
│  │ GET /api/tenants/tesla/billing                            │ │
│  │                                                           │ │
│  │ Permission Check:                                        │ │
│  │ ✅ System: PARTNER_MANAGER                              │ │
│  │ ✅ Tenant: tesla is assigned                            │ │
│  │ ❌ Permission: billing.manage (restricted to owners)     │ │
│  │                                                           │ │
│  │ Response: 403 Forbidden                                  │ │
│  │ "Partner managers cannot access billing information"     │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 **6. Scaling Considerations**

### **Handling Large Organizations**
```
🏢 Google LLC - 10,000+ Users, 50+ Locations

Performance Optimizations:
├── 📊 Permission Caching
│   ├── User permissions cached for 5 minutes
│   ├── Invalidated on role changes
│   ├── Redis cluster for distributed cache
│   └── Tenant-scoped cache keys
│
├── 🗄️ Database Optimization
│   ├── Indexed queries on userId, tenantId, companyId
│   ├── Materialized views for complex permission checks
│   ├── Read replicas for permission lookups
│   └── Partitioned by tenant for isolation
│
├── 🌐 CDN & Edge Caching
│   ├── Static permission sets cached at edge
│   ├── Role definitions distributed globally
│   ├── Cache invalidation via webhooks
│   └── Location-aware permission checks
│
└── 📈 Horizontal Scaling
    ├── Permission service can be scaled independently
    ├── Load balancer with sticky sessions for active evaluations
    ├── Eventual consistency for permission propagation
    └── Circuit breakers for permission service failures
```

### **Stack Auth Limitations & Workarounds**
```
🚫 Stack Auth Constraints:
├── Team permissions are relatively simple
├── No granular resource-level permissions
├── Limited to 100 teams per organization
└── No direct support for multi-tenant permissions

✅ Our Solutions:
├── Use Stack Auth for authentication ONLY
├── Store detailed permissions in our databases
├── Implement custom permission checking middleware
├── Use team claims as coarse-grained access hints
└── Build permission caching layer to reduce DB load
```

### **Permission Audit & Compliance**
```
📊 Audit Trail Implementation
├── 📝 Permission Change Logging
│   ├── All role changes tracked
│   ├── Who made the change and when
│   ├── Previous vs new permissions
│   └── Reason for change
│
├── 🔍 Access Log Analysis
│   ├── Every permission check logged
│   ├── Failed access attempts monitored
│   ├── Anomaly detection for suspicious activity
│   └── Monthly compliance reports
│
├── 📋 Compliance Reports
│   ├── SOX: Separation of duties verification
│   ├── GDPR: Right to access logs
│   ├── HIPAA: Audit trail for protected data
│   └── Custom: Client-specific requirements
│
└── 🔒 Security Features
    ├── Time-based permissions (expiring access)
    ├── IP-restricted access for sensitive operations
    ├── MFA requirement for permission changes
    └── Emergency revoke capabilities
```

---

## 📋 **7. Implementation Checklist**

### **Phase 1: Core Permission System**
- [ ] Extend UserRole enum with platform/tenant distinction
- [ ] Create permission constants with resource:action:scope format
- [ ] Implement Global Directory database schema
- [ ] Build permission checking service
- [ ] Create auth middleware with Stack Auth integration
- [ ] Add permission decorators for API routes

### **Phase 2: Role Management UI**
- [ ] Role management page for tenant owners
- [ ] Company access configuration
- [ ] Permission matrix visualization
- [ ] Bulk user invitation with roles
- [ ] Permission change audit log

### **Phase 3: Advanced Features**
- [ ] Permission caching layer (Redis)
- [ ] Time-based access (contractors)
- [ ] Department-level permissions
- [ ] Custom permission templates
- [ ] Automated permission recommendations

### **Phase 4: Compliance & Security**
- [ ] SOC2 compliance reporting
- [ ] GDPR access logs
- [ ] Suspicious activity detection
- [ ] Emergency access controls
- [ ] Permission backup/restore

---

## 🎯 **8. Best Practices**

### **Permission Design Principles**
```
✅ DO:
├── Follow principle of least privilege
├── Use descriptive permission names
├── Implement permission inheritance
├── Cache frequently checked permissions
├── Log all permission changes
└── Regular permission audits

❌ DON'T:
├── Don't use magic numbers for permissions
├── Don't hardcode role checks
├── Don't skip permission checks for "internal" APIs
├── Don't forget to log denied access
├── Don't make permission checks too complex
└── Don't ignore Stack Auth rate limits
```

### **Performance Guidelines**
```
⚡ Optimization Strategies:
├── Cache user permissions at session start
├── Use bit flags for frequently checked permissions
├── Batch permission checks where possible
├── Pre-compute common permission sets
├── Use CDN for static permission definitions
└── Implement request deduplication for permission checks
```

### **Security Recommendations**
```
🔒 Security Checklist:
├── Validate permissions on every request
├── Implement rate limiting for permission checks
├── Use secure, HttpOnly cookies for auth tokens
├── Rotate permission cache keys regularly
├── Implement CORS correctly
└── Use HTTPS for all API calls
```

---

## 🚀 **Conclusion**

This comprehensive role and permissions architecture provides:

1. **🏗️ Scalable Foundation**: Supports from single companies to enterprise multi-tenant deployments
2. **🔐 Fine-Grained Control**: Resource-level permissions with flexible scoping
3. **🌐 Stack Auth Integration**: Leverages Stack Auth for authentication while maintaining custom permissions
4. **📊 Real-World Ready**: Handles complex scenarios like staffing agencies and cross-company interviewers
5. **🔒 Enterprise Security**: Comprehensive audit trails, compliance features, and security controls

The system is designed to grow with your platform, supporting new features and use cases without requiring architectural changes. The separation of authentication (Stack Auth) from authorization (custom system) provides flexibility while maintaining security best practices.