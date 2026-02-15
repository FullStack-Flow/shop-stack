/**
 * Seed Data Generator
 *
 * Generates seeding.json with 10 shops, 50 products, and all related entities.
 * Run with: npx tsx src/data/generate-seed.ts
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

// ============================================================================
// User IDs (provided)
// ============================================================================
const USER_IDS = [
  "8ZzH3ONSuSpz1IYwJLiLlpooxbIKxPNO",
  "CQUDCefoyYyfpPqbFi4OuzR2XKq0Lbwh",
  "TidNPzRp37zli5iqJoBQQTGypKqzJGg0",
  "fuHd3tcUr1SZ0PWHKi9TM3yHv34enu8a",
  "oUP6VlQVSvDF65xAUrIyuvqMxoPsmURL",
  "xUYMejz1mKqSD7smI5snNI3roupLUsJG",
];

// ============================================================================
// Helpers
// ============================================================================
let idCounter = 0;
function genId(prefix: string) {
  return `${prefix}_${(++idCounter).toString().padStart(4, "0")}`;
}
function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ============================================================================
// Shop Definitions (10 shops across 6 vendors)
// ============================================================================
const SHOP_DEFS = [
  {
    name: "TechVault Electronics",
    category: "Electronics",
    vendorIdx: 0,
    desc: "Premium electronics and gadgets for tech enthusiasts",
  },
  {
    name: "StyleHaven Boutique",
    category: "Fashion",
    vendorIdx: 1,
    desc: "Trendy fashion and apparel for modern lifestyles",
  },
  {
    name: "HomeNest Living",
    category: "Home & Living",
    vendorIdx: 2,
    desc: "Beautiful home decor and furniture essentials",
  },
  {
    name: "GreenLeaf Organics",
    category: "Grocery",
    vendorIdx: 3,
    desc: "Fresh organic produce and healthy food options",
  },
  {
    name: "FitPro Sports",
    category: "Sports",
    vendorIdx: 4,
    desc: "High-performance sports gear and fitness equipment",
  },
  {
    name: "BookWorm Haven",
    category: "Books",
    vendorIdx: 5,
    desc: "Curated books and stationery for avid readers",
  },
  {
    name: "PetPals Store",
    category: "Pet Supplies",
    vendorIdx: 0,
    desc: "Everything your furry friends need and love",
  },
  {
    name: "BeautyGlow Cosmetics",
    category: "Beauty",
    vendorIdx: 1,
    desc: "Premium skincare and cosmetics collection",
  },
  {
    name: "KidZone Toys",
    category: "Toys",
    vendorIdx: 2,
    desc: "Fun and educational toys for children of all ages",
  },
  {
    name: "GadgetWorld Hub",
    category: "Electronics",
    vendorIdx: 3,
    desc: "Affordable smart devices and accessories",
  },
];

// ============================================================================
// Category Templates per shop type
// ============================================================================
const CATEGORIES_MAP: Record<string, string[]> = {
  Electronics: ["Smartphones", "Laptops", "Audio", "Wearables", "Accessories"],
  Fashion: ["Men's Wear", "Women's Wear", "Footwear", "Bags", "Jewelry"],
  "Home & Living": ["Furniture", "Lighting", "Kitchenware", "Bedding", "Decor"],
  Grocery: ["Fruits", "Vegetables", "Dairy", "Snacks", "Beverages"],
  Sports: ["Gym Equipment", "Running Gear", "Yoga", "Cycling", "Outdoor"],
  Books: ["Fiction", "Non-Fiction", "Academic", "Children's Books", "Comics"],
  "Pet Supplies": ["Dog Food", "Cat Food", "Toys", "Grooming", "Health"],
  Beauty: ["Skincare", "Makeup", "Haircare", "Fragrance", "Tools"],
  Toys: ["Action Figures", "Board Games", "Puzzles", "Dolls", "STEM Kits"],
};

// ============================================================================
// Brand Templates
// ============================================================================
const BRANDS_MAP: Record<string, string[]> = {
  Electronics: ["Apple", "Samsung", "Sony", "Bose", "Anker"],
  Fashion: ["Zara", "H&M", "Nike", "Gucci", "Levi's"],
  "Home & Living": [
    "IKEA",
    "West Elm",
    "Pottery Barn",
    "Crate & Barrel",
    "Muji",
  ],
  Grocery: [
    "Whole Foods",
    "Organic Valley",
    "Nature's Path",
    "Bob's Red Mill",
    "Earthbound",
  ],
  Sports: ["Nike", "Adidas", "Under Armour", "Reebok", "Puma"],
  Books: [
    "Penguin",
    "HarperCollins",
    "Simon & Schuster",
    "Scholastic",
    "O'Reilly",
  ],
  "Pet Supplies": ["Royal Canin", "Blue Buffalo", "Purina", "Hill's", "KONG"],
  Beauty: ["L'Oreal", "Estee Lauder", "Clinique", "MAC", "Neutrogena"],
  Toys: ["LEGO", "Hasbro", "Mattel", "Fisher-Price", "Melissa & Doug"],
};

// ============================================================================
// Tag Templates
// ============================================================================
const TAGS_MAP: Record<string, string[]> = {
  Electronics: [
    "bestseller",
    "new-arrival",
    "trending",
    "limited-edition",
    "sale",
  ],
  Fashion: [
    "summer-collection",
    "winter-collection",
    "bestseller",
    "eco-friendly",
    "premium",
  ],
  "Home & Living": [
    "handmade",
    "sustainable",
    "modern",
    "vintage",
    "clearance",
  ],
  Grocery: ["organic", "gluten-free", "vegan", "sugar-free", "farm-fresh"],
  Sports: ["pro-grade", "lightweight", "durable", "compact", "bestseller"],
  Books: [
    "award-winning",
    "bestseller",
    "new-release",
    "classic",
    "signed-copy",
  ],
  "Pet Supplies": [
    "natural",
    "grain-free",
    "vet-recommended",
    "eco-friendly",
    "premium",
  ],
  Beauty: [
    "cruelty-free",
    "vegan",
    "organic",
    "dermatologist-tested",
    "anti-aging",
  ],
  Toys: ["educational", "eco-friendly", "award-winning", "ages-3-plus", "stem"],
};

// ============================================================================
// Attribute Templates
// ============================================================================
const ATTRIBUTES_MAP: Record<
  string,
  Array<{
    name: string;
    type: string;
    values: Array<{ name: string; value: string }>;
  }>
> = {
  Electronics: [
    {
      name: "Color",
      type: "color",
      values: [
        { name: "Black", value: "#000000" },
        { name: "Silver", value: "#C0C0C0" },
        { name: "White", value: "#FFFFFF" },
      ],
    },
    {
      name: "Storage",
      type: "select",
      values: [
        { name: "64GB", value: "64GB" },
        { name: "128GB", value: "128GB" },
        { name: "256GB", value: "256GB" },
      ],
    },
  ],
  Fashion: [
    {
      name: "Size",
      type: "label",
      values: [
        { name: "S", value: "S" },
        { name: "M", value: "M" },
        { name: "L", value: "L" },
        { name: "XL", value: "XL" },
      ],
    },
    {
      name: "Color",
      type: "color",
      values: [
        { name: "Red", value: "#FF0000" },
        { name: "Blue", value: "#0000FF" },
        { name: "Black", value: "#000000" },
      ],
    },
  ],
  "Home & Living": [
    {
      name: "Material",
      type: "select",
      values: [
        { name: "Wood", value: "Wood" },
        { name: "Metal", value: "Metal" },
        { name: "Fabric", value: "Fabric" },
      ],
    },
    {
      name: "Color",
      type: "color",
      values: [
        { name: "Oak", value: "#C19A6B" },
        { name: "Walnut", value: "#5C4033" },
        { name: "White", value: "#FFFFFF" },
      ],
    },
  ],
  Grocery: [
    {
      name: "Weight",
      type: "select",
      values: [
        { name: "250g", value: "250g" },
        { name: "500g", value: "500g" },
        { name: "1kg", value: "1kg" },
      ],
    },
  ],
  Sports: [
    {
      name: "Size",
      type: "label",
      values: [
        { name: "S", value: "S" },
        { name: "M", value: "M" },
        { name: "L", value: "L" },
      ],
    },
    {
      name: "Color",
      type: "color",
      values: [
        { name: "Black", value: "#000000" },
        { name: "Red", value: "#FF0000" },
        { name: "Blue", value: "#0000FF" },
      ],
    },
  ],
  Books: [
    {
      name: "Format",
      type: "select",
      values: [
        { name: "Paperback", value: "Paperback" },
        { name: "Hardcover", value: "Hardcover" },
      ],
    },
  ],
  "Pet Supplies": [
    {
      name: "Size",
      type: "select",
      values: [
        { name: "Small", value: "Small" },
        { name: "Medium", value: "Medium" },
        { name: "Large", value: "Large" },
      ],
    },
  ],
  Beauty: [
    {
      name: "Shade",
      type: "color",
      values: [
        { name: "Light", value: "#FDEBD0" },
        { name: "Medium", value: "#D4A574" },
        { name: "Dark", value: "#8B4513" },
      ],
    },
    {
      name: "Size",
      type: "select",
      values: [
        { name: "30ml", value: "30ml" },
        { name: "50ml", value: "50ml" },
        { name: "100ml", value: "100ml" },
      ],
    },
  ],
  Toys: [
    {
      name: "Age Group",
      type: "label",
      values: [
        { name: "3-5 Years", value: "3-5" },
        { name: "6-8 Years", value: "6-8" },
        { name: "9-12 Years", value: "9-12" },
      ],
    },
  ],
};

// ============================================================================
// Product Templates (5 per shop category)
// ============================================================================
const PRODUCTS_MAP: Record<
  string,
  Array<{
    name: string;
    price: number;
    regular: number;
    cost: number;
    stock: number;
    desc: string;
    short: string;
    featured: boolean;
  }>
> = {
  Electronics: [
    {
      name: "ProMax Wireless Earbuds",
      price: 79.99,
      regular: 99.99,
      cost: 35,
      stock: 150,
      desc: "Premium noise-cancelling wireless earbuds with 30hr battery life",
      short: "Wireless earbuds with ANC",
      featured: true,
    },
    {
      name: "UltraSlim Laptop Stand",
      price: 49.99,
      regular: 59.99,
      cost: 20,
      stock: 200,
      desc: "Ergonomic aluminum laptop stand with adjustable height",
      short: "Adjustable laptop stand",
      featured: false,
    },
    {
      name: "SmartWatch Pro X",
      price: 199.99,
      regular: 249.99,
      cost: 90,
      stock: 80,
      desc: "Advanced smartwatch with health monitoring and GPS",
      short: "GPS smartwatch",
      featured: true,
    },
    {
      name: "4K Webcam Ultra HD",
      price: 129.99,
      regular: 159.99,
      cost: 55,
      stock: 120,
      desc: "Professional 4K webcam with auto-focus and noise reduction mic",
      short: "4K streaming webcam",
      featured: false,
    },
    {
      name: "PowerBank 20000mAh",
      price: 39.99,
      regular: 49.99,
      cost: 15,
      stock: 300,
      desc: "High-capacity portable charger with fast charging support",
      short: "20000mAh power bank",
      featured: false,
    },
  ],
  Fashion: [
    {
      name: "Classic Denim Jacket",
      price: 89.99,
      regular: 119.99,
      cost: 40,
      stock: 100,
      desc: "Premium denim jacket with vintage wash finish",
      short: "Vintage denim jacket",
      featured: true,
    },
    {
      name: "Silk Blend Scarf",
      price: 34.99,
      regular: 44.99,
      cost: 12,
      stock: 250,
      desc: "Luxurious silk blend scarf with geometric patterns",
      short: "Silk pattern scarf",
      featured: false,
    },
    {
      name: "Leather Chelsea Boots",
      price: 149.99,
      regular: 189.99,
      cost: 65,
      stock: 60,
      desc: "Handcrafted leather chelsea boots with cushioned sole",
      short: "Chelsea boots",
      featured: true,
    },
    {
      name: "Cashmere Sweater",
      price: 129.99,
      regular: 169.99,
      cost: 55,
      stock: 75,
      desc: "Ultra-soft cashmere pullover sweater",
      short: "Cashmere pullover",
      featured: false,
    },
    {
      name: "Canvas Tote Bag",
      price: 29.99,
      regular: 39.99,
      cost: 10,
      stock: 400,
      desc: "Durable canvas tote bag with interior pockets",
      short: "Canvas tote bag",
      featured: false,
    },
  ],
  "Home & Living": [
    {
      name: "Scandinavian Floor Lamp",
      price: 159.99,
      regular: 199.99,
      cost: 70,
      stock: 40,
      desc: "Minimalist floor lamp with warm LED and dimmer",
      short: "Modern floor lamp",
      featured: true,
    },
    {
      name: "Bamboo Cutting Board Set",
      price: 44.99,
      regular: 54.99,
      cost: 18,
      stock: 180,
      desc: "Premium bamboo cutting board set of 3 sizes",
      short: "Bamboo board set",
      featured: false,
    },
    {
      name: "Egyptian Cotton Duvet",
      price: 199.99,
      regular: 249.99,
      cost: 85,
      stock: 50,
      desc: "800-thread-count Egyptian cotton duvet cover set",
      short: "Luxury duvet set",
      featured: true,
    },
    {
      name: "Ceramic Plant Pot Set",
      price: 59.99,
      regular: 74.99,
      cost: 22,
      stock: 120,
      desc: "Hand-glazed ceramic plant pots in 3 earthy tones",
      short: "Ceramic pot set",
      featured: false,
    },
    {
      name: "Woven Wall Art",
      price: 79.99,
      regular: 99.99,
      cost: 30,
      stock: 65,
      desc: "Handwoven macramé wall hanging with natural cotton",
      short: "Macramé wall art",
      featured: false,
    },
  ],
  Grocery: [
    {
      name: "Organic Quinoa Mix",
      price: 12.99,
      regular: 15.99,
      cost: 5,
      stock: 500,
      desc: "Tri-color organic quinoa blend, 1kg bag",
      short: "Organic quinoa 1kg",
      featured: true,
    },
    {
      name: "Raw Honey Collection",
      price: 24.99,
      regular: 29.99,
      cost: 10,
      stock: 200,
      desc: "Pure raw honey sampler with 3 varieties",
      short: "Raw honey sampler",
      featured: false,
    },
    {
      name: "Cold-Pressed Olive Oil",
      price: 18.99,
      regular: 22.99,
      cost: 8,
      stock: 300,
      desc: "Extra virgin cold-pressed olive oil, 500ml",
      short: "EVOO 500ml",
      featured: true,
    },
    {
      name: "Mixed Nuts Premium",
      price: 15.99,
      regular: 19.99,
      cost: 7,
      stock: 250,
      desc: "Premium mixed nuts with cashews, almonds, and walnuts",
      short: "Premium mixed nuts",
      featured: false,
    },
    {
      name: "Matcha Green Tea Powder",
      price: 29.99,
      regular: 34.99,
      cost: 12,
      stock: 150,
      desc: "Ceremonial grade Japanese matcha powder, 100g",
      short: "Matcha powder 100g",
      featured: false,
    },
  ],
  Sports: [
    {
      name: "Resistance Band Set Pro",
      price: 34.99,
      regular: 44.99,
      cost: 12,
      stock: 350,
      desc: "Professional 5-level resistance band set with handles",
      short: "5-level resistance bands",
      featured: true,
    },
    {
      name: "Yoga Mat Premium",
      price: 59.99,
      regular: 74.99,
      cost: 22,
      stock: 200,
      desc: "Non-slip TPE yoga mat 6mm with alignment lines",
      short: "Premium yoga mat",
      featured: false,
    },
    {
      name: "Running Hydration Vest",
      price: 49.99,
      regular: 64.99,
      cost: 20,
      stock: 100,
      desc: "Lightweight running vest with 2L hydration bladder",
      short: "Hydration vest 2L",
      featured: true,
    },
    {
      name: "Adjustable Dumbbells 25kg",
      price: 189.99,
      regular: 229.99,
      cost: 85,
      stock: 45,
      desc: "Space-saving adjustable dumbbells pair, 2.5-25kg each",
      short: "Adjustable dumbbells",
      featured: false,
    },
    {
      name: "LED Jump Rope",
      price: 24.99,
      regular: 29.99,
      cost: 8,
      stock: 400,
      desc: "Smart LED jump rope with calorie counter display",
      short: "LED jump rope",
      featured: false,
    },
  ],
  Books: [
    {
      name: "The Code of Tomorrow",
      price: 24.99,
      regular: 29.99,
      cost: 8,
      stock: 300,
      desc: "A gripping sci-fi novel about AI and humanity's future",
      short: "Sci-fi novel",
      featured: true,
    },
    {
      name: "Mindful Leadership",
      price: 19.99,
      regular: 24.99,
      cost: 7,
      stock: 250,
      desc: "A guide to leading with empathy and purpose",
      short: "Leadership guide",
      featured: false,
    },
    {
      name: "Data Structures Mastery",
      price: 44.99,
      regular: 54.99,
      cost: 18,
      stock: 150,
      desc: "Comprehensive textbook on algorithms and data structures",
      short: "CS textbook",
      featured: true,
    },
    {
      name: "Adventures of Luna",
      price: 14.99,
      regular: 17.99,
      cost: 5,
      stock: 400,
      desc: "Illustrated children's storybook about a brave rabbit",
      short: "Children's storybook",
      featured: false,
    },
    {
      name: "Graphic Novel: Eclipse",
      price: 29.99,
      regular: 34.99,
      cost: 12,
      stock: 120,
      desc: "Award-winning graphic novel with stunning artwork",
      short: "Graphic novel",
      featured: false,
    },
  ],
  "Pet Supplies": [
    {
      name: "Grain-Free Dog Kibble",
      price: 49.99,
      regular: 59.99,
      cost: 22,
      stock: 200,
      desc: "Premium grain-free dry dog food, chicken recipe 5kg",
      short: "Dog food 5kg",
      featured: true,
    },
    {
      name: "Interactive Cat Toy",
      price: 19.99,
      regular: 24.99,
      cost: 7,
      stock: 350,
      desc: "Motion-activated laser and feather cat toy",
      short: "Cat laser toy",
      featured: false,
    },
    {
      name: "Orthopedic Dog Bed",
      price: 79.99,
      regular: 99.99,
      cost: 35,
      stock: 80,
      desc: "Memory foam orthopedic dog bed, washable cover",
      short: "Dog bed large",
      featured: true,
    },
    {
      name: "Pet Grooming Kit",
      price: 39.99,
      regular: 49.99,
      cost: 15,
      stock: 150,
      desc: "Complete grooming kit with clippers, brushes, and scissors",
      short: "Grooming kit",
      featured: false,
    },
    {
      name: "Salmon Oil Supplement",
      price: 22.99,
      regular: 27.99,
      cost: 9,
      stock: 250,
      desc: "Wild-caught salmon oil for skin and coat health, 500ml",
      short: "Salmon oil 500ml",
      featured: false,
    },
  ],
  Beauty: [
    {
      name: "Hyaluronic Acid Serum",
      price: 34.99,
      regular: 44.99,
      cost: 12,
      stock: 300,
      desc: "2% hyaluronic acid serum for intense hydration, 30ml",
      short: "HA serum 30ml",
      featured: true,
    },
    {
      name: "Vitamin C Moisturizer",
      price: 29.99,
      regular: 39.99,
      cost: 10,
      stock: 250,
      desc: "Brightening vitamin C day cream with SPF 30",
      short: "Vit C moisturizer",
      featured: false,
    },
    {
      name: "Retinol Night Cream",
      price: 49.99,
      regular: 64.99,
      cost: 20,
      stock: 150,
      desc: "Advanced retinol night cream for anti-aging, 50ml",
      short: "Retinol cream 50ml",
      featured: true,
    },
    {
      name: "Matte Lipstick Collection",
      price: 24.99,
      regular: 29.99,
      cost: 8,
      stock: 400,
      desc: "Set of 4 long-lasting matte lipsticks in nude shades",
      short: "Matte lipstick set",
      featured: false,
    },
    {
      name: "Argan Hair Oil",
      price: 19.99,
      regular: 24.99,
      cost: 7,
      stock: 200,
      desc: "Pure argan oil for frizz control and shine, 100ml",
      short: "Argan oil 100ml",
      featured: false,
    },
  ],
  Toys: [
    {
      name: "STEM Robot Kit",
      price: 59.99,
      regular: 74.99,
      cost: 25,
      stock: 120,
      desc: "Build-your-own programmable robot kit for ages 8+",
      short: "Programmable robot",
      featured: true,
    },
    {
      name: "Classic Strategy Board Game",
      price: 34.99,
      regular: 39.99,
      cost: 14,
      stock: 200,
      desc: "Award-winning strategy board game for 2-6 players",
      short: "Strategy board game",
      featured: false,
    },
    {
      name: "3D Wooden Puzzle Castle",
      price: 29.99,
      regular: 34.99,
      cost: 10,
      stock: 180,
      desc: "Intricate 3D wooden castle puzzle with 250 pieces",
      short: "3D castle puzzle",
      featured: true,
    },
    {
      name: "Princess Doll Playset",
      price: 44.99,
      regular: 54.99,
      cost: 18,
      stock: 150,
      desc: "Deluxe princess doll with castle playset and accessories",
      short: "Princess playset",
      featured: false,
    },
    {
      name: "Solar System Science Kit",
      price: 39.99,
      regular: 49.99,
      cost: 16,
      stock: 100,
      desc: "Interactive solar system model kit with LED lights",
      short: "Solar system kit",
      featured: false,
    },
  ],
};

// ============================================================================
// Shipping Templates
// ============================================================================
const SHIPPING_TEMPLATES = [
  {
    name: "Standard Shipping",
    desc: "Regular delivery service",
    price: "5.99",
    duration: "5-7 business days",
  },
  {
    name: "Express Shipping",
    desc: "Fast delivery service",
    price: "14.99",
    duration: "2-3 business days",
  },
  {
    name: "Overnight Shipping",
    desc: "Next-day delivery",
    price: "24.99",
    duration: "1 business day",
  },
];

// ============================================================================
// Tax Templates
// ============================================================================
const TAX_TEMPLATES = [
  { name: "Standard Tax", rate: "10.00", country: "US" },
  { name: "Reduced Tax", rate: "5.00", country: "US" },
];

// ============================================================================
// Image URL generator (picsum for realistic placeholder images)
// ============================================================================
function productImageUrl(seed: number, w = 800, h = 800) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

// ============================================================================
// MAIN GENERATION
// ============================================================================
function generate() {
  const vendorsList: any[] = [];
  const shopsList: any[] = [];
  const categoriesList: any[] = [];
  const brandsList: any[] = [];
  const tagsList: any[] = [];
  const attributesList: any[] = [];
  const taxesList: any[] = [];
  const shippingList: any[] = [];
  const productsList: any[] = [];

  // Create vendors (one per user)
  const vendorNames = [
    "TechNova Ventures",
    "StyleCraft LLC",
    "HomeWorld Inc",
    "GreenPath Farms",
    "ProFit Athletics",
    "Bookish Enterprises",
  ];

  for (let i = 0; i < USER_IDS.length; i++) {
    vendorsList.push({
      id: genId("vendor"),
      userId: USER_IDS[i],
      businessName: vendorNames[i],
      status: "active",
      contactEmail: `vendor${i + 1}@shopstack.demo`,
      contactPhone: `+1555000${(i + 1).toString().padStart(4, "0")}`,
    });
  }

  // Create shops, and per-shop entities
  let imgSeed = 1000;

  for (let si = 0; si < SHOP_DEFS.length; si++) {
    const sd = SHOP_DEFS[si];
    const shopId = genId("shop");
    const vendorId = vendorsList[sd.vendorIdx].id;

    shopsList.push({
      id: shopId,
      vendorId,
      name: sd.name,
      slug: slugify(sd.name),
      description: sd.desc,
      category: sd.category,
      status: "active",
      logo: productImageUrl(imgSeed++, 200, 200),
      banner: productImageUrl(imgSeed++, 1200, 400),
    });

    // Categories for this shop
    const catNames = CATEGORIES_MAP[sd.category] || CATEGORIES_MAP.Electronics;
    const shopCategories: any[] = [];
    for (let ci = 0; ci < catNames.length; ci++) {
      const catId = genId("cat");
      shopCategories.push({
        id: catId,
        shopId,
        name: catNames[ci],
        slug: slugify(catNames[ci]),
        description: `${catNames[ci]} category for ${sd.name}`,
        isActive: true,
        sortOrder: ci,
      });
    }
    categoriesList.push(...shopCategories);

    // Brands for this shop
    const brandNames = BRANDS_MAP[sd.category] || BRANDS_MAP.Electronics;
    const shopBrands: any[] = [];
    for (let bi = 0; bi < brandNames.length; bi++) {
      const brandId = genId("brand");
      shopBrands.push({
        id: brandId,
        shopId,
        name: brandNames[bi],
        slug: slugify(brandNames[bi]),
        description: `${brandNames[bi]} products`,
        isActive: true,
      });
    }
    brandsList.push(...shopBrands);

    // Tags for this shop
    const tagNames = TAGS_MAP[sd.category] || TAGS_MAP.Electronics;
    const shopTags: any[] = [];
    for (let ti = 0; ti < tagNames.length; ti++) {
      shopTags.push({
        id: genId("tag"),
        shopId,
        name: tagNames[ti].replace(/-/g, " "),
        slug: tagNames[ti],
        description: `${tagNames[ti]} tag`,
        isActive: true,
        sortOrder: ti,
      });
    }
    tagsList.push(...shopTags);

    // Attributes for this shop
    const attrDefs = ATTRIBUTES_MAP[sd.category] || ATTRIBUTES_MAP.Electronics;
    const shopAttrs: any[] = [];
    for (const ad of attrDefs) {
      const attrId = genId("attr");
      const attrValues = ad.values.map((v) => ({
        id: genId("aval"),
        name: v.name,
        value: v.value,
      }));
      shopAttrs.push({
        id: attrId,
        shopId,
        name: ad.name,
        slug: slugify(ad.name),
        type: ad.type,
        values: attrValues,
      });
    }
    attributesList.push(...shopAttrs);

    // Taxes for this shop
    const shopTaxes: any[] = [];
    for (const tt of TAX_TEMPLATES) {
      shopTaxes.push({
        id: genId("tax"),
        shopId,
        name: tt.name,
        rate: tt.rate,
        country: tt.country,
        isCompound: false,
        isActive: true,
      });
    }
    taxesList.push(...shopTaxes);

    // Shipping methods for this shop
    const shopShipping: any[] = [];
    for (const st of SHIPPING_TEMPLATES) {
      shopShipping.push({
        id: genId("ship"),
        shopId,
        name: st.name,
        description: st.desc,
        price: st.price,
        duration: st.duration,
        isActive: true,
      });
    }
    shippingList.push(...shopShipping);

    // Products (5 per shop)
    const prodDefs = PRODUCTS_MAP[sd.category] || PRODUCTS_MAP.Electronics;
    for (let pi = 0; pi < prodDefs.length; pi++) {
      const pd = prodDefs[pi];
      const productId = genId("prod");
      const hasVariations = shopAttrs.length > 0 && pi % 2 === 0; // alternate simple/variable

      // Thumbnail (primary) + 3 gallery images
      const images = [
        {
          id: genId("img"),
          url: productImageUrl(imgSeed++),
          alt: `${pd.name} - Main`,
          sortOrder: 0,
          isPrimary: true,
        },
        {
          id: genId("img"),
          url: productImageUrl(imgSeed++),
          alt: `${pd.name} - Side`,
          sortOrder: 1,
          isPrimary: false,
        },
        {
          id: genId("img"),
          url: productImageUrl(imgSeed++),
          alt: `${pd.name} - Detail`,
          sortOrder: 2,
          isPrimary: false,
        },
        {
          id: genId("img"),
          url: productImageUrl(imgSeed++),
          alt: `${pd.name} - Lifestyle`,
          sortOrder: 3,
          isPrimary: false,
        },
      ];

      // Pick category & brand for this product
      const categoryId = shopCategories[pi % shopCategories.length].id;
      const brandId = shopBrands[pi % shopBrands.length].id;
      const taxId = shopTaxes[0].id;

      // Tags (assign 2 tags per product)
      const productTagIds = [
        shopTags[pi % shopTags.length].id,
        shopTags[(pi + 1) % shopTags.length].id,
      ];

      // Attributes
      const attributeIds = hasVariations ? shopAttrs.map((a: any) => a.id) : [];
      const attributeValues: Record<string, string[]> = {};
      if (hasVariations) {
        for (const attr of shopAttrs) {
          attributeValues[attr.id] = attr.values.map((v: any) => v.id);
        }
      }

      // Shipping methods (assign 2 per product)
      const shippingMethodIds = [shopShipping[0].id, shopShipping[1].id];

      productsList.push({
        id: productId,
        shopId,
        name: pd.name,
        slug: slugify(pd.name),
        sku: `SKU-${shopId.split("_")[1]}-${(pi + 1).toString().padStart(3, "0")}`,
        description: pd.desc,
        shortDescription: pd.short,
        sellingPrice: pd.price.toFixed(2),
        regularPrice: pd.regular.toFixed(2),
        costPrice: pd.cost.toFixed(2),
        stock: pd.stock,
        lowStockThreshold: 5,
        trackInventory: true,
        categoryId,
        brandId,
        taxId,
        status: "active",
        productType: hasVariations ? "variable" : "simple",
        isFeatured: pd.featured,
        isActive: true,
        metaTitle: pd.name,
        metaDescription: pd.short,
        variationPrices: {},
        images,
        tagIds: productTagIds,
        attributeIds,
        attributeValues,
        shippingMethodIds,
      });
    }
  }

  return {
    vendors: vendorsList,
    shops: shopsList,
    categories: categoriesList,
    brands: brandsList,
    tags: tagsList,
    attributes: attributesList,
    taxes: taxesList,
    shippingMethods: shippingList,
    products: productsList,
  };
}

// Write to file
const data = generate();
const outPath = resolve(import.meta.dirname!, "seeding.json");
writeFileSync(outPath, JSON.stringify(data, null, 2));

console.log("✅ seeding.json generated!");
console.log(`   Vendors: ${data.vendors.length}`);
console.log(`   Shops: ${data.shops.length}`);
console.log(`   Categories: ${data.categories.length}`);
console.log(`   Brands: ${data.brands.length}`);
console.log(`   Tags: ${data.tags.length}`);
console.log(`   Attributes: ${data.attributes.length}`);
console.log(`   Taxes: ${data.taxes.length}`);
console.log(`   Shipping Methods: ${data.shippingMethods.length}`);
console.log(`   Products: ${data.products.length}`);
