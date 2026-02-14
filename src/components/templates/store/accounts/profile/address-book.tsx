import { useQuery } from "@tanstack/react-query";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDeleteDialog } from "@/components/base/common/confirm-delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  addressesQueryOptions,
  useAddressMutations,
} from "@/hooks/store/use-address";
import type {
  CreateAddressInput,
  UpdateAddressInput,
} from "@/lib/validators/address";
import { AddressDialog } from "./address-dialog";

export function AddressBook() {
  const { data, isLoading } = useQuery(addressesQueryOptions());
  const addresses = data?.addresses || [];
  const {
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    isCreating,
    isUpdating,
    isDeleting,
  } = useAddressMutations();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] =
    useState<UpdateAddressInput | null>(null);
  const [deletingAddress, setDeletingAddress] = useState<
    (typeof addresses)[number] | null
  >(null);

  const handleOpenDialog = (address?: any) => {
    if (address) {
      setEditingAddress({
        ...address,
        firstName: address.firstName || undefined,
        lastName: address.lastName || undefined,
        phone: address.phone || undefined,
        isDefault: address.isDefault || false,
      });
    } else {
      setEditingAddress(null);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (
    data: CreateAddressInput | UpdateAddressInput,
  ) => {
    try {
      if (editingAddress) {
        await updateAddress(data as UpdateAddressInput);
      } else {
        await createAddress(data as CreateAddressInput);
      }
      setIsDialogOpen(false);
    } catch (error) {
      // Error is handled by mutation hook (toast)
      console.error(error);
    }
  };

  const handleDelete = (address: (typeof addresses)[number]) => {
    setDeletingAddress(address);
  };

  const confirmDelete = async () => {
    if (!deletingAddress) return;
    await deleteAddress({ id: deletingAddress.id });
    setDeletingAddress(null);
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultAddress({ id });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-52 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Addresses</h3>
        <Button onClick={() => handleOpenDialog()} size="sm" className="gap-2">
          <Plus className="size-4" />
          Add New
        </Button>
      </div>

      {!addresses || addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          <MapPin className="mb-4 size-10 opacity-20" />
          <p>No addresses found</p>
          <Button
            variant="link"
            onClick={() => handleOpenDialog()}
            className="mt-2"
          >
            Add your first address
          </Button>
        </div>
      ) : (
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
                    variant={
                      address.type === "billing" ? "default" : "secondary"
                    }
                    className="capitalize"
                  >
                    {address.type}
                  </Badge>
                  {address.isDefault && (
                    <Badge variant="outline" className="border-primary/50">
                      Default
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {!address.isDefault && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      title="Set as Default"
                      onClick={() => handleSetDefault(address.id)}
                    >
                      <MapPin className="size-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => handleOpenDialog(address)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(address)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Address Details */}
              <div className="space-y-1 text-sm">
                <div className="font-medium text-base">{address.title}</div>
                <div className="text-muted-foreground">{address.street}</div>
                <div className="text-muted-foreground">
                  {address.city}, {address.state} {address.zip}
                </div>
                <div className="text-muted-foreground">{address.country}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddressDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={editingAddress}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      <ConfirmDeleteDialog
        open={!!deletingAddress}
        onOpenChange={(open) => !open && setDeletingAddress(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        itemName={deletingAddress?.title}
        entityType="address"
      />
    </div>
  );
}
