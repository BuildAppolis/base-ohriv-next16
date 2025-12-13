/**
 * AI Cost Calculator
 * Calculate AI generation costs based on OpenAI pricing data
 */

// Pricing data per 1M tokens (Standard pricing tier as default)
export const MODEL_PRICING = {
  // GPT-5 Series
  'gpt-5.1': { input: 1.25, output: 10.00, cached: 0.125 },
  'gpt-5': { input: 1.25, output: 10.00, cached: 0.125 },
  'gpt-5-mini': { input: 0.25, output: 2.00, cached: 0.025 },
  'gpt-5-nano': { input: 0.05, output: 0.40, cached: 0.005 },
  'gpt-5-pro': { input: 15.00, output: 120.00, cached: null },

  // GPT-4.1 Series
  'gpt-4.1': { input: 2.00, output: 8.00, cached: 0.50 },
  'gpt-4.1-mini': { input: 0.40, output: 1.60, cached: 0.10 },
  'gpt-4.1-nano': { input: 0.10, output: 0.40, cached: 0.025 },

  // GPT-4O Series
  'gpt-4o': { input: 2.50, output: 10.00, cached: 1.25 },
  'gpt-4o-mini': { input: 0.15, output: 0.60, cached: 0.075 },

  // O-Series (Reasoning Models)
  'o3': { input: 2.00, output: 8.00, cached: 0.50 },
  'o3-pro': { input: 20.00, output: 80.00, cached: null },
  'o3-deep-research': { input: 10.00, output: 40.00, cached: 2.50 },
  'o4-mini': { input: 1.10, output: 4.40, cached: 0.275 },
  'o4-mini-deep-research': { input: 2.00, output: 8.00, cached: 0.50 },
  'o1': { input: 15.00, output: 60.00, cached: 7.50 },
  'o1-pro': { input: 150.00, output: 600.00, cached: null },

  // Legacy Models
  'gpt-4-turbo': { input: 10.00, output: 30.00, cached: null },
  'gpt-4': { input: 30.00, output: 60.00, cached: null },
  'gpt-3.5-turbo': { input: 0.50, output: 1.50, cached: null },
} as const;

// Pricing tiers
export type PricingTier = 'batch' | 'flex' | 'standard' | 'priority';

// Multiplier for different pricing tiers
export const PRICING_TIER_MULTIPLIERS: Record<PricingTier, number> = {
  batch: 0.8,       // 20% discount
  flex: 0.9,        // 10% discount
  standard: 1.0,    // Base price
  priority: 2.0,    // 2x price
};

// Cost calculation interface
export interface CostCalculationOptions {
  model: string;
  inputTokens: number;
  outputTokens: number;
  pricingTier?: PricingTier;
  cachedTokens?: number; // Optional cached tokens
}

export interface CostBreakdown {
  inputCost: number;
  outputCost: number;
  cachedCost: number;
  totalCost: number;
  currency: string;
  pricingTier: PricingTier;
}

/**
 * Get pricing data for a model
 */
export function getModelPricing(model: string) {
  return MODEL_PRICING[model as keyof typeof MODEL_PRICING] || null;
}

/**
 * Calculate AI generation cost
 */
export function calculateCost(options: CostCalculationOptions): CostBreakdown | null {
  const pricing = getModelPricing(options.model);
  if (!pricing) return null;

  const tier = options.pricingTier || 'standard';
  const multiplier = PRICING_TIER_MULTIPLIERS[tier];

  const inputCost = (options.inputTokens / 1000000) * pricing.input * multiplier;
  const outputCost = (options.outputTokens / 1000000) * pricing.output * multiplier;
  const cachedCost = options.cachedTokens && pricing.cached
    ? (options.cachedTokens / 1000000) * pricing.cached * multiplier
    : 0;

  return {
    inputCost: Math.round(inputCost * 10000) / 10000, // Round to 4 decimal places
    outputCost: Math.round(outputCost * 10000) / 10000,
    cachedCost: Math.round(cachedCost * 10000) / 10000,
    totalCost: Math.round((inputCost + outputCost + cachedCost) * 10000) / 10000,
    currency: 'USD',
    pricingTier: tier,
  };
}

/**
 * Estimate cost before generation
 */
export function estimateCost(
  model: string,
  estimatedInputTokens: number,
  estimatedOutputTokens: number,
  pricingTier: PricingTier = 'standard'
): CostBreakdown | null {
  return calculateCost({
    model,
    inputTokens: estimatedInputTokens,
    outputTokens: estimatedOutputTokens,
    pricingTier,
  });
}

/**
 * Calculate actual cost after generation
 */
export function calculateActualCost(
  model: string,
  actualInputTokens: number,
  actualOutputTokens: number,
  cachedTokens: number = 0,
  pricingTier: PricingTier = 'standard'
): CostBreakdown | null {
  return calculateCost({
    model,
    inputTokens: actualInputTokens,
    outputTokens: actualOutputTokens,
    cachedTokens,
    pricingTier,
  });
}

/**
 * Estimate input tokens from text (rough approximation)
 */
export function estimateTokens(text: string): number {
  // Rough approximation: ~1 token per 4 characters for English text
  return Math.ceil(text.length / 4);
}