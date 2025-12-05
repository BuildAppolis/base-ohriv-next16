/**
 * Company Enums
 * Predefined options for company characteristics
 */

export const BUSINESS_MODELS = [
  { id: 'b2b_saas', label: 'B2B SaaS', description: 'Software as a Service for businesses' },
  { id: 'b2c_saas', label: 'B2C SaaS', description: 'Software as a Service for consumers' },
  { id: 'b2b_marketplace', label: 'B2B Marketplace', description: 'Platform connecting businesses' },
  { id: 'b2c_marketplace', label: 'B2C Marketplace', description: 'Platform connecting consumers' },
  { id: 'ecommerce', label: 'E-commerce', description: 'Online retail and goods' },
  { id: 'enterprise', label: 'Enterprise Software', description: 'Large-scale business software' },
  { id: 'consulting', label: 'Consulting/Services', description: 'Professional services' },
  { id: 'freemium', label: 'Freemium', description: 'Free basic + paid premium' },
  { id: 'subscription', label: 'Subscription', description: 'Recurring revenue model' },
  { id: 'transactional', label: 'Transactional', description: 'Per-transaction revenue' },
  { id: 'advertising', label: 'Advertising', description: 'Ad-supported revenue' },
  { id: 'hybrid', label: 'Hybrid', description: 'Multiple revenue streams' },
] as const;

export const COMPANY_STAGES = [
  { id: 'pre_seed', label: 'Pre-Seed', description: 'Very early stage, building MVP' },
  { id: 'seed', label: 'Seed', description: 'Early stage with initial funding' },
  { id: 'series_a', label: 'Series A', description: 'Proven product-market fit' },
  { id: 'series_b', label: 'Series B', description: 'Scaling operations' },
  { id: 'series_c_plus', label: 'Series C+', description: 'Late stage scaling' },
  { id: 'growth', label: 'Growth Stage', description: 'Rapid expansion phase' },
  { id: 'mature', label: 'Mature/Established', description: 'Stable, established business' },
  { id: 'enterprise', label: 'Enterprise', description: 'Large enterprise organization' },
  { id: 'public', label: 'Public', description: 'Publicly traded company' },
] as const;

export const INDUSTRIES = [
  { id: 'technology', label: 'Technology', description: 'Software, hardware, IT services' },
  { id: 'healthcare', label: 'Healthcare', description: 'Medical, health tech, pharma' },
  { id: 'finance', label: 'Finance', description: 'Banking, fintech, insurance' },
  { id: 'ecommerce', label: 'E-commerce', description: 'Online retail and marketplaces' },
  { id: 'education', label: 'Education', description: 'EdTech, learning platforms' },
  { id: 'manufacturing', label: 'Manufacturing', description: 'Production, industrial' },
  { id: 'retail', label: 'Retail', description: 'Physical and digital retail' },
  { id: 'real_estate', label: 'Real Estate', description: 'Property, PropTech' },
  { id: 'media', label: 'Media & Entertainment', description: 'Content, streaming, publishing' },
  { id: 'travel', label: 'Travel & Hospitality', description: 'Tourism, hotels, transportation' },
  { id: 'food', label: 'Food & Beverage', description: 'Restaurants, food tech, delivery' },
  { id: 'energy', label: 'Energy', description: 'Power, utilities, cleantech' },
  { id: 'logistics', label: 'Logistics', description: 'Supply chain, delivery, warehousing' },
  { id: 'telecommunications', label: 'Telecommunications', description: 'Telecom, connectivity' },
  { id: 'automotive', label: 'Automotive', description: 'Vehicles, mobility, transportation' },
  { id: 'agriculture', label: 'Agriculture', description: 'Farming, AgTech, food production' },
  { id: 'construction', label: 'Construction', description: 'Building, infrastructure, ConTech' },
  { id: 'government', label: 'Government & Public Sector', description: 'Public services, GovTech' },
  { id: 'nonprofit', label: 'Non-Profit', description: 'Social impact, charitable organizations' },
  { id: 'other', label: 'Other', description: 'Other industry' },
] as const;

export const COMPANY_SIZES = [
  { id: '1_10', label: '1-10', description: 'Startup/Small team' },
  { id: '11_50', label: '11-50', description: 'Growing startup' },
  { id: '51_200', label: '51-200', description: 'Mid-size company' },
  { id: '201_500', label: '201-500', description: 'Large company' },
  { id: '501_1000', label: '501-1,000', description: 'Enterprise' },
  { id: '1001_5000', label: '1,001-5,000', description: 'Large enterprise' },
  { id: '5001_plus', label: '5,001+', description: 'Very large enterprise' },
] as const;

/**
 * CULTURE DIMENSIONS
 * These replace the vague "pace" and "structure" fields with meaningful dimensions
 * that actually help with hiring decisions
 */

export const WORK_ENVIRONMENTS = [
  { id: 'remote', label: 'Fully Remote', description: 'Work from anywhere' },
  { id: 'hybrid', label: 'Hybrid', description: 'Mix of remote and office' },
  { id: 'office', label: 'Office-Based', description: 'Primary office presence' },
  { id: 'flexible', label: 'Flexible', description: 'Team decides' },
] as const;

export const AUTONOMY_LEVELS = [
  { id: 'high', label: 'High Autonomy', description: 'Self-directed, minimal oversight' },
  { id: 'guided', label: 'Guided Autonomy', description: 'Direction with freedom in execution' },
  { id: 'structured', label: 'Structured', description: 'Clear processes and management' },
] as const;

export const COLLABORATION_STYLES = [
  { id: 'highly_collaborative', label: 'Highly Collaborative', description: 'Constant teamwork and communication' },
  { id: 'balanced', label: 'Balanced', description: 'Mix of collaboration and independent work' },
  { id: 'independent', label: 'Independent', description: 'Primarily solo work with periodic sync' },
] as const;

export const WORK_PACE_OPTIONS = [
  { id: 'fast', label: 'Fast-Paced', description: 'Rapid iteration, move fast, startup energy' },
  { id: 'moderate', label: 'Moderate Pace', description: 'Balanced speed and quality' },
  { id: 'measured', label: 'Measured', description: 'Thoughtful, deliberate, quality-focused' },
] as const;

export const DECISION_MAKING_STYLES = [
  { id: 'top_down', label: 'Top-Down', description: 'Leadership-driven decisions' },
  { id: 'collaborative', label: 'Collaborative', description: 'Team input and consensus' },
  { id: 'autonomous', label: 'Autonomous', description: 'Distributed decision-making' },
] as const;

// Type helpers
export type BusinessModelId = typeof BUSINESS_MODELS[number]['id'];
export type CompanyStageId = typeof COMPANY_STAGES[number]['id'];
export type IndustryId = typeof INDUSTRIES[number]['id'];
export type CompanySizeId = typeof COMPANY_SIZES[number]['id'];
export type WorkEnvironmentId = typeof WORK_ENVIRONMENTS[number]['id'];
export type AutonomyLevelId = typeof AUTONOMY_LEVELS[number]['id'];
export type CollaborationStyleId = typeof COLLABORATION_STYLES[number]['id'];
export type WorkPaceId = typeof WORK_PACE_OPTIONS[number]['id'];
export type DecisionMakingStyleId = typeof DECISION_MAKING_STYLES[number]['id'];
