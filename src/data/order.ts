export const mockOrderData = {
  orderId: "20002455468764",
  orderDate: "21 May, 2024",
  estimatedDelivery: "28 May, 2024",
  items: [
    {
      id: "1",
      name: '6" Red Velvet Cheesecake Cake',
      image:
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop",
      price: 21.0,
      quantity: 1,
    },
    {
      id: "2",
      name: "6 Count Cookie Classics Assorted Tin",
      image:
        "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=200&h=200&fit=crop",
      price: 62.0,
      quantity: 4,
    },
    {
      id: "3",
      name: "B'Day Truffle Dozen Box",
      image:
        "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=200&h=200&fit=crop",
      price: 83.24,
      quantity: 1,
    },
  ],
  paymentMethod: "Visa ••••• 9999",
  address: {
    name: "Mali Malia",
    street: "6391 Elgin St. Celina",
    city: "Delaware",
    state: "DE",
    zip: "10299",
  },
  deliveryMethod: "Express shipping (2-3 days)",
  itemCost: 374.0,
  shippingCost: 14.0,
  tax: 5.0,
  couponDiscount: 15.0,
  total: 390.0,
};
