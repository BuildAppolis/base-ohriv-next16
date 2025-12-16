RavenDB Models Migration Plan
Understanding from Research
Key Insights:
RavenDB is schema-less: Unlike SQL databases, RavenDB doesn't require explicit schema migrations. Documents can have different structures within the same collection.
Collection-based organization: Documents are organized into collections, similar to tables but more flexible.
Document conventions control behavior: ID generation, collection naming, and serialization are handled by conventions.
No formal migration process needed: New models can be added directly. Indexes may need updating for new queries.
Backward compatibility: Old documents continue working with new models (with proper null checks).
Current System Patterns:
Base Interfaces: RavenDocument, TenantScopedDocument, AuditableDocument
Collection Names: kebab-case (e.g., users, tenants, jobs)
Document IDs: {collection}/{id} format
Multi-tenant: Each tenant gets its own database
Type Safety: Strong TypeScript interfaces
Implementation Plan
Phase 1: Create New Model Files
Based on the schema in docs/BACKEND_SCHEMA.md, create the following models:
Core Models (packages/database/src/models/core/)
Update existing interfaces to match new schema
Add Stripe integration models
Add Stack Auth metadata models
Auth Models (packages/database/src/models/auth/)
StackAuthUserDocument
StackAuthTeamDocument
AuthSessionDocument
Enhanced Tenant Models (packages/database/src/models/tenant/)
Update TenantDocument with Stack Auth integration
Add TenantBillingDocument
Add TenantUsageDocument
Company Models (packages/database/src/models/company/)
CompanyDocument
CompanyBillingDocument
CompanyMembershipDocument
Billing Models (packages/database/src/models/billing/)
BillingAccountDocument
SubscriptionDocument
InvoiceDocument
PaymentMethodDocument
Phase 2: Update Collection Constants
Update packages/database/src/models/collections.ts:
Add new collection names
Ensure consistency with schema
Phase 3: Create Indexes
Create new indexes in packages/database/src/indexes/:
Users_ByStackAuthId
Tenants_ByBillingAccount
Companies_ByTenant
Subscriptions_ByStatus
Phase 4: Database Initialization
Create initialization script to:
Ensure collections exist (auto-created on first document)
Deploy new indexes
Set up document conventions
Key Design Decisions
Backward Compatibility: New fields will be optional to support existing documents
Soft Deletes: All major documents will support soft delete
Audit Trail: Track creation and modification timestamps
Multi-tenancy: All tenant-scoped documents include tenantId
Type Safety: Use strict TypeScript interfaces
Files to Modify/Create
New Files:
packages/database/src/models/auth/index.ts
packages/database/src/models/auth/stack-auth-user.ts
packages/database/src/models/auth/stack-auth-team.ts
packages/database/src/models/billing/index.ts
packages/database/src/models/billing/billing-account.ts
packages/database/src/models/billing/subscription.ts
packages/database/src/models/billing/invoice.ts
packages/database/src/models/billing/payment-method.ts
packages/database/src/models/company/index.ts
packages/database/src/models/company/company.ts
packages/database/src/models/company/company-billing.ts
packages/database/src/models/company/company-membership.ts
Modified Files:
packages/database/src/models/core/index.ts - Add new base interfaces
packages/database/src/models/core/raven-document.ts - Extend with metadata
packages/database/src/models/tenant/index.ts - Add new exports
packages/database/src/models/tenant/tenant.ts - Update with Stack Auth
packages/database/src/models/collections.ts - Add new collections
packages/database/src/index.ts - Export new models
Implementation Notes
No Migration Required: Since RavenDB is schema-less, we can start using new models immediately
Index Deployment: New indexes should be deployed before application startup
Testing: Ensure all queries work with both old and new document structures
Validation: Add runtime validation for optional fields when needed
Benefits
Zero Downtime: New models work alongside existing ones
Gradual Rollout: Can deploy incrementally
Data Integrity: Type safety ensures correct structure
Performance: Optimized indexes for new queries