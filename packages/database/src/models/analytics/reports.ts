/**
 * Analytics reports models
 */

import {
  TenantScopedDocument,
  AuditableDocument
} from '../core/base';
import {
  AnalyticsReportType,
  ChartType,
  WidgetType
} from '../enums/system';
import { DateRange } from '../core/common';

/**
 * Analytics Report Document - Generated analytics reports
 */
export interface AnalyticsReportDocument extends TenantScopedDocument, AuditableDocument {
  collection: "analytics-reports";

  // Report information
  reportId: string;
  reportType: AnalyticsReportType;
  title: string;
  description?: string;

  // Report configuration
  config: {
    dateRange: DateRange;
    filters: Record<string, any>; // Dynamic filters based on report type
    groupBy?: string[];        // Fields to group by
    metrics: string[];         // Metrics to calculate
  };

  // Report data
  data: {
    summary: Record<string, number>;
    details: Array<Record<string, any>>;
    charts: Array<{
      type: ChartType;
      title: string;
      data: any;
      config?: Record<string, any>;
    }>;
    insights?: Array<{
      type: "trend" | "anomaly" | "recommendation";
      description: string;
      impact: string;
      confidence: number;
    }>;
  };

  // Metadata
  generatedBy: string;
  lastCalculated: string;
  status: "generating" | "completed" | "failed";
  error?: string;
}

/**
 * Dashboard Widget Document - Pre-configured dashboard widgets
 */
export interface DashboardWidgetDocument extends TenantScopedDocument, AuditableDocument {
  collection: "dashboard-widgets";

  // Widget information
  widgetId: string;
  name: string;
  type: WidgetType;

  // Widget configuration
  config: {
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    refreshInterval: number;     // Seconds
    dataSource: string;         // Which analytics collection to use
    filters?: Record<string, any>;
    visualization: {
      type: string;
      options?: Record<string, any>;
    };
  };

  // Widget data (cached)
  data: any;

  // Metadata
  lastRefresh: string;
  isPublic: boolean;          // Available to all tenant users
  permissions: string[];       // User roles that can view this widget
}