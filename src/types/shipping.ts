/**
 * Shipping HTTP Client Type Definitions
 *
 * TypeScript types for shipping API requests and responses
 */

// ============================================================================
// Shipping Method Types
// ============================================================================

/**
 * Shipping method item interface
 */
export interface ShippingMethodItem {
  id: string;
  shopId: string;
  name: string;
  description?: string | null;
  price: string;
  duration: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Query Types
// ============================================================================

/**
 * List shipping methods query parameters
 */
export interface ListShippingMethodsQuery {
  shopId: string;
  limit?: number;
  offset?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: "name" | "createdAt" | "price";
  sortDirection?: "asc" | "desc";
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * List shipping methods response with pagination
 */
export interface ListShippingMethodsResponse {
  data: ShippingMethodItem[];
  total: number;
  limit?: number;
  offset?: number;
}

/**
 * Create shipping method response
 */
export interface CreateShippingMethodResponse {
  success: boolean;
  shippingMethod: ShippingMethodItem;
  message?: string;
}

/**
 * Update shipping method response
 */
export interface UpdateShippingMethodResponse {
  success: boolean;
  shippingMethod: ShippingMethodItem;
  message?: string;
}

/**
 * Delete shipping method response
 */
export interface DeleteShippingMethodResponse {
  success: boolean;
  id: string;
  message?: string;
}

export interface SelectedAddress {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}
