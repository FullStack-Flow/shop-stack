export interface AdminTenant {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'suspended' | 'pending';
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
    plan: string;
    status: 'active' | 'suspended' | 'pending';
    joinedDate: string;
    stats: {
      revenue: string;
      orders: number;
      products: number;
      customers: number;
    };
  };
}
