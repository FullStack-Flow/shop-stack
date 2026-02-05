export interface CartItemResponse {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  regularPrice: number | null;
  image: string | null;
  quantity: number;
  maxQuantity: number;
  variantOptions: Record<string, string> | null;
  shopId: string;
  shopName: string;
}

export interface CartResponse {
  items: CartItemResponse[];
  totalItems: number;
  subtotal: number;
  sessionId: string | null;
}
