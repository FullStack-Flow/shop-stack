import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import AdminUsersTemplate from "@/components/templates/admin/admin-users-template";
import type { User, UserFormValues } from "@/types/users";

const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://placehold.co/40?text=JD",
    totalOrders: 15,
    totalSpent: "$1,245.00",
    status: "active",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    avatar: "https://placehold.co/40?text=JS",
    totalOrders: 8,
    totalSpent: "$680.50",
    status: "active",
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    avatar: "https://placehold.co/40?text=BJ",
    totalOrders: 3,
    totalSpent: "$245.00",
    status: "inactive",
    createdAt: new Date("2024-03-10"),
  },
  {
    id: "4",
    name: "Alice Brown",
    email: "alice@example.com",
    avatar: "https://placehold.co/40?text=AB",
    totalOrders: 22,
    totalSpent: "$3,450.75",
    status: "active",
    createdAt: new Date("2024-03-20"),
  },
  {
    id: "5",
    name: "Charlie Wilson",
    email: "charlie@example.com",
    avatar: "https://placehold.co/40?text=CW",
    totalOrders: 0,
    totalSpent: "$0.00",
    status: "suspended",
    createdAt: new Date("2024-04-01"),
  },
];

export const Route = createFileRoute("/(admin)/admin/users/")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);

  const handleAddUser = (data: UserFormValues) => {
    const newUser: User = {
      ...data,
      id: String(users.length + 1),
      avatar: `https://placehold.co/40?text=${data.name
        .split(" ")
        .map((n) => n[0])
        .join("")}`,
      totalOrders: 0,
      totalSpent: "$0.00",
      createdAt: new Date(),
    };
    setUsers([...users, newUser]);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  return (
    <AdminUsersTemplate
      users={users}
      onAddUser={handleAddUser}
      onDeleteUser={handleDeleteUser}
    />
  );
}
