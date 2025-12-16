# 🚀 Stack Auth Team Integration Visualization
## Multi-Tenant Recruitment Platform with Stack Auth

---

## 🎯 **Executive Overview**

```
🌐 Ohriv Platform + Stack Auth Teams
├── 🔐 Stack Auth Authentication (Frontend)
├── 🏢 Stack Auth Teams → Ohriv Tenants (1:1)
├── 📋 Global Directory (Cross-team user tracking)
├── 🗄️ Per-Tenant Databases (Isolated data per team)
└── 🔗 Team Context Switching (Multi-tenant access)
```

### **Integration Value Proposition:**
- **For Stack Auth Teams**: Native team management with powerful recruiting features
- **For Users**: Seamless team switching without re-authentication
- **For Admins**: Role-based access controlled by Stack Auth permissions
- **For Developers**: Clean separation between auth and business logic

---

## 🏗️ **1. Stack Auth → Ohriv Mapping Architecture**

### **Core Mapping Strategy:**
```
Stack Auth Ecosystem          →    Ohriv Platform
├── Team (auth.stack.com)     →    Tenant (tenant-{team-id})
├── Team Members              →    Cross-tenant Users
├── Roles (admin, member)      →    Base Role System
├── Permissions ($team_admin)  →    System Permissions
└── Metadata                  →    Tenant Configuration
```

### **Team-to-Tenant Relationship:**
```
🏢 Stack Auth Team: "Google LLC"
│
├── Stack Auth Team ID: "team_google_abc123"
├── Stack Auth Members: 450 users
├── Stack Auth Roles: [admin, member, billing]
│
└── ↳ Mapped to Ohriv Tenant: "tenant-google"
    ├── RavenDB Database: tenant-google
    ├── Companies: 15 Google locations
    ├── Users: 450 (synced from Stack Auth)
    ├── Jobs: 1,247 active positions
    └── Candidates: 45,892 profiles
```

---

## 🔐 **2. Authentication & Team Context Flow**

### **User Login & Team Selection:**
```
👤 Sarah Chen (sarah@google.com)
│
├── 📱 Stack Auth Login
│   ├── Email: sarah@google.com
│   ├── Password: ••••••••
│   └── MFA: Authenticator app approved
│
├── 🔄 Stack Auth Response
│   ├── JWT Token: eyJhbGciOiJIUzI1NiIs...
│   ├── User ID: user_google_sarah_456
│   ├── Teams: [
│   │   {
│   │     id: "team_google_abc123",
│   │     name: "Google LLC",
│   │     role: "member",
│   │     permissions: ["$read_members", "$read_teams"]
│   │   },
│   │   {
│   │     id: "team_andela_def789",
│   │     name: "Andela",
│   │     role: "admin",
│   │     permissions: ["$invite_members", "$update_team"]
│   │   }
│   │ ]
│
├── 🎯 Team Selection UI
│   ├── "Select which team to access:"
│   │   ☑ Google LLC (Member)
│   │   ☐ Andela (Admin)
│   │   ☐ TechStart AI (Owner)
│   │   └── ☐ Personal Projects (Viewer)
│   └── User selects: "Google LLC"
│
└── 🏢 Ohriv Tenant Session Created
    ├── Tenant: tenant-google
    ├── User: sarah@google.com
    ├── Role: Technical Recruiter (mapped from Stack Auth)
    ├── Companies: ["Google - Mountain View", "Google Cloud - Seattle"]
    └── Session: SECURE_SESSION_ID_xyz789
```

### **Backend Session Resolution:**
```typescript
// Middleware resolves JWT to tenant context
async function resolveTenantContext(jwt: string): Promise<TenantContext> {
  // 1. Validate JWT with Stack Auth
  const stackAuthUser = await stackServerApp.getUser({ token: jwt });

  // 2. Get user's teams from Stack Auth
  const userTeams = await stackServerApp.getTeamAccountsForUser(stackAuthUser.id);

  // 3. Resolve active team from session/cookie
  const activeTeamId = getActiveTeamFromCookie(); // "team_google_abc123"

  // 4. Map to Ohriv tenant
  const tenant = await getTenantByStackAuthTeamId(activeTeamId);

  // 5. Get user's role in this tenant
  const membership = await getUserMembership(stackAuthUser.id, tenant.id);

  return {
    tenant,
    user: stackAuthUser,
    role: membership.role,
    permissions: [...userTeams.permissions, ...membership.customPermissions],
    companies: membership.companies // User's accessible companies
  };
}
```

---

## 👥 **3. Multi-Team User Scenarios**

### **Scenario A: Cross-Company Recruiter**
```
👤 Alex Rodriguez - Technical Recruiter
├── 📧 Email: alex@techsolutions.com
├── 🏢 Teams: 4 Stack Auth Teams
│
├── 🏢 Team 1: "Google LLC" (Member)
│   ├── Stack Auth Role: member
│   ├── Ohriv Role: Technical Recruiter
│   ├── Access: Google - Mountain View, Google Cloud - Seattle
│   ├── Jobs Managing: 47 active positions
│   └── Candidates: 1,234 in pipeline
│
├── 🏢 Team 2: "Meta Platforms" (Admin)
│   ├── Stack Auth Role: admin
│   ├── Ohriv Role: Recruitment Manager
│   ├── Access: All Meta locations
│   ├── Managing: 5 other recruiters
│   └── Analytics: Full dashboard access
│
├── 🏢 Team 3: "Andela Talent Solutions" (Member)
│   ├── Stack Auth Role: member
│   ├── Ohriv Role: Partner Recruiter
│   ├── Access: 25 client companies
│   ├── Commission: 15% of placements
│   └── Specialization: Cloud infrastructure roles
│
└── 🏢 Team 4: "TechStart AI" (Owner)
    ├── Stack Auth Role: owner
    ├── Ohriv Role: System Administrator
    ├── Access: Full system configuration
    ├── Billing: Plan management
    └── Setup: Onboarding new companies

Team Switching Flow:
1. Alex logs in once → Receives JWT + teams list
2. Selects "Google LLC" → Works as recruiter for Google
3. Switches to "Meta" → Becomes recruitment manager
4. Switches to "Andela" → Works with client companies
5. All switches happen without re-authentication
```

### **Scenario B: Engineering Interviewer**
```
👤 Jane Smith - Senior Software Engineer
├── 📧 Email: jane.smith@google.com
├── 🏢 Single Team: "Google LLC" (Member)
│
└── 🏢 Google LLC - Multi-Company Access
    ├── Stack Auth Role: member
    ├── Ohriv Role: Technical Interviewer
    ├── Interview Permissions: [
    │   "Google - Mountain View": Full technical interview access
    │   "Google Cloud - Seattle": System design interviews only
    │   "Google - London": Coding challenges only
    │   ]
    ├── Calibrations: Peer reviewer for 12 other interviewers
    ├── Specialization: Distributed systems, Go, Kubernetes
    └── Interview Load: 8-12 candidates per week

Interview Context:
- Jane sees different question banks per company
- Her evaluator role is consistent, but scope varies
- Analytics show her performance across all Google locations
- Calibration meetings happen with interviewers from all companies
```

### **Scenario C: Partner Agency Administrator**
```
👤 Michael Chen - Partner Success Manager
├── 📧 Email: michael@andela.com
├── 🏢 Primary Team: "Andela Talent Solutions" (Admin)
│   ├── Stack Auth Role: admin
│   ├── Ohriv Role: Partner Administrator
│   ├── Client Access: 50+ client companies
│   ├── Team Management: Manages 25 recruiters
│   └── Revenue Tracking: $8.5M in placements (2023)
│
└── 👥 Cross-Client Permissions (Custom in Ohriv)
    ├── Microsoft (Client): Full recruiting lifecycle
    ├── Tesla (Client): Technical interviews only
    ├── Stripe (Client): Sourcing and screening only
    └── SpaceX (Client): Executive search only

Partner Features:
- Can add/remove team members from Andela Stack Auth team
- Manages client billing and contracts in Ohriv
- Sees consolidated analytics across all clients
- Custom permissions per client (stored in Ohriv, not Stack Auth)
```

---

## 🔄 **4. Team Management Operations**

### **Admin Team Management (via Stack Auth + Ohriv):**
```
👥 Team Admin: recruiting-admin@google.com
│
├── 🔐 Stack Auth Team Management
│   ├── Invite User: john.doe@google.com
│   │   ├── Stack Auth sends invitation email
│   │   ├── John joins team automatically
│   │   └── Stack Auth role: "member"
│   │
│   ├── Change Role: promote jane.smith to admin
│   │   ├── Update in Stack Auth dashboard
│   │   ├── Role syncs to Ohriv on next login
│   │   └── New permissions: $update_team, $invite_members
│   │
│   └── Remove User: transfer.bob@google.com
│       ├── Bob removed from Google team
│       ├── Loses access to tenant-google database
│       ├── Retains access to other teams
│       └── Ohriv archives his evaluation history
│
└── 🏢 Ohriv-Specific Configuration
    ├── Map Stack Auth roles to Ohriv roles:
    │   └── Stack Auth "admin" → Ohrif "Recruitment Manager"
    ├── Set company access per user:
    │   ├── Jane Smith: ["Google - Mountain View", "Google Cloud"]
    │   └── John Doe: ["Google - Seattle", "Google - London"]
    └── Configure custom permissions:
        ├── Interview calibration access
        ├── Analytics dashboard access
        └── Candidate communication permissions
```

### **User Self-Service:**
```
👤 User: alex.recruiter@google.com

✅ What users can do themselves:
├── Profile Management (Stack Auth)
│   ├── Update name, email, photo
│   ├── Enable 2FA authentication
│   └── Manage personal API keys
│
├── Team Preferences (Ohriv)
│   ├── Default company for dashboard
│   ├── Notification settings
│   ├── Interview scheduling preferences
│   └── Email signature templates
│
└── Cross-Team Actions
    ├── View all accessible teams
    ├── Switch between teams (no re-login)
    ├── Request access to additional companies
    └── Export personal data (GDPR compliance)

❌ What requires admin approval:
├── Changing base roles (member → admin)
├── Access to new companies/locations
├── Advanced analytics permissions
└── Bulk operations on candidate data
```

---

## 🛡️ **5. Permission Architecture**

### **Layered Permission System:**
```
🔐 Permission Hierarchy
├── Stack Auth Layer (Foundation)
│   ├── $team_admin: Full team management
│   ├── $invite_members: Add/remove team members
│   ├── $read_members: View team member list
│   ├── $update_team: Modify team settings
│   └── $billing: Access billing information
│
├── Ohriv Role Layer (Business Logic)
│   ├── Recruitment Manager: Full recruiting access
│   ├── Technical Recruiter: Sourcing and screening
│   ├── Technical Interviewer: Interviews and evaluations
│   ├── Hiring Manager: Decision making and offers
│   └── System Administrator: Platform configuration
│
├── Company Access Layer (Data Scope)
│   ├── Company Membership: User → Company mapping
│   ├── Department Access: Limit to specific departments
│   ├── Job Access: Only jobs in assigned companies
│   └── Candidate Access: Based on job assignments
│
└── Feature Permission Layer (Granular Control)
    ├── Analytics Dashboard: View reports
    ├── ML Predictions: See AI recommendations
    ├── Salary Data: View compensation information
    ├── Bulk Operations: Mass actions on candidates
    └── Export Data: Download candidate information
```

### **Permission Checking Example:**
```typescript
// Before performing an action
async function checkAction(userId: string, action: string, resource: string) {
  // 1. Get Stack Auth permissions
  const stackAuthPerms = await getStackAuthPermissions(userId);
  if (!hasBasePermission(stackAuthPerms, action)) {
    throw new ForbiddenError("Insufficient Stack Auth permissions");
  }

  // 2. Get Ohriv role and company access
  const { role, companies } = await getUserContext(userId);
  if (!roleHasPermission(role, action)) {
    throw new ForbiddenError("Role does not permit this action");
  }

  // 3. Check resource access
  if (resource.startsWith('company-')) {
    const companyId = resource.split('-')[1];
    if (!companies.includes(companyId)) {
      throw new ForbiddenError("No access to this company");
    }
  }

  // 4. Check feature-specific permissions
  const featurePerms = await getFeaturePermissions(userId);
  if (!featurePerms.includes(action)) {
    throw new ForbiddenError("Feature not enabled for user");
  }

  return true;
}
```

---

## 📊 **6. Analytics & Reporting Across Teams**

### **Multi-Tenant Analytics Dashboard:**
```
📊 Platform-Level View (Ohriv Admin)
├── Total Teams: 1,247
├── Total Users: 45,892
├── Active Recruitments: 12,456
├── ML Predictions Run: 89,234
└── Platform Revenue: $4.2M/month

🏢 Team-Level View (Team Admin)
├── Team: "Google LLC"
├── Users: 450 (425 active, 25 inactive)
├── Companies: 15 locations
├── Open Jobs: 247
├── Candidates: 8,923
├── Average Time-to-Hire: 42 days
└── Top Performers:
    ├── Most Evaluations: Jane Smith (847)
    ├── Highest Calibration: Mike Johnson (0.93 QWK)
    └── Fastest Hiring: Sarah Chen (28 days avg)

👥 User-Level View (Individual User)
├── Role: Technical Interviewer
├── Companies: 2 of 15 (based on access)
├── Interviews This Month: 12
├── Average Score: 7.8/10
├── Calibration Score: 0.87
└── Specialization: Cloud Infrastructure
```

### **Cross-Team Insights:**
```
🔍 Comparative Analytics (Partner View)
Andela Talent Solutions - Client Performance:

├── Microsoft (Client)
│   ├── Placements: 47 engineers
│   ├── Average Time-to-Fill: 35 days
│   ├── Client Satisfaction: 4.6/5
│   └── Revenue: $1.2M (15% commission)
│
├── Tesla (Client)
│   ├── Placements: 23 engineers
│   ├── Average Time-to-Fill: 52 days
│   ├── Client Satisfaction: 4.3/5
│   └── Revenue: $690K (20% commission)
│
└── SpaceX (Client)
    ├── Placements: 15 engineers
    ├── Average Time-to-Fill: 61 days
    ├── Client Satisfaction: 4.8/5
    └── Revenue: $450K (18% commission)

📈 Trend Analysis:
- Best Performance: Microsoft (fastest fills, highest volume)
- Highest Margin: Tesla (20% commission)
- Best Satisfaction: SpaceX (4.8/5 rating)
- Optimization: Increase focus on cloud infrastructure roles (48% faster placement)
```

---

## 🚀 **7. Implementation Technical Details**

### **Database Schema for Stack Auth Integration:**
```typescript
// Tenant Document - Links to Stack Auth Team
interface TenantDocument {
  id: string;                    // e.g., "tenant-google"
  tenantId: string;              // e.g., "google" (slug)

  // Stack Auth Integration
  stackAuth: {
    teamId: string;              // "team_google_abc123" (from Stack Auth)
    teamSlug: string;            // "google" (URL-friendly)
    syncedAt: Date;              // Last sync with Stack Auth
    webhookSecret: string;       // For Stack Auth webhooks
  };

  // ... other tenant fields
}

// User Document - Cross-tenant identity
interface UserDocument {
  id: string;                    // e.g., "user-sarah-123"
  email: string;                 // sarah@google.com

  // Stack Auth Integration
  stackAuth: {
    userId: string;              // Stack Auth user ID
    primaryTeamId: string;       // Default team for this user
    teamMemberships: {
      [teamId: string]: {
        role: string;             // Stack Auth role
        permissions: string[];   // Stack Auth permissions
        joinedAt: Date;
      }
    };
  };

  // Ohriv-specific per-team data
  tenantProfiles: {
    [tenantId: string]: {
      role: EvaluatorRole;        // Ohriv role in this tenant
      companies: string[];      // Accessible companies
      permissions: string[];    // Additional permissions
      preferences: {           // User preferences in this tenant
        defaultCompany?: string;
        notifications: NotificationSettings;
        dashboardLayout: string;
      };
    };
  };
}

// Sync Tracking Document
interface StackAuthSyncLog {
  id: string;
  entityType: "team" | "user" | "membership";
  entityId: string;             // Stack Auth entity ID
  operation: "create" | "update" | "delete" | "sync";
  status: "success" | "error" | "pending";
  stackAuthData: any;           // Raw data from Stack Auth webhook
  error?: string;
  processedAt: Date;
  retryCount: number;
}
```

### **Webhook Handler for Real-Time Sync:**
```typescript
// Stack Auth Webhook Endpoint
app.post('/webhooks/stack-auth', async (req, res) => {
  const event = req.body;
  const signature = req.headers['stack-auth-signature'];

  // Verify webhook signature
  if (!verifyWebhookSignature(event, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  try {
    switch (event.type) {
      case 'team.created':
        await handleTeamCreated(event.data);
        break;
      case 'team.updated':
        await handleTeamUpdated(event.data);
        break;
      case 'team.user_added':
        await handleUserAddedToTeam(event.data);
        break;
      case 'team.user_removed':
        await handleUserRemovedFromTeam(event.data);
        break;
      case 'user.updated':
        await handleUserUpdated(event.data);
        break;
    }

    res.json({ status: 'processed' });
  } catch (error) {
    logger.error('Webhook processing failed', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});
```

### **Frontend Team Switcher Component:**
```typescript
// React Component for Team Selection
function TeamSwitcher({ user, currentTeam, onTeamSwitch }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user's teams from Stack Auth
    loadUserTeams().then(setTeams).finally(() => setLoading(false));
  }, []);

  if (loading) return <TeamSwitcherSkeleton />;

  return (
    <div className="team-switcher">
      <span className="current-team">
        <img src={currentTeam.logoUrl} alt={currentTeam.name} />
        {currentTeam.name}
      </span>

      <select
        value={currentTeam.id}
        onChange={(e) => onTeamSwitch(e.target.value)}
        className="team-dropdown"
      >
        {teams.map(team => (
          <option key={team.id} value={team.id}>
            {team.name} ({team.role})
          </option>
        ))}
      </select>
    </div>
  );
}

// Usage in Layout
function AppLayout({ children }) {
  const { user } = useStackAuthUser();
  const [currentTeam, setCurrentTeam] = useState(null);

  const handleTeamSwitch = async (teamId) => {
    // Update active team in session
    await setActiveTeam(teamId);
    // Reload page to refresh permissions
    window.location.reload();
  };

  return (
    <div className="app-layout">
      <header>
        <TeamSwitcher
          user={user}
          currentTeam={currentTeam}
          onTeamSwitch={handleTeamSwitch}
        />
      </header>
      <main>{children}</main>
    </div>
  );
}
```

---

## 🎯 **8. Benefits & Advantages**

### **For Users:**
✅ **Single Sign-On**: One login for all teams
✅ **Seamless Switching**: No re-authentication when changing teams
✅ **Consistent Experience**: Familiar interface across all teams
✅ **Personalized Access**: Role-based access per team

### **For Administrators:**
✅ **Centralized Management**: Manage team membership in Stack Auth
✅ **Role-Based Access**: Leverage Stack Auth's permission system
✅ **Automated Sync**: Real-time updates via webhooks
✅ **Audit Trail**: Complete logging of all team changes

### **For Developers:**
✅ **Clean Architecture**: Auth handled by Stack Auth, business logic in Ohriv
✅ **Reduced Complexity**: No need to build user management system
✅ **Security**: Enterprise-grade authentication out of the box
✅ **Scalability**: Stack Auth handles user data storage

### **For the Business:**
✅ **Faster Onboarding**: New teams can be created in minutes
✅ **Reduced Costs**: No need for separate identity provider
✅ **Compliance**: Built-in GDPR and SOC2 compliance features
✅ **Reliability**: 99.9% uptime guarantee from Stack Auth

---

## 🚧 **9. Migration Strategy**

### **Phase 1: Foundation Setup (Week 1-2)**
1. Configure Stack Auth project with proper settings
2. Create webhooks endpoint for real-time sync
3. Implement basic team-tenant mapping
4. Update authentication middleware

### **Phase 2: User Migration (Week 3-4)**
1. Create Stack Auth teams for existing tenants
2. Invite existing users to Stack Auth teams
3. Map Stack Auth roles to Ohriv roles
4. Implement user profile migration

### **Phase 3: Feature Rollout (Week 5-6)**
1. Deploy team switcher UI
2. Enable Stack Auth login on frontend
3. Test team switching functionality
4. Verify permissions are working correctly

### **Phase 4: Cleanup (Week 7-8)**
1. Remove old authentication system
2. Archive legacy user data
3. Update documentation
4. Train users on new system

---

## 📋 **10. Conclusion**

This integration creates a powerful, secure, and user-friendly multi-tenant platform by combining:

1. **Stack Auth's** proven authentication and team management
2. **Ohriv's** specialized recruitment and evaluation features
3. **Seamless user experience** with team switching
4. **Robust permission system** that works across multiple layers
5. **Real-time synchronization** between systems

The result is a platform that feels like a single, cohesive system while maintaining the security and scalability benefits of using specialized services for their core competencies.

---

## 📞 **Support & Resources**

- **Stack Auth Documentation**: https://docs.stack-auth.com
- **Ohriv Platform Guide**: Internal documentation
- **Migration Checklist**: See appendix for detailed migration steps
- **Support Channels**: platform-support@ohriv.com, Stack Auth community forums