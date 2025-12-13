export const INDUSTRIES = [
  {
    id: "technology",
    label: "Technology",
    description: "Software, hardware, IT services",
  },
  {
    id: "healthcare",
    label: "Healthcare",
    description: "Medical, health tech, pharma",
  },
  {
    id: "finance",
    label: "Finance",
    description: "Banking, fintech, insurance",
  },
  {
    id: "ecommerce",
    label: "E-commerce",
    description: "Online retail and marketplaces",
  },
  {
    id: "education",
    label: "Education",
    description: "EdTech, learning platforms",
  },
  {
    id: "manufacturing",
    label: "Manufacturing",
    description: "Production, industrial",
  },
  { id: "retail", label: "Retail", description: "Physical and digital retail" },
  {
    id: "real_estate",
    label: "Real Estate",
    description: "Property, PropTech",
  },
  {
    id: "media",
    label: "Media & Entertainment",
    description: "Content, streaming, publishing",
  },
  {
    id: "travel",
    label: "Travel & Hospitality",
    description: "Tourism, hotels, transportation",
  },
  {
    id: "food",
    label: "Food & Beverage",
    description: "Restaurants, food tech, delivery",
  },
  { id: "energy", label: "Energy", description: "Power, utilities, cleantech" },
  {
    id: "logistics",
    label: "Logistics",
    description: "Supply chain, delivery, warehousing",
  },
  {
    id: "telecommunications",
    label: "Telecommunications",
    description: "Telecom, connectivity",
  },
  {
    id: "automotive",
    label: "Automotive",
    description: "Vehicles, mobility, transportation",
  },
  {
    id: "agriculture",
    label: "Agriculture",
    description: "Farming, AgTech, food production",
  },
  {
    id: "construction",
    label: "Construction",
    description: "Building, infrastructure, ConTech",
  },
  {
    id: "government",
    label: "Government & Public Sector",
    description: "Public services, GovTech",
  },
  {
    id: "nonprofit",
    label: "Non-Profit",
    description: "Social impact, charitable organizations",
  },
  { id: "other", label: "Other", description: "Other industry" },
] as const;

export const COMPANY_SIZES = [
  { id: "1_10", label: "1-10", description: "Startup/Small team" },
  { id: "11_50", label: "11-50", description: "Growing startup" },
  { id: "51_200", label: "51-200", description: "Mid-size company" },
  { id: "201_500", label: "201-500", description: "Large company" },
  { id: "501_1000", label: "501-1,000", description: "Enterprise" },
  { id: "1001_5000", label: "1,001-5,000", description: "Large enterprise" },
  { id: "5001_plus", label: "5,001+", description: "Very large enterprise" },
] as const;

export const COMPANY_STAGES = [
  {
    id: "pre_seed",
    label: "Pre-Seed",
    description: "Very early stage, building MVP",
  },
  {
    id: "seed",
    label: "Seed",
    description: "Early stage with initial funding",
  },
  {
    id: "series_a",
    label: "Series A",
    description: "Proven product-market fit",
  },
  { id: "series_b", label: "Series B", description: "Scaling operations" },
  {
    id: "series_c_plus",
    label: "Series C+",
    description: "Late stage scaling",
  },
  { id: "growth", label: "Growth Stage", description: "Rapid expansion phase" },
  {
    id: "mature",
    label: "Mature/Established",
    description: "Stable, established business",
  },
  {
    id: "enterprise",
    label: "Enterprise",
    description: "Large enterprise organization",
  },
  { id: "public", label: "Public", description: "Publicly traded company" },
] as const;

export const BUSINESS_MODELS = [
  { id: "saas", label: "SaaS", description: "Software-based product" },
  {
    id: "marketplace",
    label: "Marketplace",
    description: "Platform connecting users",
  },
  { id: "ecommerce", label: "E-commerce", description: "Selling goods online" },
  { id: "services", label: "Services", description: "Client-based work" },
  { id: "enterprise", label: "Enterprise", description: "Large organizations" },
  {
    id: "consumer",
    label: "Consumer",
    description: "General consumer product",
  },
  { id: "hybrid", label: "Hybrid", description: "Combination of models" },
] as const;

export const WORK_ENVIRONMENTS = [
  { id: "remote", label: "Fully Remote", description: "Work from anywhere" },
  { id: "hybrid", label: "Hybrid", description: "Mix of remote and office" },
  {
    id: "office",
    label: "Office-Based",
    description: "Primary office presence",
  },
  { id: "flexible", label: "Flexible", description: "Team decides" },
] as const;

export const jobLevels = [
  "intern",
  "entry",
  "junior",
  "mid",
  "senior",
  "principal",
  "teamLead",
  "manager",
  "director",
  "vp",
  "cLevel",
] as const;

export type JobLevel = (typeof jobLevels)[number];
export type Industry = (typeof INDUSTRIES)[number]["id"];
export type CompanySize = (typeof COMPANY_SIZES)[number]["id"];
export type CompanyStage = (typeof COMPANY_STAGES)[number]["id"];
export type BusinessModel = (typeof BUSINESS_MODELS)[number]["id"];
export type WorkEnvironment = (typeof WORK_ENVIRONMENTS)[number]["id"];
