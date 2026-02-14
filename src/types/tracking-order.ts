export interface TrackingData {
  orderId: string;
  orderDate: string;
  itemsCount: number;
  total: number;
  carrier: string;
  trackingNumber: string;
  currentLocation: string;
  estimatedDelivery: string;
  packageInfo: {
    weight: string;
    dimensions: string;
  };
  stages: {
    id: string;
    label: string;
    date?: string;
    status: "completed" | "active" | "pending";
  }[];
  updates: {
    id: string;
    timestamp: string;
    location: string;
    status: string;
    isLatest?: boolean;
  }[];
}
