import { useState } from 'react';
import PageHeader from '@/components/base/common/page-header';
import type { ReviewFormValues } from '@/types/review-form';
import { AddReviewDialog } from './add-review-dialog';

export interface ReviewHeaderProps {
  onAddReview?: (data: ReviewFormValues) => void;
  role?: 'admin' | 'vendor';
  showAddButton?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export default function ReviewHeader({
  onAddReview,
  role = 'vendor',
  showAddButton = true,
  children,
  className,
}: ReviewHeaderProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddReview = (data: ReviewFormValues) => {
    onAddReview?.(data);
  };

  return (
    <PageHeader
      title="Reviews"
      description={
        role === 'admin'
          ? 'Manage platform-wide customer reviews and ratings'
          : 'Manage customer reviews and ratings for your products'
      }
      className={className}
    >
      {children}
      {showAddButton && (
        <AddReviewDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSubmit={handleAddReview}
        />
      )}
    </PageHeader>
  );
}
