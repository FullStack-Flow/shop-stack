import { CheckCircle2, Clock, Package, Truck } from "lucide-react";
import type {
  DataTableFetchParams,
  DataTableFetchResult,
} from "@/components/base/data-table/types";
import { AdminOrdersTable } from "@/components/containers/admin/orders/admin-orders-table";
import OrderHeader from "@/components/containers/shared/orders/order-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { VendorOrderResponse } from "@/types/orders";

interface AdminOrdersTemplateProps {
  fetcher: (
    params: DataTableFetchParams,
  ) => Promise<DataTableFetchResult<VendorOrderResponse>>;
  stats?: AdminOrderStats;
}

interface AdminOrderStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  paidRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  shopCount: number;
}

export default function AdminOrdersTemplate({
  fetcher,
  stats,
}: AdminOrdersTemplateProps) {
  return (
    <div className="flex flex-col gap-6">
      <OrderHeader role="admin" />

      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">
                Total Orders
              </CardTitle>
              <Package className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">{stats.totalOrders}</div>
              <p className="text-muted-foreground text-xs">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">Pending</CardTitle>
              <Clock className="size-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">{stats.pendingOrders}</div>
              <p className="text-muted-foreground text-xs">
                Awaiting processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">In Progress</CardTitle>
              <Truck className="size-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">
                {stats.processingOrders + stats.shippedOrders}
              </div>
              <p className="text-muted-foreground text-xs">
                Processing or shipped
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">Revenue</CardTitle>
              <CheckCircle2 className="size-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl text-green-600">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-muted-foreground text-xs">
                From delivered orders
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="rounded-md">
        <AdminOrdersTable fetcher={fetcher} />
      </div>
    </div>
  );
}
