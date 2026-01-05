// Mock Data for Options
export const mockCategories = [
  { id: "1", name: "Electronics" },
  { id: "2", name: "Clothing" },
  { id: "3", name: "Home & Garden" },
];

export const mockBrands = [
  { id: "1", name: "Apple" },
  { id: "2", name: "Samsung" },
  { id: "3", name: "Nike" },
  { id: "4", name: "Adidas" },
];

export const mockTags = [
  { id: "1", name: "New Arrival" },
  { id: "2", name: "Best Seller" },
  { id: "3", name: "Sale" },
  { id: "4", name: "Limited Edition" },
];

export const mockAttributes = [
  { id: "1", name: "Color" },
  { id: "2", name: "Size" },
  { id: "3", name: "Material" },
  { id: "4", name: "Warranty" },
];

export const mockTaxes = [
  { id: "1", name: "VAT Standard", rate: 20 },
  { id: "2", name: "Reduced Rate", rate: 5 },
];

export const mockShippingMethods = [
  { id: "1", name: "Standard Shipping", price: 5.0 },
  { id: "2", name: "Express Shipping", price: 15.0 },
  { id: "3", name: "Free Shipping", price: 0.0 },
];

// Mock Products
export const mockProducts = [
  {
    id: "1",
    name: "Wireless Headphones",
    sku: "WH-001",
    shop: "Tech Gadgets Store",
    price: "$99.99",
    stock: 45,
    status: "active" as const,
    image: "https://placehold.co/100?text=WH",
    productType: "Simple",
    category: "Electronics",
    brand: "Sony",
    tags: ["Best Seller", "Sale"],
  },
  {
    id: "2",
    name: "Smart Watch",
    sku: "SW-002",
    shop: "Tech Gadgets Store",
    price: "$199.99",
    stock: 23,
    status: "active" as const,
    image: "https://placehold.co/100?text=SW",
    productType: "Variable",
    category: "Electronics",
    brand: "Apple",
    tags: ["New Arrival"],
  },
  {
    id: "3",
    name: "Laptop Stand",
    sku: "LS-003",
    shop: "Tech Gadgets Store",
    price: "$49.99",
    stock: 0,
    status: "out_of_stock" as const,
    image: "https://placehold.co/100?text=LS",
    productType: "Simple",
    category: "Electronics",
    brand: "Generic",
    tags: [],
  },
];
