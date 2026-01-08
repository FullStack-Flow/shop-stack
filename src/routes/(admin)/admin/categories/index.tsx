import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import AdminCategoriesTemplate from "@/components/templates/admin/admin-categories-template";
import { mockCategories } from "@/data/categories";
import type { Category, CategoryFormValues } from "@/types/category-types";

export const Route = createFileRoute("/(admin)/admin/categories/")({
  component: AdminCategoriesPage,
});

function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);

  const handleCategoryStatusChange = (
    categoryId: string,
    newStatus: boolean
  ) => {
    setCategories(
      categories.map((category) =>
        category.id === categoryId
          ? { ...category, isActive: newStatus }
          : category
      )
    );
  };

  const handleAddCategory = (data: CategoryFormValues) => {
    const newCategory: Category = {
      ...data,
      id: Date.now().toString(),
      image:
        data.image && data.image.length > 0
          ? URL.createObjectURL(data.image[0])
          : undefined,
      level: 0,
      productCount: 0,
      isActive: true,
      sortOrder: categories.length,
    };
    setCategories([...categories, newCategory]);
  };

  return (
    <AdminCategoriesTemplate
      categories={categories}
      onCategoryStatusChange={handleCategoryStatusChange}
      onAddCategory={handleAddCategory}
    />
  );
}
