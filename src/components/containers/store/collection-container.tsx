import CollectionItem from "@/components/base/common/collection-item";
import { type Product, mockProducts as products } from "@/data/products";
import { useCartStore } from "@/lib/store/cart-store";
import { gridCellBorderClasses } from "@/lib/utils";

export default function CollectionContainer() {
  const columns2 = 2;
  const columns3 = 3;
  const { addItem } = useCartStore();

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price.current,
      image: product.images[0].url,
      quantity: 1,
      maxQuantity: product.stock.quantity,
    });
  };

  return (
    <div className="grid @4xl:grid-cols-2 @6xl:grid-cols-3 grid-cols-1">
      {products.slice(0, 6).map((p, index) => (
        <CollectionItem
          key={p.id}
          image={p.images[0].url}
          title={p.name}
          category={p.category.name}
          fit="Regular"
          price={`$${p.price.current}`}
          className={gridCellBorderClasses(index, columns2, columns3, true)}
          onAddToCart={() => handleAddToCart(p)}
        />
      ))}
    </div>
  );
}
