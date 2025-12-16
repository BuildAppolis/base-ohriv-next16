import { RavenDocument, TenantScopedDocument, AuditableDocument, SoftDelete } from '../core';

/**
 * Payment Method Document
 * Represents a payment method stored in Stripe
 */
export interface PaymentMethodDocument extends
  RavenDocument,
  TenantScopedDocument,
  AuditableDocument,
  SoftDelete {
  collection: 'payment-methods';

  /** Stripe payment method ID */
  stripePaymentMethodId: string;

  /** Associated billing account ID */
  billingAccountId: string;

  /** Company ID if payment method is company-specific */
  companyId?: string;

  /** Owner user ID */
  ownerId: string;

  /** Payment method type */
  type:
    | 'card'
    | 'bank_account'
    | 'ideal'
    | 'sepa_debit'
    | 'acss_debit'
    | 'au_becs_debit'
    | 'bacs_debit'
    | 'us_bank_account'
    | 'link'
    | 'paypal'
    | 'klarna'
    | 'afterpay_clearpay'
    | 'affirm';

  /** Payment method subtype */
  subtype?: string;

  /** Card details for card payments */
  card?: {
    brand: 'visa' | 'mastercard' | 'amex' | 'discover' | 'unionpay' | 'diners' | 'jcb' | 'unknown';
    last4: string;
    expMonth: number;
    expYear: number;
    fingerprint: string;
    funding: 'credit' | 'debit' | 'prepaid' | 'unknown';
    country?: string;
    threeDSecureUsage?: {
      supported: boolean;
    };
  };

  /** Bank account details */
  bankAccount?: {
    country: string;
    currency: string;
    bankName?: string;
    last4: string;
    fingerprint: string;
    routingNumber?: string;
    accountType?: 'checking' | 'savings';
    accountHolderType?: 'individual' | 'company';
  };

  /** Wallet details for digital wallets */
  wallet?: {
    type: 'apple_pay' | 'google_pay' | 'link' | 'paypal' | 'paypal_credit';
    applePay?: {
      last4: string;
      type: 'credit' | 'debit' | 'prepaid';
      brand: string;
    };
    googlePay?: {
      last4: string;
      type: 'credit' | 'debit' | 'prepaid';
      brand: string;
    };
  };

  /** Billing details */
  billingDetails?: {
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
    email?: string;
    name?: string;
    phone?: string;
  };

  /** Payment method status */
  status: 'pending_setup' | 'succeeded' | 'failed' | 'requires_action' | 'requires_confirmation';

  /** Whether this is the default payment method */
  isDefault: boolean;

  /** Whether the payment method is reusable */
  isReusable: boolean;

  /** Usage type */
  usageType: 'on_session' | 'off_session';

  /** Verification status */
  verification?: {
    status: 'passed' | 'failed' | 'pending';
    failureReason?: string;
    attemptedAt?: string;
  };

  /** Exchange rate for international payments */
  exchangeRate?: number;

  /** Payment method metadata */
  metadata?: {
    label?: string;
    description?: string;
    department?: string;
    project?: string;
    purpose?: string;
    restrictions?: string[];
  };

  /** Configuration for payment method */
  configuration?: {
    typeSpecific?: {
      card?: {
        requireCvc?: boolean;
        threeDSecure?: 'required' | 'optional' | 'not_supported';
      };
      bank?: {
        mandateType?: string;
        mandateVersion?: string;
      };
    };
    restrictions?: {
      maxAmount?: number;
      minAmount?: number;
      currencies?: string[];
      allowedMerchantCategories?: string[];
      blockedMerchantCategories?: string[];
    };
  };

  /** Last used timestamp */
  lastUsedAt?: string;

  /** Usage statistics */
  usageStats?: {
    totalTransactions?: number;
    totalAmount?: number;
    successRate?: number;
    averageTransactionAmount?: number;
    lastTransactionStatus?: 'succeeded' | 'failed';
  };

  /** Risk assessment */
  risk?: {
    level: 'low' | 'normal' | 'elevated' | 'high';
    score?: number;
    factors?: string[];
    lastAssessment?: string;
  };

  /** Fraud detection flags */
  fraudFlags?: Array<{
    type: string;
    detectedAt: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;

  /** Error information if setup failed */
  error?: {
    code?: string;
    message?: string;
    type?: string;
    param?: string;
  };

  /** Network status */
  networkStatus?: {
    available: boolean;
    downtime?: string;
    maintenance?: boolean;
  };

  /** Billing cycle for recurring payments */
  billingCycle?: {
    anchor: string;
    interval: 'day' | 'week' | 'month' | 'year';
    intervalCount: number;
  };
}