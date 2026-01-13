import OrderHeader from '@/components/containers/shared/orders/order-header';
import OrderTable from '@/components/containers/shared/orders/order-table';
import { VENDOR_ORDER_PERMISSIONS } from '@/lib/config/order-permissions';
import type { Order } from '@/types/orders';

interface ShopOrdersTemplateProps {
  orders: Order[];
  shopSlug: string;
  onUpdateStatus?: (orderId: string, newStatus: string) => void;
  onDeleteOrder?: (orderId: string) => void;
}

export default function ShopOrdersTemplate({
  orders,
  shopSlug,
  onUpdateStatus,
  onDeleteOrder,
}: ShopOrdersTemplateProps) {
  return (
    <div className="space-y-6">
      <OrderHeader role="vendor" />
      <OrderTable
        orders={orders}
        shopSlug={shopSlug}
        permissions={VENDOR_ORDER_PERMISSIONS}
        onUpdateStatus={onUpdateStatus}
        onDeleteOrder={onDeleteOrder}
      />
    </div>
  );
}
