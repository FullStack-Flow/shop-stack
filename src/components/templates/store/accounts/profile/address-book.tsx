import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { AddressDialog, type AddressFormValues } from "./address-dialog";

// Mock data type
interface Address {
  id: string;
  type: "Billing" | "Shipping";
  title: string;
  country: string;
  city: string;
  state: string;
  zip: string;
  street: string;
  isDefault?: boolean;
}

// Initial mock data
const initialAddresses: Address[] = [
  {
    id: "1",
    type: "Billing",
    title: "Home",
    country: "United States",
    city: "Kipnuk",
    state: "AK",
    zip: "99614",
    street: "2231 Kidd Avenue",
    isDefault: true,
  },
  {
    id: "2",
    type: "Shipping",
    title: "Office",
    country: "United States",
    city: "Winchester",
    state: "KY",
    zip: "40391",
    street: "2148 Straford Park",
  },
];

export function AddressBook() {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const handleOpenDialog = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
    } else {
      setEditingAddress(null);
    }
    setIsDialogOpen(true);
  };

  const handleSave = (data: AddressFormValues) => {
    if (editingAddress) {
      setAddresses(
        addresses.map((addr) =>
          addr.id === editingAddress.id ? { ...addr, ...data } : addr
        )
      );
    } else {
      const newAddress = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
      };
      setAddresses([...addresses, newAddress]);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter((addr) => addr.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Addresses</h3>
        <Button onClick={() => handleOpenDialog()} size="sm" className="gap-2">
          <Plus className="size-4" />
          Add New
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((address) => (
          <div
            key={address.id}
            className="group relative flex flex-col gap-4 rounded-xl border bg-card p-5 text-card-foreground shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
          >
            {/* Header with badges and actions */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={address.type === "Billing" ? "default" : "secondary"}
                  className="font-medium"
                >
                  {address.type}
                </Badge>
                {address.isDefault && (
                  <Badge
                    variant="outline"
                    className="border-primary/30 text-primary"
                  >
                    Default
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenDialog(address)}
                >
                  <Pencil className="size-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(address.id)}
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>

            {/* Address details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <MapPin className="size-4 shrink-0 text-primary/70" />
                <span className="font-semibold text-base">{address.title}</span>
              </div>
              <div className="space-y-0.5 pl-6.5">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {address.street}
                </p>
                <p className="text-muted-foreground text-sm">
                  {address.city}, {address.state} {address.zip}
                </p>
                <p className="text-muted-foreground text-sm">
                  {address.country}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AddressDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={editingAddress}
        onSubmit={handleSave}
      />
    </div>
  );
}
