import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import AdminSettingsTemplate from "@/components/templates/admin/admin-settings-template";

interface Setting {
  id: string;
  key: string;
  value: string;
  description: string;
  category: string;
  updatedAt: Date;
}

const mockSettings: Setting[] = [
  {
    id: "1",
    key: "site.name",
    value: "ShopStack",
    description: "The name of the platform",
    category: "General",
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    key: "site.description",
    value: "Multi-vendor e-commerce platform",
    description: "Platform description shown in meta tags",
    category: "General",
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "3",
    key: "site.contact.email",
    value: "support@shopstack.com",
    description: "Primary contact email address",
    category: "Contact",
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "4",
    key: "site.contact.phone",
    value: "+1 (555) 123-4567",
    description: "Primary contact phone number",
    category: "Contact",
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "5",
    key: "payment.default.currency",
    value: "USD",
    description: "Default currency for transactions",
    category: "Payment",
    updatedAt: new Date("2024-02-01"),
  },
  {
    id: "6",
    key: "payment.stripe.enabled",
    value: "true",
    description: "Enable Stripe payment gateway",
    category: "Payment",
    updatedAt: new Date("2024-02-01"),
  },
  {
    id: "7",
    key: "shipping.default.method",
    value: "standard",
    description: "Default shipping method",
    category: "Shipping",
    updatedAt: new Date("2024-02-15"),
  },
  {
    id: "8",
    key: "shipping.free.threshold",
    value: "50.00",
    description: "Minimum order value for free shipping",
    category: "Shipping",
    updatedAt: new Date("2024-02-15"),
  },
  {
    id: "9",
    key: "email.smtp.host",
    value: "smtp.gmail.com",
    description: "SMTP server hostname",
    category: "Email",
    updatedAt: new Date("2024-03-01"),
  },
  {
    id: "10",
    key: "email.smtp.port",
    value: "587",
    description: "SMTP server port",
    category: "Email",
    updatedAt: new Date("2024-03-01"),
  },
  {
    id: "11",
    key: "security.session.timeout",
    value: "3600",
    description: "Session timeout in seconds",
    category: "Security",
    updatedAt: new Date("2024-03-15"),
  },
  {
    id: "12",
    key: "security.password.min_length",
    value: "8",
    description: "Minimum password length",
    category: "Security",
    updatedAt: new Date("2024-03-15"),
  },
];

export const Route = createFileRoute("/(admin)/admin/settings/")({
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const [settings] = useState<Setting[]>(mockSettings);

  return <AdminSettingsTemplate settings={settings} />;
}
