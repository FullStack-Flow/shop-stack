export const mockOrderDetails = {
  id: '1',
  orderNumber: 'ORD-001',
  date: '2024-05-21',
  customer: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
  },
  paymentMethod: 'Credit Card ending in 4242',
  paymentStatus: 'paid' as const,
  subtotal: 100.0,
  shipping: 15.0,
  tax: 5.0,
  total: 120.0,
  items: [
    {
      id: '1',
      name: 'Wireless Headphones',
      price: 99.99,
      quantity: 1,
      image: 'https://placehold.co/100?text=WH',
      sku: 'WH-001',
    },
  ],
  stages: [
    {
      id: '1',
      label: 'Order Placed',
      date: '21 May, 10:30 AM',
      status: 'completed' as const,
    },
    {
      id: '2',
      label: 'Processing',
      date: '22 May, 2:15 PM',
      status: 'active' as const,
    },
    {
      id: '3',
      label: 'Shipped',
      status: 'pending' as const,
    },
    {
      id: '4',
      label: 'Delivered',
      status: 'pending' as const,
    },
  ],
};
