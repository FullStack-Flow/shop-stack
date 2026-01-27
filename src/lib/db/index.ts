import { type NeonQueryFunction, neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { user } from "./schema/auth-schema";
import { brands } from "./schema/brand-schema";
import { categories } from "./schema/category-schema";
import { shops, vendors } from "./schema/shop-schema";

const schema = {
  user,
  vendors,
  shops,
  categories,
  brands,
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
