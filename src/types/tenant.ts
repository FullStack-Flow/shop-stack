export interface AdminTenant {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  plan: "free" | "pro" | "enterprise";
  status: "active" | "suspended" | "pending";
  joinedDate: string;
  productCount: number;
  orderCount: number;
}

export interface AdminTenantDetailsProps {
  tenant: {
    id: string;
    name: string;
    slug: string;
    description: string;
    owner: {
      name: string;
      email: string;
      avatar?: string;
    };
    vendorId: string;
    commissionRate: string;
    stripeConnectedAccountId?: string | null;
    stripeOnboardingComplete?: boolean;
    stripeChargesEnabled?: boolean;
    stripePayoutsEnabled?: boolean;
    plan: string;
    status: "active" | "suspended" | "pending";
    joinedDate: string;
    stats: {
      revenue: string;
      orders: number;
      products: number;
      customers: number;
    };
  };
}
