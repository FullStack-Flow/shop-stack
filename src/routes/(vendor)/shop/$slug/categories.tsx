import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { AddCategoryDialog } from '@/components/containers/shared/categories/add-category-dialog';
import ShopCategoriesTemplate from '@/components/templates/vendor/shop-categories-template';
import { mockCategories } from '@/data/categories';
import type { Category, CategoryFormValues } from '@/types/category-types';

export const Route = createFileRoute('/(vendor)/shop/$slug/categories')({
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
      parentId: data.parentId === 'none' ? undefined : data.parentId,
      level: data.parentId && data.parentId !== 'none' ? 1 : 0,
      productCount: 0,
      isActive: true,
      sortOrder: categories.length + 1,
      image: data.image ? URL.createObjectURL(data.image[0]) : undefined,
    };

    setCategories([...categories, newCategory]);
    console.log('Created category:', newCategory);
  };

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
        role="vendor"
      />
    </>
  );
}
