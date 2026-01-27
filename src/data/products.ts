export interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  date: string;
  rating: number;
  comment: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  price: {
    current: number;
    original: number;
    currency: string;
    discountPercentage: number;
  };
  images: {
    id: string;
    url: string;
    alt: string;
  }[];
  rating: {
    average: number;
    count: number;
    breakdown: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };
  reviews: Review[];
  stock: {
    inStock: boolean;
    quantity: number;
  };
  store: {
    id: string;
    name: string;
    slug: string;
    logo: string;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    memberSince: string;
  };
  shipping: {
    freeShipping: boolean;
    deliveryTime: string;
    policy: string;
  };
  specifications: Record<string, string>;
  isOnSale: boolean;
  similarProducts: Product[]; // Recursive reference for simplicity in mock
  breadcrumbs: { label: string; href: string }[];
  // Legacy fields for compatibility if needed, but we should try to use the new structure
  brand: string;
  colors: string[];
  sizes: string[];
  isNew: boolean;
  createdAt: string;
  sales: number;
}

export const CATEGORIES = {
  Clothing: ["T-Shirts", "Jeans", "Jackets", "Dresses", "Activewear"],
  Electronics: ["Smartphones", "Laptops", "Headphones", "Accessories"],
  Home: ["Furniture", "Decor", "Kitchen", "Bedding"],
  Footwear: ["Sneakers", "Boots", "Sandals", "Formal"],
};

export const BRANDS = [
  "Nike",
  "Adidas",
  "Apple",
  "Samsung",
  "Sony",
  "Zara",
  "H&M",
  "Levi's",
  "Uniqlo",
  "Dyson",
  "Bose",
];

export const COLORS = [
  "Black",
  "White",
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Purple",
  "Pink",
  "Grey",
  "Beige",
];

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const ADJECTIVES = [
  "Premium",
  "Classic",
  "Modern",
  "Elegant",
  "Durable",
  "Lightweight",
  "Comfortable",
  "Stylish",
];
const NOUNS = [
  "Runner",
  "Basic",
  "Pro",
  "Max",
  "Air",
  "Ultra",
  "Essential",
  "Signature",
];

const getRandomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItem = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
const getRandomItems = <T>(arr: T[], min: number, max: number): T[] => {
  const count = getRandomInt(min, max);
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const generateReviews = (count: number): Review[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `rev-${i}`,
    userName: getRandomItem([
      "John Doe",
      "Jane Smith",
      "Alice Johnson",
      "Bob Brown",
    ]),
    userAvatar: `https://i.pravatar.cc/150?u=${getRandomInt(1, 1000)}`,
    date: new Date(
      Date.now() - getRandomInt(0, 10000000000)
    ).toLocaleDateString(),
    rating: getRandomInt(3, 5),
    comment: getRandomItem([
      "Great product! Highly recommended.",
      "Good value for money.",
      "Excellent quality and fast shipping.",
      "Satisfied with the purchase.",
      "Could be better, but decent for the price.",
    ]),
  }));
};

const generateProducts = (count: number): Product[] => {
  return Array.from({ length: count }).map((_, i) => {
    const categoryKey = getRandomItem(
      Object.keys(CATEGORIES)
    ) as keyof typeof CATEGORIES;
    const subcategory = getRandomItem(CATEGORIES[categoryKey]);
    const brand = getRandomItem(BRANDS);
    const name = `${brand} ${getRandomItem(ADJECTIVES)} ${subcategory} ${getRandomItem(NOUNS)}`;
    const slug = name.toLowerCase().replace(/ /g, "-");

    const priceVal = getRandomInt(20, 500);
    const hasDiscount = Math.random() > 0.7;
    const discountPercent = hasDiscount
      ? getRandomItem([10, 20, 25, 30, 50])
      : 0;
    const originalPrice = hasDiscount
      ? Math.round(priceVal / (1 - discountPercent / 100))
      : priceVal;

    const ratingAvg = Number((Math.random() * 2 + 3).toFixed(1));
    const reviewCount = getRandomInt(5, 100);

    return {
      id: `prod-${i + 1}`,
      slug,
      name,
      description: `
        <p>Experience the ultimate in quality and performance with the ${name}. Designed for modern lifestyles, this product combines durability with sleek aesthetics.</p>
        <br/>
        <p>Key Features:</p>
        <ul>
          <li>Premium materials for long-lasting use</li>
          <li>Ergonomic design for maximum comfort</li>
          <li>Versatile functionality for various needs</li>
        </ul>
        <br/>
        <p>Whether you're a professional or an enthusiast, the ${name} is the perfect choice to elevate your experience.</p>
      `,
      category: {
        id: `cat-${categoryKey}`,
        name: categoryKey,
        slug: categoryKey.toLowerCase(),
      },
      price: {
        current: priceVal,
        original: originalPrice,
        currency: "$",
        discountPercentage: discountPercent,
      },
      images: [
        {
          id: `img-${i}-1`,
          url: `https://placehold.co/600x600?text=${encodeURIComponent(name)}`,
          alt: `${name} Main View`,
        },
        {
          id: `img-${i}-2`,
          url: `https://placehold.co/600x600?text=${encodeURIComponent(`${name} Side`)}`,
          alt: `${name} Side View`,
        },
        {
          id: `img-${i}-3`,
          url: `https://placehold.co/600x600?text=${encodeURIComponent(`${name} Detail`)}`,
          alt: `${name} Detail View`,
        },
        {
          id: `img-${i}-4`,
          url: `https://placehold.co/600x600?text=${encodeURIComponent(`${name} Lifestyle`)}`,
          alt: `${name} Lifestyle View`,
        },
      ],
      rating: {
        average: ratingAvg,
        count: reviewCount,
        breakdown: {
          5: Math.floor(reviewCount * 0.6),
          4: Math.floor(reviewCount * 0.2),
          3: Math.floor(reviewCount * 0.1),
          2: Math.floor(reviewCount * 0.05),
          1: Math.floor(reviewCount * 0.05),
        },
      },
      reviews: generateReviews(3),
      stock: {
        inStock: Math.random() > 0.1,
        quantity: getRandomInt(0, 50),
      },
      store: {
        id: `store-${getRandomInt(1, 10)}`,
        name: `${brand} Official Store`,
        slug: `${brand.toLowerCase()}-store`,
        logo: `https://placehold.co/100x100?text=${brand[0]}`,
        rating: 4.8,
        reviewCount: 1250,
        isVerified: true,
        memberSince: "2020",
      },
      shipping: {
        freeShipping: Math.random() > 0.3,
        deliveryTime: "3-5 business days",
        policy:
          "30-day return policy. Buyer pays return shipping unless item is defective.",
      },
      specifications: {
        Brand: brand,
        Model: `M-${getRandomInt(1000, 9999)}`,
        Material: getRandomItem([
          "Cotton",
          "Polyester",
          "Leather",
          "Metal",
          "Plastic",
        ]),
        Weight: `${getRandomInt(100, 1000)}g`,
        Origin: "Imported",
      },
      isOnSale: hasDiscount,
      similarProducts: [], // Populated after generation to avoid infinite recursion issues during init
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: categoryKey, href: `/category/${categoryKey.toLowerCase()}` },
        {
          label: subcategory,
          href: `/category/${categoryKey.toLowerCase()}/${subcategory.toLowerCase()}`,
        },
        { label: name, href: "#" },
      ],
      // Legacy fields
      brand,
      colors: getRandomItems(COLORS, 1, 4),
      sizes: getRandomItems(SIZES, 2, 5),
      isNew: Math.random() > 0.8,
      createdAt: new Date().toISOString(),
      sales: getRandomInt(0, 1000),
    };
  });
};

const products = generateProducts(50);

// Populate similar products
products.forEach((product) => {
  product.similarProducts = products
    .filter((p) => p.category.id === product.category.id && p.id !== product.id)
    .slice(0, 6);
});

export const mockProducts = products;
