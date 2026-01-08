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
