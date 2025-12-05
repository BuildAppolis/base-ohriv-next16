# Partner Role System Architecture

**Version:** 1.0
**Created:** 2025-01-23
**Status:** Planning Phase

---

## Executive Summary

This document outlines the architecture for a new **Partner Role System** that enables platform partners to create and manage organizations on behalf of clients, with controlled handoff capabilities. Additionally, it introduces a **Company Admin** role that separates billing/subscription management from day-to-day administrative duties.

---

## Table of Contents

1. [Business Requirements](#business-requirements)
2. [Role Hierarchy](#role-hierarchy)
3. [Permission Model](#permission-model)
4. [Database Schema Changes](#database-schema-changes)
5. [API Changes](#api-changes)
6. [UI/UX Changes](#uiux-changes)
7. [Security Considerations](#security-considerations)
8. [Implementation Plan](#implementation-plan)

---

## Business Requirements

### Problem Statement

**Current Limitations:**
1. Users must create their own organizations
2. No mechanism for agencies/partners to set up companies for clients
3. No way to transfer organization ownership gracefully
4. Admin role has access to billing (may not be desired for all admins)

### Goals

**Partner Role:**
- Enable partners/agencies to create organizations for clients
- Allow partners to maintain access during setup phase
- Provide clean ownership handoff to client
- Track partner relationships for reporting/commission

**Company Admin Role:**
- Separate billing/subscription access from daily operations
- Allow owners to delegate admin duties without financial risk
- Maintain clear separation of concerns

### Success Criteria

1. Partners can create organizations in < 2 minutes
2. Ownership transfer is seamless (no data loss)
3. Company Admins have 95% of Owner permissions (excluding billing)
4. Clear audit trail of partner→client handoffs
5. Zero security vulnerabilities in role escalation

---

## Role Hierarchy

### Platform Level (User.role)

```
Platform Roles (stored in User.role field):

┌─────────────────────────────────────┐
│ super-admin (Highest Authority)     │ ← Anthropic/Platform Team
│  - Full platform access              │
│  - Can impersonate any role          │
│  - Dev/debugging tools access        │
│  - Define from: SUPER_ADMIN_USER_IDS │
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ platform-owner                       │ ← Platform Owners
│  - Platform-wide configuration       │
│  - Algorithm deployment              │
│  - System settings                   │
│  - Define from: PLATFORM_OWNERS      │
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ partner (NEW)                        │ ← Partners/Agencies
│  - Create organizations for clients  │
│  - Transfer ownership                │
│  - Multi-org management dashboard    │
│  - Commission/reporting access       │
│  - Define from: PLATFORM_PARTNERS    │
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ null (Regular User)                  │ ← Standard Users
│  - Membership-based permissions      │
│  - Organization-level roles          │
└─────────────────────────────────────┘
```

### Organization Level (Membership.role)

```
Organization Roles (stored in Membership.role field):

┌─────────────────────────────────────┐
│ owner                                │ ← Organization Owner
│  - Full organization control         │
│  - Billing & subscription management │
│  - Can assign company_admin          │
│  - Delete organization               │
│  - Transfer ownership                │
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ company_admin (NEW)                  │ ← Company Administrator
│  - All admin permissions             │
│  - CANNOT access billing             │
│  - CANNOT delete organization        │
│  - CANNOT transfer ownership         │
│  - Can be assigned by owner only     │
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ admin (Modified)                     │ ← Administrator
│  - Manage platform features          │
│  - Limited compared to company_admin │
│  - Historical role (may deprecate)   │
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ manager                              │
│  - Manage jobs & candidates          │
│  - No configuration changes          │
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ recruiter                            │
│  - Process candidates                │
│  - Limited job management            │
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ interviewer                          │
│  - Assigned candidates only          │
│  - Conduct interviews                │
└─────────────────────────────────────┘
```

---

## Permission Model

### Partner Permissions (Platform Level)

```typescript
PARTNER_PERMISSIONS = {
  platform: {
    createOrganization: true,        // Create orgs on behalf of clients
    transferOwnership: true,         // Hand off to client
    viewPartnerDashboard: true,      // See all managed orgs
    accessPartnerAnalytics: true,    // Commission/performance data
    inviteToOrganization: true,      // Invite clients to orgs
  },

  // When acting as member of an organization they created
  organization: {
    fullAccess: true,                // During setup phase
    canTransitionToOwner: true,      // Step down after handoff
    maintainReadAccess: false,       // No access after transfer (configurable)
  },

  restrictions: {
    cannotAccessBilling: true,       // Partners never see client billing
    cannotDeleteOrganization: true,  // Only owners can delete
    mustTransferOwnership: true,     // Can't keep orgs indefinitely
  }
}
```

### Company Admin vs Owner Comparison

| Permission | Owner | Company Admin | Admin | Manager |
|------------|-------|---------------|-------|---------|
| **Billing & Subscription** |
| View/edit subscription | ✓ | ✗ | ✗ | ✗ |
| Manage payment methods | ✓ | ✗ | ✗ | ✗ |
| View invoices | ✓ | ✗ | ✗ | ✗ |
| Manage addons | ✓ | ✗ | ✗ | ✗ |
| Cancel subscription | ✓ | ✗ | ✗ | ✗ |
| **Organization Management** |
| Delete organization | ✓ | ✗ | ✗ | ✗ |
| Transfer ownership | ✓ | ✗ | ✗ | ✗ |
| Rename organization | ✓ | ✓ | ✗ | ✗ |
| Change organization slug | ✓ | ✓ | ✗ | ✗ |
| Manage branding | ✓ | ✓ | ✓ | ✗ |
| **User Management** |
| Invite users | ✓ | ✓ | ✓ | ✗ |
| Remove users | ✓ | ✓ | ✗ | ✗ |
| Assign company_admin role | ✓ | ✗ | ✗ | ✗ |
| Assign other roles | ✓ | ✓ | ✓ | ✗ |
| **Platform Features** |
| Manage attributes | ✓ | ✓ | ✓ | ✓ |
| Manage stages | ✓ | ✓ | ✓ | ✓ |
| Manage questions | ✓ | ✓ | ✓ | ✓ |
| Create jobs | ✓ | ✓ | ✓ | ✓ |
| Delete jobs | ✓ | ✓ | ✗ | ✗ |
| Manage candidates | ✓ | ✓ | ✓ | ✓ |
| View analytics | ✓ | ✓ | ✓ | ✓ |
| **Settings** |
| Organization settings | ✓ | ✓ | ✓ | ✗ |
| Integrations | ✓ | ✓ | ✓ | ✗ |
| API keys | ✓ | ✓ | ✗ | ✗ |
| Webhooks | ✓ | ✓ | ✗ | ✗ |

**Key Difference:** Company Admin cannot access anything billing-related or perform destructive organization operations.

---

## Database Schema Changes

### 1. Add Partner Column to User

```prisma
model User {
  id                      String   @id
  role                    String?  // 'super-admin', 'platform-owner', 'partner', or null

  // Partner-specific fields
  partnerOrganizationName String?  // Their agency/company name
  partnerContactEmail     String?  // Business contact
  partnerCommissionRate   Float?   // For reporting

  // ... existing fields

  // New relations
  partnerCreatedOrgs      PartnerOrganization[]
}
```

### 2. New PartnerOrganization Tracking Table

```prisma
model PartnerOrganization {
  id              String       @id @default(cuid())

  // Relationships
  partnerId       String
  organizationId  String

  // Status tracking
  status          PartnerStatus @default(SETUP)
  createdAt       DateTime     @default(now())
  handoffAt       DateTime?    // When ownership transferred
  completedAt     DateTime?    // When fully handed off

  // Transfer details
  originalOwnerId String?      // Partner's user ID
  newOwnerId      String?      // Client's user ID
  handoffNotes    String?      @db.Text

  // Commission tracking
  setupFee        Float?
  monthlyRate     Float?

  // Relations
  partner         User         @relation(fields: [partnerId], references: [id])
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([partnerId, organizationId])
  @@index([partnerId])
  @@index([organizationId])
  @@index([status])
}

enum PartnerStatus {
  SETUP      // Partner is actively setting up
  READY      // Ready for client handoff
  TRANSITIONING // Ownership transfer in progress
  HANDED_OFF // Client is now owner, partner may have limited access
  COMPLETED  // Partner has no access, fully client-owned
}
```

### 3. Update Organization Model

```prisma
model Organization {
  // ... existing fields

  // Partner tracking
  partnerCreated     Boolean               @default(false)
  partnerSetupBy     String?               // Partner user ID
  partnerHandoffDate DateTime?

  // Relations
  partnerOrganization PartnerOrganization?
}
```

### 4. Update Membership for company_admin

```prisma
// No schema changes needed - Membership.role already supports any string
// Just add 'company_admin' as a valid value in application logic
```

### 5. New Audit Log for Ownership Transfers

```prisma
model OwnershipTransfer {
  id                String   @id @default(cuid())
  organizationId    String
  fromUserId        String   // Previous owner
  toUserId          String   // New owner
  initiatedBy       String   // Who triggered the transfer
  reason            String?  @db.Text
  transferredAt     DateTime @default(now())
  approvedAt        DateTime?
  status            TransferStatus @default(PENDING)

  organization      Organization @relation(fields: [organizationId], references: [id])
  fromUser          User         @relation("TransferFrom", fields: [fromUserId], references: [id])
  toUser            User         @relation("TransferTo", fields: [toUserId], references: [id])
  initiator         User         @relation("TransferInitiator", fields: [initiatedBy], references: [id])

  @@index([organizationId])
  @@index([fromUserId])
  @@index([toUserId])
}

enum TransferStatus {
  PENDING    // Awaiting approval
  APPROVED   // Transfer complete
  REJECTED   // Transfer denied
  CANCELLED  // Initiator cancelled
}
```

---

## API Changes

### New tRPC Routers

#### 1. Partner Router (`src/server/routers/partner.ts`)

```typescript
export const partnerRouter = router({
  // Organization Management
  createOrganization: protectedProcedure
    .input(z.object({
      name: z.string(),
      clientEmail: z.string().email(),
      clientName: z.string(),
      industry: z.string().optional(),
      size: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Validate user is a partner
      if (ctx.user.role !== 'partner') {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      // Create organization
      // Create PartnerOrganization tracking
      // Invite client as owner-to-be
      // Partner gets temporary full access
    }),

  // Dashboard
  listManagedOrganizations: protectedProcedure
    .query(async ({ ctx }) => {
      // Return all orgs created by this partner
      // Include status, handoff date, commission data
    }),

  // Ownership Transfer
  initiateOwnershipTransfer: protectedProcedure
    .input(z.object({
      organizationId: z.string(),
      newOwnerEmail: z.string().email(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Validate partner created this org
      // Create OwnershipTransfer record
      // Send invitation to new owner
      // Update PartnerOrganization status
    }),

  completeHandoff: protectedProcedure
    .input(z.object({
      organizationId: z.string(),
      removePartnerAccess: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Mark as COMPLETED
      // Optionally remove partner's membership
      // Update organization.partnerHandoffDate
    }),

  // Analytics
  getPartnerAnalytics: protectedProcedure
    .query(async ({ ctx }) => {
      // Total orgs created
      // Active setups
      // Completed handoffs
      // Commission data
    }),
})
```

#### 2. Update Organization Router

```typescript
export const organizationRouter = router({
  // ... existing procedures

  // New: Transfer ownership (owner only)
  transferOwnership: protectedProcedure
    .input(z.object({
      organizationId: z.string(),
      newOwnerUserId: z.string(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Validate current user is owner
      // Create OwnershipTransfer
      // Update Membership roles
      // Send notifications
    }),

  // New: Accept ownership transfer
  acceptOwnershipTransfer: protectedProcedure
    .input(z.object({
      transferId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Validate transfer is for this user
      // Update transfer status
      // Update membership to owner
      // Send confirmation
    }),

  // Modified: Create with partner support
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      isPartnerCreated: z.boolean().optional(),
      partnerNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // If user is partner, track in PartnerOrganization
      // Otherwise standard creation
    }),
})
```

#### 3. Update User Router

```typescript
export const userRouter = router({
  // ... existing procedures

  // New: Assign company_admin role (owner only)
  assignCompanyAdmin: protectedProcedure
    .input(z.object({
      organizationId: z.string(),
      userId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Validate current user is owner
      // Update Membership.role to 'company_admin'
      // Send notification to new admin
    }),

  // New: Revoke company_admin (owner only)
  revokeCompanyAdmin: protectedProcedure
    .input(z.object({
      organizationId: z.string(),
      userId: z.string(),
      newRole: z.enum(['admin', 'manager', 'recruiter']),
    }))
    .mutation(async ({ ctx, input }) => {
      // Downgrade company_admin to another role
    }),
})
```

---

## UI/UX Changes

### 1. Partner Dashboard (New)

**Route:** `/partner/dashboard`

**Features:**
- List of all organizations created by partner
- Status indicators (Setup, Ready, Handed Off, Completed)
- Quick actions: "Continue Setup", "Transfer Ownership", "View Organization"
- Analytics: Total orgs, active setups, completed handoffs
- Commission summary (if applicable)

**Mockup:**
```
┌─────────────────────────────────────────────────────────┐
│ Partner Dashboard                                        │
├─────────────────────────────────────────────────────────┤
│ Overview                                                 │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│ │  24     │ │   5     │ │   18    │ │   1     │       │
│ │ Total   │ │ Active  │ │ Handed  │ │ Pending │       │
│ │ Orgs    │ │ Setups  │ │ Off     │ │Transfer │       │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
├─────────────────────────────────────────────────────────┤
│ Organizations                                            │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Acme Corp        [Setup]     [Continue Setup]      │ │
│ │ Created: 2 days ago                                │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ TechStart Inc    [Ready]     [Transfer Ownership]  │ │
│ │ Created: 1 week ago                                │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Global Solutions [Handed Off] [View Org]           │ │
│ │ Handed off: 2 weeks ago                            │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 2. Create Organization for Client (Partner)

**Route:** `/partner/organizations/new`

**Form Fields:**
- Organization Name
- Client Email (required - who will be owner)
- Client Full Name
- Industry (optional, helps with AI setup)
- Company Size (optional)
- Notes for client

**Flow:**
1. Partner fills form
2. System creates organization
3. Partner gets temporary full access
4. Client receives invitation email
5. Partner can begin setup or use AI-guided setup

### 3. Transfer Ownership Dialog

**Triggered from:** Partner Dashboard or Org Settings

**Steps:**
1. **Select New Owner**
   - Enter email or choose from existing members
   - Confirm identity
2. **Review Transfer**
   - What they'll gain (billing access, full control)
   - What partner will lose (admin access)
   - Option: Keep read-only access (yes/no)
3. **Add Notes**
   - Message for new owner
   - Handoff instructions
4. **Confirm & Send**
   - New owner receives invitation
   - Transfer pending until accepted

### 4. Owner Settings: Company Admin Assignment

**Route:** `/dashboard/settings/team`

**New Section: "Company Administrators"**

```
┌─────────────────────────────────────────────────────────┐
│ Company Administrators                                   │
│                                                          │
│ Company Admins have full administrative access except   │
│ billing and organization ownership features.             │
│                                                          │
│ Current Company Admins:                                 │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ John Doe      john@acme.com    [Revoke]            │ │
│ │ Jane Smith    jane@acme.com    [Revoke]            │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ [+ Assign Company Admin]                                │
└─────────────────────────────────────────────────────────┘
```

**Assignment Dialog:**
1. Select user from organization members
2. Explain what they'll be able to do
3. Explain what they WON'T be able to do (billing)
4. Confirm assignment

### 5. Billing Protection for Company Admins

**Route:** `/dashboard/settings/billing`

**For company_admin role:**
```
┌─────────────────────────────────────────────────────────┐
│ 🔒 Billing Access Restricted                            │
│                                                          │
│ You are a Company Administrator. Only the organization  │
│ owner can access billing and subscription settings.     │
│                                                          │
│ If you need to make billing changes, please contact:    │
│ owner@acme.com (Organization Owner)                     │
│                                                          │
│ [Request Billing Access] (sends email to owner)         │
└─────────────────────────────────────────────────────────┘
```

### 6. Navigation Updates

**For Partners:**
```
Sidebar:
├── Partner Dashboard (new)
├── Organizations
│   ├── My Organizations (orgs they created)
│   └── Create for Client (new)
├── Analytics (partner-specific)
└── Settings
```

**For Owners:**
```
Settings Tabs:
├── General
├── Team
│   └── Company Administrators (new section)
├── Billing (owner only)
├── Integrations
└── Advanced
```

**For Company Admins:**
```
Settings Tabs:
├── General
├── Team
│   └── Company Administrators (read-only, can't assign)
├── [Billing hidden]
├── Integrations
└── Advanced
```

---

## Security Considerations

### 1. Role Escalation Prevention

**Attack Vector:** Company Admin trying to elevate to Owner

**Mitigation:**
```typescript
// In role assignment mutation
if (input.newRole === 'owner' && currentUserRole !== 'owner') {
  throw new TRPCError({
    code: 'FORBIDDEN',
    message: 'Only owners can assign owner role'
  })
}

// In billing routes
if (membership.role === 'company_admin') {
  throw new TRPCError({
    code: 'FORBIDDEN',
    message: 'Billing access restricted to owners'
  })
}
```

### 2. Partner Access Abuse

**Attack Vector:** Partner maintains access after handoff

**Mitigation:**
- Automatic access revocation on handoff completion
- Audit log of partner access post-handoff
- Owner can see partner access history
- Option to immediately revoke partner access

### 3. Ownership Transfer Security

**Attack Vector:** Malicious ownership transfer

**Mitigation:**
```typescript
// Two-step verification
1. Current owner initiates transfer
2. New owner must explicitly accept
3. Email verification for new owner
4. 24-hour cooldown period (configurable)
5. Audit trail of all transfers
6. Reversible within 48 hours by platform admin
```

### 4. Billing Isolation

**Attack Vector:** Company Admin accessing billing via API

**Mitigation:**
```typescript
// Middleware check on all billing routes
async function billingGuard(req, res, next) {
  const membership = await getMembership(userId, orgId)

  if (membership.role !== 'owner') {
    logSecurityEvent('BILLING_ACCESS_DENIED', {
      userId,
      orgId,
      role: membership.role,
      attemptedRoute: req.url
    })

    throw new Error('Billing access restricted to owners')
  }

  next()
}
```

### 5. Rate Limiting

**Attack Vector:** Partner mass-creating organizations

**Mitigation:**
```typescript
// Rate limits for partners
const PARTNER_LIMITS = {
  orgsPerDay: 10,
  orgsPerMonth: 50,
  activeSetups: 20, // Max concurrent setups
}

// Check before org creation
if (partner.activeSetups >= PARTNER_LIMITS.activeSetups) {
  throw new TRPCError({
    code: 'TOO_MANY_REQUESTS',
    message: 'Too many active setups. Complete or hand off existing organizations first.'
  })
}
```

---

## Implementation Plan

### Phase 1: Database & Backend (Week 1-2)

**Tasks:**
1. ✅ Design schema changes
2. Add PartnerOrganization model
3. Add OwnershipTransfer model
4. Update Organization model with partner fields
5. Create database migration
6. Add indexes for performance

**Validation:**
- Migration runs successfully
- Existing data unaffected
- Foreign key constraints working

### Phase 2: Permission System (Week 2-3)

**Tasks:**
1. Update `ROLE_PERMISSIONS` constant with `company_admin`
2. Add partner permission checks
3. Create billing protection middleware
4. Update `usePermissions` hook
5. Write unit tests for permission logic

**Validation:**
- Company admin cannot access billing routes
- Partners can create organizations
- Ownership transfer requires proper roles
- All permission tests passing

### Phase 3: API Implementation (Week 3-4)

**Tasks:**
1. Create `partner.ts` router
2. Add partner procedures (create org, transfer ownership)
3. Update `organization.ts` router with transfer methods
4. Add `company_admin` assignment procedures
5. Create API documentation

**Validation:**
- All procedures protected with proper guards
- Error handling comprehensive
- Input validation working
- Rate limiting implemented

### Phase 4: UI Components (Week 4-5)

**Tasks:**
1. Build Partner Dashboard page
2. Create "Create Organization for Client" form
3. Build Transfer Ownership dialog
4. Add Company Admin assignment UI
5. Implement billing protection screens
6. Update navigation for partners/admins

**Validation:**
- All forms validate properly
- Error states handled
- Loading states implemented
- Responsive design working

### Phase 5: Testing & Refinement (Week 5-6)

**Tasks:**
1. End-to-end testing of partner workflow
2. Test ownership transfer flow
3. Test company_admin restrictions
4. Security penetration testing
5. Performance testing with multiple orgs
6. Bug fixes and polish

**Validation:**
- All user flows working
- No security vulnerabilities
- Performance acceptable
- UX smooth and intuitive

### Phase 6: Documentation & Launch (Week 6)

**Tasks:**
1. Write user documentation for partners
2. Create video tutorials
3. Update help content
4. Prepare announcement
5. Train support team
6. Gradual rollout to beta partners

**Validation:**
- Documentation complete
- Support team trained
- Beta partners onboarded successfully
- Feedback collected and addressed

---

## Rollout Strategy

### Stage 1: Beta Partners (10 selected partners)
- Invite 10 trusted partners
- Provide white-glove support
- Collect detailed feedback
- Monitor for issues

### Stage 2: General Availability (All partners)
- Open to all qualifying partners
- Self-service onboarding
- Automated support via docs
- Monitor metrics

### Success Metrics
- Partner satisfaction > 4.5/5
- Avg time to create org < 2 minutes
- Ownership transfer completion rate > 95%
- Zero security incidents
- < 5% support ticket rate

---

## Future Enhancements

### V2 Features (3-6 months)

1. **Partner Tiers**
   - Bronze/Silver/Gold tiers
   - Different org limits
   - Commission rates vary by tier

2. **White-Label Support**
   - Partners can brand their org creation flow
   - Custom domains for partner clients
   - Partner logo in emails

3. **Commission Automation**
   - Automatic commission tracking
   - Payout reports
   - Integration with accounting systems

4. **Partner Marketplace**
   - Directory of certified partners
   - Client reviews/ratings
   - Partner specializations (industry, size)

5. **Multi-Level Ownership**
   - Co-owners
   - Owner succession planning
   - Emergency access delegation

---

## Appendix

### A. Environment Variables

Add to `.env`:
```bash
# Partner Configuration
PLATFORM_PARTNERS=user_id_1,user_id_2,user_id_3

# Partner Limits
PARTNER_ORG_LIMIT_DAILY=10
PARTNER_ORG_LIMIT_MONTHLY=50
PARTNER_MAX_ACTIVE_SETUPS=20

# Transfer Settings
OWNERSHIP_TRANSFER_COOLDOWN_HOURS=24
OWNERSHIP_TRANSFER_REVERSIBLE_HOURS=48
```

### B. Audit Log Events

New events to log:
- `PARTNER_ORG_CREATED`
- `OWNERSHIP_TRANSFER_INITIATED`
- `OWNERSHIP_TRANSFER_ACCEPTED`
- `OWNERSHIP_TRANSFER_REJECTED`
- `COMPANY_ADMIN_ASSIGNED`
- `COMPANY_ADMIN_REVOKED`
- `BILLING_ACCESS_DENIED`
- `PARTNER_ACCESS_REVOKED`

### C. Email Templates

New templates needed:
1. **Partner Invitation** - Invite user to become partner
2. **Client Org Created** - Notify client their org is ready
3. **Ownership Transfer Request** - Invite to accept ownership
4. **Ownership Transfer Complete** - Confirmation to both parties
5. **Company Admin Assigned** - Notify new company admin
6. **Billing Access Denied** - Help company admin contact owner

---

**End of Document**
