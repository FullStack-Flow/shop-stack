/**
 * Slug Utilities
 *
 * Reusable slug generation functions for the multi-vendor marketplace.
 * Used for creating URL-friendly identifiers for stores, products, categories, etc.
 */

/**
 * Generate a URL-friendly slug from a given name/text
 *
 * @param name - The text to convert to a slug
 * @param options - Optional configuration
 * @returns A URL-friendly slug string
 *
 * @example
 * generateSlug('My Awesome Store') // "my-awesome-store-a1b2c3"
 * generateSlug('Electronics 2024!') // "electronics-2024-d4e5f6"
 * generateSlug('Café & Bakery', { separator: '_' }) // "cafe_bakery_g7h8i9"
 */
export function generateSlug(
  name: string,
  options: {
    /** Separator character (default: '-') */
    separator?: string;
    /** Include random suffix for uniqueness (default: true) */
    unique?: boolean;
    /** Length of random suffix (default: 6) */
    suffixLength?: number;
    /** Custom suffix instead of random (optional) */
    customSuffix?: string;
  } = {},
): string {
  const {
    separator = "-",
    unique = true,
    suffixLength = 6,
    customSuffix,
  } = options;

  // Normalize the string (remove accents, etc.)
  let slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .replace(/[\s_]+/g, separator) // Replace spaces/underscores with separator
    .replace(new RegExp(`${separator}+`, "g"), separator) // Remove consecutive separators
    .replace(new RegExp(`^${separator}|${separator}$`, "g"), ""); // Trim separators

  // Add suffix for uniqueness
  if (customSuffix) {
    slug = `${slug}${separator}${customSuffix}`;
  } else if (unique) {
    const randomSuffix = crypto.randomUUID().slice(0, suffixLength);
    slug = `${slug}${separator}${randomSuffix}`;
  }

  return slug;
}

/**
 * Generate a simple slug without random suffix (for display purposes)
 *
 * @param name - The text to convert to a slug
 * @returns A URL-friendly slug string without random suffix
 *
 * @example
 * generateSimpleSlug('My Awesome Store') // "my-awesome-store"
 */
export function generateSimpleSlug(name: string): string {
  return generateSlug(name, { unique: false });
}

/**
 * Check if a string is a valid slug format
 *
 * @param slug - The string to validate
 * @returns True if the string is a valid slug
 */
export function isValidSlug(slug: string): boolean {
  // Valid slug: lowercase alphanumeric with hyphens, no leading/trailing hyphens
  const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Sanitize a user-provided slug (useful for manual slug input)
 *
 * @param slug - The slug to sanitize
 * @returns A sanitized slug string
 */
export function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
