/**
 * Trend analytics models
 */

import {
  TenantScopedDocument,
  AuditableDocument
} from '../core/base';

/**
 * Trend Analytics Document - Tracks trends over time
 */
export interface TrendAnalyticsDocument extends TenantScopedDocument, AuditableDocument {
  collection: "trend-analytics";

  // Analytics information
  analyticsId: string;
  trendType: "hiring_volume" | "time_to_hire" | "cost_per_hire" | "source_effectiveness" | "quality_metrics";
  title: string;

  // Trend data
  data: Array<{
    date: string;
    value: number;
    changeFromPrevious?: number;
    percentChange?: number;
    metadata?: Record<string, any>;
  }>;

  // Analysis
  analysis: {
    trend: "increasing" | "decreasing" | "stable" | "volatile";
    growthRate?: number;         // Compound annual growth rate
    seasonality?: Array<{
      period: string;
      multiplier: number;
      description: string;
    }>;
    correlations?: Array<{
      factor: string;
      correlation: number;
      strength: "weak" | "moderate" | "strong";
    }>;
    insights: Array<{
      type: string;
      description: string;
      impact: string;
      confidence: number;
    }>;
  };

  // Predictions
  predictions?: {
    shortTerm: Array<{
      date: string;
      predictedValue: number;
      confidence: number;
      range: {
        min: number;
        max: number;
      };
    }>;
    longTerm: Array<{
      period: string;
      predictedTrend: string;
      confidence: number;
      factors: string[];
    }>;
  };

  lastCalculated: string;
}