/**
 * Universal Seed Script
 *
 * Seeds the database with sample data for all major entities.
 * Run with: npx tsx src/lib/db/seeding.ts
 */

import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import seedDataRaw from "../../data/seeding.json";
import { attributes, attributeValues } from "./schema/attribute-schema";
import { user } from "./schema/auth-schema";
import { brands } from "./schema/brand-schema";
import { categories } from "./schema/category-schema";
import {
  productAttributes,
  productImages,
  productShippingMethods,
  products,
  productTags,
} from "./schema/products-schema";
import { shippingMethods } from "./schema/shipping-schema";
import { shops, vendors } from "./schema/shop-schema";
import { tags } from "./schema/tags-schema";
import { taxRates } from "./schema/tax-schema";

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

// Cast seedData to any to match the dynamic structure
const seedData = seedDataRaw as any;

// User IDs for cleanup
const USER_IDS = [
  "8ZzH3ONSuSpz1IYwJLiLlpooxbIKxPNO",
  "CQUDCefoyYyfpPqbFi4OuzR2XKq0Lbwh",
  "TidNPzRp37zli5iqJoBQQTGypKqzJGg0",
  "fuHd3tcUr1SZ0PWHKi9TM3yHv34enu8a",
  "oUP6VlQVSvDF65xAUrIyuvqMxoPsmURL",
  "xUYMejz1mKqSD7smI5snNI3roupLUsJG",
];

/**
 * Cleanup existing seeded data before re-inserting.
 * Deleting vendors cascades to shops → products → images/tags/attrs/shipping.
 */
async function cleanup() {
  console.log("🧹 Cleaning up existing seed data...");
  try {
    await db.delete(vendors).where(inArray(vendors.userId, USER_IDS));
    console.log("   ✅ Existing vendors/shops/products cleaned up.\n");
  } catch (error) {
    console.warn("   ⚠️ Cleanup warning (may be first run):", error);
  }
}

async function seedAll() {
  console.log("🌱 Starting universal seed...\n");

  // Clean up old data first to avoid FK conflicts on re-runs
  await cleanup();

  const {
    vendors: vendorsList,
    shops: shopsList,
    brands: brandsList,
    categories: categoriesList,
    attributes: attributesList,
    taxes: taxesList,
    tags: tagsList,
    shippingMethods: shippingList,
    products: productsList,
  } = seedData;

  // 1. Seed Users (for Vendors)
  console.log(`👤 Seeding ${vendorsList.length} users for vendors...`);
  for (const vendor of vendorsList) {
    try {
      await db
        .insert(user)
        .values({
          id: vendor.userId,
          name: vendor.businessName,
          email: vendor.contactEmail,
          emailVerified: true,
          role: "vendor",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoNothing();
    } catch (error) {
      console.warn(`  ⚠️ Failed to seed user ${vendor.contactEmail}:`, error);
    }
  }

  // 2. Seed Vendors
  console.log(`🏢 Seeding ${vendorsList.length} vendors...`);
  for (const vendor of vendorsList) {
    try {
      await db
        .insert(vendors)
        .values({
          id: vendor.id,
          userId: vendor.userId,
          businessName: vendor.businessName,
          status: vendor.status,
          contactEmail: vendor.contactEmail,
          contactPhone: vendor.contactPhone,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoNothing();
    } catch (error) {
      console.warn(`  ⚠️ Failed to seed vendor ${vendor.businessName}:`, error);
    }
  }

  // 3. Seed Shops
  console.log(`🏪 Seeding ${shopsList.length} shops...`);
  for (const shop of shopsList) {
    try {
      await db
        .insert(shops)
        .values({
          id: shop.id,
          vendorId: shop.vendorId,
          name: shop.name,
          slug: shop.slug,
          description: shop.description,
          category: shop.category,
          logo: shop.logo,
          banner: shop.banner,
          status: shop.status,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoNothing();
    } catch (error) {
      console.warn(`  ⚠️ Failed to seed shop ${shop.name}:`, error);
    }
  }

  // 4. Seed Taxes (scoped to shops)
  console.log(`💰 Seeding ${taxesList.length} tax rates...`);
  for (const tax of taxesList) {
    try {
      await db
        .insert(taxRates)
        .values({
          id: tax.id,
          shopId: tax.shopId,
          name: tax.name,
          rate: tax.rate,
          country: tax.country,
          isCompound: tax.isCompound,
          isActive: tax.isActive,
        })
        .onConflictDoNothing();
    } catch (error) {
      console.warn(`  ⚠️ Failed to seed tax ${tax.name}:`, error);
    }
  }

  // 5. Seed Brands (scoped to shops)
  console.log(`🏷️ Seeding ${brandsList.length} brands...`);
  for (const brand of brandsList) {
    try {
      await db
        .insert(brands)
        .values({
          id: brand.id,
          shopId: brand.shopId,
          name: brand.name,
          slug: brand.slug,
          description: brand.description,
          isActive: brand.isActive,
        })
        .onConflictDoNothing();
    } catch (error) {
      console.warn(`  ⚠️ Failed to seed brand ${brand.name}:`, error);
    }
  }

  // 6. Seed Categories (scoped to shops)
  console.log(`📂 Seeding ${categoriesList.length} categories...`);
  for (const category of categoriesList) {
    try {
      await db
        .insert(categories)
        .values({
          id: category.id,
          shopId: category.shopId,
          name: category.name,
          slug: category.slug,
          description: category.description,
          isActive: category.isActive,
          sortOrder: category.sortOrder,
        })
        .onConflictDoNothing();
    } catch (error) {
      console.warn(`  ⚠️ Failed to seed category ${category.name}:`, error);
    }
  }

  // 7. Seed Tags (scoped to shops)
  console.log(`🏷️ Seeding ${tagsList.length} tags...`);
  for (const tag of tagsList) {
    try {
      await db
        .insert(tags)
        .values({
          id: tag.id,
          shopId: tag.shopId,
          name: tag.name,
          slug: tag.slug,
          description: tag.description,
          isActive: tag.isActive,
          sortOrder: tag.sortOrder,
        })
        .onConflictDoNothing();
    } catch (error) {
      console.warn(`  ⚠️ Failed to seed tag ${tag.name}:`, error);
    }
  }

  // 8. Seed Shipping Methods (scoped to shops)
  console.log(`🚚 Seeding ${shippingList.length} shipping methods...`);
  for (const ship of shippingList) {
    try {
      await db
        .insert(shippingMethods)
        .values({
          id: ship.id,
          shopId: ship.shopId,
          name: ship.name,
          description: ship.description,
          price: ship.price,
          duration: ship.duration,
          isActive: ship.isActive,
        })
        .onConflictDoNothing();
    } catch (error) {
      console.warn(`  ⚠️ Failed to seed shipping ${ship.name}:`, error);
    }
  }

  // 9. Seed Attributes and Values (scoped to shops)
  console.log(`🎨 Seeding ${attributesList.length} attributes...`);
  for (const attr of attributesList) {
    try {
      await db
        .insert(attributes)
        .values({
          id: attr.id,
          shopId: attr.shopId,
          name: attr.name,
          slug: attr.slug,
          type: attr.type as any,
          isActive: true,
        })
        .onConflictDoNothing();

      if (attr.values && attr.values.length > 0) {
        for (const val of attr.values) {
          await db
            .insert(attributeValues)
            .values({
              id: val.id,
              attributeId: attr.id,
              name: val.name,
              slug: val.name.toLowerCase().replace(/\s+/g, "-"),
              value: val.value,
            })
            .onConflictDoNothing();
        }
      }
    } catch (error) {
      console.warn(`  ⚠️ Failed to seed attribute ${attr.name}:`, error);
    }
  }

  // 10. Seed Products with Images, Tags, Attributes, and Shipping
  console.log(`📦 Seeding ${productsList.length} products...`);
  for (const product of productsList) {
    try {
      // Insert product
      await db
        .insert(products)
        .values({
          id: product.id,
          shopId: product.shopId,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          description: product.description,
          shortDescription: product.shortDescription,
          sellingPrice: product.sellingPrice,
          regularPrice: product.regularPrice,
          costPrice: product.costPrice,
          stock: product.stock,
          lowStockThreshold: product.lowStockThreshold,
          trackInventory: product.trackInventory,
          categoryId: product.categoryId || null,
          brandId: product.brandId || null,
          taxId: product.taxId || null,
          status: product.status as any,
          productType: product.productType as any,
          isFeatured: product.isFeatured,
          isActive: product.isActive,
          metaTitle: product.metaTitle,
          metaDescription: product.metaDescription,
          variationPrices:
            product.variationPrices &&
            Object.keys(product.variationPrices).length > 0
              ? JSON.stringify(product.variationPrices)
              : null,
        })
        .onConflictDoNothing();

      // Insert product images (thumbnail + gallery)
      if (product.images && product.images.length > 0) {
        for (const img of product.images) {
          await db
            .insert(productImages)
            .values({
              id: img.id,
              productId: product.id,
              url: img.url,
              alt: img.alt || null,
              sortOrder: img.sortOrder,
              isPrimary: img.isPrimary,
            })
            .onConflictDoNothing();
        }
      }

      // Insert product tags (junction table)
      if (product.tagIds && product.tagIds.length > 0) {
        for (const tagId of product.tagIds) {
          await db
            .insert(productTags)
            .values({
              productId: product.id,
              tagId,
            })
            .onConflictDoNothing();
        }
      }

      // Insert product attributes (junction table)
      if (product.attributeIds && product.attributeIds.length > 0) {
        for (const attrId of product.attributeIds) {
          await db
            .insert(productAttributes)
            .values({
              productId: product.id,
              attributeId: attrId,
              value: product.attributeValues[attrId]
                ? JSON.stringify(product.attributeValues[attrId])
                : null,
            })
            .onConflictDoNothing();
        }
      }

      // Insert product shipping methods (junction table)
      if (product.shippingMethodIds && product.shippingMethodIds.length > 0) {
        for (const shipId of product.shippingMethodIds) {
          await db
            .insert(productShippingMethods)
            .values({
              productId: product.id,
              shippingMethodId: shipId,
            })
            .onConflictDoNothing();
        }
      }
    } catch (error) {
      if (!(error as any).toString().includes("duplicate key")) {
        console.warn(`  ⚠️ Failed to seed product ${product.name}:`, error);
      }
    }
  }

  console.log("\n✅ Universal seed complete!");
  console.log("   📊 Summary:");
  console.log(`   - ${vendorsList.length} vendors`);
  console.log(`   - ${shopsList.length} shops`);
  console.log(`   - ${categoriesList.length} categories`);
  console.log(`   - ${brandsList.length} brands`);
  console.log(`   - ${tagsList.length} tags`);
  console.log(`   - ${attributesList.length} attributes`);
  console.log(`   - ${taxesList.length} tax rates`);
  console.log(`   - ${shippingList.length} shipping methods`);
  console.log(
    `   - ${productsList.length} products (with images, tags, attrs, shipping)`,
  );
}

seedAll()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error during seeding:", error);
    process.exit(1);
  });
