interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface OrderItemsListProps {
  items: OrderItem[];
}

export default function OrderItemsList({ items }: OrderItemsListProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-16 overflow-hidden rounded-md border bg-muted">
              <img
                src={item.image}
                alt={item.name}
                className="size-full object-fill"
              />
            </div>
            <span className="font-medium">{item.name}</span>
          </div>
          <div className="text-right">
            <p className="font-semibold text-lg">${item.price.toFixed(2)}</p>
            <p className="text-muted-foreground text-sm">
              Qty: {item.quantity}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
