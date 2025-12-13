import { JobPositionDetails, TechStackItemWithUsage } from "./_types/company";
import { Briefcase, Building2, Code, Cloud, Cpu, Database, Heart, Monitor, MessageSquare, Wrench, TestTube, BookOpen } from "lucide-react";

export const getTechCategoryColor = (category: string) => {
  switch (category) {
    case "programming_languages":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "frameworks_libraries":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "datastorage":
      return "bg-green-100 text-green-800 border-green-200";
    case "cloud_infrastructure":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "devops_tools":
      return "bg-red-100 text-red-800 border-red-200";
    case "testing_tools":
      return "bg-cyan-100 text-cyan-800 border-cyan-200";
    case "monitoring_tools":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "collaboration_tools":
      return "bg-pink-100 text-pink-800 border-pink-200";
    case "specialized_technologies":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const groupTechByCategory = (techStack?: TechStackItemWithUsage[]) => {
  if (!techStack) return {};

  // First, ensure unique items by ID
  const uniqueTechStack = techStack.reduce((unique, tech) => {
    if (!unique.some((item) => item.id === tech.id)) {
      unique.push(tech);
    }
    return unique;
  }, [] as TechStackItemWithUsage[]);

  return uniqueTechStack.reduce(
    (acc, tech) => {
      if (!acc[tech.category]) {
        acc[tech.category] = [];
      }
      acc[tech.category].push(tech);
      return acc;
    },
    {} as Record<string, TechStackItemWithUsage[]>
  );
};

// Helper function to merge base and specific details for single-level positions
export const mergePositionDetails = (
  baseDetails: JobPositionDetails,
  specificDetails: JobPositionDetails
): JobPositionDetails => {
  // Use specific details as primary, falling back to base details if needed
  return {
    impact: specificDetails.impact || baseDetails.impact,
    scope: specificDetails.scope || baseDetails.scope,
    responsibilities: [
      // Remove duplicates while preserving order
      ...new Set([
        ...specificDetails.responsibilities,
        ...baseDetails.responsibilities,
      ]),
    ],
  };
};

// Helper function to merge tools for single-level positions
export const mergePositionTools = (
  baseTools: TechStackItemWithUsage[] | undefined,
  specificTools: TechStackItemWithUsage[] | undefined
): TechStackItemWithUsage[] => {
  const allTools = [...(specificTools || []), ...(baseTools || [])];

  // Remove duplicates based on tool id, keeping specific tools first
  const uniqueTools = allTools.filter(
    (tool, index, arr) => arr.findIndex((t) => t.id === tool.id) === index
  );

  return uniqueTools;
};


export const getIndustryIcon = (industry?: string) => {
  switch (industry) {
    case "technology": return <Code className="h-4 w-4" />;
    case "healthcare": return <Heart className="h-4 w-4" />;
    case "ecommerce": return <Briefcase className="h-4 w-4" />;
    default: return <Building2 className="h-4 w-4" />;
  }
};

export const getStageLabel = (stage?: string) => {
  switch (stage) {
    case "pre_seed": return "Pre-Seed";
    case "seed": return "Seed";
    case "series_a": return "Series A";
    case "series_b": return "Series B";
    case "series_c_plus": return "Series C+";
    case "growth": return "Growth";
    case "mature": return "Mature";
    case "enterprise": return "Enterprise";
    case "public": return "Public";
    default: return "Unknown";
  }
};

export const getStageDescription = (stage?: string) => {
  switch (stage) {
    case "pre_seed": return "Idea / MVP stage - Early concept development";
    case "seed": return "Initial funding round - First investors and early development";
    case "series_a": return "Proven product-market fit - First major funding for growth";
    case "series_b": return "Building scale - Expanding operations and market presence";
    case "series_c_plus": return "Late-stage growth - Preparing for IPO or acquisition";
    case "growth": return "Rapid expansion - Fast scaling in multiple markets";
    case "mature": return "Established & profitable - Stable business with consistent revenue";
    case "enterprise": return "Large enterprise focus - Serving major corporate clients";
    case "public": return "Publicly traded - Listed on stock exchange";
    default: return "Unknown stage";
  }
};

export const getSizeLabel = (size?: string) => {
  switch (size) {
    case "1_10": return "1–10";
    case "11_50": return "11–50";
    case "51_200": return "51–200";
    case "201_500": return "201–500";
    case "501_1000": return "501–1,000";
    case "1001_5000": return "1,001–5,000";
    case "5001_plus": return "5,001+";
    default: return "Unknown";
  }
};

export const getTechCategoryIcon = (category: string) => {
  switch (category) {
    case "programming_languages": return <Code className="h-4 w-4" />;
    case "frameworks_libraries": return <BookOpen className="h-4 w-4" />;
    case "datastorage": return <Database className="h-4 w-4" />;
    case "cloud_infrastructure": return <Cloud className="h-4 w-4" />;
    case "devops_tools": return <Wrench className="h-4 w-4" />;
    case "testing_tools": return <TestTube className="h-4 w-4" />;
    case "monitoring_tools": return <Monitor className="h-4 w-4" />;
    case "collaboration_tools": return <MessageSquare className="h-4 w-4" />;
    case "specialized_technologies": return <Cpu className="h-4 w-4" />;
    default: return <Code className="h-4 w-4" />;
  }
};

export const getTechCategoryLabel = (category: string) => {
  return category.split("_").map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(" ");
};
