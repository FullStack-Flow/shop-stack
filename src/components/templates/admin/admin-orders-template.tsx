import { Plus } from 'lucide-react';
import { useState } from 'react';
import { AddOrderDialog } from '@/components/containers/shared/orders/add-order-dialog';
import OrderHeader from '@/components/containers/shared/orders/order-header';
import OrderTable from '@/components/containers/shared/orders/order-table';
import { Button } from '@/components/ui/button';
import { ADMIN_ORDER_PERMISSIONS } from '@/lib/config/order-permissions';
import type { Order } from '@/types/orders';

interface AdminOrdersTemplateProps {
  orders: Order[];
  onAddOrder: (
    data: Omit<Order, 'id' | 'date' | 'customer'> & {
      customerName: string;
      customerEmail: string;
    }
  ) => void;
  onDeleteOrder: (id: string) => void;
}

export default function AdminOrdersTemplate({
  orders,
  onAddOrder,
  onDeleteOrder,
}: AdminOrdersTemplateProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    console.log('Update status for order:', orderId, 'to:', newStatus);
  };

  return (
    <div className="flex flex-col gap-6">
      <OrderHeader role="admin">
        <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Order
        </Button>
      </OrderHeader>

      <AddOrderDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={(data) => {
          onAddOrder(data);
        }}
      />

      <OrderTable
        orders={orders}
        shopSlug="admin"
        permissions={ADMIN_ORDER_PERMISSIONS}
        onUpdateStatus={handleUpdateStatus}
        onDeleteOrder={onDeleteOrder}
      />
    </div>
  );
}
