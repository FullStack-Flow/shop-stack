export interface Review {
  id: string;
  productName: string;
  productImage: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  status: "published" | "pending" | "rejected";
}

export interface ReviewPermissions {
  canDelete: boolean;
  canEdit: boolean;
  canView: boolean;
  canUpdateStatus: boolean;
}

export interface ReviewEligibility {
  canReview: boolean;
  eligibleOrderItems: {
    orderItemId: string;
    orderId: string;
    orderNumber: string;
    productName: string;
    purchaseDate: string;
    alreadyReviewed: boolean;
  }[];
  existingReviews: {
    reviewId: string;
    rating: number;
    title: string;
    createdAt: string;
  }[];
}
