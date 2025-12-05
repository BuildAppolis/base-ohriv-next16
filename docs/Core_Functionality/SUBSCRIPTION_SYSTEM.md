# Ohriv Subscription System Documentation

## Overview
The Ohriv platform uses a tiered subscription model with a base membership fee and optional add-ons that are automatically activated based on usage and data volume.

## Pricing Structure

### Base Membership
- **Monthly**: $450/month
- **Annual**: $4,800/year (saves $600/year)
- **Required**: Every organization must have an active base membership
- **Includes**: Core platform features, basic recruiting tools, user management

### Add-on Features
Each add-on costs:
- **Monthly**: $120/month
- **Annual**: $1,000/year (saves $440/year)

#### Add-on Types (Interview Stages)
1. **Custom Interview Add-on**
   - Purpose: Create and manage custom interview stages tailored to specific roles
   - Features: 
     - Unlimited custom interview stages
     - Custom scoring rubrics per stage
     - Stage-specific analytics and reporting
   - Activation: Based on volume of custom interview stages created
   - Value: Organizations needing specialized interview processes beyond standard stages

2. **Final Interview Add-on**
   - Purpose: Advanced tools for final round interviews and decision making
   - Features:
     - Structured decision matrix for final evaluations
     - Panel interview coordination tools
     - Offer management and tracking
   - Activation: When organization conducts final interviews regularly
   - Value: Streamlines the critical final decision phase

3. **Phone Interview Add-on**
   - Purpose: Streamlined phone screening and initial assessment tools
   - Features:
     - Automated call scheduling integration
     - Quick scoring templates for phone screens
     - Auto-filtering based on phone screen results
   - Activation: Based on volume of phone interviews conducted
   - Value: Efficiently manage high-volume initial screenings

## Automatic Add-on Activation

Add-ons are activated automatically based on usage patterns to ensure customers only pay when they receive value:

```typescript
// Activation thresholds for interview add-ons
const ADD_ON_TRIGGERS = {
  custom_interview: {
    condition: 'customStages.count >= 3 || customStageUsage >= 10/month',
    description: 'Activated when organization creates custom interview workflows'
  },
  final_interview: {
    condition: 'finalInterviews.count >= 5/month',
    description: 'Activated based on final interview volume'
  },
  phone_interview: {
    condition: 'phoneScreens.count >= 20/month',
    description: 'Activated when phone screening volume justifies automation'
  }
};
```

## Database Schema

### Subscription Configuration (Global Settings)
```prisma
model SubscriptionConfig {
  id                String   @id @default(cuid())
  baseMonthlyPrice  Float    @default(450)
  baseAnnualPrice   Float    @default(4800)
  addonMonthlyPrice Float    @default(120)
  addonAnnualPrice  Float    @default(1000)
  stripeBasePriceId String?  // Stripe Price ID for base subscription
  updatedAt         DateTime @updatedAt
}

model SubscriptionAddon {
  id                String   @id @default(cuid())
  key               String   @unique // predictive_analytics, advanced_reporting, team_collaboration
  name              String
  description       String
  features          Json     // Array of feature descriptions
  monthlyPrice      Float    @default(120)
  annualPrice       Float    @default(1000)
  activationRule    String   // SQL/logic for auto-activation
  stripePriceId     String?  // Stripe Price ID
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model OrganizationSubscription {
  id                   String       @id @default(cuid())
  organizationId       String       @unique
  stripeCustomerId     String
  stripeSubscriptionId String
  status               String       // active, canceled, past_due, trialing
  billingCycle         String       // monthly, annual
  baseSubscriptionId   String       // Stripe subscription item ID
  currentPeriodStart   DateTime
  currentPeriodEnd     DateTime
  cancelAtPeriodEnd    Boolean      @default(false)
  organization         organization @relation(fields: [organizationId], references: [id])
  addons               OrganizationAddon[]
  createdAt            DateTime     @default(now())
  updatedAt            DateTime     @updatedAt
}

model OrganizationAddon {
  id                 String                   @id @default(cuid())
  subscriptionId     String
  addonKey           String
  stripeItemId       String?                  // Stripe subscription item ID
  status             String                   // active, pending, canceled
  activatedAt        DateTime?
  activationReason   String?                  // Why it was activated
  manualOverride     Boolean   @default(false) // Admin manually activated/deactivated
  subscription       OrganizationSubscription @relation(fields: [subscriptionId], references: [id])
  createdAt          DateTime                 @default(now())
  updatedAt          DateTime                 @updatedAt
}
```

## Stripe Integration

### Price Management
When admin updates pricing in the dashboard:
1. Create new Stripe Price object with updated amount
2. Update all existing subscriptions to use new price (prorated)
3. Store new Stripe Price ID in database

### Subscription Lifecycle

#### Organization Creation
1. Organization signs up
2. Create Stripe Customer
3. Create Stripe Subscription with base price
4. Store subscription details in database

#### Add-on Activation
1. Background job monitors usage metrics
2. When threshold met, add subscription item to Stripe subscription
3. Send notification to organization
4. Record activation in database

#### Billing
- Stripe handles all recurring billing
- Webhooks update database with payment status
- Failed payments trigger notifications and grace period

## Admin Configuration

### Pricing Management Page (`/admin/pricing`)
- Update base membership prices (monthly/annual)
- Update add-on prices
- Edit add-on features and descriptions
- View current subscriber counts
- Preview changes before applying

### Implementation Flow
```typescript
// Admin updates pricing
async function updatePricing(config: PricingConfig) {
  // 1. Create new Stripe prices
  const stripePrices = await createStripePrices(config);
  
  // 2. Update database configuration
  await updateDatabaseConfig(config, stripePrices);
  
  // 3. Migrate existing subscriptions
  await migrateExistingSubscriptions(stripePrices);
  
  // 4. Send notifications to affected customers
  await notifyCustomers(config);
}
```

## API Endpoints

### Subscription Management
- `GET /api/subscriptions/config` - Get current pricing configuration
- `PATCH /api/subscriptions/config` - Update pricing (admin only)
- `GET /api/subscriptions/addons` - List all add-ons with current status
- `POST /api/subscriptions/addons/:key/override` - Manually activate/deactivate add-on

### Organization Subscriptions
- `GET /api/organizations/:id/subscription` - Get organization's subscription details
- `POST /api/organizations/:id/subscription` - Create subscription
- `PATCH /api/organizations/:id/subscription` - Update billing cycle or cancel
- `GET /api/organizations/:id/subscription/usage` - Get usage metrics for add-on triggers

## Monitoring & Analytics

### Key Metrics
- Monthly Recurring Revenue (MRR)
- Add-on activation rate
- Churn rate by subscription type
- Average time to add-on activation
- Revenue per organization

### Alerts
- Payment failures
- Unusual usage patterns
- Add-on activation thresholds approaching
- Subscription cancellations

## Testing Strategy

### Unit Tests
- Pricing calculation logic
- Add-on activation rules
- Subscription state transitions

### Integration Tests
- Stripe API interactions
- Webhook processing
- Database updates

### End-to-End Tests
- Complete signup flow
- Add-on activation based on usage
- Billing cycle changes
- Cancellation and reactivation

## Security Considerations

1. **PCI Compliance**: Never store credit card details, use Stripe tokens
2. **Webhook Validation**: Verify Stripe webhook signatures
3. **Access Control**: Only super admins can modify pricing
4. **Audit Trail**: Log all subscription changes
5. **Data Encryption**: Encrypt sensitive subscription data at rest

## Future Enhancements

1. **Usage-based Pricing**: Charge based on number of candidates/jobs
2. **Custom Plans**: Enterprise customers with negotiated rates
3. **Bundled Discounts**: Reduced rates for multiple add-ons
4. **Referral Program**: Discounts for customer referrals
5. **Free Trial**: 14-day trial with full features
6. **Granular Add-ons**: More specific feature packages

## Support & Troubleshooting

### Common Issues

#### Subscription Not Activating
- Check Stripe webhook configuration
- Verify organization has Stripe customer ID
- Check payment method on file

#### Add-on Not Auto-Activating
- Verify usage metrics are being tracked
- Check activation thresholds in config
- Review manual override settings

#### Pricing Changes Not Reflecting
- Ensure Stripe API keys are valid
- Check for pending migrations
- Verify cache invalidation

### Contact
For subscription-related issues:
- Technical: dev@ohriv.com
- Billing: billing@ohriv.com
- Support: support@ohriv.com