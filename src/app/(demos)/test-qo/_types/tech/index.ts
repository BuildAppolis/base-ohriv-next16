import type { TechStackItem } from "../company";
import { PROGRAMMING_LANGUAGES } from "./languages";
import { FRONTEND_FRAMEWORKS } from "./frontend";
import { BACKEND_FRAMEWORKS } from "./backend";
import { DATABASES } from "./databases";
import { CLOUD_INFRASTRUCTURE, DEVOPS_TOOLS } from "./cloud_devops";
import { MONITORING_TOOLS, TESTING_TOOLS, COLLABORATION_TOOLS, SPECIALIZED_TECHNOLOGIES } from "./tools";

// Export all categories
export { PROGRAMMING_LANGUAGES } from "./languages";
export { FRONTEND_FRAMEWORKS } from "./frontend";
export { BACKEND_FRAMEWORKS } from "./backend";
export { DATABASES } from "./databases";
export { CLOUD_INFRASTRUCTURE, DEVOPS_TOOLS } from "./cloud_devops";
export { MONITORING_TOOLS, TESTING_TOOLS, COLLABORATION_TOOLS, SPECIALIZED_TECHNOLOGIES } from "./tools";

// Consolidated tech stack items by category
export const TECH_STACK_ITEMS = {
  programming_languages: PROGRAMMING_LANGUAGES,
  frameworks_libraries: [...FRONTEND_FRAMEWORKS, ...BACKEND_FRAMEWORKS],
  datastorage: DATABASES,
  cloud_infrastructure: CLOUD_INFRASTRUCTURE,
  devops_tools: DEVOPS_TOOLS,
  testing_tools: TESTING_TOOLS,
  monitoring_tools: MONITORING_TOOLS,
  collaboration_tools: COLLABORATION_TOOLS,
  specialized_technologies: SPECIALIZED_TECHNOLOGIES,
};

// Helper function to get all tech items as a flat array
export function getAllTechItems(): TechStackItem[] {
  const allItems: TechStackItem[] = [];

  Object.entries(TECH_STACK_ITEMS).forEach(([category, items]) => {
    items.forEach(item => {
      allItems.push({
        ...item,
        category
      });
    });
  });

  return allItems;
}

// Helper function to get items by category
export function getTechItemsByCategory(category: keyof typeof TECH_STACK_ITEMS): TechStackItem[] {
  return TECH_STACK_ITEMS[category] || [];
}

// Helper function to search tech items
export function searchTechItems(query: string): TechStackItem[] {
  const allItems = getAllTechItems();
  const lowercaseQuery = query.toLowerCase();

  return allItems.filter(item =>
    item.name.toLowerCase().includes(lowercaseQuery) ||
    item.description.toLowerCase().includes(lowercaseQuery)
  );
}

// Helper function to get items by multiple categories
export function getTechItemsByCategories(categories: (keyof typeof TECH_STACK_ITEMS)[]): TechStackItem[] {
  return categories.flatMap(category => TECH_STACK_ITEMS[category] || []);
}

// Export categories for reference
export const TECH_CATEGORIES = Object.keys(TECH_STACK_ITEMS) as (keyof typeof TECH_STACK_ITEMS)[];

// Export category information for use in components
export const CATEGORY_INFO = {
  programming_languages: {
    label: "Programming Languages",
    description: "Core languages for software development",
    icon: "🔤"
  },
  frameworks_libraries: {
    label: "Frameworks & Libraries",
    description: "Tools for rapid application development",
    icon: "📚"
  },
  datastorage: {
    label: "Data Storage",
    description: "Databases and data management solutions",
    icon: "💾"
  },
  cloud_infrastructure: {
    label: "Cloud & Infrastructure",
    description: "Cloud platforms and infrastructure tools",
    icon: "☁️"
  },
  devops_tools: {
    label: "DevOps Tools",
    description: "Tools for CI/CD and deployment automation",
    icon: "🔧"
  },
  testing_tools: {
    label: "Testing Tools",
    description: "Testing and quality assurance solutions",
    icon: "✅"
  },
  monitoring_tools: {
    label: "Monitoring Tools",
    description: "Observability and monitoring platforms",
    icon: "📊"
  },
  collaboration_tools: {
    label: "Collaboration Tools",
    description: "Tools for team collaboration and communication",
    icon: "🤝"
  },
  specialized_technologies: {
    label: "Specialized Technologies",
    description: "Niche and emerging technologies",
    icon: "🛠️"
  }
} as const;

export type TechCategory = keyof typeof TECH_STACK_ITEMS;