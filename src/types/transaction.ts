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
