# 🏢 Staffing Agency Multi-Company Team Hierarchy
## How Staffing Agencies Manage Teams Across Multiple Client Companies

---

## 🎯 **Executive Overview**

```
🌐 Stack Auth Teams → Ohriv Tenants → Multiple Client Companies
│
├── Stack Auth Team: "Andela Talent Solutions"
│   └── 1 Team = 1 Ohriv Tenant
│
├── Ohriv Tenant: "Andela"
│   └── Manages 25 client companies
│
├── Client Companies: Microsoft, Tesla, SpaceX, etc.
│   └── Shared team pool across all companies
│
└── Team Members: Same 40 staff work on all client jobs
```

### **Key Concept:**
- **One Stack Auth Team** = One staffing agency
- **One Ohriv Tenant** = One staffing agency
- **Multiple Companies** = Multiple client organizations
- **Shared Team Pool** = Same staff members work across all clients

---

## 🏗️ **1. Top-Down Hierarchy Visualization**

### **Level 1: Stack Auth Team (Identity Layer)**
```
🔐 Stack Auth Team: "Andela Talent Solutions"
├── Team ID: team_andela_xyz789
├── Team Owner: ceo@andela.com
├── Total Members: 85 users
├── Plan: Enterprise (Unlimited companies)
└── Created: January 15, 2024

All users authenticate through this single Stack Auth team
```

### **Level 2: Ohriv Tenant (Business Logic Layer)**
```
🏢 Ohriv Tenant: tenant-andela
├── Stack Auth Mapping: team_andela_xyz789 → tenant-andela
├── Database: tenant-andela (RavenDB)
├── Configuration: Staffing agency mode enabled
├── Max Companies: 25 (current: 25, MAXED)
├── Max Users: 100 (current: 85)
└── Billing: $1,500/month

Business logic and data isolation happens here
```

### **Level 3: Client Companies (Customer Layer)**
```
🏢 Client Companies within tenant-andela:

┌─────────────────────────────────────────────────────────┐
│  Company 1: Microsoft - Redmond                        │
│  ├── Company ID: company-microsoft-redmond               │
│  ├── Client Contact: hiring-manager@microsoft.com        │
│  ├── Contract: $15,000/month recruiting fee              │
│  └── Active Jobs: 47 positions                           │
├─────────────────────────────────────────────────────────┤
│  Company 2: Tesla - Palo Alto                            │
│  ├── Company ID: company-tesla-palo-alto                  │
│  ├── Client Contact: talent@tesla.com                    │
│  ├── Contract: $20,000/month + 18% commission             │
│  └── Active Jobs: 23 positions                           │
├─────────────────────────────────────────────────────────┤
│  Company 3: SpaceX - Hawthorne                           │
│  ├── Company ID: company-spacex-hawthorne                 │
│  ├── Client Contact: careers@spacex.com                  │
│  ├── Contract: $25,000/month + 20% commission             │
│  └── Active Jobs: 31 positions                           │
└─────────────────────────────────────────────────────────┘

(22 more client companies...)
```

### **Level 4: Team Members (User Layer)**
```
👥 Shared Team Pool (85 members work across ALL 25 companies):

🔹 Account Managers (3)
├── Sarah Chen (sarah@andela.com)
│   ├── Role: Senior Account Manager
│   ├── Access: All 25 companies
│   ├── Responsibilities: Client relations, contract renewals
│   └── Current Load: 8 companies
├── Michael Davis (michael@andela.com)
│   └── ... (manages 9 companies)
└── Lisa Wang (lisa@andela.com)
    └── ... (manages 8 companies)

🔹 Tech Recruiters (25)
├── Alex Rodriguez (alex@andela.com)
│   ├── Role: Technical Recruiter
│   ├── Specialization: Cloud Infrastructure
│   ├── Access: All 25 companies
│   ├── Current Assignments:
│   │   ├── Microsoft: 12 active searches
│   │   ├── Tesla: 8 active searches
│   │   └── SpaceX: 5 active searches
│   └── Performance: 94% fill rate
├── Emma Thompson (emma@andela.com)
│   ├── Role: Technical Recruiter
│   ├── Specialization: Frontend Engineering
│   └── Managing searches across all companies
└── ... (23 more recruiters)

🔹 Technical Assessors (8)
├── James Park (james@andela.com)
│   ├── Role: Senior Technical Assessor
│   ├── Expertise: System Design, Algorithms
│   ├── Evaluations: 15/week
│   └── Companies: Conducts assessments for all clients
└── ... (7 more assessors)

🔹 Client Success Managers (4)
├── Rachel Green (rachel@andela.com)
│   ├── Role: Client Success Manager
│   ├── Portfolio: 6 companies
│   └── Focus: Client retention and satisfaction
└── ... (3 more CSMs)

🔹 Support Staff (45)
    ├── Schedulers, coordinators, analysts, etc.
    └── All work across multiple companies as needed
```

---

## 🔄 **2. How It Works in Practice**

### **User Login Flow:**
```
👤 Recruiter logs in as recruiter@andela.com

1️⃣ Stack Auth Authentication
   ├── Email: recruiter@andela.com
   ├── Password: ••••••••
   ├── Team: "Andela Talent Solutions" (only option)
   └── Success: JWT token + team context

2️⃣ Ohriv Tenant Resolution
   ├── JWT validated
   ├── Team mapped to tenant: team_andela → tenant-andela
   ├── User profile loaded: alex@andela.com
   └── Role assigned: Technical Recruiter

3️⃣ Company Access Determination
   ├── Alex has access to ALL 25 companies
   ├── Default company set in preferences: Microsoft
   ├── Can switch companies instantly (no re-auth)
   └── Sees jobs from all companies in unified view
```

### **Daily Work Scenario:**
```
🌅 Monday Morning - Alex's Dashboard

📊 Unified View Across All Clients:
├── 📋 Active Searches: 47 total
│   ├── Microsoft: 18 searches (Cloud Infrastructure)
│   ├── Tesla: 12 searches (AI/ML)
│   ├── SpaceX: 10 searches (Aerospace Software)
│   ├── Stripe: 7 searches (Payments Engineering)
├── 👥 Candidates in Pipeline: 1,247 total
├── 📅 Interviews Today: 8 (mixed companies)
└── 📊 Performance Metrics:
    ├── Overall Fill Rate: 92%
    ├── Average Time-to-Fill: 38 days
    └── Client Satisfaction: 4.7/5

🔄 Working Across Companies:
1️⃣ 9:00 AM - Screen candidates for Microsoft (5 candidates)
2️⃣ 10:00 AM - Interview with Tesla candidate
3️⃣ 11:00 AM - Submit shortlist to SpaceX
4️⃣ 2:00 PM - Client call with Stripe (hiring update)
5️⃣ 3:00 PM - Schedule interviews for Microsoft
6️⃣ 4:00 PM - Review feedback from SpaceX interviews

📱 Notifications (All from same interface):
├── 🔔 New application: Microsoft - Senior Cloud Engineer
├── 🔔 Interview feedback: Tesla - ML Engineer passed
├── 🔔 Client request: SpaceX - Need 2 more Sr Engineers
└── 🔔 Commission earned: Stripe placement completed ($24k)
```

### **Client-Specific Views:**
```
🏢 When Alex views "Microsoft Dashboard":

Microsoft - Redmond (Client)
├── Client Manager: Sarah Chen
├── Contract: $15,000/month
├── Active Jobs: 18 positions
├── Your Candidates: 342
├── Interviews This Week: 12
├── Recent Hires: 8 (last 30 days)
└── Communication:
    ├── Last client call: 3 days ago
    ├── Next review meeting: Friday 2PM
    └── Client satisfaction: 4.8/5

🔀 When Alex switches to "Tesla Dashboard":

Tesla - Palo Alto (Client)
├── Client Manager: Michael Davis
├── Contract: $20,000 + 18% commission
├── Active Jobs: 12 positions
├── Your Candidates: 187
├── Interviews This Week: 8
├── Recent Hires: 5 (last 30 days)
└── Communication:
    ├── Last client call: 1 day ago
    ├── Weekly report: Sent Monday
    └── Client satisfaction: 4.5/5
```

---

## 🛡️ **3. Permission & Access Control**

### **Permission Layers:**
```
🔐 Stack Auth Layer (Global)
├── Team Membership: Must be in "Andela Talent Solutions" team
├── Base Role: Member, Admin, or Owner
└── Basic Permissions: Can access platform

🏢 Ohriv Tenant Layer (Agency)
├── Tenant Access: Must be member of tenant-andela
├── Staff Role: Account Manager, Recruiter, Assessor, etc.
└── Global Permissions: Can work across all companies

🏢 Company Layer (Client)
├── Default Access: All staff have access to all companies
├── Restricted Access: Can limit per-company if needed
└── Client Permissions: What each staff member can do per client

📄 Job Layer (Resource)
├── Job Access: Based on company assignment
├── Candidate Access: Only candidates for assigned jobs
└── Evaluation Access: Based on evaluator role
```

### **Example: Restricted Access Scenario**
```
👥 New Hire: Jennifer Lopez (jennifer@andela.com)
├── Role: Junior Technical Recruiter
├── Onboarding: First 90 days
├── Initial Access:
│   ├── Companies: 3 (Microsoft, Tesla, SpaceX)
│   ├── Reason: Training on smaller client set
│   └── Mentor: Alex Rodriguez
└── Progression:
    ├── Month 1: Shadow Alex on all companies
    ├── Month 2: Independent work on 3 companies
    ├── Month 3: Add 5 more companies
    └── Month 4: Full access to all 25 companies
```

---

## 📊 **4. Analytics & Reporting**

### **Multi-Level Analytics:**
```
📈 Andela Leadership View (Owner Level)
├── Total Revenue: $2.8M/month
├── Gross Margin: 68%
├── Client Retention: 94%
├── Team Utilization: 87%
├── Placement Volume: 34/month
└── Profit per Recruiter: $12,500/month

📊 Account Manager View (Sarah Chen)
├── Portfolio Revenue: $1.1M/month
├── Managed Companies: 8
├── Team Size: 25 recruiters
├── Client Satisfaction: 4.7/5
├── Contract Renewals: 6/8 on time
└── At-Risk Clients: 1 (low volume)

📋 Recruiter View (Alex Rodriguez)
├── Personal Performance:
│   ├── Placements: 8/month
│   ├── Revenue Generated: $192,000/month
│   ├── Commission Earned: $38,400/month
│   ├── Fill Rate: 94%
│   └── Client Score: 4.8/5
├── By Company Breakdown:
│   ├── Microsoft: 3 placements, $72k revenue
│   ├── Tesla: 2 placements, $48k revenue
│   ├── SpaceX: 2 placements, $60k revenue
│   └── Stripe: 1 placement, $12k revenue
└── Pipeline:
    ├── Active Candidates: 127
    ├── Interviews Scheduled: 15
    └── Offers Pending: 3
```

### **Client Performance Reports:**
```
📊 Quarterly Client Review - Microsoft

Microsoft - Redmond (Client)
├── Q4 Performance:
│   ├── Positions Filled: 47/50 (94% fill rate)
│   ├── Time-to-Fill: 42 days (target: 45)
│   ├── Candidate Quality: 4.6/5 (based on performance)
│   ├── Cost-per-Hire: $18,500 (under $20k budget)
│   └── Diversity Metrics: 32% underrepresented
├── Team Performance:
│   ├── Primary Recruiter: Alex Rodriguez
│   ├── Backup Recruiter: Emma Thompson
│   ├── Technical Assessor: James Park
│   └── Account Manager: Sarah Chen
├── Financials:
│   ├── Contract Fee: $45,000 (Q4)
│   ├── Commission Bonuses: $8,500
│   ├── Total Cost: $53,500
│   └── Value: Estimated $450k savings vs internal recruiting
└── Next Quarter:
    ├── Renewal: Yes (contract extended)
    ├── Volume: +10% more positions
    └── Focus Areas: AI/ML, Cloud Security
```

---

## 🚀 **5. Benefits of This Model**

### **For the Staffing Agency:**
✅ **Efficiency**: One team manages 25 clients instead of 25 separate teams
✅ **Cost Savings**: 85 staff instead of 25×5=125 staff (40% reduction)
✅ **Quality Control**: Consistent recruiting standards across all clients
✅ **Flexibility**: Easily reallocate staff based on client demand
✅ **Knowledge Sharing**: Best practices spread across all clients

### **For Clients:**
✅ **Expertise**: Access to experienced recruiters who understand multiple markets
✅ **Speed**: Faster time-to-hire due to shared resources
✅ **Cost**: Predictable pricing vs variable internal costs
✅ **Quality**: Pre-vetted recruiting team with proven track record
✅ **Scalability**: Easily scale up/down recruiting efforts

### **For Team Members:**
✅ **Variety**: Work with diverse companies and technologies
✅ **Career Growth**: Exposure to multiple industries and roles
✅ **Income**: Commission from multiple clients
✅ **Flexibility**: Can specialize or generalize across clients
✅ **Stability**: Employment with agency, not tied to single client

---

## 🔧 **6. Technical Implementation Details**

### **Database Schema for Staffing Agency:**
```typescript
// Tenant Document - Staffing Agency Mode
interface TenantDocument {
  id: string;                    // "tenant-andela"
  mode: "staffing_agency";     // Special mode for agencies

  // Staffing agency configuration
  agencyConfig: {
    maxCompanies: number;        // 25
    sharedTeamPool: boolean;     // true
    allowClientSpecificTeams: boolean; // false
    commissionStructure: {
      baseFee: number;           // $1,500/month per company
      commissionRate: number;   // 15-20%
      tiers: {
        [revenue]: number: number; // Revenue -> commission %
      };
    };
  };
}

// Company Document - Client Companies
interface CompanyDocument {
  id: string;                    // "company-microsoft-redmond"
  tenantId: string;              // "tenant-andela"

  // Client-specific configuration
  clientConfig: {
    contractType: "retainer" | "commission" | "hybrid";
    monthlyFee: number;          // $15,000
    commissionRate: number;       // 0.18 (18%)
    exclusivity: boolean;        // Exclusive recruiting partner
    dedicatedRecruiters: string[]; // [] = shared pool
    hiringManager: {
      name: string;
      email: string;
      phone: string;
    };
    billingContact: {
      name: string;
      email: string;
      department: string;
    };
  };

  // Company information
  name: string;                  // "Microsoft - Redmond"
  industry: string;
  location: string;
  website: string;
}

// User Document - Staff Members
interface UserDocument {
  id: string;                    // "user-alex-rodriguez"
  tenantId: string;              // "tenant-andela"

  // Staffing agency role
  agencyRole: "account_manager" | "recruiter" | "assessor" | "csm" | "support";

  // Company assignments (all companies by default)
  companyAccess: {
    mode: "all" | "selective" | "restricted";
    allowedCompanies: string[];  // Empty = all companies
    restrictedCompanies: string[];
  };

  // Performance tracking
  performance: {
    placementsPerMonth: number;
    fillRate: number;
    clientSatisfaction: number;
    revenueGenerated: number;
    commissionEarned: number;
  };
}

// Job Document - Client Positions
interface JobDocument {
  id: string;                    // "job-ms-cloud-senior-001"
  tenantId: string;              // "tenant-andela"
  companyId: string;             // "company-microsoft-redmond"

  // Recruiting configuration
  recruitingConfig: {
    assignedRecruiters: string[]; // Empty = any recruiter
    commissionRate: number;       // Override default if needed
    priority: "high" | "normal" | "low";
    timeline: number;             // Days to fill
    budget: {
      min: number;
      max: number;
      currency: string;
    };
  };

  // Standard job fields
  title: string;
  department: string;
  level: JobLevel;
  location: string;
  description: string;
  requirements: string[];
}
```

### **Frontend Component: Company Switcher**
```typescript
// Recruiters see all companies in one interface
function RecruiterDashboard() {
  const { user } = useStackAuthUser();
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [viewMode, setViewMode] = useState("unified"); // unified | company-specific

  return (
    <div className="recruiter-dashboard">
      <Header>
        <div className="user-info">
          <span>{user.name}</span>
          <span className="role">{user.agencyRole}</span>
          <span className="agency">{user.tenantName}</span>
        </div>

        <CompanyFilter
          companies={user.accessibleCompanies}
          selected={selectedCompanies}
          onChange={setSelectedCompanies}
          mode={viewMode}
        />
      </Header>

      {viewMode === "unified" ? (
        <UnifiedView
          companies={selectedCompanies.length > 0 ? selectedCompanies : user.accessibleCompanies}
          user={user}
        />
      ) : (
        <CompanySpecificView
          company={selectedCompanies[0]}
          user={user}
        />
      )}
    </div>
  );
}

// Unified view shows data from all selected companies
function UnifiedView({ companies, user }) {
  return (
    <div className="unified-view">
      <MetricsSummary companies={companies} user={user} />
      <JobBoard companies={companies} filters={user.defaultFilters} />
      <CandidatePipeline companies={companies} />
      <InterviewSchedule companies={companies} />
      <CommissionTracker companies={companies} user={user} />
    </div>
  );
}
```

---

## 📋 **7. Summary**

The staffing agency model creates a highly efficient structure where:

1. **One Stack Auth team** manages identity for the entire agency
2. **One Ohriv tenant** contains all client companies
3. **Shared team pool** of staff members works across all clients
4. **Unified interface** allows seamless switching between companies
5. **Consistent experience** for both staff and clients
6. **Cost efficiency** through resource sharing

This model maximizes resource utilization while providing flexibility and scalability for both the staffing agency and its clients.