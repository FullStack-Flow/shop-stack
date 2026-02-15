export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
  };
  date: string;
  total: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "paid" | "unpaid" | "refunded";
  items: number;
}

export interface OrderPermissions {
  canDelete: boolean;
  canEdit: boolean;
  canView: boolean;
  canUpdateStatus: boolean;
}

export interface OrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  productSku: string | null;
  productImage: string | null;
  variantOptions: Record<string, string> | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  shippingMethod: string | null;
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  } | null;
  shopId: string;
  shopName: string;
  shopSlug: string;
  items: OrderItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutResult {
  success: boolean;
  orderIds: string[];
  paymentIntentId: string;
  clientSecret: string;
  totalAmount: number;
}

export interface StripeConnectStatus {
  isConnected: boolean;
  onboardingComplete: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  accountId: string | null;
  requiresAction: boolean;
  actionUrl?: string;
}

export interface CheckoutSessionData {
  orderIds: string[];
  paymentIntentId: string;
  clientSecret: string;
  totalAmount: number;
}

export interface VendorOrderResponse {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  shippingMethod: string | null;
  shippingAddress: unknown;
  shopId: string;
  shopName: string;
  customer: {
    id?: string;
    name?: string | null;
    email: string | null;
  };
  itemCount: number;
  createdAt: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";
