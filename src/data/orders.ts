import { Order } from "@/types/orders";

export const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-001",
    customer: {
      name: "John Doe",
      email: "john@example.com",
    },
    date: "2024-05-21",
    total: "$120.00",
    status: "processing",
    paymentStatus: "paid",
    items: 3,
  },
  {
    id: "2",
    orderNumber: "ORD-002",
    customer: {
      name: "Jane Smith",
      email: "jane@example.com",
    },
    date: "2024-05-20",
    total: "$85.50",
    status: "delivered",
    paymentStatus: "paid",
    items: 2,
  },
  {
    id: "3",
    orderNumber: "ORD-003",
    customer: {
      name: "Bob Johnson",
      email: "bob@example.com",
    },
    date: "2024-05-19",
    total: "$250.00",
    status: "cancelled",
    paymentStatus: "refunded",
    items: 5,
  },
  {
    id: "4",
    orderNumber: "ORD-004",
    customer: {
      name: "Alice Brown",
      email: "alice@example.com",
    },
    date: "2024-05-18",
    total: "$45.00",
    status: "shipped",
    paymentStatus: "paid",
    items: 1,
  },
  {
    id: "5",
    orderNumber: "ORD-005",
    customer: {
      name: "Charlie Wilson",
      email: "charlie@example.com",
    },
    date: "2024-05-17",
    total: "$180.00",
    status: "pending",
    paymentStatus: "unpaid",
    items: 4,
  },
];
