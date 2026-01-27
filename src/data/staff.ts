export const mockStaff = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "admin" as const,
    status: "active" as const,
    joinedDate: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "manager" as const,
    status: "active" as const,
    joinedDate: "2024-02-01T14:30:00Z",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "staff" as const,
    status: "invited" as const,
    joinedDate: "2024-03-10T09:15:00Z",
  },
];
