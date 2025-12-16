import { RavenDocument, TenantScopedDocument, AuditableDocument } from '../core';

/**
 * Billing Account Document
 * Represents a Stripe billing account for a tenant or company
 */
export interface BillingAccountDocument extends
  RavenDocument,
  TenantScopedDocument,
  AuditableDocument {
  collection: 'billing-accounts';

  /** Stripe customer ID */
  stripeCustomerId: string;

  /** Account owner user ID */
  ownerId: string;

  /** Billing account name */
  name: string;

  /** Account email for billing */
  email: string;

  /** Account type: tenant-level or company-level */
  accountType: 'tenant' | 'company';

  /** For company accounts, the company ID */
  companyId?: string;

  /** Default payment method ID */
  defaultPaymentMethodId?: string;

  /** Billing address */
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };

  /** Tax information */
  taxInfo?: {
    taxId?: string;
    taxIdType?: string;
    businessType?: string;
    taxExempt?: boolean;
    taxExemptIds?: string[];
  };

  /** Billing preferences */
  preferences?: {
    currency: string; // ISO 4217 currency code
    timezone: string; // IANA timezone
    billingDay?: number; // Day of month for billing (1-31)
    invoiceDelivery: 'email' | 'portal' | 'both';
    poRequired?: boolean;
    approvalRequired?: boolean;
    approvers?: string[];
  };

  /** Credit balance */
  creditBalance?: number;

  /** Account status */
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';

  /** Collection method */
  collectionMethod: 'charge_automatically' | 'send_invoice';

  /** Payment terms for invoice collection */
  paymentTerms?: number; // Days until payment is due

  /** Next billing date */
  nextBillingDate?: string;

  /** Metadata from Stripe */
  stripeMetadata?: Record<string, string>;

  /** Invoice customization */
  invoiceSettings?: {
    footer?: string;
    defaultPaymentMethod?: string;
    renderingOptions?: {
      amountTaxDisplays?: string;
      totalTaxDisplays?: string;
    };
  };

  /** Billing history summary */
  summary?: {
    totalRevenue?: number;
    thisMonthRevenue?: number;
    lastMonthRevenue?: number;
    lifetimeValue?: number;
    averageInvoiceAmount?: number;
    invoiceCount?: number;
  };

  /** Integration settings */
  integrations?: {
    quickbooks?: {
      enabled: boolean;
      realmId?: string;
      accessToken?: string;
      refreshDate?: string;
    };
    xero?: {
      enabled: boolean;
      tenantId?: string;
      accessToken?: string;
      refreshDate?: string;
    };
  };
}