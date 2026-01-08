export interface Product {
  id: string;
  name: string;
  sku: string;
  shop: string;
  price: string;
  stock: number;
  status: 'active' | 'out_of_stock';
  image: string;
  productType: string;
  category?: string;
  brand?: string;
  tags?: string[];
}
