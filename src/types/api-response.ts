/**
 * Shared API Response Types
 *
 * Generic response type patterns for consistent API responses.
 * Follows DRY principle - single definition for common patterns.
 */

// ============================================================================
// Generic Response Types
// ============================================================================

/**
 * Generic paginated list response
 * Use for any list endpoint with pagination
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Generic single item response
 */
export interface SingleItemResponse<T> {
  data: T;
}

/**
 * Generic success response for mutations
 */
export interface MutationResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Generic error response
 */
export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}

// ============================================================================
// Type Utilities
// ============================================================================

/**
 * Helper to create a paginated response type
 */
export type ListResponse<T> = PaginatedResponse<T>;

/**
 * Helper to create a detail response type
 */
export type DetailResponse<T> = { [K in string]: T };

/**
 * Async function that returns a paginated response
 */
export type PaginatedHandler<T> = () => Promise<PaginatedResponse<T>>;

// ============================================================================
// Response Factory Functions
// ============================================================================

/**
 * Create a paginated response object
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  limit: number,
  offset: number
): PaginatedResponse<T> {
  return { data, total, limit, offset };
}

/**
 * Create a success mutation response
 */
export function createSuccessResponse<T = undefined>(
  message: string,
  data?: T
): MutationResponse<T> {
  return { success: true, message, data };
}

/**
 * Create an empty paginated response
 */
export function emptyPaginatedResponse<T>(
  limit: number,
  offset: number
): PaginatedResponse<T> {
  return { data: [], total: 0, limit, offset };
}
