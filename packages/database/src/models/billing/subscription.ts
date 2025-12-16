import { RavenDocument, TenantScopedDocument, AuditableDocument, SoftDelete } from '../core';

/**
 * Subscription Document
 * Represents a Stripe subscription for a tenant or company
 */
export interface SubscriptionDocument extends
  RavenDocument,
  TenantScopedDocument,
  AuditableDocument,
  SoftDelete {
  collection: 'subscriptions';

  /** Stripe subscription ID */
  stripeSubscriptionId: string;

  /** Associated billing account ID */
  billingAccountId: string;

  /** Company ID if this is a company-specific subscription */
  companyId?: string;

  /** Subscription status from Stripe */
  status:
    | 'trialing'
    | 'active'
    | 'past_due'
    | 'canceled'
    | 'unpaid'
    | 'incomplete'
    | 'incomplete_expired'
    | 'paused';

  /** Subscription type */
  subscriptionType:
    | 'platform_fee'          // Platform usage fee
    | 'tenant_access'         // Tenant-level access
    | 'company_access'        // Company-specific access
    | 'feature_addon'         // Additional features
    | 'usage_based'           // Usage-based billing
    | 'support_package'       // Premium support
    | 'integration_addon';    // Third-party integrations

  /** Product/Plan ID from Stripe */
  stripeProductId?: string;
  stripePriceId?: string;

  /** Current subscription period */
  currentPeriodStart: string;
  currentPeriodEnd: string;

  /** Trial period if applicable */
  trialStart?: string;
  trialEnd?: string;

  /** Cancellation information */
  canceledAt?: string;
  cancelAtPeriodEnd?: boolean;
  cancellationReason?: string;

  /** Billing configuration */
  billing: {
    interval: 'day' | 'week' | 'month' | 'year';
    intervalCount: number;
    collectionMethod: 'charge_automatically' | 'send_invoice';
    daysUntilDue?: number;
    currency: string;
    unitAmount: number;
    unitAmountDecimal?: string;
  };

  /** Quantity for metered/quantity-based subscriptions */
  quantity?: number;

  /** Usage-based billing configuration */
  usage?: {
    billingScheme: 'per_unit' | 'tiered' | 'volume' | 'package';
    tiers?: Array<{
      upTo?: number;
      unitAmount?: number;
      flatAmount?: number;
    }>;
    unitAmount?: number;
  };

  /** Subscription items for complex subscriptions */
  items?: Array<{
    id: string;
    stripePriceId: string;
    quantity?: number;
    metadata?: Record<string, string>;
  }>;

  /** Discount information */
  discount?: {
    stripeCouponId?: string;
    stripePromotionCodeId?: string;
    percentOff?: number;
    amountOff?: number;
    duration: 'once' | 'repeating' | 'forever';
    durationInMonths?: number;
  };

  /** Subscription metadata */
  metadata?: {
    featureSet?: string[];
    limits?: {
      users?: number;
      companies?: number;
      storage?: number;
      apiCalls?: number;
    };
    features?: Record<string, boolean>;
    customFields?: Record<string, any>;
  };

  /** Automatic tax configuration */
  automaticTax?: {
    enabled: boolean;
    liability?: {
      type: string;
      account?: string;
    };
  };

  /** Billing reason */
  billingReason?:
    | 'subscription_create'
    | 'subscription_cycle'
    | 'subscription_update'
    | 'subscription'
    | 'manual'
    | 'upcoming'
    | 'transfer';

  /** Latest invoice ID */
  latestInvoiceId?: string;

  /** Next pending invoice item ID */
  pendingInvoiceItemIntents?: string[];

  /** Pause configuration */
  pauseCollection?: {
    behavior: 'void' | 'keep_as_draft' | 'mark_uncollectible';
    resumesAt?: string;
  };

  /** Scheduled changes */
  pendingUpdate?: {
    prorationDate?: number;
    items?: Array<{
      id: string;
      price?: string;
      quantity?: number;
      deleted?: boolean;
    }>;
    trialEnd?: number;
  };

  /** Subscription history */
  history?: Array<{
    timestamp: string;
    event: string;
    changes: Record<string, any>;
    userId?: string;
  }>;
}