import { RavenDocument, TenantScopedDocument, AuditableDocument } from '../core';

/**
 * Invoice Document
 * Represents a Stripe invoice for billing
 */
export interface InvoiceDocument extends
  RavenDocument,
  TenantScopedDocument,
  AuditableDocument {
  collection: 'invoices';

  /** Stripe invoice ID */
  stripeInvoiceId: string;

  /** Associated billing account ID */
  billingAccountId: string;

  /** Company ID if invoice is for a specific company */
  companyId?: string;

  /** Invoice number from Stripe */
  invoiceNumber?: string;

  /** Invoice status from Stripe */
  status:
    | 'draft'
    | 'open'
    | 'paid'
    | 'void'
    | 'uncollectible'
    | 'deleted';

  /** Total amount in cents */
  total: number;

  /** Amount due (total - paid) */
  amountDue: number;

  /** Amount already paid */
  amountPaid: number;

  /** Amount remaining */
  amountRemaining: number;

  /** Currency code (ISO 4217) */
  currency: string;

  /** Invoice date */
  createdAt: string;

  /** Due date */
  dueDate?: string;

  /** Payment date if paid */
  paidAt?: string;

  /** Billing period for subscription invoices */
  periodStart?: string;
  periodEnd?: string;

  /** Invoice type */
  invoiceType:
    | 'subscription'
    | 'one_time'
    | 'usage_based'
    | 'credit'
    | 'refund'
    | 'adjustment';

  /** Invoice lines/items */
  lines?: Array<{
    id: string;
    description?: string;
    quantity?: number;
    unitAmount?: number;
    unitAmountDecimal?: string;
    amount: number;
    currency: string;
    period?: {
      start: string;
      end: string;
    };
    proration?: boolean;
    subscription?: string;
    subscriptionItem?: string;
    metadata?: Record<string, string>;
    type: 'invoiceitem' | 'subscription' | 'upcoming';
  }>;

  /** Tax amounts */
  tax?: Array<{
      amount: number;
      inclusive: boolean;
      amountDecimal?: string;
      price?: string;
      rate?: string;
      jurisdiction?: string;
      type?: 'sales_tax' | 'vat' | 'gst' | 'hst' | 'pst' | 'qst';
    }>;

  /** Total tax amount */
  taxAmount?: number;

  /** Discount applied */
  discount?: {
    coupon?: string;
    couponId?: string;
    percentOff?: number;
    amountOff?: number;
    promotionCode?: string;
  };

  /** Discount amount in cents */
  discountAmount?: number;

  /** Subtotal before discounts and tax */
  subtotal?: number;

  /** Starting balance before this invoice */
  startingBalance?: number;

  /** Ending balance after this invoice */
  endingBalance?: number;

  /** Customer balance applied */
  customerBalance?: number;

  /** Billing reason */
  billingReason?:
    | 'subscription_cycle'
    | 'subscription_create'
    | 'subscription_update'
    | 'subscription_threshold'
    | 'manual'
    | 'upcoming'
    | 'transfer'
    | 'subscription_delete';

  /** Payment configuration */
  paymentSettings?: {
    defaultPaymentMethod?: string;
    paymentMethodTypes?: string[];
    paymentMethodOptions?: Record<string, any>;
  };

  /** Shipping information */
  shipping?: {
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
    cost?: number;
    name?: string;
    phone?: string;
    tracking?: {
      carrier?: string;
      number?: string;
      url?: string;
    };
  };

  /** Invoice metadata */
  metadata?: {
    purchaseOrder?: string;
    department?: string;
    project?: string;
    costCenter?: string;
    approver?: string;
    notes?: string;
    internalReference?: string;
  };

  /** Invoice footer text */
  footer?: string;

  /** Memo/description */
  description?: string;

  /** Statement descriptor */
  statementDescriptor?: string;

  /** Hosted invoice URL */
  hostedInvoiceUrl?: string;

  /** Invoice PDF URL */
  invoicePdf?: string;

  /** Account tax IDs */
  customerTaxIds?: Array<{
    type: string;
    value: string;
  }>;

  /** Customer address */
  customerAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };

  /** Customer shipping address */
  customerShipping?: {
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
    name?: string;
    phone?: string;
  };

  /** Transfer data for connected accounts */
  transferData?: {
    amount?: number;
    destination?: string;
    destinationPaymentMethod?: string;
  };

  /** Automatic tax enabled */
  automaticTax?: {
    enabled: boolean;
    liability?: {
      type: string;
      account?: string;
    };
  };

  /** Collection method */
  collectionMethod: 'charge_automatically' | 'send_invoice';

  /** Next payment attempt */
  nextPaymentAttempt?: string;

  /** Number of payment attempts made */
  attemptCount?: number;

  /** Invoice finalized status */
  finalizedAt?: string;

  /** Invoice voided status */
  voidedAt?: string;

  /** Invoice marked uncollectible */
  markedUncollectibleAt?: string;

  /** Auto-advance configuration */
  autoAdvance?: boolean;

  /** Custom fields */
  customFields?: Array<{
    name: string;
    value: string;
  }>;
}