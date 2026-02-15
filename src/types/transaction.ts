export interface Transaction {
  id: string;
  trackingNumber: string;
  totalPrice: string;
  productPrice: string;
  deliveryFee: string;
  taxableAmount: string;
  discount: string;
  paymentGateway: string;
  paymentStatus: "paid" | "pending" | "failed" | "refunded";
  date: string;
}

export interface TransactionPermissions {
  canDelete: boolean;
  canEdit: boolean;
  canView: boolean;
  canRefund: boolean;
}

export interface VendorTransactionResponse {
  id: string;
  paymentIntentId: string | null;
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  vendorAmount: number;
  platformFee: number;
  currency: string;
  status: string;
  paymentMethod: string;
  provider: string;
  // Customer info
  customer: {
    name: string | null;
    email: string;
  };
  // Shop info
  shop: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface VendorTransactionStats {
  totalEarnings: number;
  pendingEarnings: number;
  platformFeesPaid: number;
  totalTransactions: number;
  successfulTransactions: number;
  pendingTransactions: number;
  refundedTransactions: number;
}
