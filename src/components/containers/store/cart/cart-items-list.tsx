import CartItem from '@/components/base/store/cart/cart-item';
import { useCartStore } from '@/lib/store/cart-store';

export default function CartItemsList() {
  const { items } = useCartStore();

  return (
    <div className="space-y-6">
      <div className="divide-y rounded-lg border bg-background p-6 shadow-sm">
        {items.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
