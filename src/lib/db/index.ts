import { type NeonQueryFunction, neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import {
  customerAddresses,
  customerAddressesRelations,
} from "./schema/address-schema";
import {
  attributes,
  attributesRelations,
  attributeValues,
  attributeValuesRelations,
} from "./schema/attribute-schema";
import { user } from "./schema/auth-schema";
import { brands } from "./schema/brand-schema";
import {
  cartItems,
  cartItemsRelations,
  cartSessions,
  cartSessionsRelations,
} from "./schema/cart-schema";
import { categories } from "./schema/category-schema";
import {
  couponCategories,
  couponCategoriesRelations,
  couponProducts,
  couponProductsRelations,
  coupons,
  couponsRelations,
  couponUsage,
  couponUsageRelations,
} from "./schema/coupon-schema";
import {
  productAttributes,
  productAttributesRelations,
  productImages,
  productImagesRelations,
  products,
  productsRelations,
  productTags,
  productTagsRelations,
} from "./schema/products-schema";
import { shops, vendors } from "./schema/shop-schema";
import { tags, tagsRelations } from "./schema/tags-schema";
import { taxRates, taxRatesRelations } from "./schema/tax-schema";
import {
  wishlistItems,
  wishlistItemsRelations,
} from "./schema/wishlist-schema";

const schema = {
  user,
  vendors,
  shops,
  categories,
  brands,
  attributes,
  attributeValues,
  attributesRelations,
  attributeValuesRelations,
  tags,
  tagsRelations,
  taxRates,
  taxRatesRelations,
  productAttributes,
  productAttributesRelations,
  productImages,
  productImagesRelations,
  products,
  productsRelations,
  productTags,
  productTagsRelations,
  coupons,
  couponProducts,
  couponCategories,
  couponUsage,
  couponsRelations,
  couponProductsRelations,
  couponCategoriesRelations,
  couponUsageRelations,
  cartSessions,
  cartItems,
  cartItemsRelations,
  cartSessionsRelations,
  customerAddresses,
  customerAddressesRelations,
  wishlistItems,
  wishlistItemsRelations,
};

// Lazy initialization - only connect to DB when first accessed on server
let sqlClient: NeonQueryFunction<false, false> | null = null;
let dbClient: NeonHttpDatabase<typeof schema> | null = null;

function getSql() {
  if (!sqlClient) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL environment variable is not set. Please check your .env file.",
      );
    }
    sqlClient = neon(url);
  }
  return sqlClient;
}

function getDb() {
  if (!dbClient) {
    dbClient = drizzle({
      client: getSql(),
      schema,
    });
  }
  return dbClient;
}

// Export getters that lazily initialize
export const sql = new Proxy({} as NeonQueryFunction<false, false>, {
  get(_, prop) {
    return Reflect.get(getSql(), prop);
  },
  apply(_, thisArg, args) {
    return Reflect.apply(getSql(), thisArg, args);
  },
});

export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_, prop) {
    return Reflect.get(getDb(), prop);
  },
});
