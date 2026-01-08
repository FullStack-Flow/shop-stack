import type { ShippingMethod } from "@/types/shipping";

export const mockShippingMethods: ShippingMethod[] = [
  {
    id: "1",
    name: "Standard Shipping",
    price: 5.0,
    duration: "3-5 business days",
    description: "Regular ground shipping",
  },
  {
    id: "2",
    name: "Express Shipping",
    price: 15.0,
    duration: "1-2 business days",
    description: "Fastest delivery option",
  },
  {
    id: "3",
    name: "Free Shipping",
    price: 0.0,
    duration: "5-7 business days",
    description: "Free shipping for orders over $50",
  },
];
