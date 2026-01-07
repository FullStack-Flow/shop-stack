import { AddCategoryDialog } from "@/components/containers/vendors/categories/add-category-dialog";
import ShopCategoriesTemplate from "@/components/templates/vendor/shop-categories-template";
import { mockCategories } from "@/data/categories";
import { Category, CategoryFormValues } from "@/types/category-types";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/(vendor)/shop/$slug/categories")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddCategory = () => {
    setIsDialogOpen(true);
  };

  const handleCategorySubmit = (data: CategoryFormValues) => {
    const newCategory: Category = {
      id: String(categories.length + 1),
      name: data.name,
      slug: data.slug,
      description: data.description,
      icon: data.icon,
      parentId: data.parentId === "none" ? undefined : data.parentId,
      level: data.parentId && data.parentId !== "none" ? 1 : 0, // Set level based on parent
      productCount: 0,
      isActive: true, // Default to active
      sortOrder: categories.length + 1, // Add to end
      image: data.image ? URL.createObjectURL(data.image[0]) : undefined, // Mock image URL
    };

    setCategories([...categories, newCategory]);
    console.log("Created category:", newCategory);
  };

  // Prepare options for parent category select (only potential parents,
  // e.g., not deep nested if we want to limit depth, but here all categories are fine)
  const categoryOptions = categories.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return (
    <>
      <ShopCategoriesTemplate
        categories={categories}
        onAddCategory={handleAddCategory}
      />

      <AddCategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleCategorySubmit}
        categories={categoryOptions}
      />
    </>
  );
}
