import type { Taxes } from "@/types/taxes";

export const mockTaxes: Taxes[] = [
  {
    id: "1",
    name: "VAT Standard",
    rate: 20,
    country: "UK",
    state: "",
    zip: "",
    priority: 1,
  },
  {
    id: "2",
    name: "Sales Tax NY",
    rate: 8.875,
    country: "US",
    state: "NY",
    zip: "10001",
    priority: 2,
  },
  {
    id: "3",
    name: "GST",
    rate: 5,
    country: "CA",
    state: "",
    zip: "",
    priority: 1,
  },
  {
    id: "4",
    name: "PST BC",
    rate: 7,
    country: "CA",
    state: "BC",
    zip: "",
    priority: 2,
  },
];
