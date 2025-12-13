/**
 * Cost Color Scale Utility
 * Provides color coding for different cost levels
 */

export interface CostLevel {
  id: string;
  min: number;
  max: number;
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
  description: string;
  icon: string;
}

export const COST_LEVELS: CostLevel[] = [
  {
    id: 'veryCheap',
    min: 0,
    max: 0.05,
    color: '#10b981', // emerald-500
    bgColor: '#ecfdf5', // emerald-50
    borderColor: '#10b981', // emerald-500
    label: 'Very Cheap',
    description: 'Under $0.05 - Excellent value',
    icon: '💰',
  },
  {
    id: 'cheap',
    min: 0.05,
    max: 0.25,
    color: '#84cc16', // lime-500
    bgColor: '#f7fee7', // lime-50
    borderColor: '#84cc16', // lime-500
    label: 'Cheap',
    description: '$0.05-$0.25 - Great value',
    icon: '🪙',
  },
  {
    id: 'moderate',
    min: 0.25,
    max: 1.00,
    color: '#eab308', // yellow-500
    bgColor: '#fef3c7', // yellow-50
    borderColor: '#eab308', // yellow-500
    label: 'Moderate',
    description: '$0.25-$1.00 - Reasonable cost',
    icon: '💵',
  },
  {
    id: 'expensive',
    min: 1.00,
    max: 5.00,
    color: '#f97316', // orange-500
    bgColor: '#fff7ed', // orange-50
    borderColor: '#f97316', // orange-500
    label: 'Expensive',
    description: '$1.00-$5.00 - Consider alternatives',
    icon: '💳',
  },
  {
    id: 'veryExpensive',
    min: 5.00,
    max: Infinity,
    color: '#ef4444', // red-500
    bgColor: '#fef2f2', // red-50
    borderColor: '#ef4444', // red-500
    label: 'Very Expensive',
    description: 'Over $5.00 - Use with caution',
    icon: '⚠️',
  },
];

/**
 * Get cost level based on cost amount
 */
export function getCostLevel(cost: number): CostLevel {
  return COST_LEVELS.find(level => cost >= level.min && cost < level.max) || COST_LEVELS[COST_LEVELS.length - 1];
}

/**
 * Get color information for a cost level
 */
export function getCostColors(cost: number) {
  const level = getCostLevel(cost);
  return {
    color: level.color,
    bgColor: level.bgColor,
    borderColor: level.borderColor,
    label: level.label,
    icon: level.icon,
    description: level.description,
  };
}

/**
 * Check if cost should show warning
 */
export function shouldShowWarning(cost: number): boolean {
  const level = getCostLevel(cost);
  return level.id === 'expensive' || level.id === 'veryExpensive';
}

/**
 * Get warning message for cost level
 */
export function getCostWarning(cost: number): string | null {
  const level = getCostLevel(cost);

  if (level.id === 'veryExpensive') {
    return `⚠️ This operation costs $${cost.toFixed(2)} - very expensive! Consider using a smaller model or reducing output length.`;
  }

  if (level.id === 'expensive') {
    return `💡 This operation costs $${cost.toFixed(2)} - consider using a more cost-effective model like GPT-4o mini or GPT-5 Nano.`;
  }

  return null;
}

/**
 * Get cost efficiency score (0-100)
 * Higher score = more cost efficient
 */
export function getCostEfficiencyScore(cost: number): number {
  const level = getCostLevel(cost);
  const scores: Record<string, number> = {
    'veryCheap': 100,
    'cheap': 80,
    'moderate': 60,
    'expensive': 30,
    'veryExpensive': 10,
  };

  return scores[level.id] || 0;
}

/**
 * Get cost recommendation
 */
export function getCostRecommendation(cost: number, model: string): string | null {
  const level = getCostLevel(cost);

  if (level.id === 'veryExpensive') {
    if (model.includes('pro')) {
      return `Consider switching from ${model} to the standard version for significant cost savings.`;
    }
    if (model.includes('o1') || model.includes('o3')) {
      return 'Consider using GPT-4o or GPT-5 models for better cost efficiency unless reasoning is essential.';
    }
    return 'Consider reducing max tokens or using a smaller model.';
  }

  if (level.id === 'expensive') {
    if (!model.includes('mini') && !model.includes('nano')) {
      return 'Consider using mini or nano versions of this model for better cost efficiency.';
    }
  }

  return null;
}