/**
 * Common utility types and interfaces used across domains
 */

/**
 * Geographic location information
 */
export interface Location {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  timezone: string;
}

/**
 * Contact information
 */
export interface ContactInfo {
  email?: string;
  phone?: string;
  mobile?: string;
  fax?: string;
  website?: string;
}

/**
 * Geographic coordinates
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Address with optional coordinates
 */
export interface Address extends Location {
  coordinates?: Coordinates;
  fullAddress?: string;
  shortAddress?: string;
}

/**
 * Monetary amount with currency
 */
export interface MonetaryAmount {
  amount: number;
  currency: string;
}

/**
 * Date range
 */
export interface DateRange {
  startDate: string;
  endDate?: string;
}

/**
 * File attachment information
 */
export interface Attachment {
  type: string;
  url: string;
  title: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  tags?: string[];
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  offset?: number;
  limit?: number;
}

/**
 * Sort parameters
 */
export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * Common filter types
 */
export interface FilterParams {
  search?: string;
  status?: string[];
  dateRange?: DateRange;
  [key: string]: any;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    offset: number;
    limit: number;
    hasMore: boolean;
  };
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  action: string;
  timestamp: string;
  userId: string;
  details?: Record<string, any>;
}

/**
 * Metadata with statistics
 */
export interface StatisticsMetadata {
  lastCalculated: string;
  lastUpdated?: string;
}

/**
 * Configuration object with flexible structure
 */
export interface Configuration {
  [key: string]: any;
}