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

export interface TransactionCustomer {
  name: string | null;
  email: string;
}

export interface TransactionCustomerWithId extends TransactionCustomer {
  id: string | null;
}

export interface TransactionShop {
  id: string;
  name: string;
}

export interface TransactionShopWithSlug extends TransactionShop {
  slug: string;
}

export interface TransactionVendor {
  id: string;
  businessName: string | null;
}

export interface TransactionBaseResponse {
  id: string;
  paymentIntentId: string | null;
  orderId: string;
  orderNumber: string;
  currency: string;
  status: string;
  paymentMethod: string;
  provider: string;
  createdAt: string;
}

export interface VendorTransactionResponse extends TransactionBaseResponse {
  totalAmount: number;
  vendorAmount: number;
  platformFee: number;
  customer: TransactionCustomer;
  shop: TransactionShop;
}

export interface TransactionStatsBase {
  totalTransactions: number;
  successfulTransactions: number;
  refundedTransactions: number;
}

export interface VendorTransactionStats extends TransactionStatsBase {
  totalEarnings: number;
  pendingEarnings: number;
  platformFeesPaid: number;
  pendingTransactions: number;
}

export interface AdminTransactionResponse extends TransactionBaseResponse {
  amount: number;
  connectedAccountId: string | null;
  applicationFeeAmount: number | null;
  vendorAmount: number | null;
  customer: TransactionCustomerWithId;
  shop: TransactionShopWithSlug;
  vendor: TransactionVendor;
}

export interface AdminTransactionStats extends TransactionStatsBase {
  totalRevenue: number;
  platformFees: number;
  vendorPayouts: number;
  pendingPayments: number;
  failedTransactions: number;
}
