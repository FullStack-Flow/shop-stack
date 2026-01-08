import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export interface OrderFormValues {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'paid' | 'unpaid' | 'refunded';
  items: number;
  notes?: string;
  orderDate?: Date;
}

interface AddOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: OrderFormValues) => void;
}

export function AddOrderDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddOrderDialogProps) {
  const [formData, setFormData] = useState<OrderFormValues>({
    orderNumber: '',
    customerName: '',
    customerEmail: '',
    total: '',
    status: 'pending',
    paymentStatus: 'unpaid',
    items: 0,
    notes: '',
    orderDate: new Date(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      orderNumber: '',
      customerName: '',
      customerEmail: '',
      total: '',
      status: 'pending',
      paymentStatus: 'unpaid',
      items: 0,
      notes: '',
      orderDate: new Date(),
    });
  };

  const handleChange = (
    field: keyof OrderFormValues,
    value: string | number | Date
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Create a new order for a customer. Fill in all required fields.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <div className="grid gap-4">
              <Field>
                <FieldLabel>Order Number</FieldLabel>
                <Input
                  value={formData.orderNumber}
                  onChange={(e) => handleChange('orderNumber', e.target.value)}
                  placeholder="ORD-001"
                  required
                />
              </Field>

              <Field>
                <FieldLabel>Customer Name</FieldLabel>
                <Input
                  value={formData.customerName}
                  onChange={(e) => handleChange('customerName', e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </Field>

              <Field>
                <FieldLabel>Customer Email</FieldLabel>
                <Input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) =>
                    handleChange('customerEmail', e.target.value)
                  }
                  placeholder="john@example.com"
                  required
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Total Amount ($)</FieldLabel>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.total}
                    onChange={(e) => handleChange('total', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel>Number of Items</FieldLabel>
                  <Input
                    type="number"
                    min="0"
                    value={formData.items}
                    onChange={(e) =>
                      handleChange('items', parseInt(e.target.value, 10) || 0)
                    }
                    placeholder="0"
                    required
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Order Status</FieldLabel>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleChange('status', value as OrderFormValues['status'])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel>Payment Status</FieldLabel>
                  <Select
                    value={formData.paymentStatus}
                    onValueChange={(value) =>
                      handleChange(
                        'paymentStatus',
                        value as OrderFormValues['paymentStatus']
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field>
                <FieldLabel>Order Date</FieldLabel>
                <Calendar
                  mode="single"
                  selected={formData.orderDate}
                  onSelect={(date) => {
                    if (date) handleChange('orderDate', date);
                  }}
                  className="rounded-md border"
                />
              </Field>

              <Field>
                <FieldLabel>Notes (Optional)</FieldLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Additional notes about this order..."
                  rows={3}
                />
              </Field>
            </div>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Order</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
