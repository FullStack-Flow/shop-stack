import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ConfirmDeleteDialog } from "@/components/base/common/confirm-delete-dialog";
import { PageSkeleton } from "@/components/base/common/page-skeleton";
import { AddProductDialog } from "@/components/containers/shared/products/add-product-dialog";
import ShopProductsTemplate from "@/components/templates/vendor/products/shop-products-template";
import { useEntityCRUD } from "@/hooks/common/use-entity-crud";
import { shippingMethodsQueryOptions } from "@/hooks/common/use-shipping";
import { attributesQueryOptions } from "@/hooks/vendors/use-attributes";
import { brandsQueryOptions } from "@/hooks/vendors/use-brands";
import { categoriesQueryOptions } from "@/hooks/vendors/use-categories";
import { useProducts } from "@/hooks/vendors/use-products";
import { shopBySlugQueryOptions } from "@/hooks/vendors/use-shops";
import { tagsQueryOptions } from "@/hooks/vendors/use-tags";
import { taxRatesQueryOptions } from "@/hooks/vendors/use-tax-rates";
import { createVendorProductsFetcher } from "@/hooks/vendors/use-vendor-entity-fetchers";
import type { ProductFormValues, ProductItem } from "@/types/products";

export const Route = createFileRoute("/(vendor)/shop/$slug/products/")({
  component: ProductsPage,
  pendingComponent: PageSkeleton,
});

function ProductsPage() {
  const { slug } = Route.useParams();

  // Get shop data to retrieve shopId
  const { data: shopData } = useSuspenseQuery(shopBySlugQueryOptions(slug));
  const shopId = shopData?.shop?.id ?? "";

  // Create fetcher for server-side pagination
  const fetcher = useMemo(() => createVendorProductsFetcher(shopId), [shopId]);

  // Fetch related data for the dialog
  const { data: categoriesData } = useSuspenseQuery(
    categoriesQueryOptions({
      shopId,
      limit: 100,
      offset: 0,
      sortBy: "sortOrder",
      sortDirection: "asc",
    }),
  );

  const { data: brandsData } = useSuspenseQuery(
    brandsQueryOptions({
      shopId,
      limit: 100,
      offset: 0,
      sortBy: "sortOrder",
      sortDirection: "asc",
    }),
  );

  const { data: tagsData } = useSuspenseQuery(
    tagsQueryOptions({
      shopId,
      limit: 100,
      offset: 0,
      sortBy: "sortOrder",
      sortDirection: "asc",
    }),
  );

  const { data: attributesData } = useSuspenseQuery(
    attributesQueryOptions({
      shopId,
      limit: 100,
      offset: 0,
      sortBy: "sortOrder",
      sortDirection: "asc",
    }),
  );

  const { data: taxesData } = useSuspenseQuery(
    taxRatesQueryOptions({
      shopId,
      limit: 100,
      offset: 0,
      sortBy: "priority",
      sortDirection: "asc",
    }),
  );

  const { data: shippingMethodsData } = useSuspenseQuery(
    shippingMethodsQueryOptions({
      shopId,
      limit: 100,
      offset: 0,
      isActive: true,
      sortBy: "name",
      sortDirection: "asc",
    }),
  );

  // Get product mutations
  const {
    createProduct,
    updateProduct,
    deleteProduct,
    mutationState,
    isProductMutating,
  } = useProducts(shopId);

  // Transform API data for components
  const categories =
    categoriesData?.data?.map((c) => ({ id: c.id, name: c.name })) ?? [];
  const brands =
    brandsData?.data?.map((b) => ({ id: b.id, name: b.name })) ?? [];
  const tags = tagsData?.data?.map((t) => ({ id: t.id, name: t.name })) ?? [];
  const availableAttributes =
    attributesData?.data?.map(
      (a: {
        id: string;
        name: string;
        type: "color" | "image" | "label" | "select";
        values: any[];
      }) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        values: a.values.map((v) => ({
          id: v.id,
          name: v.name,
          value: v.value,
        })),
      }),
    ) ?? [];
  const taxes =
    taxesData?.data?.map((t) => ({
      id: t.id,
      name: t.name,
      rate: t.rate,
    })) ?? [];

  const shippingMethods =
    shippingMethodsData?.data?.map((s) => ({
      id: s.id,
      name: s.name,
    })) ?? [];

  // Use shared CRUD hook
  const {
    isDialogOpen,
    setIsDialogOpen,
    editingItem: editingProduct,
    deletingItem: deletingProduct,
    setDeletingItem: setDeletingProduct,
    handleAdd: handleAddProduct,
    handleEdit: handleEditProduct,
    handleDelete: handleDeleteProduct,
    confirmDelete,
    handleDialogClose,
  } = useEntityCRUD<ProductItem>({
    onDelete: async (id) => {
      await deleteProduct(id);
    },
  });

  const handleProductSubmit = async (
    data: ProductFormValues,
    status: "draft" | "active",
  ) => {
    console.log("ProductsPage: handleProductSubmit triggered", {
      data,
      status,
    });
    try {
      if (editingProduct) {
        console.log(
          "ProductsPage: Updating existing product",
          editingProduct.id,
        );
        // Build images array from form values
        const images: Array<{
          url: string;
          isPrimary: boolean;
          sortOrder: number;
        }> = [];
        if (data.thumbnailImage) {
          images.push({
            url: data.thumbnailImage,
            isPrimary: true,
            sortOrder: 0,
          });
        }
        if (Array.isArray(data.galleryImages)) {
          data.galleryImages.forEach((url, index) => {
            images.push({ url, isPrimary: false, sortOrder: index + 1 });
          });
        }

        await updateProduct({
          id: editingProduct.id,
          name: data.name,
          sku: data.sku,
          sellingPrice: data.sellingPrice,
          regularPrice: data.regularPrice || undefined,
          costPrice: data.costPrice || undefined,
          stock: Number(data.stock),
          lowStockThreshold: Number(data.lowStockThreshold) || 5,
          trackInventory: data.trackInventory,
          description: data.description,
          categoryId: data.categoryId || undefined,
          brandId: data.brandId || undefined,
          tagIds: data.tagIds,
          attributeIds: data.attributeIds,
          shippingMethodIds: data.shippingMethodIds,
          attributeValues: data.attributeValues,
          taxId: data.taxId || undefined,
          productType: data.productType,
          isActive: data.isActive,
          isFeatured: data.isFeatured,
          metaTitle: data.metaTitle || undefined,
          metaDescription: data.metaDescription || undefined,
          variationPrices: data.variationPrices,
          images,
          status,
        });
        console.log(
          "ProductsPage: Product update mutation called successfully",
        );
      } else {
        console.log("ProductsPage: Creating new product");
        // Build images array from form values
        const images: Array<{
          url: string;
          isPrimary: boolean;
          sortOrder: number;
        }> = [];
        if (data.thumbnailImage) {
          images.push({
            url: data.thumbnailImage,
            isPrimary: true,
            sortOrder: 0,
          });
        }
        if (Array.isArray(data.galleryImages)) {
          data.galleryImages.forEach((url, index) => {
            images.push({ url, isPrimary: false, sortOrder: index + 1 });
          });
        }

        await createProduct({
          name: data.name,
          sku: data.sku,
          sellingPrice: data.sellingPrice,
          regularPrice: data.regularPrice || undefined,
          costPrice: data.costPrice || undefined,
          stock: Number(data.stock),
          lowStockThreshold: Number(data.lowStockThreshold) || 5,
          trackInventory: data.trackInventory,
          description: data.description || "",
          shortDescription: data.shortDescription || "",
          categoryId: data.categoryId || undefined,
          brandId: data.brandId || undefined,
          tagIds: data.tagIds,
          attributeIds: data.attributeIds,
          shippingMethodIds: data.shippingMethodIds,
          attributeValues: data.attributeValues,
          taxId: data.taxId || undefined,
          status,
          productType: data.productType,
          isFeatured: data.isFeatured,
          isActive: data.isActive,
          metaTitle: data.metaTitle || undefined,
          metaDescription: data.metaDescription || undefined,
          variationPrices: data.variationPrices,
          images,
        });
        console.log(
          "ProductsPage: Product creation mutation called successfully",
        );

        console.log(data);
      }
      handleDialogClose();
    } catch (error) {
      console.error("Failed to save product:", error);
    }
  };

  return (
    <>
      <ShopProductsTemplate
        fetcher={fetcher}
        onAddProduct={handleAddProduct}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        mutationState={mutationState}
        isProductMutating={isProductMutating}
      />

      <AddProductDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) handleDialogClose();
        }}
        onSubmit={handleProductSubmit}
        isSubmitting={mutationState.isAnyMutating}
        categories={categories}
        brands={brands}
        tags={tags}
        availableAttributes={availableAttributes}
        taxes={taxes}
        shippingMethods={shippingMethods}
        initialValues={
          editingProduct
            ? {
                name: editingProduct.name,
                slug: editingProduct.slug || "",
                sku: editingProduct.sku || "",
                sellingPrice: editingProduct.sellingPrice,
                regularPrice: editingProduct.regularPrice || "",
                costPrice: editingProduct.costPrice || "",
                stock: editingProduct.stock,
                lowStockThreshold: editingProduct.lowStockThreshold || 5,
                trackInventory: editingProduct.trackInventory,
                description: editingProduct.description || "",
                shortDescription: editingProduct.shortDescription || "",
                categoryId: editingProduct.categoryId || "",
                brandId: editingProduct.brandId || "",
                tagIds: editingProduct.tagIds,
                attributeIds: editingProduct.attributeIds,
                shippingMethodIds: editingProduct.shippingMethodIds || [],
                attributeValues: editingProduct.attributeValues || {},
                taxId: editingProduct.taxId || "",
                status: editingProduct.status,
                productType: editingProduct.productType,
                isActive: editingProduct.isActive,
                isFeatured: editingProduct.isFeatured,
                metaTitle: editingProduct.metaTitle || "",
                metaDescription: editingProduct.metaDescription || "",
                variationPrices: editingProduct.variationPrices,
                thumbnailImage:
                  editingProduct.images.find((i) => i.isPrimary)?.url || "",
                galleryImages: editingProduct.images
                  .filter((i) => !i.isPrimary)
                  .map((i) => i.url),
              }
            : null
        }
      />

      <ConfirmDeleteDialog
        open={!!deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
        onConfirm={confirmDelete}
        isDeleting={mutationState.deletingId === deletingProduct?.id}
        itemName={deletingProduct?.name}
        entityType="product"
      />
    </>
  );
}
