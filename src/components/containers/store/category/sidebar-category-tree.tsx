import CategoryTree from '@/components/base/store/category/category-tree';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { categoryTree } from '@/lib/helper/categories';

export default function SidebarCategoryTree() {
  const allCategories = categoryTree;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Browse Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <CategoryTree categories={allCategories} />
      </CardContent>
    </Card>
  );
}
